import ast
import cv2
import numpy as np
import pandas as pd
import sys
import os


def get_user_choice():
     while True:
        user_input = input("Is the CSV interpolated? (y/n): ").lower()
        if user_input in ('y', 'yes'):
            return True
        elif user_input in ('n', 'no'):
            return False


# --- FUNCTIONS ---
def drawBorder(img, top_left, bottom_right, color=(0, 255, 0), thickness=10, line_length_x=200, line_length_y=200):
    x1, y1 = top_left
    x2, y2 = bottom_right
    cv2.line(img, (x1, y1), (x1, y1 + line_length_y), color, thickness)
    cv2.line(img, (x1, y1), (x1 + line_length_x, y1), color, thickness)
    cv2.line(img, (x1, y2), (x1, y2 - line_length_y), color, thickness)
    cv2.line(img, (x1, y2), (x1 + line_length_x, y2), color, thickness)
    cv2.line(img, (x2, y1), (x2 - line_length_x, y1), color, thickness)
    cv2.line(img, (x2, y1), (x2, y1 + line_length_y), color, thickness)
    cv2.line(img, (x2, y2), (x2, y2 - line_length_y), color, thickness)
    cv2.line(img, (x2, y2), (x2 - line_length_x, y2), color, thickness)
    return img



if len(sys.argv) < 2:
    # print("Usage: python script.py <csv file>")
    sys.exit(1)

csvFile = sys.argv[1] 
csvPath = os.path.join("csv folder", csvFile)

if not os.path.exists(csvPath):
    # print(f"❌ Video file not found: {csvPath}")
    sys.exit(1)


base_name = os.path.splitext(csvFile)[0]

# Construct the full path to the corresponding video file
video_name = base_name + ".mp4"
video_path = os.path.join("testImages", video_name)

is_interpolated = get_user_choice()
output_folder_name = "interpolated" if is_interpolated else "not_interpolated"

# Create the folder if it doesn't exist
os.makedirs(output_folder_name, exist_ok=True)
# --- SETTINGS ---
output_file_name = base_name + ".avi"   # change extension

OUTPUT_FILE = os.path.join(output_folder_name, output_file_name)

# Check if the video file exists
if not os.path.exists(video_path):
    # print(f"❌ Video file not found: {video_path}")
    sys.exit(1)

# print(f"✔️ Found CSV file: {csvPath}")
# print(f"✔️ Found video file: {video_path}")


# --- LOAD DATA ---
# results = pd.read_csv(csvPath)
results = pd.read_csv(csvPath, on_bad_lines="skip")  
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    raise IOError("❌ Cannot open video file. Check path and format.")

fps = cap.get(cv2.CAP_PROP_FPS) or 25.0  # default to 25 if can't read
# print("Input FPS:", fps)

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) 

fourcc = cv2.VideoWriter_fourcc(*'MJPG')
out = cv2.VideoWriter(os.path.join(output_folder_name, output_file_name), 
                      fourcc, fps, (width, height))


if not out.isOpened():
    raise IOError("❌ Cannot open VideoWriter. Check codec support.")

# --- PREPARE LICENSE PLATES ---
license_plate = {}
for vehId in np.unique(results['vehId']):
    max_ = np.amax(results[results['vehId'] == vehId]['licenseNumberScore'])
    plate_info = results[(results['vehId'] == vehId) & (results['licenseNumberScore'] == max_)].iloc[0]
    license_plate[vehId] = {'licensePlateNumber': plate_info['licenseNumber'], 'licenseCrop': None}

    cap.set(cv2.CAP_PROP_POS_FRAMES, plate_info['frameNumber'])
    ret, frame = cap.read()
    if not ret:
        continue

    x1, y1, x2, y2 = ast.literal_eval(plate_info['plateBbox']
                                      .replace('[ ', '[').replace('   ', ' ')
                                      .replace('  ', ' ').replace(' ', ','))
    x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(width, x2), min(height, y2)

    crop = frame[y1:y2, x1:x2]
    if crop.size > 0:
        crop = cv2.resize(crop, (int((x2 - x1) * 400 / (y2 - y1)), 400))
        license_plate[vehId]['licenseCrop'] = crop

# --- RESET TO START ---
cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

frameNumber = -1
while True:
    ret, frame = cap.read()
    frameNumber += 1
    if not ret:
        break

    df_ = results[results['frameNumber'] == frameNumber]
    for _, row in df_.iterrows():
        car_x1, car_y1, car_x2, car_y2 = map(int, ast.literal_eval(row['carBbox']
                                                                   .replace('[ ', '[').replace('   ', ' ')
                                                                   .replace('  ', ' ').replace(' ', ',')))
        drawBorder(frame, (car_x1, car_y1), (car_x2, car_y2), (0, 255, 0), 25, 200, 200)

        x1, y1, x2, y2 = map(int, ast.literal_eval(row['plateBbox']
                                                   .replace('[ ', '[').replace('   ', ' ')
                                                   .replace('  ', ' ').replace(' ', ',')))
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 12)

        crop = license_plate[row['vehId']]['licenseCrop']
        if crop is not None:
            H, W, _ = crop.shape
            top_y = max(0, car_y1 - H - 100)
            left_x = max(0, int((car_x2 + car_x1 - W) / 2))
            right_x = min(width, left_x + W)
            bottom_y = min(height, top_y + H)

            frame[top_y:bottom_y, left_x:right_x] = crop[:bottom_y - top_y, :right_x - left_x]
            # cv2.rectangle(frame, (left_x, top_y - 300), (right_x, top_y), (255, 255, 255), -1)

            # (text_w, text_h), _ = cv2.getTextSize(license_plate[row['vehId']]['licensePlateNumber'],
                                                #   cv2.FONT_HERSHEY_SIMPLEX, 4.3, 17)
            # text_x = max(0, int((car_x2 + car_x1 - text_w) / 2))
            # text_y = max(0, top_y - 150 + text_h // 2)
            
            # Draw white background box for text
            rect_top = max(0, top_y - 120)   # not -300
            rect_bottom = top_y
            cv2.rectangle(frame, (left_x, rect_top), (right_x, rect_bottom), (255, 255, 255), -1)

            # Draw text inside safely
            (text_w, text_h), _ = cv2.getTextSize(license_plate[row['vehId']]['licensePlateNumber'],
                                                cv2.FONT_HERSHEY_SIMPLEX, 2.5, 8)

            text_x = max(0, int((left_x + right_x - text_w) / 2))
            text_y = max(rect_top + text_h + 10, text_h + 10)  # Ensure inside frame
            cv2.putText(frame, license_plate[row['vehId']]['licensePlateNumber'],
            (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 2.5, (255, 255, 255), 8)

    out.write(frame)  # Always same (width, height)

out.release()
cap.release()
# print(f"✅ Saved frames to {OUTPUT_FILE}")
