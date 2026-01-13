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

# Try to import TensorFlow (optional for API if model is pre-trained)
try:
    import tensorflow as tf
    from tensorflow import keras
    HAS_TF = True
except ImportError:
    HAS_TF = False
    print("⚠️  TensorFlow not installed - model loading disabled")

app = FastAPI(
    title="BaggageLens AI API",
    description="CNN + Siamese Network for Luggage Matching",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained model
model = None
if HAS_TF:
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'siamese_model.h5')
        if os.path.exists(model_path):
            model = keras.models.load_model(model_path)
            print(f"✅ Model loaded from {model_path}")
        else:
            print(f"⚠️  Model not found at {model_path}")
            print("📝 To train the model, use: google_colab_training.ipynb")
    except Exception as e:
        print(f"⚠️  Could not load model: {e}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "AI Model API is running",
        "model": "CNN + Siamese Network"
    }

@app.post("/compare")
async def compare_images(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):
    """
    Compare two luggage images and return similarity score
    
    Args:
        image1: First luggage image
        image2: Second luggage image
    
    Returns:
        similarity_score: Float between 0 (different) and 1 (identical)
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded. Train model in Google Colab and upload siamese_model.h5 to models/ folder")
    
    if not HAS_TF:
        raise HTTPException(status_code=503, detail="TensorFlow not installed")
    
    try:
        # Read images
        image1_data = await image1.read()
        image2_data = await image2.read()
        
        img1 = Image.open(io.BytesIO(image1_data)).convert('RGB')
        img2 = Image.open(io.BytesIO(image2_data)).convert('RGB')
        
        # Resize to model input shape
        img1 = img1.resize((256, 256))
        img2 = img2.resize((256, 256))
        
        # Convert to numpy arrays and normalize
        img1_array = np.array(img1, dtype=np.float32) / 255.0
        img2_array = np.array(img2, dtype=np.float32) / 255.0
        
        # Get similarity score
        similarity_score = float(model.predict([np.array([img1_array]), np.array([img2_array])], verbose=0)[0][0])
        
        return {
            "image1": image1.filename,
            "image2": image2.filename,
            "similarity_score": similarity_score,
            "match": "Found match" if similarity_score > 0.7 else "Not a match"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error comparing images: {str(e)}")

@app.post("/match-batch")
async def match_batch(
    lost_image: UploadFile = File(...),
    found_images: list = File(...)
):
    """
    Find matching luggage from a batch of found images
    
    Args:
        lost_image: Image of lost luggage
        found_images: List of found luggage images
    
    Returns:
        {
            "matches": [
                {"image_id": "123", "similarity_score": 0.92},
                {"image_id": "456", "similarity_score": 0.87}
            ],
            "best_match": {"image_id": "123", "similarity_score": 0.92}
        }
    """
    try:
        # TODO: Implement batch matching
        matches = []
        
        return {
            "matches": matches,
            "best_match": None,
            "count": len(matches)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/extract-features")
async def extract_features(image: UploadFile = File(...)):
    """
    Extract CNN features from an image for storage
    
    Args:
        image: Luggage image
    
    Returns:
        {
            "features": [0.1, 0.2, ...],
            "shape": [1, 512]
        }
    """
    try:
        # Read image
        img = Image.open(io.BytesIO(await image.read()))
        
        # TODO: Extract features using CNN encoder
        # features = model.encoder.predict(img)
        
        return {
            "features": [],  # Placeholder
            "shape": [1, 512]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
