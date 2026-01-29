from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
import torch
import io

app = FastAPI()

import time

# Load model globally (once at startup)
print("⏳ Loading CLIP model... (this may take a moment)")

def load_model_with_retry(retries=3):
    for i in range(retries):
        try:
            model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            print("✅ CLIP model loaded!")
            return model, processor
        except Exception as e:
            print(f"⚠️ Attempt {i+1}/{retries} failed: {e}")
            if i < retries - 1:
                print("   Retrying in 5 seconds...")
                time.sleep(5)
            else:
                print("❌ Failed to download model. Please check your internet connection.")
                print("   The script needs access to 'huggingface.co' to download the AI model.")
                raise e

model, processor = load_model_with_retry()

class ImageRequest(BaseModel):
    imageUrl: str

@app.get("/")
def home():
    return {"status": "ML Service is running", "model": "openai/clip-vit-base-patch32"}

@app.post("/embed")
def generate_embedding(data: ImageRequest):
    try:
        # Download image
        response = requests.get(data.imageUrl, stream=True)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content))

        # Process image
        inputs = processor(images=image, return_tensors="pt")

        # Generate embedding
        with torch.no_grad():
            features = model.get_image_features(**inputs)
        
        # Robustly handle different return types (Tensor vs Object)
        if hasattr(features, 'image_embeds'):
            features = features.image_embeds
        elif hasattr(features, 'pooler_output'):
            features = features.pooler_output
        elif not isinstance(features, torch.Tensor):
            # Fallback for other object types, try accessing as tuple/list
            features = features[0]

        # Convert to list (vector)
        # Normalize the embedding (optional but recommended for cosine similarity)
        embedding = features / features.norm(p=2, dim=-1, keepdim=True)
        vector = embedding[0].tolist()

        return {"embedding": vector}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
