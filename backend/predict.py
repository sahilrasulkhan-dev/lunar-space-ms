import sys
from pathlib import Path
from ultralytics import YOLO

default_image = "path/to/test_image.jpg" if Path("path/to/test_image.jpg").exists() else "test_image.jpg"
image_source = sys.argv[1] if len(sys.argv) > 1 else default_image

print(f"Loading YOLO model from models/best.pt...")
model = YOLO("models/best.pt")

print(f"Running inference on: {image_source} (conf=0.25)...")
results = model.predict(source=image_source, save=True, conf=0.25)

boxes_count = len(results[0].boxes) if results else 0
print(f"\nInference complete! Detections found: {boxes_count}")
print(f"Results saved to directory: runs/detect/predict/")
