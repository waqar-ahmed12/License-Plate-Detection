import sys
import os
from ultralytics import YOLO
from sort.sort import *
import cv2
import numpy as np
from utils import getVehicle, readLicensePlate, writeCsv
import matplotlib.pyplot as plt
import easyocr   
import json


#main modified to change the use of image filters, to experiment with the easy ocr
def showImage(title, img):
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    plt.imshow(img_rgb)
    plt.title(title)
    plt.axis('off')
    plt.show()

scriptDir = os.path.dirname(os.path.abspath(__file__))

if len(sys.argv) < 2:
    sys.exit(1)

vidName = sys.argv[1]  # e.g., "lisenceVid.mp4"
# vidPath = os.path.join("/home/waqar/Desktop/Internship/Number plate/backend", vidName)
vidPath = os.path.abspath(os.path.join(
    os.path.dirname(__file__),
    '..',
    'backend',
    vidName
))

if not os.path.exists(vidPath):
    # print(f"video not found: {vidPath}")
    print(json.dumps({"error": f"{vidPath}"}))
    sys.exit(1)

filename = os.path.basename(vidName)
csvName = os.path.splitext(filename)[0] + ".csv"  # e.g., lisenceVid.csv
csvPath = os.path.join(scriptDir, "csv folder", csvName)

cocoModel = YOLO(os.path.join(scriptDir, "yolov8n.pt"))

# cocoModel = YOLO("/home/waqar/Desktop/Internship/Number plate/ocr_env/yolov8n.pt")
# licencePlateDetector = YOLO('home/waqar/Desktop/Internship/Number plate/ocr_env/Automatic-License-Plate-Recognition-using-YOLOv8/license_plate_detector.pt')
licencePlateDetector = YOLO(os.path.join(scriptDir, 'Automatic-License-Plate-Recognition-using-YOLOv8', 'license_plate_detector.pt'))

reader = easyocr.Reader(['en'], gpu=False)

cap = cv2.VideoCapture(vidPath)
motTracker = Sort()

results = {}
vehicle_classes = [2, 3, 5, 7]  # only detect car, motorcycle, bus, truck

ret = True
frameNumber = -1
while ret:
    frameNumber += 1
    ret, frame = cap.read()
    if not ret:
        break

    results[frameNumber] = {}
    detections = cocoModel(frame)[0]  # Run detection on current frame

    vehicleDetected = []

    for detection in detections.boxes.data.tolist():
        x1, y1, x2, y2, score, classId = detection
        if int(classId) in vehicle_classes:
            vehicleDetected.append([x1, y1, x2, y2, score])

    # convert to numpy array
    vehicleDetected = np.asarray(vehicleDetected)

    # only update tracker if we have detections
    if len(vehicleDetected) > 0:
        trackId = motTracker.update(vehicleDetected)
    else:
        trackId = []

    # continue with license plate detection
    licensePlates = licencePlateDetector(frame)[0]


    for plates in licensePlates.boxes.data.tolist():
        x1, y1, x2, y2, score, classId = plates

        xveh1, xveh2, yveh1, yveh2, vehId = getVehicle(plates, trackId)

        if vehId != -1:
            pad = 5
            x1 = max(0, int(x1 - pad))
            y1 = max(0, int(y1 - pad))
            x2 = min(frame.shape[1], int(x2 + pad))
            y2 = min(frame.shape[0], int(y2 + pad))

            crop = frame[y1:y2, x1:x2]

            if crop.size == 0:
                continue

            desired_height = 60
            scale = desired_height / crop.shape[0]
            new_w = int(crop.shape[1] * scale)
            crop = cv2.resize(crop, (new_w, desired_height))

            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)
            blur = cv2.bilateralFilter(gray, 7, 50, 50)

            # 🔹 OCR with EasyOCR
            result = reader.readtext(blur)
            plateText = "".join([det[1] for det in result]) if result else None
            textConfidence = np.mean([det[2] for det in result]) if result else 0

            if plateText:
                results[frameNumber][vehId] = {
                    'car': {'bbox': [xveh1, xveh2, yveh1, yveh2]},
                    'licensePlate': {
                        'bbox': [x1, y1, x2, y2],
                        'text': plateText,
                        'bboxScore': score,
                        'textScore': textConfidence
                    }
                }

cap.release()

writeCsv(results, csvPath)
print(f"csv saved: {csvPath}")
sys.exit(0)