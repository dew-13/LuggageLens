from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from PIL import Image
import io
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import TensorFlow
try:
    import tensorflow as tf
    from tensorflow import keras
    HAS_TF = True
except ImportError:
    HAS_TF = False
    print("⚠️  TensorFlow not installed - model loading disabled")

app = FastAPI(
    title="BaggageLens AI API",
    description="ResNet50 Siamese Network for Luggage Matching & Embedding Generation",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Model Loading
# ============================================================
IMAGE_SIZE = (224, 224)  # ResNet50 standard input
EMBEDDING_DIM = 512      # Must match Supabase vector(512)

siamese_model = None
encoder_model = None

if HAS_TF:
    models_dir = os.path.join(os.path.dirname(__file__), 'models')

    def load_via_weights():
        """
        Build architecture locally and load trained weights.
        This is cross-version compatible (works across Python 3.12/3.13, TF 2.19/2.20).
        """
        from siamese_model import create_siamese_network
        
        encoder_weights = os.path.join(models_dir, 'encoder_weights.weights.h5')
        siamese_weights = os.path.join(models_dir, 'siamese_weights.weights.h5')
        
        if not os.path.exists(encoder_weights):
            return None, None
        
        print("🔄 Building model architecture locally...")
        siamese, encoder = create_siamese_network()
        
        # Load trained weights into the locally-built architecture
        if os.path.exists(siamese_weights):
            try:
                siamese.load_weights(siamese_weights)
                print(f"✅ Siamese weights loaded from {siamese_weights}")
            except Exception as e:
                print(f"⚠️  Siamese weights failed: {e}")
                siamese = None
        else:
            siamese = None

        try:
            encoder.load_weights(encoder_weights)
            print(f"✅ Encoder weights loaded from {encoder_weights}")
            print(f"   Output shape: {encoder.output_shape}")
        except Exception as e:
            print(f"⚠️  Encoder weights failed: {e}")
            encoder = None
        
        return siamese, encoder

    def load_via_full_model():
        """Fallback: try loading full .keras or .h5 model files"""
        class L2Distance(tf.keras.layers.Layer):
            def call(self, inputs):
                x1, x2 = inputs
                return tf.math.sqrt(tf.maximum(
                    tf.reduce_sum(tf.square(x1 - x2), axis=1, keepdims=True),
                    tf.keras.backend.epsilon()
                ))

        custom_objects = {'L2Distance': L2Distance}
        loaded_encoder = None
        loaded_siamese = None

        for name, target in [('encoder_model', 'encoder'), ('siamese_model', 'siamese')]:
            for ext in ['.keras', '.h5']:
                path = os.path.join(models_dir, f'{name}{ext}')
                if os.path.exists(path):
                    try:
                        model = keras.models.load_model(
                            path, custom_objects=custom_objects, compile=False, safe_mode=False
                        )
                        print(f"✅ Loaded: {path}")
                        if target == 'encoder':
                            loaded_encoder = model
                        else:
                            loaded_siamese = model
                        break
                    except Exception as e:
                        print(f"⚠️  Failed {path}: {e}")
        
        return loaded_siamese, loaded_encoder

    # Try weights first (most reliable), then full model files
    print("🔄 Loading trained models...")
    siamese_model, encoder_model = load_via_weights()

    if not encoder_model:
        print("⚠️  Weights not found, trying full model files...")
        siamese_model, encoder_model = load_via_full_model()

    if not encoder_model and not siamese_model:
        print("📝 No trained models found. Train in Google Colab:")
        print("   1. Open ai-model/google_colab_training.ipynb in Google Colab")
        print("   2. Train the model")
        print("   3. Download encoder_weights.weights.h5 and siamese_weights.weights.h5")
        print("   4. Place them in ai-model/models/ folder")
        print("   5. Restart this API")


def preprocess_image(image_data: bytes) -> np.ndarray:
    """Load and preprocess a single image for the model"""
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    img = img.resize(IMAGE_SIZE)
    img_array = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(img_array, axis=0)  # Add batch dimension


# ============================================================
# API Endpoints
# ============================================================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "AI Model API is running",
        "model": "ResNet50 Siamese Network",
        "encoder_loaded": encoder_model is not None,
        "siamese_loaded": siamese_model is not None,
        "embedding_dim": EMBEDDING_DIM,
        "image_size": list(IMAGE_SIZE)
    }


@app.post("/embed")
async def generate_embedding(image: UploadFile = File(...)):
    """
    Generate a 512-dimensional embedding vector for a luggage image.
    This is the primary endpoint used by the Node.js backend to create
    vectors for storage in Supabase pgvector.

    Returns:
        {"embedding": [0.1, 0.2, ...], "shape": [1, 512]}
    """
    if not encoder_model:
        raise HTTPException(
            status_code=503,
            detail="Encoder model not loaded. Train in Google Colab and place encoder_model.h5 in models/ folder."
        )

    try:
        image_data = await image.read()
        img_array = preprocess_image(image_data)

        # Generate embedding
        embedding = encoder_model.predict(img_array, verbose=0)

        # L2 normalize (should already be normalized, but ensure it)
        norm = np.linalg.norm(embedding[0])
        if norm > 0:
            normalized = (embedding[0] / norm).tolist()
        else:
            normalized = embedding[0].tolist()

        return {
            "embedding": normalized,
            "shape": list(embedding.shape),
            "dimension": EMBEDDING_DIM
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating embedding: {str(e)}")


@app.post("/embed-url")
async def generate_embedding_from_url(data: dict):
    """
    Generate embedding from an image URL.
    Compatible with the ml-service /embed endpoint signature.

    Body: {"imageUrl": "https://..."}
    Returns: {"embedding": [0.1, 0.2, ...]}
    """
    if not encoder_model:
        raise HTTPException(
            status_code=503,
            detail="Encoder model not loaded."
        )

    try:
        import requests
        image_url = data.get("imageUrl")
        if not image_url:
            raise HTTPException(status_code=400, detail="imageUrl is required")

        response = requests.get(image_url, stream=True, timeout=10)
        response.raise_for_status()

        img_array = preprocess_image(response.content)
        embedding = encoder_model.predict(img_array, verbose=0)

        # L2 normalize
        norm = np.linalg.norm(embedding[0])
        normalized = (embedding[0] / norm).tolist() if norm > 0 else embedding[0].tolist()

        return {"embedding": normalized}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compare")
async def compare_images(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):
    """
    Compare two luggage images and return similarity score.

    Returns:
        similarity_score: Float between 0 (different) and 1 (identical)
    """
    if not encoder_model:
        raise HTTPException(status_code=503, detail="Encoder not loaded.")

    try:
        image1_data = await image1.read()
        image2_data = await image2.read()

        img1 = preprocess_image(image1_data)
        img2 = preprocess_image(image2_data)

        # Use encoder + cosine similarity (more reliable than siamese comparison head)
        emb1 = encoder_model.predict(img1, verbose=0)[0]
        emb2 = encoder_model.predict(img2, verbose=0)[0]
        similarity_score = float(np.dot(emb1, emb2))  # Cosine sim (vectors are L2-normalized)

        return {
            "image1": image1.filename,
            "image2": image2.filename,
            "similarity_score": round(similarity_score, 4),
            "match": "Found match" if similarity_score > 0.85 else "Not a match",
            "model": "resnet50_encoder_cosine"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error comparing images: {str(e)}")


@app.post("/match-batch")
async def match_batch(
    lost_image: UploadFile = File(...),
    found_images: list = File(...)
):
    """
    Compare a lost luggage image against a batch of found images.

    Returns:
        Ranked list of matches sorted by similarity score.
    """
    if not encoder_model:
        raise HTTPException(status_code=503, detail="Encoder model not loaded.")

    try:
        # Encode the lost image
        lost_data = await lost_image.read()
        lost_array = preprocess_image(lost_data)
        lost_embedding = encoder_model.predict(lost_array, verbose=0)[0]

        # Encode and compare each found image
        matches = []
        for i, found_img in enumerate(found_images):
            found_data = await found_img.read()
            found_array = preprocess_image(found_data)
            found_embedding = encoder_model.predict(found_array, verbose=0)[0]

            # Cosine similarity (vectors are L2-normalized)
            similarity = float(np.dot(lost_embedding, found_embedding))
            matches.append({
                "image_id": found_img.filename or f"found_{i}",
                "similarity_score": round(similarity, 4)
            })

        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x["similarity_score"], reverse=True)

        return {
            "lost_image": lost_image.filename,
            "matches": matches,
            "best_match": matches[0] if matches else None,
            "count": len(matches)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/extract-features")
async def extract_features(image: UploadFile = File(...)):
    """
    Extract feature embedding from a single image.
    Alias for /embed endpoint with different response format.
    """
    if not encoder_model:
        raise HTTPException(status_code=503, detail="Encoder model not loaded.")

    try:
        image_data = await image.read()
        img_array = preprocess_image(image_data)
        features = encoder_model.predict(img_array, verbose=0)

        return {
            "features": features[0].tolist(),
            "shape": list(features.shape)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000))
    )
