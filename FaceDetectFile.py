from tkinter import Tk
from tkinter.filedialog import askopenfilename, askopenfilenames
import tkinter.messagebox
import cv2
import tempfile
import time
import pymongo
import urllib.request
import numpy as np
import asyncio
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import os
import pickle
import keyboard
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


@app.route('/getdata')
def data_get():
    return "This is text"


def PickleViewer():
    with open('./backend/face_recognition_model7.pkl', 'rb') as f:
        data = pickle.load(f)

    # View the contents of the pickle file
    print(data)


@app.route('/FaceDetect', methods=['POST'])
def index():
    data = request.get_json()
    Allmails = data.values()
    for temp in Allmails:
        mail = temp
    print(mail)
    tkinter.messagebox.showinfo("Title", "Your message here")

    load_image = askopenfilename()
    target_image = fr.load_image_file(load_image)

    new_face_encoding = fr.face_encodings(target_image)

    # print(new_face_encoding)
    if len(new_face_encoding) == 1:

        print("face found")
        # PickleViewer()
        model_file_path = "./backend/face_recognition_model7.pkl"

        # Load the existing model from file
        if os.path.exists(model_file_path):
            with open(model_file_path, 'rb') as f:
                known_face_encodings, known_face_names = pickle.load(f)
        else:
            known_face_encodings = []
            known_face_names = []

        # Load the new image and extract face encodings
        known_face_encodings.append(new_face_encoding[0])
        known_face_names.append(mail)

        # Save the updated model to file
        with open(model_file_path, 'wb') as f:
            pickle.dump((known_face_encodings, known_face_names), f)

    elif (len(new_face_encoding) > 1):
        print("more then one face")
    else:
        print("No face")

    with open(load_image, "rb") as img_file:
        my_string = base64.b64encode(img_file.read())

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


async def getNumber(name):

    connection_string = 'mongodb+srv://hassan:hassan123@cluster0.brlttau.mongodb.net/Mediascape?retryWrites=true&w=majority'

    client = pymongo.MongoClient(connection_string)

    db = client['Mediascape']

    collection = db['students']

    result = collection.aggregate([
        {'$match': {'email': name}},
        {'$project': {'PhoneNumber': 1, '_id': 0}}
    ])
    for document in result:
        return document['PhoneNumber']


async def sendWhatsapp(image, num):

    options = webdriver.ChromeOptions()  # remove
    options.add_argument(
        "user-data-dir=C:/Users/SmartCom/AppData/Local/Google/Chrome/User Data")  # remove
    driver = webdriver.Chrome('chromedriver.exe', chrome_options=options)
    driver.get("https://web.whatsapp.com/")
    wait = WebDriverWait(driver, 100)

    target = num  # Replace with the phone number of the contact you want to send the image to
    extra = image
    image_path = os.path.abspath(extra)

    print(image_path)
    search_bar_xpath = '//*[@id="side"]/div[1]/div/div/div[2]/div/div[1]/p'
    search_bar = wait.until(
        EC.presence_of_element_located((By.XPATH, search_bar_xpath)))
    search_bar.click()

    search_bar.send_keys(target)

    time.sleep(2)

    keyboard.press("tab")
    keyboard.release("enter")
    keyboard.press("tab")
    keyboard.release("enter")

    time.sleep(2)

    attachment_xpath = '//div[@title="Attach"]'
    attachment = wait.until(
        EC.presence_of_element_located((By.XPATH, attachment_xpath)))
    attachment.click()

    time.sleep(2)

    image_xpath = '//input[@type="file"]'
    image = wait.until(EC.presence_of_element_located((By.XPATH, image_xpath)))
    image.send_keys(image_path)

    time.sleep(2)

    keyboard.press("enter")
    keyboard.release("enter")

    time.sleep(4)

    driver.quit()


@app.route('/UploadImagesPKL', methods=['POST'])
def ProcessData():

    path_email = dict()
    MAX_IMAGE_SIZE = 1000000

    model_file_path = "./backend/face_recognition_model7.pkl"
    with open(model_file_path, "rb") as f:
        known_face_encodings, known_face_names = pickle.load(f)

    tkinter.messagebox.showinfo("Title", "Your message here")
    new_image_paths = askopenfilenames()

    for new_image_path in new_image_paths:

        new_image = cv2.imread(new_image_path)
        new_image_size = os.path.getsize(new_image_path)
        if new_image_size > MAX_IMAGE_SIZE:

            temp_file, temp_file_path = tempfile.mkstemp(suffix=".jpg")
            os.close(temp_file)

            resize_factor = np.sqrt(MAX_IMAGE_SIZE / new_image_size)
            resized_image = cv2.resize(
                new_image, (0, 0), fx=resize_factor, fy=resize_factor)

            cv2.imwrite(temp_file_path, resized_image)

            new_image = cv2.imread(temp_file_path)

        new_face_encodings = fr.face_encodings(new_image)
        if len(new_face_encodings) > 0:
            face_distances = fr.face_distance(
                known_face_encodings, new_face_encodings[0])
            print(face_distances)
            best_match_index = np.argmin(face_distances)
            if face_distances[best_match_index] < 0.6:
                person_name = known_face_names[best_match_index]
                path_email[new_image_path] = person_name
                print(f"The person in {new_image_path} is {person_name}")
            else:
                print(f"No matching person found in {new_image_path}")
        else:
            print(f"No face found in {new_image_path}")

        if new_image_size > MAX_IMAGE_SIZE:  # Del temp file agr koi create hoi ha
            os.remove(temp_file_path)

    return path_email


loop_running = False


@app.route('/CameraReceive', methods=['POST'])
async def Camera():
    global loop_running
    path_email = dict()
    on_value = request.get_data().decode('utf-8')
    print(on_value)

    if on_value == "ON" and not loop_running:  # start loop only if not already running
        loop_running = True
        folder_path = './backend/imageListner/2023_03_05'
        latest_image = None

        while loop_running:
            print("Listening")

            image_files = [f for f in os.listdir(folder_path) if (
                f.endswith('.JPG') or f.endswith('.png')) and ('processed' not in f)]

            image_files.sort(key=lambda f: os.path.getmtime(os.path.join(
                folder_path, f)), reverse=True)  # sorting to get latest

            latest_image_file = image_files[0] if len(
                image_files) > 0 else None
            latest_image_file_path = os.path.join(
                folder_path, latest_image_file) if latest_image_file is not None else None

            if latest_image_file_path is not None and latest_image_file_path != latest_image:
                print(latest_image_file_path)

                #####     CHUNK START    #######

                # Define the maximum image size in bytes
                MAX_IMAGE_SIZE = 1000000

                # Load the model from file
                model_file_path = "./backend/face_recognition_model7.pkl"
                with open(model_file_path, "rb") as f:
                    known_face_encodings, known_face_names = pickle.load(f)

                new_image_path = latest_image_file_path

                # Load the new image and resize if necessary
                new_image = cv2.imread(new_image_path)
                new_image_size = os.path.getsize(new_image_path)
                if new_image_size > MAX_IMAGE_SIZE:
                    # Create a temporary file to store the resized image
                    temp_file, temp_file_path = tempfile.mkstemp(suffix=".jpg")
                    os.close(temp_file)

                    # Calculate the resize factor to reduce the image to less than 1 MB
                    resize_factor = np.sqrt(MAX_IMAGE_SIZE / new_image_size)
                    resized_image = cv2.resize(
                        new_image, (0, 0), fx=resize_factor, fy=resize_factor)

                    # Write the resized image to the temporary file
                    cv2.imwrite(temp_file_path, resized_image)

                    # Load the resized image as the new image
                    new_image = cv2.imread(temp_file_path)

                # Recognize faces in the new image
                new_face_encodings = fr.face_encodings(new_image)
                if len(new_face_encodings) > 0:
                    face_distances = fr.face_distance(
                        known_face_encodings, new_face_encodings[0])
                    print(face_distances)
                    best_match_index = np.argmin(face_distances)
                    if face_distances[best_match_index] < 0.6:
                        person_name = known_face_names[best_match_index]

                        processed_image_file_path = new_image_path.replace(
                            '.JPG', '_processed.JPG').replace('.png', '_processed.png')
                        os.rename(new_image_path, processed_image_file_path)

                        cwd = os.path.abspath(os.getcwd())
                        full_path = os.path.join(
                            cwd, processed_image_file_path[2:]).replace('\\', '/')

                        path_email[full_path] = person_name
                        print(
                            f"The person in {new_image_path} is {person_name}")
                        number = await getNumber(person_name)
                        await sendWhatsapp(processed_image_file_path, number)
                        print("RETURNED")
                        return path_email
                    else:
                        processed_image_file_path = new_image_path.replace(
                            '.JPG', '_processed.JPG').replace('.png', '_processed.png')
                        os.rename(new_image_path, processed_image_file_path)
                        print(f"No matching person found in {new_image_path}")
                else:
                    processed_image_file_path = new_image_path.replace(
                        '.JPG', '_processed.JPG').replace('.png', '_processed.png')
                    os.rename(new_image_path, processed_image_file_path)

                    print(f"No face found in {new_image_path}")

                # Delete the temporary file if it was created
                if new_image_size > MAX_IMAGE_SIZE:
                    os.remove(temp_file_path)

                ####        CHUNK END #######
                latest_image = latest_image_file_path

            time.sleep(1)

    elif on_value == "OFF" and loop_running:  # loop of agr pehley se running ha
        loop_running = False
        return path_email

    return path_email


if __name__ == "__main__":
    app.run(debug=True)
