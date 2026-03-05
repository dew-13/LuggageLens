from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from PIL import Image
import io
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================================
# PyTorch Imports
# ============================================================
import torch
import torch.nn as nn
from torchvision import transforms, models

app = FastAPI(
    title="BaggageLens AI API",
    description="ResNet50 + CLIP Ensemble for Luggage Matching & Embedding Generation",
    version="3.0.0"
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
# Model Definitions
# ============================================================
IMAGE_SIZE = 224
RESNET_EMBEDDING_DIM = 512   # ResNet50 encoder output
CLIP_EMBEDDING_DIM = 512     # CLIP ViT-B/32 output

# ImageNet normalization (for ResNet50)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

resnet_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


class ResNet50Encoder(nn.Module):
    """ResNet50-based encoder — must match train_local.py architecture exactly"""
    def __init__(self, embedding_dim=RESNET_EMBEDDING_DIM):
        super().__init__()
        resnet = models.resnet50(weights=None)  # No pretrained; we load our trained weights
        self.backbone = nn.Sequential(*list(resnet.children())[:-1])
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(2048, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(1024, embedding_dim),
        )

    def forward(self, x):
        features = self.backbone(x)
        embedding = self.head(features)
        embedding = nn.functional.normalize(embedding, p=2, dim=1)
        return embedding


# ============================================================
# Load Models
# ============================================================
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
models_dir = os.path.join(os.path.dirname(__file__), 'models')

# --- ResNet50 Encoder (trained locally) ---
resnet_encoder = None

resnet_weight_files = [
    'encoder_model.pth',
    'checkpoint_best.pth',
]

for weight_file in resnet_weight_files:
    weight_path = os.path.join(models_dir, weight_file)
    if os.path.exists(weight_path):
        try:
            print(f"🔄 Loading ResNet50 encoder from {weight_file}...")
            resnet_encoder = ResNet50Encoder(RESNET_EMBEDDING_DIM).to(device)

            state_dict = torch.load(weight_path, map_location=device, weights_only=True)

            # checkpoint_best.pth has model_state_dict inside it (full siamese)
            if 'model_state_dict' in state_dict:
                # Extract encoder weights from full siamese checkpoint
                full_state = state_dict['model_state_dict']
                encoder_state = {}
                for key, value in full_state.items():
                    if key.startswith('encoder.'):
                        encoder_state[key.replace('encoder.', '')] = value
                resnet_encoder.load_state_dict(encoder_state)
            else:
                resnet_encoder.load_state_dict(state_dict)

            resnet_encoder.eval()
            print(f"✅ ResNet50 encoder loaded! (512-dim embeddings)")
            break
        except Exception as e:
            print(f"⚠️  Failed to load {weight_file}: {e}")
            resnet_encoder = None

if not resnet_encoder:
    print("⚠️  No trained ResNet50 encoder found.")
    print("   Train one with: python train_local.py")

# --- CLIP Model ---
clip_model = None
clip_processor = None

try:
    from transformers import CLIPModel, CLIPProcessor

    print("🔄 Loading CLIP model (openai/clip-vit-base-patch32)...")

    def load_clip_with_retry(retries=2):
        for i in range(retries):
            try:
                model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
                processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
                model.eval()
                return model, processor
            except Exception as e:
                print(f"   ⚠️  CLIP load attempt {i+1}/{retries} failed: {e}")
                if i < retries - 1:
                    time.sleep(3)
        return None, None

    clip_model, clip_processor = load_clip_with_retry()
    if clip_model:
        print(f"✅ CLIP model loaded! (512-dim embeddings)")
    else:
        print("⚠️  CLIP model not available (will use ResNet50 only)")

except ImportError:
    print("⚠️  transformers package not installed — CLIP disabled")
    print("   Install with: pip install transformers")


# ============================================================
# Helper Functions
# ============================================================

def preprocess_image_resnet(image_data: bytes) -> torch.Tensor:
    """Preprocess image for ResNet50 encoder"""
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    tensor = resnet_transform(img).unsqueeze(0).to(device)
    return tensor


def preprocess_image_clip(image_data: bytes):
    """Preprocess image for CLIP"""
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    return img


def get_resnet_embedding(image_data: bytes):
    """Generate 512-dim embedding from ResNet50 encoder"""
    if not resnet_encoder:
        return None
    with torch.no_grad():
        tensor = preprocess_image_resnet(image_data)
        embedding = resnet_encoder(tensor)
        return embedding[0].cpu().numpy().tolist()


def get_clip_embedding(image_data: bytes):
    """Generate 512-dim embedding from CLIP"""
    if not clip_model or not clip_processor:
        return None
    try:
        with torch.no_grad():
            img = preprocess_image_clip(image_data)
            inputs = clip_processor(images=img, return_tensors="pt")
            features = clip_model.get_image_features(**inputs)
            # L2 normalize using F.normalize (most reliable across PyTorch versions)
            embedding = torch.nn.functional.normalize(features, p=2, dim=-1)
            return embedding[0].cpu().numpy().tolist()
    except Exception as e:
        print(f"⚠️ CLIP embedding error: {e}")
        return None


def get_resnet_embedding_from_url(image_url: str):
    """Generate ResNet50 embedding from image URL"""
    import requests as req
    response = req.get(image_url, stream=True, timeout=10)
    response.raise_for_status()
    return get_resnet_embedding(response.content)


def get_clip_embedding_from_url(image_url: str):
    """Generate CLIP embedding from image URL"""
    import requests as req
    response = req.get(image_url, stream=True, timeout=10)
    response.raise_for_status()
    return get_clip_embedding(response.content)


# ============================================================
# API Endpoints
# ============================================================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "AI Model API is running",
        "version": "3.0.0",
        "models": {
            "resnet50": {
                "loaded": resnet_encoder is not None,
                "embedding_dim": RESNET_EMBEDDING_DIM,
                "description": "Trained Siamese ResNet50 encoder (luggage-specific)"
            },
            "clip": {
                "loaded": clip_model is not None,
                "embedding_dim": CLIP_EMBEDDING_DIM,
                "description": "OpenAI CLIP ViT-B/32 (general visual features)"
            }
        },
        "ensemble_mode": resnet_encoder is not None and clip_model is not None,
        "device": str(device)
    }


@app.post("/embed")
async def generate_embedding(image: UploadFile = File(...)):
    """
    Generate embedding(s) for a luggage image.

    Returns ResNet50 embedding (primary), CLIP embedding (if available),
    and a fused ensemble embedding.
    """
    if not resnet_encoder and not clip_model:
        raise HTTPException(status_code=503, detail="No models loaded")

    try:
        image_data = await image.read()

        resnet_emb = get_resnet_embedding(image_data)
        clip_emb = get_clip_embedding(image_data)

        # Primary embedding (prefer ResNet50 since it's trained on luggage)
        primary_embedding = resnet_emb or clip_emb

        response = {
            "embedding": primary_embedding,
            "dimension": len(primary_embedding),
        }

        # Include individual embeddings if both available
        if resnet_emb:
            response["resnet_embedding"] = resnet_emb
        if clip_emb:
            response["clip_embedding"] = clip_emb

        response["models_used"] = []
        if resnet_emb:
            response["models_used"].append("resnet50")
        if clip_emb:
            response["models_used"].append("clip")

        return response

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")


@app.post("/embed-url")
async def generate_embedding_from_url(data: dict):
    """
    Generate embedding from an image URL.
    Returns both ResNet50 and CLIP embeddings.

    Body: {"imageUrl": "https://..."}
    """
    if not resnet_encoder and not clip_model:
        raise HTTPException(status_code=503, detail="No models loaded")

    try:
        image_url = data.get("imageUrl")
        if not image_url:
            raise HTTPException(status_code=400, detail="imageUrl is required")

        import requests as req
        response = req.get(image_url, stream=True, timeout=10)
        response.raise_for_status()
        image_data = response.content

        resnet_emb = get_resnet_embedding(image_data)
        clip_emb = get_clip_embedding(image_data)

        primary_embedding = resnet_emb or clip_emb

        return {
            "embedding": primary_embedding,
            "clip_embedding": clip_emb,
            "models_used": [m for m in ["resnet50" if resnet_emb else None,
                                         "clip" if clip_emb else None] if m]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compare")
async def compare_images(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):
    """
    Compare two luggage images using ensemble similarity.

    Uses weighted combination of ResNet50 (0.6) and CLIP (0.4) similarity scores.
    """
    if not resnet_encoder and not clip_model:
        raise HTTPException(status_code=503, detail="No models loaded")

    try:
        image1_data = await image1.read()
        image2_data = await image2.read()

        scores = {}
        weights = {}

        # ResNet50 similarity (luggage-specific, higher weight)
        resnet_emb1 = get_resnet_embedding(image1_data)
        resnet_emb2 = get_resnet_embedding(image2_data)
        if resnet_emb1 and resnet_emb2:
            resnet_sim = float(np.dot(resnet_emb1, resnet_emb2))
            scores["resnet50"] = round(resnet_sim, 4)
            weights["resnet50"] = 0.6

        # CLIP similarity (general visual, complementary)
        clip_emb1 = get_clip_embedding(image1_data)
        clip_emb2 = get_clip_embedding(image2_data)
        if clip_emb1 and clip_emb2:
            clip_sim = float(np.dot(clip_emb1, clip_emb2))
            scores["clip"] = round(clip_sim, 4)
            weights["clip"] = 0.4

        # Ensemble score (weighted average)
        if scores:
            total_weight = sum(weights[k] for k in scores)
            ensemble_score = sum(scores[k] * weights[k] for k in scores) / total_weight
        else:
            raise HTTPException(status_code=503, detail="No models available for comparison")

        return {
            "image1": image1.filename,
            "image2": image2.filename,
            "ensemble_score": round(ensemble_score, 4),
            "individual_scores": scores,
            "weights": {k: weights[k] for k in scores},
            "match": "Found match" if ensemble_score > 0.85 else "Not a match",
            "model": "resnet50_clip_ensemble"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error comparing images: {str(e)}")


@app.post("/match-batch")
async def match_batch(
    lost_image: UploadFile = File(...),
    found_images: list = File(...)
):
    """
    Compare a lost luggage image against a batch of found images.
    Uses ensemble scoring for best results.
    """
    if not resnet_encoder and not clip_model:
        raise HTTPException(status_code=503, detail="No models loaded")

    try:
        lost_data = await lost_image.read()
        lost_resnet = get_resnet_embedding(lost_data)
        lost_clip = get_clip_embedding(lost_data)

        matches = []
        for i, found_img in enumerate(found_images):
            found_data = await found_img.read()
            found_resnet = get_resnet_embedding(found_data)
            found_clip = get_clip_embedding(found_data)

            # Ensemble score
            scores = {}
            if lost_resnet and found_resnet:
                scores["resnet50"] = float(np.dot(lost_resnet, found_resnet))
            if lost_clip and found_clip:
                scores["clip"] = float(np.dot(lost_clip, found_clip))

            weights = {"resnet50": 0.6, "clip": 0.4}
            if scores:
                total_w = sum(weights.get(k, 0.5) for k in scores)
                ensemble = sum(scores[k] * weights.get(k, 0.5) for k in scores) / total_w
            else:
                ensemble = 0.0

            matches.append({
                "image_id": found_img.filename or f"found_{i}",
                "ensemble_score": round(ensemble, 4),
                "individual_scores": {k: round(v, 4) for k, v in scores.items()}
            })

        matches.sort(key=lambda x: x["ensemble_score"], reverse=True)

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
    """Extract feature embedding from a single image (alias for /embed)"""
    if not resnet_encoder and not clip_model:
        raise HTTPException(status_code=503, detail="No models loaded")

    try:
        image_data = await image.read()
        resnet_emb = get_resnet_embedding(image_data)
        clip_emb = get_clip_embedding(image_data)

        return {
            "features": resnet_emb or clip_emb,
            "resnet_features": resnet_emb,
            "clip_features": clip_emb,
            "shape": [1, RESNET_EMBEDDING_DIM]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000))
    )
