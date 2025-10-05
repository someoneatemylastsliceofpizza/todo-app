const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let todos = [];
let history = [];

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("client connected from ", socket.handshake.address);

    socket.emit("init", { todos, history });

    socket.on("firstupdate", () => {
      io.emit("update", { todos, history });
    });

    socket.on("add", (todo) => {
      todos.push(todo);
      history.push({ action: "Added", todo, timestamp: Date.now() });
      io.emit("update", { todos, history });
    });

    socket.on("edit", (todo) => {
      const idx = todos.findIndex((t) => t.id === todo.id);
      if (idx >= 0) {
        todos[idx] = todo;
        history.push({ action: "Edited", todo, timestamp: Date.now() });
        io.emit("update", { todos, history });
      }
    });

    socket.on("delete", (id) => {
      const idx = todos.findIndex((t) => t.id === id);
      if (idx >= 0) {
        const [removed] = todos.splice(idx, 1);
        history.push({ action: "Deleted", todo: removed, timestamp: Date.now() });
        io.emit("update", { todos, history });
      }
    });
  });

  server.listen(3000, () => console.log("http://localhost:3000"));
});
