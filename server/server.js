const uuidv1 = require("uuid/v1");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require("fs");

const PORT = 8080;

app.use(express.json());

app.get("/api/rooms", (_, res) => {
  fs.readFile("./databas/rooms.json", (err, data) => {
    if (err) {
      res.status(500).end();
      return;
    }

    res.status(200).send(JSON.parse(data));
  });
});

app.post("/api/rooms", (req, res) => {
  if (!req.body || !req.body.name) {
    res.status(400).end();
    return;
  }

  fs.readFile("./databas/rooms.json", (err, data) => {
    if (err) {
      res.status(500).end();
      return;
    }

    let file = JSON.parse(data);
    let rooms = [...file.rooms];

    for (let room of rooms) {
      if (room.name === req.body.name) {
        res.status(400).end("This room is already exist!");
        return;
      }
    }

    let id = rooms[rooms.length - 1].id + 1;
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

      res.status(200).send(room);
    });
  });
});

app.post("/api/room/:id", (req, res) => {
  const body = req.body;

  if (!(body || body.user || body.message)) {
    res.status(400).end();
    return;
  }

  const id = parseInt(req.params.id);
  const user = body.user;
  const message = body.message;

  fs.readFile("./databas/rooms.json", (err, data) => {
    if (err) {
      res.status(500).end();
      return;
    }

    let file = JSON.parse(data);
    let room = file.rooms.find(el => el.id === id);

    if (!room) {
      res.status(400).status("This room does not exist!");
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

          res.status(200).send({ message: newMessage });
        }
      );
    });
  });
});

app.delete("/api/room/:id", (req, res) => {
  let id = parseInt(req.params.id);

  fs.readFile("./databas/rooms.json", (err, data) => {
    if (err) {
      res.status(500).end();
      return;
    }
    let file = JSON.parse(data);
    let rooms = [...file.rooms];

    let idx = rooms.findIndex(room => room.id === id);

    if (idx === -1) {
      res.status(500).end();
      return;
    }

    const room = rooms[idx];
    const name = room.name;

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

        res.status(200).end();
      });
    });
  });
});

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
