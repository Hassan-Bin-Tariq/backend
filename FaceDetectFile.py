from tkinter import Tk
from tkinter.filedialog import askopenfilename, askopenfilenames
import tkinter.messagebox


import urllib.request
import numpy as np
import asyncio


import cv2 as cv
import face_recognition as fr

# import win32api
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


# all_images_paths = []


@app.route('/getdata')
def data_get():
    return "This is text"


@app.route('/FaceDetect', methods=['POST'])
def index():
    data = request.get_json()
    print(data)
    tkinter.messagebox.showinfo("Title", "Your message here")

    load_image = askopenfilename()

    # print(load_image)
    target_image = fr.load_image_file(load_image)

    # target_encoding = fr.face_encodings(target_image)

    face_location = fr.face_locations(target_image)

    if face_location == 1:
        print("face found")
    elif (len(face_location) > 1):
        print("more then one face")
    else:
        print("No face")

    with open(load_image, "rb") as img_file:
        my_string = base64.b64encode(img_file.read())
    # print(load_image)

    d = dict()
    d['path'] = load_image
    d['base'] = str(my_string)
    return d


async def get_face_encodings(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = await asyncio.get_event_loop().run_in_executor(None, urllib.request.urlopen, req)
    img_array = np.array(bytearray(resp.read()), dtype=np.uint8)
    known_image = cv.imdecode(img_array, cv.IMREAD_UNCHANGED)
    face_encodings = []
    if known_image is not None:
        face_encodings = fr.face_encodings(known_image)[0]
    return face_encodings


async def process_image(url, Present_Encodings):
    print(url)
    parts = url.split('/')

    # Extract the file id
    file_id = parts[5]

    # Create the new link using the file id
    new_url = f"https://drive.google.com/uc?id={file_id}"
    face_encodings = await get_face_encodings(new_url)
    # Perform other processing here with the face encodings
    Present_Encodings.append(face_encodings)
    # print(face_encodings)


def create_frame(targett, location, label):
    top, right, bottom, left = location

    cv.rectangle(targett, (left, top), (right, bottom), (255, 0, 0), 2)
    cv.rectangle(targett, (left, bottom + 20),
                 (right, bottom), (255, 0, 0), cv.FILLED)
    cv.putText(targett, label, (left + 3, bottom + 14),
               cv.FONT_HERSHEY_DUPLEX, 0.4, (255, 255, 255), 1)


async def getSelected_face_encodings(all_paths, path_email, detected_faces, Present_Encodings, emails):
    print("inside")
    pathie = 0
    for path in all_paths:
        target_image = fr.load_image_file(path)
        target_encoding = fr.face_encodings(target_image)
        kk = 0
        for encode in Present_Encodings:
            # print(encode, target_encoding)
            # print("Encoding : "+str(kk))
            face_location = fr.face_locations(target_image)
            is_target_face = fr.compare_faces(
                encode, target_encoding, tolerance=0.55)

            if face_location:
                face_number = 0
                for location in face_location:
                    if is_target_face[face_number]:
                        label = "Face Matched"
                        create_frame(target_image, location, label)
                        detected_faces.append(path)
                        path_email[path] = emails[kk]
                        # path_email["path"] = path
                        print(pathie, kk)

                    face_number += 1
            kk += 1

        pathie += 1
        rgb_img = cv.cvtColor(target_image, cv.COLOR_RGB2BGRA)
        cv.imshow('Face Recognition', rgb_img)
        cv.waitKey(0)


@app.route('/UploadImages', methods=['POST'])
async def data():
    Present_Encodings = []
    detected_faces = []
    all_images_paths = []
    emails = []
    path_email = dict()

    data = request.get_json()
    keys = data.keys()
    valuesss = data.values()

    for key in keys:
        emails.append(key)
        print(key)

    tkinter.messagebox.showinfo("Title", "Your message here")

    load_image = askopenfilenames()
    for image in load_image:
        all_images_paths.append(image)

    # print(selected_encodings)

    for url in valuesss:
        await process_image(url, Present_Encodings)

    # tasks = [asyncio.ensure_future(process_image(
    #     url, Present_Encodings)) for url in valuesss]
    # #print(tasks)
    # await asyncio.gather(*tasks)
    # #print(tasks)
    await getSelected_face_encodings(all_images_paths, path_email, detected_faces, Present_Encodings, emails)

    return path_email, 200


@app.route('/UploadImagesPKL', methods=['POST'])
def ProcessData():

    print("called")
    return ("Responded")


if __name__ == "__main__":
    app.run(debug=True)
