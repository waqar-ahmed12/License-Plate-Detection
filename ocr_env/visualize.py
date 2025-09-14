import cv2
import numpy as np
import pandas as pd
import sys
import os


def drawBorder(img, top_left, bottom_right, color=(0, 255, 0), thickness=5, line_length_x=100, line_length_y=100):
    x1, y1 = top_left
    x2, y2 = bottom_right

    # top-left
    cv2.line(img, (x1, y1), (x1, y1 + line_length_y), color, thickness)
    cv2.line(img, (x1, y1), (x1 + line_length_x, y1), color, thickness)

    # bottom-left
    cv2.line(img, (x1, y2), (x1, y2 - line_length_y), color, thickness)
    cv2.line(img, (x1, y2), (x1 + line_length_x, y2), color, thickness)

    # top-right
    cv2.line(img, (x2, y1), (x2 - line_length_x, y1), color, thickness)
    cv2.line(img, (x2, y1), (x2, y1 + line_length_y), color, thickness)

    # bottom-right
    cv2.line(img, (x2, y2), (x2, y2 - line_length_y), color, thickness)
    cv2.line(img, (x2, y2), (x2 - line_length_x, y2), color, thickness)

    return img

export_rows = []

def main():
    if len(sys.argv) < 2:
        sys.exit(1)

    csv_name = sys.argv[1]
    # base_name = os.path.splitext(csv_name)
    
    fileName = csv_name.split('/')[-1]
    fileName = fileName.split('.')[0]
    

    # Paths
    # csvPath = f"/home/waqar/Desktop/Internship/Number plate/ocr_env/interpolated/{fileName}.csv"
    # vidPath = f"/home/waqar/Desktop/Internship/Number plate/backend/uploads/{fileName}.mp4"
    # outputVidPath = f"/home/waqar/Desktop/Internship/Number plate/ocr_env/interpolated/{fileName}.mp4"

    baseDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    csvPath = os.path.join(baseDir, "ocr_env", "interpolated", f"{fileName}.csv")
    vidPath = os.path.join(baseDir, "backend", "uploads", f"{fileName}.mp4")
    outputVidPath = os.path.join(baseDir, "ocr_env", "interpolated", f"{fileName}.mp4")


    # csvPath = f"{csv_name}"
    # vidPath = f"{base_name}.mp4"
    # outputVidPath = f"{base_name}.mp4"

    # print(csvPath)
    # print(vidPath)
    # print(outputVidPath)
    
    results = pd.read_csv(csvPath)

    cap = cv2.VideoCapture(vidPath)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(outputVidPath, fourcc, fps, (width, height))

    PLATE_HEIGHT = 120  
    FONT_SCALE = 2
    FONT_THICKNESS = 4

    # Prepare license plate crops
    license_plate = {}
    for car_id in np.unique(results['vehId']):
        max_ = np.amax(results[results['vehId'] == car_id]['licenseNumberScore'])
        license_plate[car_id] = {
            'license_crop': None,
            'license_plate_number': results[(results['vehId'] == car_id) &
                                            (results['licenseNumberScore'] == max_)]['licenseNumber'].iloc[0]
        }

        for car_id, data in license_plate.items():
            export_rows.append({
                "vehId": car_id,
                "licenseNumber": data["license_plate_number"]
            })

        

        cap.set(cv2.CAP_PROP_POS_FRAMES, results[(results['vehId'] == car_id) &
                                                 (results['licenseNumberScore'] == max_)]['frameNumber'].iloc[0])
        ret, frame = cap.read()
        if not ret:
            continue

        x1, y1, x2, y2 = map(float, results[(results['vehId'] == car_id) &
                                            (results['licenseNumberScore'] == max_)]['plateBbox'].iloc[0].split())

        license_crop = frame[int(y1):int(y2), int(x1):int(x2), :]
        license_crop = cv2.resize(license_crop, (int((x2 - x1) * PLATE_HEIGHT / (y2 - y1)), PLATE_HEIGHT))

        license_plate[car_id]['license_crop'] = license_crop

    frame_nmr = -1
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    # Read frames
    ret = True
    while ret:
        ret, frame = cap.read()
        frame_nmr += 1
        if not ret:
            break

        df_ = results[results['frameNumber'] == frame_nmr]
        for row_indx in range(len(df_)):
            # Draw car bbox
            car_x1, car_y1, car_x2, car_y2 = map(float, df_.iloc[row_indx]['carBbox'].split())
            drawBorder(frame, (int(car_x1), int(car_y1)), (int(car_x2), int(car_y2)),
                        (0, 255, 0), thickness=20, line_length_x=100, line_length_y=100)

            # Draw license plate bbox
            x1, y1, x2, y2 = map(float, df_.iloc[row_indx]['plateBbox'].split())
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 8)

            # Place license crop + text
            license_crop = license_plate[df_.iloc[row_indx]['vehId']]['license_crop']
            plate_number = license_plate[df_.iloc[row_indx]['vehId']]['license_plate_number']
            H, W, _ = license_crop.shape
            frame_h, frame_w, _ = frame.shape

            # --- Preferred position above car ---
            y_offset = int(car_y1) - H - 20
            x_offset = int((car_x2 + car_x1 - W) / 2)

            # If not enough space above → place below red bbox
            if y_offset < 0:
                y_offset = int(y2) + 20

            # Clamp inside frame
            if x_offset < 0:
                x_offset = 0
            if x_offset + W > frame_w:
                x_offset = frame_w - W
            if y_offset + H > frame_h:
                y_offset = frame_h - H

            try:
                frame[y_offset:y_offset + H, x_offset:x_offset + W, :] = license_crop

                # --- Text position ---
                (text_width, text_height), _ = cv2.getTextSize(plate_number,
                                                               cv2.FONT_HERSHEY_SIMPLEX,
                                                               FONT_SCALE,
                                                               FONT_THICKNESS)

                text_x = x_offset + (W - text_width) // 2
                text_y = y_offset + H + text_height + 10

                # If text goes below frame, move it above crop
                if text_y > frame_h:
                    text_y = y_offset - 10

                cv2.putText(frame,
                            plate_number,
                            (text_x, text_y),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            FONT_SCALE,
                            (255, 255, 255),
                            FONT_THICKNESS)
            except Exception as e:
                print("overlay failed:", e)

        out.write(frame)

    out.release()
    cap.release()
    print(f"video saved to {outputVidPath}")


    export_df = pd.DataFrame(export_rows)
    base_name = os.path.splitext(os.path.basename(vidPath))[0]

    baseDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    export_csvPath = os.path.join(
        baseDir, "ocr_env", "interpolated", f"{base_name}_unique.csv"
    )
    # export_csvPath = os.path.join(
    #     "/home/waqar/Desktop/Internship/Number plate/ocr_env/interpolated",
    #     f"{base_name}_unique.csv"
    # )
    export_df.to_csv(export_csvPath, index=False)
    print(f"final detections saved at {export_csvPath}")



if __name__ == "__main__":
    main()
    print("in main if visualize")
else:
    print("Not in main visualizes")
