const uuidv1 = require("uuid/v1");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
let file = require("./databas/rooms.json");

const fs = require("fs");

const PORT = 8080;

app.use(express.json());

app
  .route("/api/rooms")
  .get((_, res) => {
    res.status(200).send(file);
  })
  .post((req, res) => {
    if (!req.body || !req.body.name) {
      res.status(400).end();
      return;
    }

    let rooms = file.rooms;

    for (let room of rooms) {
      if (room.name === req.body.name) {
        res.status(400).end("This room is already exist!");
        return;
      }
    }

    let id = uuidv1();
    let room = {
      id,
      name: req.body.name
    };
    rooms.push(room);

    fs.writeFile("./databas/rooms.json", JSON.stringify({ rooms }), err => {
      if (err) {
        res.status(500).end();
        return;
      }

      fs.writeFile(
        `./databas/rooms/${room.name}.json`,
        JSON.stringify({ users: [], messages: [] }),
        err => {
          if (err) {
            res.status(500).end();
            return;
          }
        }
      );

      res.status(201).send(room);
    });
  });

app
  .route("/api/room/:id")
  .get((req, res) => {
    const id = req.params.id;

    let room = file.rooms.find(el => el.id === id);

    if (!room) {
      res.status(404).end();
      return;
    }

    fs.readFile(`./databas/rooms/${room.name}.json`, (err, data) => {
      if (err) {
        res.status(500).end();
        return;
      }

      res.status(200).send(data);
    });
  })
  .post((req, res) => {
    const body = req.body;

    if (!body || !body.user || !body.message) {
      res.status(400).end();
      return;
    }

    const id = req.params.id;
    const user = body.user;
    const message = body.message;

    let room = file.rooms.find(el => el.id === id);

    if (!room) {
      res.status(404).status("This room does not exist!");
      return;
    }

    fs.readFile(`./databas/rooms/${room.name}.json`, (err, data) => {
      if (err) {
        res.status(500).end();
        return;
      }

      let file = JSON.parse(data);
      let users = [...file.users];
      let messages = [...file.messages];

      if (!users.includes(user)) {
        users.push(user);
      }

      let newMessage = { id: uuidv1(), user, message };

      messages.push(newMessage);

      fs.writeFile(
        `./databas/rooms/${room.name}.json`,
        JSON.stringify({ users, messages }),
        err => {
          if (err) {
            res.status(500).end();
            return;
          }

          io.emit("new_message", { message: newMessage });
          res.end();
        }
      );
    });
  })
  .delete((req, res) => {
    let id = req.params.id;

    let rooms = file.rooms;

    let idx = rooms.findIndex(room => room.id === id);

    if (idx === -1) {
      res.status(404).end();
      return;
    }

    const room = rooms[idx];
    const name = room.name;

    if (name === "Main") {
      res.status(400).end();
      return;
    }

    fs.unlink(`./databas/rooms/${name}.json`, err => {
      if (err) {
        res.status(500).end;
        return;
      }

      rooms.splice(idx, 1);

      fs.writeFile("./databas/rooms.json", JSON.stringify({ rooms }), err => {
        if (err) {
          res.status(500).end();
        }

        res.status(204).end();
      });
    });
  });

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
