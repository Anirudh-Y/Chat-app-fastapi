import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Homepage.jsx";
import Chat from "./components/Chat.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/chat/:name/:roomid" Component={Chat}/>
      </Routes>
    </Router>
  );
}

export default App;
