import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import "./home.css";

function Home(){

  const [alias, setAlias] = useState("");
  const [name, setName] = useState("");
  const [roomid,setRoomId] = useState("");
  const navigate = useNavigate()

  return (
    <div className="home">
      <form>
        <div className="mb-3">
          <label for="exampleInputEmail1" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            aria-describedby="emailHelp"
            onChange={(e) => {
              setName(e.target.value);
              console.log(name);

            }}
          />
        </div>
        <div className="mb-3">
          <label for="exampleInputPassword1" className="form-label">
            Alias if any
          </label>
          <input
            type="text"
            className="form-control"
            id="alias"
            onChange={(e) => {
              setAlias(e.target.value);
            }}
          />
        </div>
        <button
          type="button"
          id="submit"
          className="btn btn-primary"
          onClick={async (e) => {
            console.log(name,alias);
            if (alias.length === 0) {
              if (name.length === 0) {
                alert("Please type your name or alias");
                return;
              } else {
                let data = await fetch(`http://localhost:8000/roomid/${name}`);
                let id = await data.json();
                navigate(`/chat/${name}/${id}`);
              }
            } else if (alias.length !== 0) {
              let data = await fetch(`http://localhost:8000/roomid/${alias}`);
              let id = await data.json();
              navigate(`/chat/${alias}/${id}`);
            }
          }}
        >
          To the chat link
        </button>
      </form>
      <form className="form2">
        <div className="mb-3">
          <label for="exampleInputPassword1" className="form-label">
            Paste room id here
          </label>
          <input type="text" className="form-control" id="roomid" onChange={(e)=>{
            setRoomId(e.target.value);
          }} />
        </div>
        <button type="button" id="enter" className="btn btn-primary" onClick={ async (e)=>{
          if (alias.length === 0) {
            if (name.length === 0) {
              alert("Please type your name or alias");
              return;
            } else {
              navigate(`/chat/${name}/${roomid}`);
            }
          } else if (alias.length !== 0) {
            navigate(`/chat/${alias}/${roomid}`);
          }
        }}>
          Enter
        </button>
      </form>
    </div>
  );
}

export default Home;
