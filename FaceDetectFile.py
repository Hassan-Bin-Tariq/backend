from tkinter import Tk
from tkinter.filedialog import askopenfilename, askopenfilenames

import urllib.request
import numpy as np
import asyncio


import cv2 as cv
import face_recognition as fr

import win32api
from flask import Flask, render_template, request, Response
from flask import jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
import base64

app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()
CORS(app)


@app.route('/getdata')
def data_get():
    return "This is text"


@app.route('/FaceDetect')
def index():
    win32api.MessageBox(0, 'You have just run a python script on the page load!',
                        'Running a Python Script via Javascript', 0x00001000)

    load_image = askopenfilename()

    # print(load_image)
    target_image = fr.load_image_file(load_image)
    target_encoding = fr.face_encodings(target_image)

    face_location = fr.face_locations(target_image)

    # print(type(target_encoding))

    def create_frame(location, label):
        top, right, bottom, left = location

        cv.rectangle(target_image, (left, top),
                     (right, bottom), (255, 0, 0), 2)
        cv.rectangle(target_image, (left, bottom + 20),
                     (right, bottom), (255, 0, 0), cv.FILLED)
        cv.putText(target_image, label, (left + 3, bottom + 14),
                   cv.FONT_HERSHEY_DUPLEX, 0.4, (255, 255, 255), 1)

    if face_location:

        for location in face_location:
            label = "Selected File"
            create_frame(location, label)

    def render_image():
        rgb_img = cv.cvtColor(target_image, cv.COLOR_RGB2BGRA)
        cv.imshow('Face Recognition', rgb_img)
        cv.waitKey(0)

    render_image()

    with open(load_image, "rb") as img_file:
        my_string = base64.b64encode(img_file.read())
    # print(load_image)

    d = dict()
    d['path'] = load_image
    d['base'] = str(my_string)

    return d


# @app.route('/UploadImages')
# def index2():
#     all_images = []
#     win32api.MessageBox(0, 'You have just run a python script on the page load!',
#                         'Running a Python Script via Javascript', 0x00001000)
#     load_image = askopenfilenames()
#     for image in load_image:
#         all_images.append(image)
#     print(type(all_images))
#     print(all_images)

#     return all_images

async def process_image(url):
    print(url)
    response = urllib.request.urlopen(url)
    img_array = np.array(bytearray(response.read()), dtype=np.uint8)

    # Decode the image data
    known_image = cv.imdecode(img_array, cv.IMREAD_UNCHANGED)

    # Check if the image was correctly loaded
    if known_image is None:
        print("Failed to load the image data.")
        exit(1)

    # Call fr.face_encodings
    face_encodings = fr.face_encodings(known_image)
    return face_encodings


async def get_face_encodings(url):
    resp = await asyncio.get_event_loop().run_in_executor(None, urllib.request.urlopen, url)
    img_array = np.array(bytearray(resp.read()), dtype=np.uint8)
    known_image = cv.imdecode(img_array, cv.IMREAD_UNCHANGED)
    face_encodings = []
    if known_image is not None:
        face_encodings = fr.face_encodings(known_image)
    return face_encodings


async def process_image(url):
    # print(url)
    parts = url.split('/')

    # Extract the file id
    file_id = parts[5]

    # Create the new link using the file id
    new_url = f"https://drive.google.com/uc?id={file_id}"
    face_encodings = await get_face_encodings(new_url)
    # Perform other processing here with the face encodings
    print(face_encodings)


@app.route('/UploadImages', methods=['POST'])
async def data():

    data = request.get_json()
    print(data)
    keys = data.keys()
    valuesss = data.values()
    for key in keys:
        print(key)

    tasks = [asyncio.ensure_future(process_image(url)) for url in valuesss]
    await asyncio.gather(*tasks)

    return 'Data received', 200


if __name__ == "__main__":
    app.run(debug=True)
