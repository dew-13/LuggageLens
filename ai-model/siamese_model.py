import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import ResNet50
import numpy as np
import os

"""
BaggageLens - Siamese Network with ResNet50 Encoder

Architecture:
- Input: Two luggage images (224x224x3)
- Encoder: ResNet50 (ImageNet) → GlobalAveragePooling → Dense(512)
- Distance: L2 Euclidean distance between embeddings
- Output: Similarity score (0-1) via sigmoid

Embedding Output: 512-dimensional vector (compatible with Supabase pgvector)
Training: See google_colab_training.ipynb (requires GPU)
"""

EMBEDDING_DIM = 512  # Must match Supabase vector(512)
INPUT_SHAPE = (224, 224, 3)  # ResNet50 standard input


def create_resnet_encoder(input_shape=INPUT_SHAPE):
    """
    Create ResNet50-based encoder that outputs L2-normalized 512-dim embeddings.
    
    Uses ImageNet pre-trained weights with partial fine-tuning:
    - Layers 0-139: Frozen (general features like edges, textures)
    - Layers 140+: Trainable (fine-tuned for luggage specifics)
    """
    # Load ResNet50 pre-trained on ImageNet, without classification head
    base_model = ResNet50(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape
    )

    # Freeze early layers for transfer learning
    for layer in base_model.layers[:140]:
        layer.trainable = False
    for layer in base_model.layers[140:]:
        layer.trainable = True

    inputs = keras.Input(shape=input_shape)

    # ResNet expects BGR pixel values in specific ranges
    x = keras.applications.resnet50.preprocess_input(inputs * 255.0)
    x = base_model(x, training=False)

    # Custom embedding head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(1024, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(EMBEDDING_DIM, activation=None)(x)  # Linear output

    # L2 normalize (crucial for cosine similarity in pgvector)
    outputs = layers.Lambda(lambda t: tf.math.l2_normalize(t, axis=1))(x)

    return keras.Model(inputs, outputs, name='resnet50_encoder')


class L2Distance(layers.Layer):
    """Custom layer: Euclidean distance between two embedding vectors"""
    def call(self, inputs):
        x1, x2 = inputs
        sum_squared = tf.reduce_sum(tf.square(x1 - x2), axis=1, keepdims=True)
        return tf.math.sqrt(tf.maximum(sum_squared, tf.keras.backend.epsilon()))


def create_siamese_network(input_shape=INPUT_SHAPE):
    """
    Create full Siamese network with shared ResNet50 encoder.
    
    Returns:
        model: Full Siamese model (for /compare endpoint)
        encoder: Encoder-only model (for /embed endpoint → Supabase vectors)
    """
    encoder = create_resnet_encoder(input_shape)

    # Two input branches
    img1_input = keras.Input(shape=input_shape, name='image_1')
    img2_input = keras.Input(shape=input_shape, name='image_2')

    # Shared encoder processes both images
    embedding_1 = encoder(img1_input)
    embedding_2 = encoder(img2_input)

    # L2 distance between embeddings
    distance = L2Distance()([embedding_1, embedding_2])

    # Distance → similarity score
    similarity = layers.Dense(1, activation='sigmoid', name='similarity')(distance)

    model = keras.Model(
        inputs=[img1_input, img2_input],
        outputs=similarity,
        name='siamese_network'
    )

    # Expose encoder for direct access
    model.encoder = encoder

    return model, encoder


# ============================================================
# Legacy compatibility: keep the old function names working
# ============================================================

def create_cnn_encoder(input_shape=INPUT_SHAPE):
    """Legacy wrapper → now uses ResNet50 encoder"""
    return create_resnet_encoder(input_shape)


def create_siamese_with_encoder(input_shape=INPUT_SHAPE):
    """Legacy wrapper → returns model with .encoder attribute"""
    model, encoder = create_siamese_network(input_shape)
    return model


if __name__ == "__main__":
    print("🔄 Building Siamese Network with ResNet50 encoder...")
    model, encoder = create_siamese_network()

    print("\n📐 Encoder Summary:")
    encoder.summary()

    print(f"\n✅ Encoder output: {EMBEDDING_DIM}-dim vector")
    print(f"   Compatible with Supabase vector({EMBEDDING_DIM})")

    # Save architecture (untrained - training happens in Google Colab)
    os.makedirs('models', exist_ok=True)
    encoder.save('models/encoder_model.h5')
    print("✅ Encoder architecture saved to models/encoder_model.h5")
    print("📝 To train with real data, use: google_colab_training.ipynb")
