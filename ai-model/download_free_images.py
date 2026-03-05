"""
BaggageLens - Download Free Luggage Images for Training

Downloads luggage/suitcase images from free public sources (Unsplash, Pexels, Lorem Picsum)
and organizes them for training.

Usage:
    python download_free_images.py
"""

import os
import requests
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
LOST_DIR = os.path.join(DATASET_DIR, 'lost')
FOUND_DIR = os.path.join(DATASET_DIR, 'found')

# Free luggage/suitcase images from Unsplash (direct image URLs)
# These are freely usable under the Unsplash license
UNSPLASH_LUGGAGE_IDS = [
    # Suitcases and luggage
    "tGBXiHxJlMk",  # suitcase
    "WBGjg0DsO_g",  # luggage
    "9HI8UJMSdZA",  # suitcase on conveyor
    "0ZBRKEG_5no",  # travel bags
    "PH4JzGHAn5c",  # suitcase
    "6LBBOwkPzyQ",  # luggage
    "IO2Kk2ss5DY",  # bags
    "_94HLr_QXo8",  # suitcase
    "ReEqHw1gyj4",  # luggage rack
    "tPLALWud_RI",  # bags
    "V3DokM1NQcs",  # travel bag
    "5Hl5reICevY",  # backpack
    "oRWRlTgBrPo",  # suitcase
    "e6FMMambeO4",  # luggage
    "YddMIRck34I",  # travel
    "NuOGFo4PudE",  # bags
    "nJHoP0ZIk2w",  # suitcase
    "GLA3Pv_SgKw",  # luggage belt
    "3l3RwQdHRHg",  # travel bags
    "-6WiY7tKm2o",  # bags
    "JBwcenOuRCg",  # travel
    "Nfy0t-KMWnE",  # bags
    "CnthDZXCdoY",  # suitcase
    "aJnHWEOOfRE",  # bags
    "LJ36url5Z_M",  # luggage
    "gKUC4TMhOiY",  # bags
    "FHnnjk1Yj7Y",  # travel bags
    "FCHlYvR5gJI",  # suitcase 
    "OtXADkUh3-I",  # luggage belt
    "iKdQCIiSMlQ",  # bags
    "tE7_jvK-_YU",  # travel
    "bJhT_8nbUA0",  # suitcase
    "zDCkmPs4Now",  # luggage
    "rIKAaR4AdCg",  # bag
    "BNBA1h-NgdY",  # travel bag
    "Mwuod2cm8g4",  # suitcase
    "3TLl_97HNJo",  # bags
    "N_Y88TWmGwA",  # bag
    "YlmELQZl5gM",  # bag
    "VIFnBpEiV0I",  # luggage
    "dJdcb11aboQ",  # suitcase
    "YneSv_KDk2g",  # luggage
    "7MAjXGUmaPg",  # bag
    "2EGNqazbAMk",  # bags
    "wD1LRb9OeEo",  # travel
    "R-LK3sqLiBw",  # bags
    "C_71FkAV3jE",  # suitcase
    "_uqbMFHEjUU",  # bags
    "pElSkGRA2NU",  # airport
    "cYrMQA7a3Wc",  # bags
    "F59Bl3yBiJk",  # travel
    "KgLtFCgfC28",  # bags
    "U-Kty6HxcQc",  # bags
    "T01GZhBSyMQ",  # bags
    "rCbdp8VCYhQ",  # bags
    "Wafer-WKqWA",  # bags
    "MEL-jJnm7RQ",  # luggage
    "auIbTAcSH6E",  # airport
    "RIz5AUbLOkE",  # bags
    "l3MMvRaSHuo",  # bags  
    "cLaaxa4Jhk4",  # bags
    "4tlpKNybkrY",  # bags
    "GtYFwFrFbMA",  # bags
    "N7sMJSLkfZ0",  # bags
    "5VoGBJQcDzA",  # suitcase
    "bViMd-fvI_A",  # bags
    "3PeSjpLVtLg",  # bags
    "IBWJsMObnnU",  # bags
    "-moOiJco_qk",  # bags
    "nBDjuEPqT3c",  # bags
    "7rriIaBH6JY",  # bags
    "NZzVFEOPLuo",  # bags
    "X16zXkbKJA4",  # bags
    "qpha85bOBCk",  # bags
    "jLwVAUtLOAQ",  # bags
    "9i8rCxzJw2Y",  # bags
    "BHMDnKiQwqo",  # bags
    "KD9LmqJtXe4",  # luggage
    "oMpAz-DN-9I",  # bags
]

def download_image(url, filepath, timeout=15):
    """Download a single image"""
    try:
        headers = {
            'User-Agent': 'BaggageLens Training Data Collector (github.com)'
        }
        response = requests.get(url, headers=headers, timeout=timeout, stream=True)
        response.raise_for_status()
        
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type and 'octet-stream' not in content_type:
            return False, f"Not an image: {content_type}"
            
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Verify it's a valid image
        file_size = os.path.getsize(filepath)
        if file_size < 1000:  # Less than 1KB is likely not a valid image
            os.remove(filepath)
            return False, "File too small"
            
        return True, "OK"
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return False, str(e)


def download_unsplash_images():
    """Download luggage images from Unsplash"""
    os.makedirs(LOST_DIR, exist_ok=True)
    os.makedirs(FOUND_DIR, exist_ok=True)
    
    print(f"🔄 Downloading {len(UNSPLASH_LUGGAGE_IDS)} images from Unsplash...")
    print("   (These are free to use under the Unsplash license)")
    
    # Split IDs into lost and found
    split = len(UNSPLASH_LUGGAGE_IDS) // 2
    lost_ids = UNSPLASH_LUGGAGE_IDS[:split]
    found_ids = UNSPLASH_LUGGAGE_IDS[split:]
    
    total_downloaded = 0
    total_failed = 0
    
    def download_batch(ids, target_dir, prefix):
        nonlocal total_downloaded, total_failed
        downloaded = 0
        failed = 0
        
        for i, img_id in enumerate(ids):
            # Unsplash source URL - 640px wide (good quality, reasonable size)
            url = f"https://images.unsplash.com/photo-{img_id}?w=640&q=80&fit=crop"
            # Also try the simpler format
            alt_url = f"https://source.unsplash.com/{img_id}/640x480"
            
            filepath = os.path.join(target_dir, f"{prefix}_{i+1:04d}.jpg")
            
            success, msg = download_image(url, filepath)
            if not success:
                # Try alternative URL format
                success, msg = download_image(alt_url, filepath)
            
            if success:
                downloaded += 1
                total_downloaded += 1
            else:
                failed += 1
                total_failed += 1
            
            if (i + 1) % 10 == 0:
                print(f"   [{i+1}/{len(ids)}] {prefix}: {downloaded} downloaded, {failed} failed")
            
            # Be nice to the server
            time.sleep(0.3)
        
        return downloaded, failed
    
    print(f"\n📁 Downloading to dataset/lost/ ...")
    lost_ok, lost_fail = download_batch(lost_ids, LOST_DIR, "bag")
    
    print(f"\n📁 Downloading to dataset/found/ ...")
    found_ok, found_fail = download_batch(found_ids, FOUND_DIR, "item")
    
    return total_downloaded, total_failed


def generate_synthetic_luggage():
    """Generate synthetic luggage images using colored rectangles with features"""
    try:
        import numpy as np
        import cv2
    except ImportError:
        print("   ⚠️  numpy/opencv not available for synthetic generation")
        return 0

    print("\n🎨 Generating synthetic luggage images as supplementary data...")
    
    os.makedirs(LOST_DIR, exist_ok=True)
    os.makedirs(FOUND_DIR, exist_ok=True)
    
    # Count existing images
    existing_lost = len([f for f in os.listdir(LOST_DIR) if f.endswith(('.jpg', '.png'))])
    existing_found = len([f for f in os.listdir(FOUND_DIR) if f.endswith(('.jpg', '.png'))])
    
    colors = [
        (30, 30, 30),    # Black
        (50, 50, 150),   # Navy
        (150, 50, 50),   # Burgundy
        (50, 100, 50),   # Dark Green
        (100, 100, 100), # Gray
        (200, 180, 150), # Tan
        (180, 50, 50),   # Red
        (50, 50, 180),   # Blue
        (150, 100, 50),  # Brown
        (200, 200, 200), # Silver
        (255, 200, 100), # Gold
        (100, 50, 150),  # Purple
        (50, 150, 150),  # Teal
        (200, 100, 50),  # Orange
        (150, 150, 50),  # Olive
    ]
    
    generated = 0
    target_per_folder = max(30, 50 - min(existing_lost, existing_found))
    
    for folder, prefix, start_idx in [(LOST_DIR, "syn_bag", existing_lost),
                                       (FOUND_DIR, "syn_item", existing_found)]:
        for i in range(target_per_folder):
            img = np.ones((224, 224, 3), dtype=np.uint8) * 240  # Light background
            
            color = colors[i % len(colors)]
            
            # Random suitcase-like shape
            suitcase_type = np.random.choice(['upright', 'horizontal', 'backpack'])
            
            if suitcase_type == 'upright':
                x1 = np.random.randint(40, 70)
                y1 = np.random.randint(20, 40)
                x2 = np.random.randint(150, 180)
                y2 = np.random.randint(180, 210)
                cv2.rectangle(img, (x1, y1), (x2, y2), color, -1)
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 0), 2)
                # Handle
                hx = (x1 + x2) // 2
                cv2.rectangle(img, (hx - 15, y1 - 15), (hx + 15, y1), (80, 80, 80), -1)
                # Wheels
                cv2.circle(img, (x1 + 15, y2 + 5), 5, (50, 50, 50), -1)
                cv2.circle(img, (x2 - 15, y2 + 5), 5, (50, 50, 50), -1)
                # Zipper line
                cy = (y1 + y2) // 2
                cv2.line(img, (x1 + 5, cy), (x2 - 5, cy), (0, 0, 0), 1)
                
            elif suitcase_type == 'horizontal':
                x1 = np.random.randint(20, 40)
                y1 = np.random.randint(50, 80)
                x2 = np.random.randint(180, 210)
                y2 = np.random.randint(160, 190)
                cv2.rectangle(img, (x1, y1), (x2, y2), color, -1)
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 0), 2)
                # Handle on side
                cv2.rectangle(img, (x2, (y1+y2)//2 - 10), (x2 + 12, (y1+y2)//2 + 10), (80, 80, 80), -1)
                # Buckles
                cv2.rectangle(img, ((x1+x2)//2 - 20, y1 + 5), ((x1+x2)//2 + 20, y1 + 15), (200, 200, 200), -1)
                
            else:  # backpack
                cx, cy = 112, 110
                w, h = np.random.randint(50, 70), np.random.randint(70, 90)
                pts = np.array([
                    [cx - w, cy - h],
                    [cx + w, cy - h],
                    [cx + w + 5, cy + h],
                    [cx - w - 5, cy + h]
                ], np.int32)
                cv2.fillPoly(img, [pts], color)
                cv2.polylines(img, [pts], True, (0, 0, 0), 2)
                # Straps
                cv2.line(img, (cx - w + 10, cy - h), (cx - w + 5, cy + h + 15), (0, 0, 0), 3)
                cv2.line(img, (cx + w - 10, cy - h), (cx + w - 5, cy + h + 15), (0, 0, 0), 3)
                # Pocket
                cv2.rectangle(img, (cx - 25, cy), (cx + 25, cy + 30), 
                            tuple(min(c + 30, 255) for c in color), -1)
            
            # Add some noise for realism
            noise = np.random.normal(0, 5, img.shape).astype(np.int16)
            img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
            
            filepath = os.path.join(folder, f"{prefix}_{i+1:04d}.jpg")
            cv2.imwrite(filepath, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            generated += 1
    
    print(f"   ✅ Generated {generated} synthetic luggage images")
    return generated


if __name__ == "__main__":
    print("🧳 BaggageLens - Free Image Downloader")
    print("=" * 50)
    
    # Try downloading real images
    downloaded, failed = download_unsplash_images()
    print(f"\n📊 Download Results:")
    print(f"   ✅ Downloaded: {downloaded}")
    print(f"   ❌ Failed: {failed}")
    
    # If we didn't get enough images, supplement with synthetic ones
    lost_count = len([f for f in os.listdir(LOST_DIR) if f.endswith(('.jpg', '.png'))]) if os.path.exists(LOST_DIR) else 0
    found_count = len([f for f in os.listdir(FOUND_DIR) if f.endswith(('.jpg', '.png'))]) if os.path.exists(FOUND_DIR) else 0
    
    print(f"\n📁 Current dataset:")
    print(f"   lost/:  {lost_count} images")
    print(f"   found/: {found_count} images")
    
    if lost_count < 20 or found_count < 20:
        print(f"\n⚠️  Not enough real images downloaded (need ~20+ per folder)")
        print("   Generating synthetic luggage images to supplement...")
        generate_synthetic_luggage()
        
        lost_count = len([f for f in os.listdir(LOST_DIR) if f.endswith(('.jpg', '.png'))])
        found_count = len([f for f in os.listdir(FOUND_DIR) if f.endswith(('.jpg', '.png'))])
        print(f"\n📁 Final dataset:")
        print(f"   lost/:  {lost_count} images")
        print(f"   found/: {found_count} images")
    
    print(f"\n🚀 Ready to train! Run:")
    print(f"   python train_local.py")
