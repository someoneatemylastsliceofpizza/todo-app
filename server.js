const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", async (socket) => {
    console.log("client connected from ", socket.handshake.address);

    const todos = await prisma.todo.findMany();
    const history = await prisma.history.findMany({ orderBy: { id: "asc" } });

    socket.emit("init", { todos, history });

    socket.on("firstupdate", async () => {
      const todos = await prisma.todo.findMany();
      const history = await prisma.history.findMany({
        orderBy: { timestamp: "asc" },
      });
      io.emit("update", { todos, history });
    });

    socket.on("add", async (todo) => {
      const createdTodo = await prisma.todo.create({
        data: {
          ...todo,
          timestamp: new Date(todo.timestamp),
        },
      });

      await prisma.history.create({
        data: {
          action: "Added",
          name: createdTodo.name,
          todoId: createdTodo.id,
          important: createdTodo.important,
          timestamp: createdTodo.timestamp,
        },
      });

      const todos = await prisma.todo.findMany();
      const history = await prisma.history.findMany({
        orderBy: { timestamp: "asc" },
      });

      io.emit("update", { todos, history });
    });

    socket.on("edit", async (todo) => {
      const oldtodo = await prisma.todo.findUnique({ where: { id: todo.id } });
      await prisma.todo.update({
        where: { id: todo.id },
        data: {
          name: todo.name,
          note: todo.note,
          important: todo.important,
          timestamp: todo.timestamp,
        },
      });
      await prisma.history.create({
        data: {
          action: "Edited",
          name: oldtodo.name,
          newname: todo.name,
          note: oldtodo.note,
          newnote: todo.note,
          important: oldtodo.important,
          newimportant: todo.important,
          timestamp: oldtodo.timestamp,
          newtimestamp: todo.timestamp,
        },
      });

      const todos = await prisma.todo.findMany();
      const history = await prisma.history.findMany({
        orderBy: { timestamp: "asc" },
      });
      io.emit("update", { todos, history });
    });

    socket.on("delete", async (id) => {
      const removed = await prisma.todo.findUnique({ where: { id } });
      if (!removed) return;

      // record snapshot into history
      await prisma.history.create({
        data: {
          action: "Deleted",
          todoId: removed.id,
          name: removed.name,
          note: removed.note,
          important: removed.important,
          timestamp: new Date(),
        },
      });

      await prisma.todo.delete({ where: { id } });

      const todos = await prisma.todo.findMany();
      const history = await prisma.history.findMany({
        orderBy: { timestamp: "asc" },
      });
      io.emit("update", { todos, history });
    });
  });

  server.listen(3000, () => console.log("http://localhost:3000"));
});
