# from ultralytics import YOLO

# licencePlateDetector = YOLO('../Automatic-License-Plate-Recognition-using-YOLOv8/license_plate_detector.pt')

# frame = '../testImages/mehran.png'

# licensePlates = licencePlateDetector(frame)

# print("THis is the licese plate object")
# print(licensePlates)
# print('\n\n')


# print("THis is the first in the licese plate object")
# print(licensePlates[0])
# print('\n\n')

# print("this is the detection")
# detections = licensePlates[0].boxes.data.cpu().numpy()
# print(detections)

#margella rip 5505
#suzuki gag 9331
#alto atw 198
#mehrean lee 6367

from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
import easyocr
import numpy as np



# Load YOLO license plate detector
licencePlateDetector = YOLO('../Automatic-License-Plate-Recognition-using-YOLOv8/license_plate_detector.pt')

# Initialize EasyOCR
reader = easyocr.Reader(['en'], gpu=False)

# Read image
frame_path = '../testImages/margella.png'
frame = cv2.imread(frame_path)
img_h, img_w = frame.shape[:2]

# Run YOLO
results = licencePlateDetector(frame)[0]
detections = results.boxes.data.cpu().numpy()

cropped_plates = []
ocr_texts = []

# Padding in pixels
pad = 5

for x1, y1, x2, y2, conf, cls in detections:
    # Add padding and clip to image dimensions
    x1 = max(0, int(x1 - pad))
    y1 = max(0, int(y1 - pad))
    x2 = min(img_w, int(x2 + pad))
    y2 = min(img_h, int(y2 + pad))

    # Crop plate
    crop = frame[y1:y2, x1:x2]

    # Resize to consistent height
    desired_height = 60
    scale = desired_height / crop.shape[0]
    new_w = int(crop.shape[1] * scale)
    crop = cv2.resize(crop, (new_w, desired_height))

    # Mild preprocessing
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)  # improve local contrast
    blur = cv2.bilateralFilter(gray, 7, 50, 50)  # remove small noise but keep edges

    # Store preprocessed plate for visualization
    cropped_plates.append(blur)

    # OCR
    result = reader.readtext(blur)
    text = "".join([det[1] for det in result])
    ocr_texts.append(text)

# Show results
plt.figure(figsize=(12, 6))
for i, plate in enumerate(cropped_plates):
    plt.subplot(1, len(cropped_plates), i+1)
    plt.imshow(plate, cmap='gray')
    plt.axis("off")
    plt.title(f"OCR: {ocr_texts[i]}")

plt.show()

print("Detected license plates:", ocr_texts)
