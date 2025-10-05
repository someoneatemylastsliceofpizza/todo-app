"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";

const socket = io();

type Todo = {
  id: string;
  name: string;
  note: string;
  important: number;
  timestamp: number;
};

type HistoryItem = {
  action: string;
  todo: Todo;
  timestamp: number;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [important, setImportant] = useState(5);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    socket.on("init", (data) => {
      setTodos(data.todos);
      setHistory(data.history);
    });
    socket.on("update", (data) => {
      setTodos(data.todos);
      setHistory(data.history);
    });

    socket.emit("firstupdate");

    return () => {
      socket.off("init");
      socket.off("update");
    };
  }, []);

  const addTodo = () => {
    if (!name) return;
    socket.emit("add", {
      id: uuid(),
      name,
      note,
      important,
      timestamp: Date.now(),
    });
    setName("");
    setNote("");
    setImportant(5);
  };

  const startEdit = (todo: Todo) => setEditingTodo(todo);

  const saveEdit = () => {
    if (!editingTodo) return;
    socket.emit("edit", editingTodo);
    setEditingTodo(null);
  };

  const deleteTodo = (id: string) => {
    socket.emit("delete", id);
  };

  // setInterval(() => {
  //   socket.emit("firstupdate");
  // }, 4000);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "1rem",
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#f0f0f0",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        {/* Todo Section */}
        <div
          style={{
            background: "#00000070",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
            width: "100%",
            maxWidth: "700px",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(50px)",
            flexGrow: 1,
          }}
        >
          <div style={{ overflowY: "auto", flex: 1, marginBottom: "1rem" }}>
            {todos
              .sort(
                (a, b) => b.important - a.important || b.timestamp - a.timestamp
              )
              .map((t) => (
                <div
                  key={t.id}
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem 0",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flexDirection: "column", display: "flex" }}>
                      <div style={{ flexDirection: "row", display: "flex", gap: "1rem" }}>
                        <strong>{t.name}</strong>
                        <div style={{color: "#ccc"}}>{t.note}</div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                        {new Date(t.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => startEdit(t)}
                        style={{
                          background: "#333",
                          color: "#f0f0f0",
                          border: "none",
                          borderRadius: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#555")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "#333")
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(t.id)}
                        style={{
                          background: "#b00020",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#e53935")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "#b00020")
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {todos.length === 0 && <div style={{ justifyItems:"center"}}><div>No todos yet.</div></div>}
          </div>

          {/* Add/Edit Input Section */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <input
              placeholder="Name"
              value={editingTodo ? editingTodo.name : name}
              onChange={(e) =>
                editingTodo
                  ? setEditingTodo({ ...editingTodo, name: e.target.value })
                  : setName(e.target.value)
              }
              style={{
                flex: "1 1 50%",
                width: "50%",    
                paddingInline: "10px",
                paddingBlock: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #333",
                background: "#2a2a2a",
                color: "#f0f0f0",
              }}
            />
            <input
              placeholder="Note"
              id="note"
              value={editingTodo ? editingTodo.note : note}
              onChange={(e) =>
                editingTodo
                  ? setEditingTodo({ ...editingTodo, note: e.target.value })
                  : setNote(e.target.value)
              }
              style={{
                flex: "1 1 20%",
                width: "100px",
                paddingInline: "10px",
                paddingBlock: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #333",
                background: "#2a2a2a",
                color: "#f0f0f0",
              }}
            />
            <input
              type="number"
              placeholder="Important"
              id="important"
              value={editingTodo ? editingTodo.important : important}
              onChange={(e) =>
                editingTodo
                  ? setEditingTodo({
                      ...editingTodo,
                      important: parseFloat(e.target.value),
                    })
                  : setImportant(parseFloat(e.target.value))
              }
              style={{
                flex: "1 1 10%",
                width: "50px",
                maxWidth: "50px",
                paddingInline: "5px",
                paddingBlock: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #333",
                background: "#2a2a2a",
                color: "#f0f0f0",
              }}
            />
            <button
              onClick={editingTodo ? saveEdit : addTodo}
              style={{
                flex: "1 1 10%",
                width: "10%",
                paddingBlock: "0.5rem",
                background: editingTodo ? "#ffa000" : "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = editingTodo
                  ? "#ffc107"
                  : "#66bb6a")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = editingTodo
                  ? "#ffa000"
                  : "#4caf50")
              }
            >
              {editingTodo ? "Save" : "Add"}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div style={{ width: "100%", maxWidth: "300px", background: "#00000070", backdropFilter: "blur(50px)", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 5px 15px rgba(0,0,0,0.5)" }}>
          <h2>History (Last 10)</h2>
          <ul>
            {history
              .slice(-10)
              .reverse()
              .map((h, i) => (
                <li key={i} style={{ marginBottom: "0.25rem" }}>
                  <span style={{ color: "#aaa" }}>
                    [{new Date(h.timestamp).toLocaleTimeString()}]
                  </span>{" "}
                  {h.action}: {h.todo.name} {h.todo.note ? "(" : ""}{h.todo.note}{h.todo.note ? ")" : ""}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
