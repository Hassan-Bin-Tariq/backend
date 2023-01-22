from tkinter import Tk
from tkinter.filedialog import askopenfilename

import cv2 as cv
import face_recognition as fr

import win32api
from flask import Flask, render_template, request, Response
from flask import jsonify
from flask_cors import CORS
import socketio

app = Flask(__name__)
CORS(app)


@app.route('/getdata')
def data_get():
    return "This is text"


@app.route('/FaceDetect')
def index():
    win32api.MessageBox(0, 'You have just run a python script on the page load!',
                        'Running a Python Script via Javascript', 0x00001000)
    print("asd")

    load_image = askopenfilename()

    target_image = fr.load_image_file(load_image)
    target_encoding = fr.face_encodings(target_image)

    face_location = fr.face_locations(target_image)

    # print(target_image)

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

    image = ' '.join([str(elem) for elem in target_image])
    # print(hassan)
    return image
    # return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
