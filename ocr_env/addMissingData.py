import csv
import numpy as np
from scipy.interpolate import interp1d
import os
import sys

def interpolateBB(data):
    # Extract necessary data columns from input data
    frameNumbers = np.array([int(row['frameNumber']) for row in data])
    carId = np.array([int(float(row['vehId'])) for row in data])
    carBB = np.array([list(map(float, row['carBbox'][1:-1].split())) for row in data])
    plateBB = np.array([list(map(float, row['plateBbox'][1:-1].split())) for row in data])

    interpolatedData = []
    uniqueCarId = np.unique(carId)

    for vehId in uniqueCarId:
        frameNumbers_ = [p['frameNumber'] for p in data if int(float(p['vehId'])) == int(float(vehId))]
        
        # Filter data for a specific car ID
        carMask = carId == vehId
        carFrameNumbers = frameNumbers[carMask]
        carBBInterpolated = []
        plateBBInterpolated = []

        firstFrame = carFrameNumbers[0]

        for i in range(len(carBB[carMask])):
            frameNumber = carFrameNumbers[i]
            carBbox = carBB[carMask][i]
            plateBbox = plateBB[carMask][i]

            if i > 0:
                previousFrameNumber = carFrameNumbers[i-1]
                prevCarBB = carBBInterpolated[-1]
                prevPlateBB = plateBBInterpolated[-1]

                gap = frameNumber - previousFrameNumber
                if gap > 1 and gap <= 10:  # allow interpolation up to 10-frame gap
                    # Interpolate missing frames' bounding boxes
                    x = np.array([previousFrameNumber, frameNumber])
                    xNew = np.arange(previousFrameNumber + 1, frameNumber)  # strictly missing frames only
                    interpolatedFunction = interp1d(x, np.vstack((prevCarBB, carBbox)), axis=0, kind='linear')
                    interpolatedCarBB = interpolatedFunction(xNew)
                    interpolatedFunction = interp1d(x, np.vstack((prevPlateBB, plateBbox)), axis=0, kind='linear')
                    interpolated_plateBB = interpolatedFunction(xNew)

                    carBBInterpolated.extend(interpolatedCarBB.tolist())
                    plateBBInterpolated.extend(interpolated_plateBB.tolist())

            carBBInterpolated.append(carBbox)
            plateBBInterpolated.append(plateBbox)


        for i in range(len(carBBInterpolated)):
            frameNumber = firstFrame + i
            row = {}
            row['frameNumber'] = str(frameNumber)
            row['vehId'] = str(vehId)
            row['carBbox'] = ' '.join(map(str, carBBInterpolated[i]))
            row['plateBbox'] = ' '.join(map(str, plateBBInterpolated[i]))

            if str(frameNumber) not in frameNumbers_:
                #   Imputed row, set the following fields to '0'
                row['platebBoxScore'] = '0'
                row['licenseNumber'] = '0'
                row['licenseNumberScore'] = '0'
            else:
                # Original row, retrieve values from the input data if available
                original_row = [p for p in data if int(p['frameNumber']) == frameNumber and int(float(p['vehId'])) == int(float(vehId))][0]
                row['platebBoxScore'] = original_row['platebBoxScore'] if 'platebBoxScore' in original_row else '0'
                row['licenseNumber'] = original_row['licenseNumber'] if 'licenseNumber' in original_row else '0'
                row['licenseNumberScore'] = original_row['licenseNumberScore'] if 'licenseNumberScore' in original_row else '0'

            interpolatedData.append(row)
    return interpolatedData


# 1. Check if a command-line argument was provided
if len(sys.argv) < 2:
    sys.exit(1)

# 2. Get the input file name from the command-line arguments
inputFIleName = sys.argv[1]
scriptDir = os.path.dirname(os.path.abspath(__file__))
filename = os.path.basename(inputFIleName)
inputPath = os.path.join(scriptDir, 'csv folder', filename)

# 3. Define the folder and file paths
outputFolder = "interpolated"
basename = os.path.splitext(filename)[0]
# basename = os.path.splitext(inputFIleName)[0]  # Get filename without extension
outputFile = f"{basename}.csv"  # Add 'Inter' to the base name
outputPath = os.path.join(scriptDir, outputFolder, outputFile)

# 4. Create the output folder if it doesn't exist
os.makedirs(outputFolder, exist_ok=True)

# 5. Read the input CSV file
try:
    with open(inputPath, 'r') as file:
        reader = csv.DictReader(file)
        data = list(reader)
    # print(f"read input data from '{inputFIleName}'.")
except FileNotFoundError:
    # print(f"file '{inputFIleName}' was not found.")
    sys.exit(1)


# Interpolate missing data
interpolatedData = interpolateBB(data)

header = ['frameNumber', 'vehId', 'carBbox', 'plateBbox', 'platebBoxScore', 'licenseNumber', 'licenseNumberScore']
try:
    with open(outputPath, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=header)
        writer.writeheader()
        writer.writerows(interpolatedData)
    # print(f"saved interpolated data to '{outputPath}'.")
except IOError as e:
    # print(f"error writing to file: {e}")
    sys.exit(1)
