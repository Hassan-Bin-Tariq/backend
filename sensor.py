import random
import time
import win32api

print("asd")
win32api.MessageBox(0, 'You have just run a python script on the button click!',
                    'Running a Python Script via Javascript', 0x00001000)
# while True:

#     time.sleep(random.random() * 5)  # wait 0 to 5 seconds
#     temperature = (random.random() * 20) - 5  # -5 to 15
#     print(temperature, flush=True, end='')
