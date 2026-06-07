import sys
import os
from ultralytics import YOLO
from sort.sort import *
import cv2
import numpy as np
from utils import getVehicle, readLicensePlate, writeCsv
import matplotlib.pyplot as plt

def showImage(title, img):
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    plt.imshow(img_rgb)
    plt.title(title)
    plt.axis('off')
    plt.show()

if len(sys.argv) < 2:
    sys.exit(1)

vidName = sys.argv[1]  # e.g., "lisenceVid.mp4"
vidPath = os.path.join("data", vidName)

if not os.path.exists(vidPath):
    # print(f"video not found: {vidPath}")
    sys.exit(1)

csvName = os.path.splitext(vidName)[0] + ".csv"  # e.g., lisenceVid.csv
csvPath = os.path.join(".", csvName)

cocoModel = YOLO('yolov8n.pt')
licencePlateDetector = YOLO('Automatic-License-Plate-Recognition-using-YOLOv8/license_plate_detector.pt')

cap = cv2.VideoCapture(vidPath)
motTracker = Sort()

results = {}
vehClasses = [2, 3, 5, 7]  # only detect car, motorcycle, bus, truck

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
        if int(classId) in vehClasses:
            vehicleDetected.append([x1, y1, x2, y2, score])

    trackId = motTracker.update(np.asarray(vehicleDetected))
    licensePlates = licencePlateDetector(frame)[0]

    for plates in licensePlates.boxes.data.tolist():
        x1, y1, x2, y2, score, classId = plates

        xveh1, xveh2, yveh1, yveh2, vehId = getVehicle(plates, trackId)

        if vehId != -1:
            cropped = frame[int(y1): int(y2), int(x1): int(x2), :]
            grayedCrop = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
            _, croppedThresh = cv2.threshold(grayedCrop, 64, 255, cv2.THRESH_BINARY_INV)

            plateText, textConfidence = readLicensePlate(croppedThresh)

            if plateText is not None:
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