import tensorflow as tf
from tensorflow import keras
import numpy as np
import cv2
from pathlib import Path
import os
import albumentations as A

"""
Training script for ResNet50 Siamese Network (Local)

⚠️ NOTE: For best results, use google_colab_training.ipynb with GPU.
This script is for local training with smaller datasets.

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

Each image file is treated as a unique bag identity.
Data augmentation creates multiple variants to form positive pairs.
"""

IMAGE_SIZE = (224, 224)  # ResNet50 standard input
BATCH_SIZE = 16          # Smaller batch for local (no GPU)
EPOCHS = 20
AUGMENTATIONS_PER_IMAGE = 6


# ============================================================
# Data Augmentation Pipeline
# ============================================================

augment_pipeline = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.15, rotate_limit=20, p=0.7),
    A.Perspective(scale=(0.02, 0.08), p=0.3),
    A.OneOf([
        A.RandomBrightnessContrast(brightness_limit=0.3, contrast_limit=0.3, p=1.0),
        A.HueSaturationValue(hue_shift_limit=15, sat_shift_limit=30, val_shift_limit=25, p=1.0),
    ], p=0.8),
    A.OneOf([
        A.GaussianBlur(blur_limit=(3, 5), p=1.0),
        A.GaussNoise(var_limit=(10.0, 40.0), p=1.0),
    ], p=0.4),
])


def load_images_from_directory(directory, size=IMAGE_SIZE):
    """Load images from directory, each file = unique identity"""
    images = []
    labels = []

    if not os.path.exists(directory):
        print(f"⚠️  Directory not found: {directory}")
        return [], []

    extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp']
    idx = 0
    for ext in extensions:
        for img_file in Path(directory).glob(ext):
            try:
                img = cv2.imread(str(img_file))
                if img is not None:
                    img = cv2.resize(img, size)
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    images.append(img / 255.0)
                    labels.append(idx)
                    idx += 1
            except Exception as e:
                print(f"Error loading {img_file}: {e}")

    return np.array(images, dtype=np.float32), np.array(labels)


def augment_dataset(images, labels, augmentations_per_image=AUGMENTATIONS_PER_IMAGE):
    """Create augmented variants for each image (same identity label)"""
    all_images = []
    all_labels = []

    for img, label in zip(images, labels):
        # Keep original
        all_images.append(img)
        all_labels.append(label)

        # Create augmented copies
        img_uint8 = (img * 255).astype(np.uint8)
        for _ in range(augmentations_per_image):
            augmented = augment_pipeline(image=img_uint8)['image']
            all_images.append(augmented.astype(np.float32) / 255.0)
            all_labels.append(label)

    return np.array(all_images), np.array(all_labels)


def generate_pairs(images, labels, num_pairs=2000):
    """Generate balanced positive and negative pairs"""
    pairs_left = []
    pairs_right = []
    pair_labels = []

    unique_labels = np.unique(labels)
    label_to_indices = {lbl: np.where(labels == lbl)[0] for lbl in unique_labels}

    for _ in range(num_pairs):
        if np.random.random() > 0.5:
            # Positive pair
            lbl = np.random.choice(unique_labels)
            indices = label_to_indices[lbl]
            if len(indices) >= 2:
                idx1, idx2 = np.random.choice(indices, 2, replace=False)
            else:
                idx1 = idx2 = indices[0]
            pairs_left.append(images[idx1])
            pairs_right.append(images[idx2])
            pair_labels.append(1.0)
        else:
            # Negative pair
            lbl1, lbl2 = np.random.choice(unique_labels, 2, replace=False)
            idx1 = np.random.choice(label_to_indices[lbl1])
            idx2 = np.random.choice(label_to_indices[lbl2])
            pairs_left.append(images[idx1])
            pairs_right.append(images[idx2])
            pair_labels.append(0.0)

    return np.array(pairs_left), np.array(pairs_right), np.array(pair_labels)


def train_siamese_network():
    """Main training function"""
    from siamese_model import create_siamese_network

    print("🔄 Loading training data...")

    # Load images
    lost_images, lost_labels = load_images_from_directory('dataset/lost')
    found_images, found_labels = load_images_from_directory('dataset/found')

    # Offset found labels to avoid overlap
    if len(found_labels) > 0:
        found_labels = found_labels + (max(lost_labels) + 1 if len(lost_labels) > 0 else 0)

    # Handle empty dataset
    if len(lost_images) == 0 and len(found_images) == 0:
        print("⚠️  No training data found in dataset/lost/ or dataset/found/")
        print("📝 Options:")
        print("   1. Add luggage images to dataset/lost/ and dataset/found/")
        print("   2. Use google_colab_training.ipynb to download Roboflow dataset")
        return None, None

    # Combine datasets
    if len(lost_images) > 0 and len(found_images) > 0:
        all_images = np.vstack([lost_images, found_images])
        all_labels = np.hstack([lost_labels, found_labels])
    elif len(lost_images) > 0:
        all_images, all_labels = lost_images, lost_labels
    else:
        all_images, all_labels = found_images, found_labels

    print(f"✅ Loaded {len(all_images)} original images")

    # Data augmentation
    print(f"🔄 Augmenting images (×{AUGMENTATIONS_PER_IMAGE} per image)...")
    all_images, all_labels = augment_dataset(all_images, all_labels)
    print(f"✅ Dataset expanded to {len(all_images)} images ({len(np.unique(all_labels))} identities)")

    # Generate pairs
    num_pairs = min(5000, len(all_images) * 3)
    print(f"🔄 Generating {num_pairs} training pairs...")
    left, right, labels = generate_pairs(all_images, all_labels, num_pairs)

    # Train/validation split
    split = int(len(labels) * 0.8)
    left_train, left_val = left[:split], left[split:]
    right_train, right_val = right[:split], right[split:]
    labels_train, labels_val = labels[:split], labels[split:]

    print(f"✅ Training: {len(labels_train)}, Validation: {len(labels_val)}")

    # Create model
    print("🔄 Building Siamese Network with ResNet50 encoder...")
    model, encoder = create_siamese_network()

    # Compile
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    # Train
    print(f"🚀 Training for {EPOCHS} epochs...")
    history = model.fit(
        [left_train, right_train], labels_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_data=([left_val, right_val], labels_val),
        callbacks=[
            keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3),
        ],
        verbose=1
    )

    # Save models
    os.makedirs('models', exist_ok=True)
    model.save('models/siamese_model.h5')
    encoder.save('models/encoder_model.h5')
    print("✅ Siamese model saved to models/siamese_model.h5")
    print("✅ Encoder model saved to models/encoder_model.h5")

    # Final evaluation
    loss, accuracy = model.evaluate([left_val, right_val], labels_val, verbose=0)
    print(f"\n📊 Final Performance:")
    print(f"   Loss:     {loss:.4f}")
    print(f"   Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")

    return model, history


if __name__ == "__main__":
    model, history = train_siamese_network()
