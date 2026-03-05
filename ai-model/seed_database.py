"""
BaggageLens - Seed Database with Found Luggage

Uploads luggage images to Supabase Storage, generates AI embeddings,
and inserts records into the luggage table as "found" items.

This creates a realistic database for testing:
- ~50 images uploaded as "found" bags (for matching against)
- Remaining images stay on disk as test data (for "no match" scenarios)

Usage:
    python seed_database.py

Prerequisites:
    - AI API running: python api.py (port 8000)
    - Supabase project with schema v3 applied
"""

import os
import sys
import time
import random
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment from backend/.env (has Supabase credentials)
backend_env = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
if os.path.exists(backend_env):
    load_dotenv(backend_env)
    print(f"✅ Loaded backend env")

# Also load local .env
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
AI_API_URL = os.getenv('AI_API_URL', 'http://localhost:8000')
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
BUCKET_NAME = os.getenv('SUPABASE_BUCKET', 'luggage-images')

FOUND_ITEMS_COUNT = 50  # How many images to upload as "found" items
LOST_ITEMS_COUNT = 10   # How many to upload as "lost" (watchlist items, no user)

# Metadata pools for realistic data
COLORS = ['black', 'navy', 'red', 'gray', 'brown', 'blue', 'green', 'silver', 'burgundy', 'tan', 'orange', 'purple']
BAG_TYPES = ['suitcase', 'backpack', 'duffel', 'carry-on', 'briefcase', 'garment bag', 'trolley']
BRANDS = ['Samsonite', 'American Tourister', 'Rimowa', 'Tumi', 'Delsey', 'Away', 'Victorinox', 'Unknown', None]
LOCATIONS = [
    'Terminal 1, Belt 3', 'Terminal 2, Belt 5', 'Terminal 3, Belt 1',
    'Baggage Office', 'Security Checkpoint', 'Gate Area', 'Arrivals Hall',
    'Transfer Area', 'Lost Property Office', 'Customs Area'
]
DESCRIPTIONS = [
    'Hard-shell suitcase with four wheels',
    'Soft fabric duffel bag with shoulder strap',
    'Medium-sized roller bag',
    'Large checked suitcase',
    'Compact carry-on luggage',
    'Backpack with laptop compartment',
    'Small cabin bag',
    'Oversized sports equipment bag',
    'Leather briefcase',
    'Travel garment bag',
    'Wheeled trolley bag',
    'Expandable suitcase with TSA lock',
]


def check_prerequisites():
    """Verify Supabase and AI API are reachable"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ SUPABASE_URL and SUPABASE_KEY not found in environment")
        print("   Make sure backend/.env has these values")
        return False

    # Check AI API
    try:
        resp = requests.get(f"{AI_API_URL}/health", timeout=5)
        health = resp.json()
        print(f"✅ AI API: {health.get('version', 'unknown')}")
        print(f"   ResNet50: {'✅' if health.get('models', {}).get('resnet50', {}).get('loaded') else '❌'}")
        print(f"   CLIP: {'✅' if health.get('models', {}).get('clip', {}).get('loaded') else '❌'}")
    except Exception as e:
        print(f"❌ AI API not reachable at {AI_API_URL}: {e}")
        print("   Start it with: python api.py")
        return False

    # Check Supabase
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        resp = requests.get(f"{SUPABASE_URL}/rest/v1/luggage?select=id&limit=1", headers=headers, timeout=10)
        if resp.status_code in [200, 406]:
            print(f"✅ Supabase connected")
        else:
            print(f"⚠️  Supabase returned: {resp.status_code}")
    except Exception as e:
        print(f"❌ Supabase not reachable: {e}")
        return False

    return True


def get_dataset_images():
    """Get list of images from the dataset folders"""
    extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    found_dir = os.path.join(DATASET_DIR, 'found')
    lost_dir = os.path.join(DATASET_DIR, 'lost')

    found_images = sorted([
        f for f in Path(found_dir).iterdir()
        if f.suffix.lower() in extensions
    ]) if os.path.exists(found_dir) else []

    lost_images = sorted([
        f for f in Path(lost_dir).iterdir()
        if f.suffix.lower() in extensions
    ]) if os.path.exists(lost_dir) else []

    return found_images, lost_images


def upload_to_supabase_storage(file_path, storage_path):
    """Upload a file to Supabase Storage and return the public URL"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }

    # Read file
    with open(file_path, 'rb') as f:
        file_data = f.read()

    # Determine content type
    ext = Path(file_path).suffix.lower()
    content_types = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}
    content_type = content_types.get(ext, 'image/jpeg')

    # Upload
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
    headers['Content-Type'] = content_type

    resp = requests.post(upload_url, headers=headers, data=file_data)

    if resp.status_code in [200, 201]:
        # Get public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        return public_url
    elif resp.status_code == 409:
        # Already exists, return URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        return public_url
    else:
        print(f"   ⚠️  Upload failed ({resp.status_code}): {resp.text[:200]}")
        return None


def generate_embeddings_from_file(file_path):
    """Generate ResNet50 + CLIP embeddings by uploading the file directly to the AI API"""
    try:
        with open(file_path, 'rb') as f:
            image_bytes = f.read()

        # Use the API's /embed endpoint with multipart upload
        import io
        files = {'image': (os.path.basename(file_path), io.BytesIO(image_bytes), 'image/jpeg')}
        resp = requests.post(
            f"{AI_API_URL}/embed",
            files=files,
            timeout=60
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get('embedding'), data.get('clip_embedding')
        else:
            # Try the /embed-url endpoint as fallback if image is already uploaded
            return None, None
    except Exception as e:
        print(f"   ⚠️  Embedding error: {e}")
        return None, None


def insert_luggage_record(image_url, status, resnet_emb, clip_emb, metadata):
    """Insert a luggage record into Supabase"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

    record = {
        'mongo_user_id': 'seed_system',  # System user for seeded data
        'image_url': image_url,
        'status': status,
        'is_active': True,
        'description': metadata.get('description'),
        'color': metadata.get('color'),
        'bag_type': metadata.get('bag_type'),
        'brand': metadata.get('brand'),
        'metadata': {
            'location': metadata.get('location', 'Unknown'),
            'source': 'seed_data',
            'seeded_at': time.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
    }

    if resnet_emb:
        record['embedding'] = resnet_emb
    if clip_emb:
        record['clip_embedding'] = clip_emb

    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/luggage",
        headers=headers,
        json=record
    )

    if resp.status_code in [200, 201]:
        return resp.json()
    else:
        print(f"   ⚠️  DB insert failed ({resp.status_code}): {resp.text[:200]}")
        return None


def seed_database():
    """Main seeding function"""
    print("🧳 BaggageLens - Database Seeder")
    print("=" * 60)

    if not check_prerequisites():
        return False

    found_images, lost_images = get_dataset_images()
    all_images = found_images + lost_images
    random.shuffle(all_images)

    if not all_images:
        print("❌ No images found in dataset/")
        return False

    print(f"\n📦 Dataset: {len(all_images)} images available")
    print(f"   Will seed: {FOUND_ITEMS_COUNT} found + {LOST_ITEMS_COUNT} lost items")

    # Select subset
    total_to_seed = min(FOUND_ITEMS_COUNT + LOST_ITEMS_COUNT, len(all_images))
    selected = all_images[:total_to_seed]
    found_batch = selected[:FOUND_ITEMS_COUNT]
    lost_batch = selected[FOUND_ITEMS_COUNT:FOUND_ITEMS_COUNT + LOST_ITEMS_COUNT]

    print(f"\n🔄 Seeding {len(found_batch)} found items + {len(lost_batch)} lost items...")
    print("   (Each image: upload → embed → insert. This takes ~5-10 seconds per image)")

    success_count = 0
    fail_count = 0
    start_time = time.time()

    for i, img_path in enumerate(selected):
        status = 'found' if i < len(found_batch) else 'lost'
        label = '📦 Found' if status == 'found' else '🔍 Lost'

        # Generate random realistic metadata
        metadata = {
            'color': random.choice(COLORS),
            'bag_type': random.choice(BAG_TYPES),
            'brand': random.choice(BRANDS),
            'description': random.choice(DESCRIPTIONS),
            'location': random.choice(LOCATIONS),
        }

        print(f"\n[{i+1}/{total_to_seed}] {label}: {img_path.name}")
        brand_str = f' ({metadata["brand"]})' if metadata.get('brand') else ''
        print(f"   Metadata: {metadata['color']} {metadata['bag_type']}{brand_str}")

        # 1. Upload to storage
        storage_path = f"seed/{status}/{img_path.name}"
        image_url = upload_to_supabase_storage(img_path, storage_path)
        if not image_url:
            fail_count += 1
            continue
        print(f"   ✅ Uploaded")

        # 2. Generate embeddings from local file (avoids URL download issues)
        resnet_emb, clip_emb = generate_embeddings_from_file(img_path)
        models_used = []
        if resnet_emb:
            models_used.append('ResNet50')
        if clip_emb:
            models_used.append('CLIP')
        print(f"   ✅ Embeddings: [{', '.join(models_used) or 'none'}]")

        # 3. Insert record
        record = insert_luggage_record(image_url, status, resnet_emb, clip_emb, metadata)
        if record:
            success_count += 1
            print(f"   ✅ Saved to DB")
        else:
            fail_count += 1

        # Rate limiting
        time.sleep(0.5)

        # Progress ETA
        elapsed = time.time() - start_time
        avg_per_item = elapsed / (i + 1)
        remaining = avg_per_item * (total_to_seed - i - 1)
        if remaining > 60:
            eta = f"{remaining/60:.1f}m"
        else:
            eta = f"{remaining:.0f}s"
        print(f"   ⏱️  ETA: {eta}")

    # Summary
    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print("🎉 Seeding Complete!")
    print("=" * 60)
    print(f"   ✅ Successful: {success_count}")
    print(f"   ❌ Failed: {fail_count}")
    print(f"   ⏱️  Total time: {elapsed/60:.1f} minutes")
    print(f"\n   The database now has {success_count} luggage items with AI embeddings.")
    print(f"   Remaining ~{len(all_images) - total_to_seed} images are available as test data")
    print(f"   (for testing 'no match' scenarios)")

    # Save test image list for reference
    test_images = all_images[total_to_seed:]
    if test_images:
        test_file = os.path.join(DATASET_DIR, 'test_images.txt')
        with open(test_file, 'w') as f:
            f.write("# These images are NOT in the database.\n")
            f.write("# Upload them via the app to test 'no match' scenarios.\n\n")
            for img in test_images[:50]:
                f.write(f"{img}\n")
        print(f"\n   📝 Test images list saved to: dataset/test_images.txt")

    return True


if __name__ == "__main__":
    if not seed_database():
        sys.exit(1)
