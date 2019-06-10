import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";

import Main from "./Main";
import Room from "./Room";

function Home(props) {
  const [rooms, updateRooms] = useState([]);
  const [newRoom, updateNewRoom] = useState("");

  useEffect(getRooms, []);

  function getRooms() {
    axios
      .get("/api/rooms")
      .then(response => {
        updateRooms(response.data.rooms);
      })
      .catch(error => console.log(error));
  }

  function createRoom() {
    axios
      .post("/api/rooms", { name: newRoom })
      .then(response => {
        let newData = [...rooms, response.data];
        updateRooms(newData);
        updateNewRoom("");
      })
      .catch(error => console.log(error));
  }

  function removeRoom(id) {
    axios
      .delete(`/api/room/${id}`)
      .then(_ => getRooms())
      .catch(error => console.log(error));
  }

  return (
    <Router>
      <header className="main-header">
        <span className="main-header__username">{props.name}</span>
        <button onClick={() => props.updateAuthed(false)}>Log Out</button>
      </header>
      <div className="wrapper">
        <aside className="rooms-list">
          <div className="room-list__new-room">
            <input
              className="room-list__new-room__input"
              type="text"
              onChange={e => updateNewRoom(e.target.value)}
              placeholder="New room..."
              value={newRoom}
            />
            <button
              className="room-list__new-room__button"
              onClick={createRoom}
            >
              &#43;
            </button>
          </div>
          {rooms.map(room => (
            <div className="room-list__room" key={room.id}>
              <Link className="room-list__room__link" to={`/room/${room.id}`}>
                {room.name}
              </Link>
              <button onClick={() => removeRoom(room.id)}>&times;</button>
            </div>
          ))}
        </aside>

        <Route exact path="/" component={Main} />
        <Route
          path="/room/:id"
          render={routeProps => <Room {...routeProps} name={props.name} />}
        />
      </div>
    </Router>
  );
}

export default Home;
