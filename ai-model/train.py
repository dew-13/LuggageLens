import tensorflow as tf
from tensorflow import keras
import numpy as np
import cv2
from pathlib import Path
import os

"""
Training script for Siamese CNN Network

Usage:
    python train.py

Dataset structure:
    dataset/
    ├── lost/
    │   ├── bag_001.jpg
    │   ├── bag_002.jpg
    │   └── ...
    └── found/
        ├── item_001.jpg
        ├── item_002.jpg
        └── ...

Training steps:
    1. Load and preprocess images
    2. Generate positive pairs (same bag, different angles)
    3. Generate negative pairs (different bags)
    4. Train Siamese network
    5. Save model
"""

IMAGE_SIZE = (256, 256)
BATCH_SIZE = 32
EPOCHS = 50

def load_images_from_directory(directory, size=IMAGE_SIZE):
    """Load images from directory"""
    images = []
    labels = []
    
    if not os.path.exists(directory):
        print(f"⚠️  Directory not found: {directory}")
        return [], []
    
    for idx, img_file in enumerate(Path(directory).glob('*.jpg')):
        try:
            img = cv2.imread(str(img_file))
            if img is not None:
                img = cv2.resize(img, size)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                images.append(img / 255.0)  # Normalize
                labels.append(idx)
        except Exception as e:
            print(f"Error loading {img_file}: {e}")
    
    return np.array(images), np.array(labels)

def generate_pairs(images, labels, num_pairs=1000):
    """Generate positive and negative pairs"""
    pairs = []
    pair_labels = []
    
    num_images = len(images)
    
    # Generate positive pairs
    for _ in range(num_pairs // 2):
        idx1 = np.random.randint(0, num_images)
        idx2 = np.random.randint(0, num_images)
        
        if labels[idx1] == labels[idx2]:  # Same class (same bag)
            pairs.append([images[idx1], images[idx2]])
            pair_labels.append(1)  # Positive
    
    # Generate negative pairs
    for _ in range(num_pairs // 2):
        idx1 = np.random.randint(0, num_images)
        idx2 = np.random.randint(0, num_images)
        
        if labels[idx1] != labels[idx2]:  # Different class (different bags)
            pairs.append([images[idx1], images[idx2]])
            pair_labels.append(0)  # Negative
    
    return np.array(pairs), np.array(pair_labels)

def train_siamese_network():
    """Main training function"""
    from siamese_model import create_siamese_network
    
    print("🔄 Loading training data...")
    
    # Load images (placeholder structure)
    lost_images, lost_labels = load_images_from_directory('dataset/lost')
    found_images, found_labels = load_images_from_directory('dataset/found')
    
    # If no real data, create dummy data for demonstration
    if len(lost_images) == 0:
        print("⚠️  No training data found. Creating dummy data for demonstration...")
        lost_images = np.random.rand(10, 256, 256, 3)
        lost_labels = np.arange(10)
    
    if len(found_images) == 0:
        found_images = np.random.rand(10, 256, 256, 3)
        found_labels = np.arange(10, 20)
    
    # Combine datasets
    all_images = np.vstack([lost_images, found_images])
    all_labels = np.hstack([lost_labels, found_labels])
    
    print(f"✅ Loaded {len(all_images)} images")
    
    # Generate pairs
    print("🔄 Generating image pairs...")
    pairs, labels = generate_pairs(all_images, all_labels, num_pairs=500)
    print(f"✅ Generated {len(pairs)} pairs")
    
    # Create model
    print("🔄 Creating Siamese network...")
    model = create_siamese_network()
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    print("🔄 Starting training...")
    
    # Train
    history = model.fit(
        [pairs[:, 0], pairs[:, 1]], labels,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_split=0.2,
        verbose=1
    )
    
    # Save model
    os.makedirs('models', exist_ok=True)
    model.save('models/siamese_model.h5')
    print("✅ Model saved to models/siamese_model.h5")
    
    return model, history

if __name__ == "__main__":
    model, history = train_siamese_network()
