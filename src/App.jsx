import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'todo-app-items'

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all') // all | active | completed

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: Date.now().toString(), text: trimmed, completed: false }
    ])
    setText('')
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">
        Todo App
      </h1>

      <form onSubmit={addTodo} className="flex gap-2 mb-4" data-testid="todo-form">
        <input
          data-testid="todo-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          data-testid="add-btn"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add
        </button>
      </form>

      <div className="bg-white rounded-md shadow divide-y" data-testid="todo-list">
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-6" data-testid="empty-state">
            No tasks yet.
          </p>
        )}
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between px-4 py-3"
            data-testid="todo-item"
          >
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                data-testid="todo-checkbox"
              />
              <span
                className={
                  todo.completed
                    ? 'line-through text-slate-400'
                    : 'text-slate-800'
                }
              >
                {todo.text}
              </span>
            </label>
            <button
              onClick={() => deleteTodo(todo.id)}
              data-testid="delete-btn"
              className="text-red-500 hover:text-red-700 text-sm ml-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
        <span data-testid="remaining-count">{remaining} item(s) left</span>
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className={
                filter === f
                  ? 'font-semibold text-indigo-600'
                  : 'hover:text-indigo-500'
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={clearCompleted} data-testid="clear-completed-btn" className="hover:text-indigo-500">
          Clear completed
        </button>
      </div>
    </div>
  )
}
