from fastapi import *
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="static")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Room:
  def __init__(self, room_id):
    self.room = room_id
    self.connections = []

  async def broadcast(self, message, sender):
    for connection in self.connections:
      print(message)
      await connection.send_text(message)

room_dict = {}
dump=[]

@app.get('/')
def home(request: Request):
  # return templates.TemplateResponse("home.html", {"request": request})
  return "status 200 OK"

@app.get('/roomid/{name}')
def getUniqueID(request: Request,name:str):
    num=0
    id =  pwd_context.hash(name)
    while id in room_dict or id in dump:
        id = pwd_context.hasah(name+str(num))
        num+=1
    
    id=id.replace("/","")
    room_dict[id]={"room":Room(id),"owner":name}
    return id

@app.get('/chat/check/{url}')
def checkValidity(request:Request,url:str):
   print("hi this is url "+url)
   if(url not in dump and url in room_dict):
      return {"status":200}
   else:
      return {"status":505}
   
@app.get('/chat/{client_id}/{room_id}')
def getChat(request: Request,client_id:str,room_id:str):
  # return templates.TemplateResponse("index.html", {"request": request})
  return "status 200 OK"

@app.websocket('/ws/{room_id}/{client_id}')
async def websocket_endpoint(websocket:WebSocket, room_id: str, client_id: str):
    print(room_id+" "+client_id)
    try:
        if room_id not in room_dict:
            raise WebSocketDisconnect

        await websocket.accept()

        room  = room_dict[room_id]["room"]
        owner = room_dict[room_id]["owner"]
        room.connections.append(websocket)

        print(f"connection established for {client_id} in room {room_id}")

        while True:
            data = await websocket.receive_text()
            res = json.loads(data)
            if ("all_out" in res and client_id == owner) or ("all_out" not in res):
                await room.broadcast(data, websocket)

            
    except WebSocketDisconnect:
        if room_id in room_dict:
            room = room_dict[room_id]["room"]
            owner = room_dict[room_id]["owner"]

            room.connections.remove(websocket)
            if len(room.connections) == 0:
                dump.append(room_id)
                del room_dict[room_id]

