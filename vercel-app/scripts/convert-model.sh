#!/bin/bash

# Script to convert Keras model to TensorFlow.js format
# Usage: ./scripts/convert-model.sh

echo "Converting Keras model to TensorFlow.js format..."

# Check if tensorflowjs is installed
if ! command -v tensorflowjs_converter &> /dev/null
then
    echo "tensorflowjs_converter not found. Installing..."
    pip install tensorflowjs
fi

# Create models directory
mkdir -p public/models

# Convert the model
tensorflowjs_converter \
  --input_format keras \
  --output_format tfjs_layers_model \
  --weight_shard_size_bytes 4194304 \
  ../cse499_brain_tumor_model-keras-default-v1/brain_tumor_model.keras \
  ./public/models/

echo "Model conversion complete!"
echo "Model files are in ./public/models/"
echo ""
echo "Note: Custom objects need to be handled separately."
echo "You may need to update the model loading code to handle custom objects."
