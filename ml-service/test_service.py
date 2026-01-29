import requests
import json

# URL of your local ML service
SERVICE_URL = "http://localhost:8000/embed"

# A sample image URL (a reliable Wikimedia image of a suitcase)
TEST_IMAGE_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF9P-bEK2JX6P9WxnjukBk0TSu_DO-HHWh9A&s"
def test_service():
    print(f"🚀 Sending request to {SERVICE_URL}...")
    print(f"📸 Image: {TEST_IMAGE_URL}")
    
    try:
        payload = {"imageUrl": TEST_IMAGE_URL}
        response = requests.post(SERVICE_URL, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            embedding = data.get("embedding", [])
            print(f"✅ Success! Received embedding vector.")
            print(f"📏 Vector length: {len(embedding)} dimensions")
            print(f"🔢 First 5 values: {embedding[:5]}...")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the service.")
        print("💡 Is the server running? Run 'python main.py' in a separate terminal.")

if __name__ == "__main__":
    test_service()
