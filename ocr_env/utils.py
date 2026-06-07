import string
import easyocr
import cv2
import re
from collections import Counter
# import csv
# from collections import defaultdict
import sys

reader = easyocr.Reader(['en'], gpu=False)

# Mapping dictionaries for character conversion
dict_char_to_int = {'O': '0',
                    'I': '1',
                    'J': '3',
                    'A': '4',
                    'G': '6',
                    'S': '5'}

dict_int_to_char = {'0': 'O',
                    '1': 'I',
                    '3': 'J',
                    '4': 'A',
                    '6': 'G',
                    '5': 'S'}


# def writeCsv(results, output_path):
#     with open('csv folder' + output_path, 'w') as f:
#         # Write the header
#         f.write('frameNumber,vehId,carBbox,plateBbox,platebBoxScore,licenseNumber,licenseNumberScore\n')

#         for frameNumber in results.keys():
#             for vehId in results[frameNumber].keys():
#                 data = results[frameNumber][vehId]

#                 # Convert vehId to int if it's a float
#                 vehId_int = int(vehId)

#                 # Check that the required keys exist
#                 if 'car' in data and 'licensePlate' in data and 'text' in data['licensePlate']:
#                     carBB = [float(x) for x in data['car']['bbox']]
#                     plateBB = [float(x) for x in data['licensePlate']['bbox']]
#                     plateScore = float(data['licensePlate']['bboxScore'])
#                     licenseText = data['licensePlate']['text']
#                     text_score = float(data['licensePlate']['textScore'])

#                     f.write('{},{},[{} {} {} {}],[{} {} {} {}],{},{},{}\n'.format(
#                         frameNumber,
#                         vehId_int,
#                         carBB[0], carBB[1], carBB[2], carBB[3],
#                         plateBB[0], plateBB[1], plateBB[2], plateBB[3],
#                         plateScore,
#                         licenseText,
#                         text_score
#                     ))


def clean_text(text):
    cleaned = re.sub(r"[^A-Za-z0-9 ]", "", text)
    return cleaned.strip()

def majority_vote(entries):
    valid = [clean_text(t) for t, s in entries if s > 0.3 and clean_text(t) != ""]
    if not valid:
        return None
    counter = Counter(valid)
    return counter.most_common(1)[0][0]


# def writeCsv(results, output_path):
#     # translation table to remove punctuation
#     remove_punct = str.maketrans('', '', string.punctuation)

#     with open(output_path, 'w') as f:
#         # Write the header
#         f.write('frameNumber,vehId,carBbox,plateBbox,platebBoxScore,licenseNumber,licenseNumberScore\n')

#         for frameNumber in results.keys():
#             for vehId in results[frameNumber].keys():
#                 data = results[frameNumber][vehId]

#                 # Convert vehId to int if it's a float
#                 vehId_int = int(vehId)

#                 # Check that the required keys exist
#                 if 'car' in data and 'licensePlate' in data and 'text' in data['licensePlate']:
#                     carBB = [float(x) for x in data['car']['bbox']]
#                     plateBB = [float(x) for x in data['licensePlate']['bbox']]
#                     plateScore = float(data['licensePlate']['bboxScore'])
#                     licenseText = data['licensePlate']['text']
#                     text_score = float(data['licensePlate']['textScore'])

#                     # Remove punctuation from licenseText
#                     licenseText = licenseText.translate(remove_punct)

#                     f.write('{},{},[{} {} {} {}],[{} {} {} {}],{},{},{}\n'.format(
#                         frameNumber,
#                         vehId_int,
#                         carBB[0], carBB[1], carBB[2], carBB[3],
#                         plateBB[0], plateBB[1], plateBB[2], plateBB[3],
#                         plateScore,
#                         licenseText,
#                         text_score
#                     ))


def clean_license_text(text: str) -> str:
    # Keep only letters, digits, space, underscore, hyphen
    allowed = set(string.ascii_letters + string.digits + " _-")
    cleaned = "".join(ch for ch in text if ch in allowed)

    # Regex for plate format: 2-3 letters at start, optional space/_/-, then 3-4 digits at end
    pattern = re.compile(r"^[A-Za-z]{2,3}[\s_-]?\d{3,4}$")
    
    # Keep only if it matches pattern
    if pattern.match(cleaned):
        return cleaned
    return ""   # discard invalid plates

def writeCsv(results, output_path):
    with open(output_path, 'w') as f:
        # Write header
        f.write('frameNumber,vehId,carBbox,plateBbox,platebBoxScore,licenseNumber,licenseNumberScore\n')

        for frameNumber in results.keys():
            for vehId in results[frameNumber].keys():
                data = results[frameNumber][vehId]

                vehId_int = int(vehId)

                if 'car' in data and 'licensePlate' in data and 'text' in data['licensePlate']:
                    carBB = [float(x) for x in data['car']['bbox']]
                    plateBB = [float(x) for x in data['licensePlate']['bbox']]
                    plateScore = float(data['licensePlate']['bboxScore'])
                    
                    licenseText = clean_license_text(data['licensePlate']['text'])
                    text_score = float(data['licensePlate']['textScore'])

                    # Only write if licenseText is valid
                    if licenseText:
                        f.write('{},{},[{} {} {} {}],[{} {} {} {}],{},{},{}\n'.format(
                            frameNumber,
                            vehId_int,
                            carBB[0], carBB[1], carBB[2], carBB[3],
                            plateBB[0], plateBB[1], plateBB[2], plateBB[3],
                            plateScore,
                            licenseText,
                            text_score
                        ))





PLATE_PATTERNS = [
    r'^[A-Z]{2,3}[0-9]{3,4}$',       # AB1234, ABC123
    r'^[A-Z]{2,3}\s?[0-9]{3,4}$',    # AB 1234
    r'^[A-Z]{2,3}[0-9]{2,3}[A-Z]{1,2}$',  # e.g. LEC12A
]

def license_complies_format(text):
    """
    Accept plates that start with 2-3 alphabets (A-Z),
    followed by optional space, hyphen, or underscore,
    and end with 3-4 digits.
    """
    text = re.sub(r"[^A-Za-z0-9\s\-_]", "", text)  # strip punctuations, allow - _ and space

    # Regex: 2-3 letters + optional space/hyphen/underscore + 3-4 digits
    pattern = r'^[A-Z]{2,3}[\s\-_]?[0-9]{3,4}$'
    return re.match(pattern, text) is not None



# def license_complies_format(text):
#     if len(text) != 7:
#         return False

#     if (text[0] in string.ascii_uppercase or text[0] in dict_int_to_char.keys()) and \
#        (text[1] in string.ascii_uppercase or text[1] in dict_int_to_char.keys()) and \
#        (text[2] in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or text[2] in dict_char_to_int.keys()) and \
#        (text[3] in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or text[3] in dict_char_to_int.keys()) and \
#        (text[4] in string.ascii_uppercase or text[4] in dict_int_to_char.keys()) and \
#        (text[5] in string.ascii_uppercase or text[5] in dict_int_to_char.keys()) and \
#        (text[6] in string.ascii_uppercase or text[6] in dict_int_to_char.keys()):
#         return True
#     else:
#         return False


def format_license(text):
    license_plate_ = ''
    mapping = {0: dict_int_to_char, 1: dict_int_to_char, 4: dict_int_to_char, 5: dict_int_to_char, 6: dict_int_to_char,
               2: dict_char_to_int, 3: dict_char_to_int}
    for j in [0, 1, 2, 3, 4, 5, 6]:
        if text[j] in mapping[j].keys():
            license_plate_ += mapping[j][text[j]]
        else:
            license_plate_ += text[j]

    return license_plate_


def readLicensePlate(license_plate_crop):

    detections = reader.readtext(license_plate_crop)

    for detection in detections:
        bbox, text, score = detection

        text = text.upper().replace(' ', '')

        if license_complies_format(text):
            return format_license(text), score

    return None, None
def readLicensePlate(license_plate_crop):
    if license_plate_crop is None or license_plate_crop.size == 0:
        return None, None

    # Preprocessing (same as before)
    desired_height = 60
    scale = desired_height / license_plate_crop.shape[0]
    new_w = int(license_plate_crop.shape[1] * scale)
    crop_resized = cv2.resize(license_plate_crop, (new_w, desired_height))

    gray = cv2.cvtColor(crop_resized, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    blur = cv2.bilateralFilter(gray, 7, 50, 50)

    # OCR
    detections = reader.readtext(blur)

    for detection in detections:
        _, text, score = detection
        text = text.upper().replace(' ', '')

        if license_complies_format(text):
            return text, score   # <-- no need for fixed char/digit mapping anymore

    return None, None



def getVehicle(license_plate, vehicle_track_ids):
    x1, y1, x2, y2, score, class_id = license_plate

    foundIt = False
    for j in range(len(vehicle_track_ids)):
        xcar1, ycar1, xcar2, ycar2, car_id = vehicle_track_ids[j]

        if x1 > xcar1 and y1 > ycar1 and x2 < xcar2 and y2 < ycar2:
            car_indx = j
            foundIt = True
            break

    if foundIt:
        return vehicle_track_ids[car_indx]

    return -1, -1, -1, -1, -1
