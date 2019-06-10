import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

function Room(props) {
  const [message, updateMessage] = useState("");
  const [messages, updateMessages] = useState([]);
  const [users, updateUsers] = useState([]);

  const { id } = props.match.params;
  const user = props.name;

  useEffect(() => {
    socket.on("new_message", data => {
      updateUsers(u => {
        if (!u.includes(data.message.user)) return u.concat(data.message.user);
        return u;
      });

      updateMessages(m => m.concat(data.message));
    });

    axios
      .get(`/api/room/${id}`)
      .then(response => {
        let data = response.data;
        updateMessages(data.messages);
        updateUsers(data.users);
      })
      .catch(err => console.log(err));

    return () => {
      socket.off("new_message");
    };
  }, [props.location.pathname]);

  function sendMessage(e) {
    e.preventDefault();

    axios
      .post(`/api/room/${id}`, { user, message })
      .then(_ => updateMessage(""))
      .catch(err => console.log(err));
  }

  return (
    <div className="chat-room">
      <div className="chat">
        <div className="messages">
          {messages.map(message => (
            <div
              className={`message ${
                message.user === user ? "current-user" : null
              }`}
              key={message.id}
            >
              <p className="message__username">{message.user}</p>
              <p>{message.message}</p>
            </div>
          ))}
        </div>
        <div className="new-message">
          <form onSubmit={sendMessage}>
            <input
              type="text"
              onChange={e => updateMessage(e.target.value)}
              value={message}
            />
            <input type="submit" value="Send" />
          </form>
        </div>
      </div>
      <aside className="users">
        {users.map(user => (
          <p key={user} className="user">
            {user}
          </p>
        ))}
      </aside>
    </div>
  );
}

export default Room;
