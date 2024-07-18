import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";

let log_out;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [roomid, setRoomId] = useState("");
  const [clientid, setClientId] = useState("");
  const [roomidiv, setRoomIdiv] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  // const [ws,setWs]=useState()

  const navigate = useNavigate();

  const func = async () => {
    let url = window.location.href.split("/")[5];
    let name = window.location.href.split("/")[4];
    const logout = document.getElementById("logout");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message");

    let res = await fetch(`http://localhost:8000/chat/check/${url}`);
    let data = await res.json();

    if (data.status === 505) {
      navigate("/");
    }

    setClientId(name);
    setRoomId(url);
    setRoomIdiv(url.substring(0, 10) + "....");

    async function processMessage(event) {
      const d = await JSON.parse(event.data);
      console.log(d);
      if ("all_out" in d) {
        if (d.userID !== name) alert("Owner has logged out");
        log_out();
      }
      setMessages((prev) => {
        return [...prev, { userID: d.userID, msg: d.msg }];
      });
    }

    let ws;

    logout.addEventListener("click", async (event) => {
      ws.send(JSON.stringify({ all_out: true, userID: name }));
      setTimeout(() => {
        log_out();
      }, 1000);
    });

    let roomID = url;
    ws = new WebSocket(`ws://localhost:8000/ws/${roomID}/${name}`);
    console.log(`ws://localhost:8000/ws/${roomID}/${name}`);
    // ws.onmessage = processMessage;
    log_out = () => {
      if (ws) {
        ws.close();
        navigate("/");
      }
    };

    ws.onmessage = processMessage;

    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageInput.value;

      ws.send(JSON.stringify({ msg: message, userID: name }));
      messageInput.value = "";
    });

    window.addEventListener("beforeunload", async () => {
      await ws.send(JSON.stringify({ all_out: true, userID: name }));
      if (ws) {
        ws.close();
      }
    });
    return () => {
      window.removeEventListener("beforeunload", () => {});
      window.removeEventListener("load", () => {});
      logout.removeEventListener("click", () => {});
      messageForm.removeEventListener("submit", () => {});
    };
  };

  useEffect(() => {
    func();
  }, []);

  return (
    <div className="chat">
      <h1>Chat App</h1>
      <h2 id="room_div_id">Room ID: {roomidiv}</h2>
      <div className="btn1">
        <button
          id="copy_id"
          onClick={(e) => {
            navigator.clipboard.writeText(roomid);
            setShow(true);
            setTimeout(() => {
              setShow(false);
            }, 2000);
          }}
        >
          Copy room id
        </button>
        {show && <p>Room ID copied</p>}

        <button id="logout">Logout</button>
      </div>
      <div className="box">
        <div id="message-box">
          {/* Messages will be added here */}
          {messages.map((message) => {
            return (
              <div className="w-full flex justify-start">
                <div style={{ display: "flex" ,flexDirection: "column" }}>
                  {message.userID === clientid ? (
                    <p style={{ width: "60%", alignSelf:"flex-end",textAlign: "end" }}>
                      Me: {message.msg}
                    </p>
                  ) : (
                    <p style={{width:"60%"}}>
                      {message.userID}: {message.msg}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chatbox">
        <form id="message-form">
          <div>
            <input
              type="text"
              id="message"
              placeholder="Enter your message"
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <button type="submit">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
