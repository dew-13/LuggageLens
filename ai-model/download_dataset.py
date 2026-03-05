"""
BaggageLens - Download Luggage Dataset for Local Training

Downloads the Roboflow luggage dataset and organizes it into
the required folder structure for train.py.

Usage:
    pip install roboflow
    python download_dataset.py

Dataset structure created:
    dataset/
    ├── lost/
    │   ├── bag_001.jpg
    │   └── ...
    └── found/
        ├── bag_001.jpg
        └── ...
"""

import os
import shutil
from pathlib import Path

DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')


def download_roboflow_dataset():
    """Download luggage dataset from Roboflow"""
    try:
        from roboflow import Roboflow
    except ImportError:
        print("❌ roboflow package not installed.")
        print("   Run: pip install roboflow")
        return False

    from dotenv import load_dotenv
    load_dotenv()

    print("🔄 Downloading luggage dataset from Roboflow...")
    print("   Dataset: luggage-kcuiy (luggage-7rqr6 workspace)")

    ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
    if not ROBOFLOW_API_KEY:
        print("❌ ROBOFLOW_API_KEY not found in .env file")
        print("   Add this to ai-model/.env:")
        print("   ROBOFLOW_API_KEY=your_key_here")
        return None

    try:
        rf = Roboflow(api_key=ROBOFLOW_API_KEY)
        project = rf.workspace("luggage-7rqr6").project("luggage-kcuiy")
        version = project.version(1)
        # Object-detection datasets require a detection format (not 'folder')
        # yolov8 format gives us images in train/valid/test subdirectories
        raw_location = os.path.join(DATASET_DIR, '_raw')
        dataset = version.download("yolov8", location=raw_location)

        raw_dir = dataset.location
        print(f"✅ Downloaded to: {raw_dir}")
        return raw_dir

    except Exception as e:
        print(f"❌ Download failed: {e}")
        print("\n📝 Alternative: manually add luggage images to:")
        print(f"   {os.path.join(DATASET_DIR, 'lost')}/")
        print(f"   {os.path.join(DATASET_DIR, 'found')}/")
        return None


def organize_dataset(raw_dir):
    """
    Organize downloaded images into lost/ and found/ folders.
    
    Strategy: Split images roughly 50/50 into lost and found.
    Each image file represents a unique luggage identity.
    The augmentation pipeline in train.py creates variants of each.
    """
    lost_dir = os.path.join(DATASET_DIR, 'lost')
    found_dir = os.path.join(DATASET_DIR, 'found')
    os.makedirs(lost_dir, exist_ok=True)
    os.makedirs(found_dir, exist_ok=True)

    # Collect all images from the raw download
    extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    all_images = []

    for root, dirs, files in os.walk(raw_dir):
        for f in files:
            if Path(f).suffix.lower() in extensions:
                all_images.append(os.path.join(root, f))

    if not all_images:
        print("⚠️  No images found in downloaded dataset")
        return False

    print(f"📦 Found {len(all_images)} images in downloaded dataset")

    # Split 50/50 into lost and found
    split_point = len(all_images) // 2

    lost_count = 0
    found_count = 0

    for i, img_path in enumerate(all_images):
        ext = Path(img_path).suffix.lower()
        if i < split_point:
            dst = os.path.join(lost_dir, f"bag_{i+1:04d}{ext}")
            shutil.copy2(img_path, dst)
            lost_count += 1
        else:
            dst = os.path.join(found_dir, f"item_{i-split_point+1:04d}{ext}")
            shutil.copy2(img_path, dst)
            found_count += 1

    print(f"✅ Organized dataset:")
    print(f"   📁 dataset/lost/  → {lost_count} images")
    print(f"   📁 dataset/found/ → {found_count} images")
    print(f"   Total: {lost_count + found_count} unique luggage identities")

    return True


def check_existing_dataset():
    """Check if dataset already has images"""
    lost_dir = os.path.join(DATASET_DIR, 'lost')
    found_dir = os.path.join(DATASET_DIR, 'found')

    lost_count = 0
    found_count = 0

    if os.path.exists(lost_dir):
        lost_count = len([f for f in os.listdir(lost_dir)
                         if Path(f).suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp'}])
    if os.path.exists(found_dir):
        found_count = len([f for f in os.listdir(found_dir)
                          if Path(f).suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp'}])

    return lost_count, found_count


if __name__ == "__main__":
    print("🧳 BaggageLens Dataset Downloader")
    print("=" * 50)

    # Check existing
    lost_count, found_count = check_existing_dataset()
    if lost_count > 0 or found_count > 0:
        print(f"\n📦 Existing dataset found:")
        print(f"   lost/: {lost_count} images")
        print(f"   found/: {found_count} images")
        response = input("\n   Overwrite? (y/N): ").strip().lower()
        if response != 'y':
            print("   Keeping existing dataset.")
            exit(0)

    # Download
    raw_dir = download_roboflow_dataset()
    if raw_dir:
        organize_dataset(raw_dir)
        print("\n🚀 Ready to train! Run:")
        print("   python train_local.py")
    else:
        print("\n📝 Manual alternative:")
        print("   1. Download luggage images from Google Images / Unsplash / Pexels")
        print("   2. Place ~50+ images in dataset/lost/")
        print("   3. Place ~50+ images in dataset/found/")
        print("   4. Run: python train_local.py")
