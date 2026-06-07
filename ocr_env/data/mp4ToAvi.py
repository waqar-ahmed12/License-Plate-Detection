import cv2

# Input and output file paths

file = 'streetTest1'
input_file = f"{file}.mp4"
output_file = f"{file}.avi"

# Read the input video
cap = cv2.VideoCapture(input_file)

# Get video properties
fps = int(cap.get(cv2.CAP_PROP_FPS))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'XVID')  # For .avi format
out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    out.write(frame)  # Write frame to output

cap.release()
out.release()
cv2.destroyAllWindows()

print(f"Conversion complete! Saved as {output_file}")
