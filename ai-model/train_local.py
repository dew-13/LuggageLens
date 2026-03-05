"""
BaggageLens - Local Training Script (PyTorch - Optimized for CPU + 20GB RAM)

Trains a ResNet50-based Siamese Network for luggage image matching.
Outputs a 512-dimensional embedding compatible with Supabase pgvector.

Optimized for:
  - CPU training (no GPU required)
  - 20GB RAM
  - PyTorch backend (Python 3.13 compatible)

Expected Training Time (CPU-only):
  - 75 images:   ~10-15 minutes
  - 150 images:  ~20-30 minutes

Usage:
    python train_local.py
    python train_local.py --images-limit 100 --epochs 20 --batch-size 8
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
import numpy as np
from PIL import Image
from pathlib import Path
import os
import sys
import time
import argparse
import gc
import random

# ============================================================
# Configuration
# ============================================================

IMAGE_SIZE = 224
EMBEDDING_DIM = 512

DEFAULT_BATCH_SIZE = 8
DEFAULT_EPOCHS = 20
DEFAULT_AUGMENTATIONS = 5
DEFAULT_NUM_PAIRS = 3000
DEFAULT_IMAGES_LIMIT = 150  # Use 150 images by default (75 per folder)


def parse_args():
    parser = argparse.ArgumentParser(description='BaggageLens Local Training (PyTorch)')
    parser.add_argument('--batch-size', type=int, default=DEFAULT_BATCH_SIZE,
                        help=f'Batch size (default: {DEFAULT_BATCH_SIZE})')
    parser.add_argument('--epochs', type=int, default=DEFAULT_EPOCHS,
                        help=f'Number of epochs (default: {DEFAULT_EPOCHS})')
    parser.add_argument('--augmentations', type=int, default=DEFAULT_AUGMENTATIONS,
                        help=f'Augmentations per image (default: {DEFAULT_AUGMENTATIONS})')
    parser.add_argument('--num-pairs', type=int, default=DEFAULT_NUM_PAIRS,
                        help=f'Number of training pairs (default: {DEFAULT_NUM_PAIRS})')
    parser.add_argument('--images-limit', type=int, default=DEFAULT_IMAGES_LIMIT,
                        help=f'Max images to load, 0=all (default: {DEFAULT_IMAGES_LIMIT})')
    parser.add_argument('--resume', action='store_true',
                        help='Resume from last checkpoint')
    return parser.parse_args()


# ============================================================
# Memory Monitoring
# ============================================================

def get_memory_mb():
    try:
        import psutil
        return psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)
    except ImportError:
        return 0


def print_memory(label=""):
    mem = get_memory_mb()
    if mem > 0:
        print(f"   💾 RAM: {mem:.0f} MB {label}")


# ============================================================
# ResNet50 Encoder (produces 512-dim L2-normalized embeddings)
# ============================================================

class ResNet50Encoder(nn.Module):
    """
    ResNet50-based encoder for luggage embeddings.
    
    Architecture:
        ResNet50 (ImageNet pretrained) → AdaptiveAvgPool → 
        Dense(1024) → BN → ReLU → Dropout → Dense(512) → L2-normalize
    
    Output: 512-dim L2-normalized vector (compatible with Supabase pgvector cosine similarity)
    """
    def __init__(self, embedding_dim=EMBEDDING_DIM):
        super().__init__()
        
        # Load pre-trained ResNet50
        resnet = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
        
        # Remove the classification head (fc layer)
        # Keep everything up to avgpool
        self.backbone = nn.Sequential(*list(resnet.children())[:-1])  # Output: (batch, 2048, 1, 1)
        
        # Freeze early layers (first ~6 of 10 blocks) for transfer learning
        children = list(self.backbone.children())
        for child in children[:6]:
            for param in child.parameters():
                param.requires_grad = False
        
        # Custom embedding head
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
        # L2 normalize (crucial for cosine similarity in pgvector)
        embedding = nn.functional.normalize(embedding, p=2, dim=1)
        return embedding


# ============================================================
# Siamese Network
# ============================================================

class SiameseNetwork(nn.Module):
    """
    Siamese Network with shared ResNet50 encoder.
    
    Two images → shared encoder → two embeddings → L2 distance → sigmoid → similarity score
    """
    def __init__(self, embedding_dim=EMBEDDING_DIM):
        super().__init__()
        self.encoder = ResNet50Encoder(embedding_dim)
        self.similarity_head = nn.Sequential(
            nn.Linear(1, 1),
            nn.Sigmoid()
        )
    
    def forward(self, img1, img2):
        emb1 = self.encoder(img1)
        emb2 = self.encoder(img2)
        
        # L2 distance
        distance = torch.sqrt(torch.sum((emb1 - emb2) ** 2, dim=1, keepdim=True) + 1e-8)
        
        # Distance → similarity
        similarity = self.similarity_head(distance)
        return similarity
    
    def get_embedding(self, x):
        return self.encoder(x)


# ============================================================
# Dataset & Data Loading
# ============================================================

# ImageNet normalization (required for pretrained ResNet50)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Training augmentation
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), scale=(0.85, 1.15)),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
    transforms.RandomGrayscale(p=0.05),
    transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

# Validation / inference (no augmentation)
val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


def load_images_from_directory(directory, limit=0):
    """Load image paths and assign identity labels"""
    extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    all_files = sorted([
        f for f in Path(directory).iterdir()
        if f.suffix.lower() in extensions
    ])
    
    if limit > 0:
        all_files = all_files[:limit]
    
    return all_files


class SiamesePairDataset(Dataset):
    """
    Generates pairs of images on-the-fly (memory efficient).
    Positive pairs: augmented versions of the same image.
    Negative pairs: images from different identities.
    """
    def __init__(self, image_paths, labels, num_pairs=3000, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.num_pairs = num_pairs
        self.transform = transform or val_transform
        
        self.unique_labels = list(set(labels))
        self.label_to_indices = {}
        for i, lbl in enumerate(labels):
            if lbl not in self.label_to_indices:
                self.label_to_indices[lbl] = []
            self.label_to_indices[lbl].append(i)
        
        # Pre-generate pair indices for reproducibility
        self.pairs = self._generate_pairs()
    
    def _generate_pairs(self):
        pairs = []
        for _ in range(self.num_pairs):
            if random.random() > 0.5:
                # Positive pair (same identity, augmentation creates difference)
                lbl = random.choice(self.unique_labels)
                indices = self.label_to_indices[lbl]
                if len(indices) >= 2:
                    idx1, idx2 = random.sample(indices, 2)
                else:
                    idx1 = idx2 = indices[0]
                pairs.append((idx1, idx2, 1.0))
            else:
                # Negative pair
                lbl1, lbl2 = random.sample(self.unique_labels, 2)
                idx1 = random.choice(self.label_to_indices[lbl1])
                idx2 = random.choice(self.label_to_indices[lbl2])
                pairs.append((idx1, idx2, 0.0))
        return pairs
    
    def __len__(self):
        return len(self.pairs)
    
    def __getitem__(self, idx):
        idx1, idx2, label = self.pairs[idx]
        
        img1 = Image.open(self.image_paths[idx1]).convert('RGB')
        img2 = Image.open(self.image_paths[idx2]).convert('RGB')
        
        img1 = self.transform(img1)
        img2 = self.transform(img2)
        
        return img1, img2, torch.tensor(label, dtype=torch.float32)


# ============================================================
# Training
# ============================================================

def train_local(args):
    print("🧳 BaggageLens - Local Training (PyTorch)")
    print("=" * 60)
    print(f"   Batch size:    {args.batch_size}")
    print(f"   Epochs:        {args.epochs}")
    print(f"   Target pairs:  {args.num_pairs}")
    print(f"   Images limit:  {'All' if args.images_limit == 0 else args.images_limit}")
    print()
    
    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    if device.type == 'cuda':
        print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("💻 Training on CPU (no GPU detected)")
        print("   This works fine with 20GB RAM!")
    print_memory("(initial)")
    
    # ── Step 1: Load Images ──────────────────────────────────
    print("\n📂 Step 1: Loading images...")
    
    half_limit = args.images_limit // 2 if args.images_limit > 0 else 0
    
    lost_dir = os.path.join('dataset', 'lost')
    found_dir = os.path.join('dataset', 'found')
    
    lost_files = load_images_from_directory(lost_dir, limit=half_limit) if os.path.exists(lost_dir) else []
    found_files = load_images_from_directory(found_dir, limit=half_limit) if os.path.exists(found_dir) else []
    
    if not lost_files and not found_files:
        print("\n❌ No training images found!")
        print("   Run: python download_dataset.py")
        return None
    
    # Create combined file list with identity labels
    all_files = []
    all_labels = []
    
    for i, f in enumerate(lost_files):
        all_files.append(f)
        all_labels.append(i)
    
    offset = len(lost_files)
    for i, f in enumerate(found_files):
        all_files.append(f)
        all_labels.append(offset + i)
    
    num_identities = len(set(all_labels))
    print(f"   ✅ Found {len(all_files)} images ({num_identities} identities)")
    print(f"      lost/: {len(lost_files)}, found/: {len(found_files)}")
    
    if num_identities < 2:
        print("   ❌ Need at least 2 unique images!")
        return None
    
    # ── Step 2: Create Datasets ──────────────────────────────
    print(f"\n🔗 Step 2: Creating {args.num_pairs} training pairs...")
    
    # Use on-the-fly augmentation (no need to pre-augment in RAM!)
    num_pairs = min(args.num_pairs, len(all_files) * 20)
    val_pairs = max(200, num_pairs // 5)
    
    train_dataset = SiamesePairDataset(
        all_files, all_labels,
        num_pairs=num_pairs,
        transform=train_transform
    )
    val_dataset = SiamesePairDataset(
        all_files, all_labels,
        num_pairs=val_pairs,
        transform=val_transform
    )
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=0,  # Use 0 for Windows compatibility
        pin_memory=(device.type == 'cuda')
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0
    )
    
    pos_count = sum(1 for _, _, l in train_dataset.pairs if l == 1.0)
    neg_count = len(train_dataset) - pos_count
    print(f"   ✅ Training:   {len(train_dataset)} pairs (pos: {pos_count}, neg: {neg_count})")
    print(f"   ✅ Validation: {len(val_dataset)} pairs")
    print_memory("(after dataset creation)")
    
    # ── Step 3: Build Model ──────────────────────────────────
    print("\n🏗️  Step 3: Building Siamese Network with ResNet50...")
    model = SiameseNetwork(EMBEDDING_DIM).to(device)
    
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"   ✅ Model built!")
    print(f"   📊 Total params:     {total_params:,}")
    print(f"   📊 Trainable params: {trainable_params:,}")
    print_memory("(after model)")
    
    # ── Step 4: Train ────────────────────────────────────────
    print(f"\n🚀 Step 4: Training for {args.epochs} epochs...")
    print("=" * 60)
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=1e-4
    )
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=3, min_lr=1e-7
    )
    
    # Checkpoint path
    os.makedirs('models', exist_ok=True)
    checkpoint_path = 'models/checkpoint_best.pth'
    
    if args.resume and os.path.exists(checkpoint_path):
        print(f"   📂 Resuming from checkpoint: {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    
    best_val_acc = 0.0
    patience_counter = 0
    patience_limit = 7
    training_start = time.time()
    epoch_times = []
    
    for epoch in range(args.epochs):
        epoch_start = time.time()
        
        # Training
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        for batch_idx, (img1, img2, labels) in enumerate(train_loader):
            img1 = img1.to(device)
            img2 = img2.to(device)
            labels = labels.to(device).unsqueeze(1)
            
            optimizer.zero_grad()
            outputs = model(img1, img2)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * img1.size(0)
            predicted = (outputs > 0.5).float()
            train_correct += (predicted == labels).sum().item()
            train_total += labels.size(0)
        
        train_loss /= train_total
        train_acc = train_correct / train_total
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for img1, img2, labels in val_loader:
                img1 = img1.to(device)
                img2 = img2.to(device)
                labels = labels.to(device).unsqueeze(1)
                
                outputs = model(img1, img2)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * img1.size(0)
                predicted = (outputs > 0.5).float()
                val_correct += (predicted == labels).sum().item()
                val_total += labels.size(0)
        
        val_loss /= val_total
        val_acc = val_correct / val_total
        
        scheduler.step(val_loss)
        
        epoch_time = time.time() - epoch_start
        epoch_times.append(epoch_time)
        remaining = (args.epochs - epoch - 1) * np.mean(epoch_times)
        
        if remaining > 3600:
            eta = f"{remaining/3600:.1f}h"
        elif remaining > 60:
            eta = f"{remaining/60:.0f}m"
        else:
            eta = f"{remaining:.0f}s"
        
        print(f"   Epoch {epoch+1:2d}/{args.epochs} | "
              f"{epoch_time:.0f}s | "
              f"Train: loss={train_loss:.4f} acc={train_acc:.3f} | "
              f"Val: loss={val_loss:.4f} acc={val_acc:.3f} | "
              f"ETA: {eta}")
        
        # Save best checkpoint
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'val_loss': val_loss,
            }, checkpoint_path)
            print(f"   💾 New best! Val accuracy: {val_acc:.3f}")
        else:
            patience_counter += 1
            if patience_counter >= patience_limit:
                print(f"\n   ⏹️  Early stopping (no improvement for {patience_limit} epochs)")
                break
    
    total_time = time.time() - training_start
    if total_time > 3600:
        time_str = f"{total_time/3600:.1f} hours"
    elif total_time > 60:
        time_str = f"{total_time/60:.1f} minutes"
    else:
        time_str = f"{total_time:.0f} seconds"
    
    print(f"\n✅ Training completed in {time_str}")
    print(f"   Best validation accuracy: {best_val_acc:.3f} ({best_val_acc*100:.1f}%)")
    
    # ── Step 5: Load Best & Save ─────────────────────────────
    print("\n💾 Step 5: Saving trained models...")
    
    # Load best checkpoint
    if os.path.exists(checkpoint_path):
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint['model_state_dict'])
    
    # Save encoder only (this is what the API uses)
    encoder_state = model.encoder.state_dict()
    torch.save(encoder_state, 'models/encoder_model.pth')
    print("   ✅ Encoder saved: models/encoder_model.pth")
    
    # Save full siamese model
    torch.save(model.state_dict(), 'models/siamese_model.pth')
    print("   ✅ Siamese model saved: models/siamese_model.pth")
    
    # Also export encoder to ONNX for cross-framework compatibility
    try:
        model.eval()
        dummy_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE).to(device)
        torch.onnx.export(
            model.encoder, dummy_input,
            'models/encoder_model.onnx',
            input_names=['image'],
            output_names=['embedding'],
            dynamic_axes={'image': {0: 'batch'}, 'embedding': {0: 'batch'}},
            opset_version=14
        )
        print("   ✅ ONNX export saved: models/encoder_model.onnx")
    except Exception as e:
        print(f"   ⚠️  ONNX export failed (not critical): {e}")
    
    # ── Step 6: Test ─────────────────────────────────────────
    print("\n🧪 Step 6: Testing encoder output...")
    model.eval()
    with torch.no_grad():
        test_img = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE).to(device)
        embedding = model.get_embedding(test_img)
        
        print(f"   Shape: {list(embedding.shape)} (expected: [1, {EMBEDDING_DIM}])")
        print(f"   L2 norm: {torch.norm(embedding[0]).item():.4f} (expected: ~1.0)")
        print(f"   ✅ Compatible with Supabase pgvector vector({EMBEDDING_DIM})")
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 Training Complete!")
    print("=" * 60)
    print(f"   📁 Models saved in: ai-model/models/")
    print(f"   📊 Best accuracy: {best_val_acc*100:.1f}%")
    print(f"   🔧 Encoder output: {EMBEDDING_DIM}-dim L2-normalized embeddings")
    print(f"\n   Next steps:")
    print(f"   1. The API (api.py) needs to be updated to load PyTorch model")
    print(f"   2. Restart: python api.py")
    print(f"   3. Test: curl http://localhost:8000/health")
    
    return model


if __name__ == "__main__":
    args = parse_args()
    result = train_local(args)
    if result is None:
        sys.exit(1)
