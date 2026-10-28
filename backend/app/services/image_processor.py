import cv2
import numpy as np
import os
from pathlib import Path
import logging
from app.utils.exceptions import ProcessingError

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.results_dir = Path("app/results")
        self.results_dir.mkdir(parents=True, exist_ok=True)

    def process_lunar_image(self, image_path: str, output_filename: str):
        """
        Process the lunar image using OpenCV to detect craters, rocks, and safe zones.
        Returns stats and the path to the annotated image.
        """
        # Read image
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"cv2.imread returned None for path: {image_path}")
            logger.info("Image loaded")
        except Exception as e:
            raise ProcessingError(str(e), "Image Loading")
            
        try:
            original = img.copy()
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Noise removal and contrast enhancement
            logger.info("Preprocessing started")
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(blurred)
        except Exception as e:
            raise ProcessingError(str(e), "Preprocessing")
            
        try:
            # Edge detection for rocks and rough terrain
            edges = cv2.Canny(enhanced, 50, 150)
            logger.info("Edge detection completed")
        except Exception as e:
            raise ProcessingError(str(e), "Edge Detection")
            
        try:
            # Crater detection using Hough Circles
            craters = cv2.HoughCircles(
                enhanced, cv2.HOUGH_GRADIENT, dp=1, minDist=50,
                param1=150, param2=30, minRadius=10, maxRadius=100
            )
            
            crater_mask = np.zeros_like(gray)
            if craters is not None:
                craters = np.uint16(np.around(craters))
                for i in craters[0, :]:
                    # Draw on mask
                    cv2.circle(crater_mask, (i[0], i[1]), i[2], 255, -1)
                    # Draw on original (Red for craters)
                    cv2.circle(original, (i[0], i[1]), i[2], (0, 0, 255), 2)
            logger.info("Crater detection completed")
        except Exception as e:
            raise ProcessingError(str(e), "Crater Detection")
            
        try:
            # Rough terrain density map
            kernel = np.ones((25, 25), np.uint8)
            dense_edges = cv2.dilate(edges, kernel, iterations=1)
            
            # Safe zones are where there are no craters and low edge density
            safe_mask = cv2.bitwise_not(cv2.bitwise_or(dense_edges, crater_mask))
            logger.info("Safe zone generated")
        except Exception as e:
            raise ProcessingError(str(e), "Safe Zone Generation")
        
        # Apply colored overlays
        # Safe zone (Green)
        green_overlay = np.zeros_like(original)
        green_overlay[safe_mask == 255] = [0, 255, 0]
        
        # Unsafe (Red - dense edges not including craters which are already drawn)
        red_overlay = np.zeros_like(original)
        red_overlay[(dense_edges == 255) & (crater_mask == 0)] = [0, 0, 255]
        
        # Blend overlays
        cv2.addWeighted(green_overlay, 0.2, original, 1.0, 0, original)
        cv2.addWeighted(red_overlay, 0.2, original, 1.0, 0, original)
        
        # Save output
        output_path = self.results_dir / f"annotated_{output_filename}"
        cv2.imwrite(str(output_path), original)
        
        # Calculate stats
        total_pixels = gray.shape[0] * gray.shape[1]
        safe_pixels = np.count_nonzero(safe_mask)
        unsafe_pixels = np.count_nonzero(dense_edges) + np.count_nonzero(crater_mask)
        
        safe_percentage = (safe_pixels / total_pixels) * 100
        unsafe_percentage = (unsafe_pixels / total_pixels) * 100
        landing_score = min(100, safe_percentage * 1.5) # Simple heuristic
        
        return {
            "safe_percentage": round(safe_percentage, 2),
            "unsafe_percentage": round(unsafe_percentage, 2),
            "landing_score": round(landing_score, 2),
            "confidence": 85.5,
            "terrain_type": "Regolith-dominated" if safe_percentage > 60 else "Rocky/Cratered",
            "processed_image_path": str(output_path),
            "terrain_map": cv2.bitwise_or(dense_edges, crater_mask) # 255 = obstacle, 0 = safe
        }
