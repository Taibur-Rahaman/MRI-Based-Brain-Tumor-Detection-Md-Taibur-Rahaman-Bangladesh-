# MRI-Based Brain Tumor Detection and Segmentation – Md Taibur Rahaman (Bangladesh)

This project implements a deep learning model for brain tumor detection and segmentation using MRI images. The model is trained on the BraTS 2020 dataset and provides 3D visualization of tumor segmentation results.

## 📋 Project Overview

This repository contains:
- A Jupyter notebook for brain tumor detection and segmentation
- Trained Keras model for brain tumor segmentation
- Interactive Gradio interface for 3D visualization
- Support for multiple MRI modalities (FLAIR, T1, T1ce, T2)

## 🧠 Features

- **Multi-modality MRI Support**: Works with FLAIR, T1, T1ce, and T2 MRI sequences
- **3D Segmentation Visualization**: Interactive 3D viewer for predicted tumor masks
- **Tumor Classification**: Identifies different tumor regions:
  - NCR/NET (Necrotic and Non-Enhancing Tumor)
  - Edema
  - Enhancing Tumor
- **Interactive Interface**: Gradio-based web interface for easy model interaction

## 📁 Project Structure

```
├── cse499-mri-based-brain-tumor-detection.ipynb  # Main Jupyter notebook
├── cse499_brain_tumor_model-keras-default-v1/    # Trained model files
│   ├── brain_tumor_model.keras                   # Keras model
│   ├── custom_objects.pkl                        # Custom objects for model loading
│   ├── preprocessing.pkl                         # Preprocessing parameters
│   └── training.log                              # Training logs
└── README.md                                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.7+
- TensorFlow 2.x
- Gradio
- Nibabel (for NIfTI file handling)
- NumPy
- Plotly

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd "Brain Tumer"
```

2. Install required packages:
```bash
pip install gradio tensorflow nibabel numpy plotly
```

### Usage

1. Open the Jupyter notebook:
```bash
jupyter notebook cse499-mri-based-brain-tumor-detection.ipynb
```

2. Run all cells to:
   - Load the trained model
   - Set up the data generator
   - Launch the Gradio interface

3. Access the interactive interface through the provided Gradio URL

## 📊 Model Details

The model uses a deep learning architecture for 3D medical image segmentation:
- Input shape: (128, 128, 96, 4) - 4 MRI modalities
- Output: Segmentation masks with 4 classes (Background, NCR/NET, Edema, Enhancing Tumor)
- Custom loss function: Combined dice loss and categorical cross-entropy
- Custom metrics: Dice coefficient for each tumor class

## 📚 Dataset

This project uses the BraTS 2020 dataset:
- Training Data: MICCAI_BraTS2020_TrainingData
- Validation Data: MICCAI_BraTS2020_ValidationData

## 🔗 Links

- Original Kaggle Notebook: [CSE499 MRI-Based Brain Tumor Detection](https://www.kaggle.com/code/taiburrahaman/cse499-mri-based-brain-tumor-detection)

## 👤 Author

Md Taibur Rahaman (Bangladesh)

## 📝 License

This project is part of CSE499 coursework. Please refer to the original dataset licenses for usage terms.
