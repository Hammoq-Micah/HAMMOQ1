import boto3
import re
import json

# to find nike style code


def findPattern_Nike(text):
    detected_styleCode = re.findall(r'\S[A-Z0-9]+-\S[A-Z0-9]+', text)
    try:
        return list(dict.fromkeys(detected_styleCode))[0]
    except:
        return None

# to find reebok style code


def findPattern_Reebok(text):
    detected_styleCode = re.findall(
        r'\b[a-zA-Z0-9]{6,}\b [0-9]+ \b[a-zA-Z0-9]{6}\b', text)
    try:
        detected_styleCode = list(dict.fromkeys(detected_styleCode))[0]
        return detected_styleCode.split()[-1]
    except:
        return None

# word list to string


def list_to_String(listOfWords):
    return ' '.join(listOfWords)


def lambda_handler(event, context):
    filePath = event
    bucket = 'hammoq-react-webapp-images'
    client = boto3.client('rekognition')
    response = client.detect_text(
        Image={'S3Object': {'Bucket': bucket, 'Name': filePath}})

    textDetections = response['TextDetections']

    wordList = []
    for text in textDetections:
        wordList.append(text['DetectedText'])

    line = list_to_String(wordList)
    detected_styleCode = findPattern_Nike(line)
    if detected_styleCode == None:
        detected_styleCode = findPattern_Reebok(line)
    return {
        'body': detected_styleCode,
        'status': 200
    }
