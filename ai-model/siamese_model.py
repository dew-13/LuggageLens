import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import os

"""
Siamese CNN Network for Luggage Image Matching

Architecture:
- Input: Two luggage images (256x256x3)
- CNN Encoder: Feature extraction
- Distance Layer: Euclidean distance calculation
- Output: Similarity score (0-1)
"""

def create_cnn_encoder(input_shape=(256, 256, 3)):
    """Create CNN encoder for feature extraction"""
    inputs = keras.Input(shape=input_shape)
    
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.Conv2D(256, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.Flatten()(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation='relu')(x)
    
    return keras.Model(inputs, x, name='encoder')

class L2Distance(layers.Layer):
    """Custom layer for Euclidean distance"""
    def call(self, x):
        x1, x2 = x
        return tf.math.sqrt(tf.reduce_sum(tf.square(x1 - x2), axis=1, keepdims=True))

def create_siamese_network(input_shape=(256, 256, 3)):
    """Create full Siamese network for image comparison"""
    
    # Create encoder
    encoder = create_cnn_encoder(input_shape)
    
    # Input layers
    img1_input = keras.Input(shape=input_shape)
    img2_input = keras.Input(shape=input_shape)
    
    # Process both images through same encoder
    feat1 = encoder(img1_input)
    feat2 = encoder(img2_input)
    
    # Calculate distance
    distance = L2Distance()([feat1, feat2])
    
    # Similarity (1 / (1 + distance))
    similarity = layers.Lambda(lambda x: 1 / (1 + x))(distance)
    
    return keras.Model([img1_input, img2_input], similarity, name='siamese_network')

def create_siamese_with_encoder(input_shape=(256, 256, 3)):
    """Create Siamese network with accessible encoder"""
    encoder = create_cnn_encoder(input_shape)
    
    img1_input = keras.Input(shape=input_shape)
    img2_input = keras.Input(shape=input_shape)
    
    feat1 = encoder(img1_input)
    feat2 = encoder(img2_input)
    
    distance = L2Distance()([feat1, feat2])
    similarity = layers.Lambda(lambda x: 1 / (1 + x))(distance)
    
    model = keras.Model([img1_input, img2_input], similarity, name='siamese_network')
    model.encoder = encoder
    
    return model

if __name__ == "__main__":
    # Test model creation
    model = create_siamese_network()
    model.summary()
    
    # Save architecture
    model.save('models/siamese_model.h5')
    print("✅ Model saved to models/siamese_model.h5")
