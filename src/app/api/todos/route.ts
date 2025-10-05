import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

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
  todoId: String;
  timestamp: number;
};

// in-memory DB
let todos: Todo[] = [];
let history: HistoryItem[] = [];

export async function GET() {
  return NextResponse.json({ todos, history });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const todo: Todo = {
    id: uuid(),
    name: data.name,
    note: data.note,
    important: data.important || 0,
    timestamp: Date.now(),
  };
  todos.push(todo);
  history.push({
    action: "Added",
    todo,
    todoId: todo.id,
    timestamp: Date.now(),
  });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const idx = todos.findIndex((t) => t.id === data.id);
  if (idx >= 0) {
    todos[idx] = {
      ...todos[idx],
      name: data.name ?? todos[idx].name,
      note: data.note ?? todos[idx].note,
      important: data.important ?? todos[idx].important,
      timestamp: Date.now(),
    };
    history.push({ action: "Edited", todo: todos[idx], todoId: todos[idx].id, timestamp: Date.now() });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const idx = todos.findIndex((t) => t.id === data.id);
  if (idx >= 0) {
    const [removed] = todos.splice(idx, 1);
    history.push({ action: "Deleted", todo: removed, todoId: removed.id ,timestamp: Date.now() });
  }
  return NextResponse.json({ success: true });
}
