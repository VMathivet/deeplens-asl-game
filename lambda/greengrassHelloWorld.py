print("Started Lambda")

import awscam
import mo
import cv2
from datetime import datetime
import json
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import sys
from threading import Thread
from base64 import b64encode

clients = []
class ResultsServer(WebSocket):
    def handleConnected(self):
        print(self.address, 'connected')
        clients.append(self)
    def handleClose(self):
        clients.remove(self)
        print(self.address, 'closed')

try:
    results_server = SimpleWebSocketServer('', 8080, ResultsServer)
    t = Thread(target=results_server.serveforever)
    t.start()
    print("Started websocket server")
except:
    print("error", sys.exc_info()[0])

def greengrass_infinite_infer_run():
    try:
        global clients

        input_width = 224
        input_height = 224
        model_name = "image-classification"

        error, model_path = mo.optimize(model_name, input_width, input_height)
        if error:
            print error
            raise Exception(error)
        print("Optimized model")

        model = awscam.Model(model_path, {"GPU": 1})
        print("Loaded model")

        model_type = "classification"
        labels = ['a','b','c','d','e','f','g','h','i','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','not']
        topk = 1

        while True:
            start = datetime.now()
            ret, frame = awscam.getLastFrame()
            if ret == False:
                raise Exception("Failed to get frame from the stream")

            height, width, channels = frame.shape
            frame_cropped = frame[0:height, (width-height)/2:width-(width-height)/2]
            frame_resize = cv2.resize(frame_cropped, (input_width, input_height))
            infer_output = model.doInference(frame_resize)
            parsed_results = model.parseResult(model_type, infer_output)
            top_k = parsed_results[model_type][0:topk]

            ret, jpeg = cv2.imencode(".jpg", frame_resize)
            try:
                end = datetime.now()
                top_k[0]["label"] = labels[top_k[0]["label"]];
                top_k[0]["jpeg"] = b64encode(jpeg)
                top_k[0]["delay"] = (end - start).microseconds / 1000
                msg = json.dumps(top_k[0]) + u''
                for client in clients:
                    client.sendMessage(msg)
            except:
                print("error", sys.exc_info()[0])

    except Exception as e:
        print("Lambda failed: " + str(e))

    # Asynchronously schedule this function to be run again in 15 seconds
    Timer(15, greengrass_infinite_infer_run).start()

# Execute the function above
greengrass_infinite_infer_run()


# This is a dummy handler and will not be invoked
# Instead the code above will be executed in an infinite loop for our example
def function_handler(event, context):
    return
