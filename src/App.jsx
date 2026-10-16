import React, { useEffect, useMemo, useState } from 'react';

const DEMO_EMAIL = 'student@example.com';
const DEMO_PASSWORD = 'password123';
const STORAGE_KEY = 'daymark-todos';
const FILTERS = ['All', 'Active', 'Completed'];

function readTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('That email and password do not match. Try the demo details below.');
      return;
    }
    setError('');
    onLogin(email.trim());
  }

  return (
    <main className="login-layout">
      <section className="login-card" aria-labelledby="login-title">
        <a className="wordmark" href="#home" aria-label="Daymark home">
          <span className="brand-icon" aria-hidden="true">✓</span> daymark
        </a>
        <div className="login-copy">
          <p className="eyebrow">A little more focus</p>
          <h1 id="login-title">Welcome back.</h1>
          <p className="muted">Sign in to pick up where you left off.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-button" type="submit">Sign in <span aria-hidden="true">→</span></button>
        </form>
        <div className="demo-note">
          <span className="demo-dot" aria-hidden="true" />
          <span><strong>Demo access</strong><br />student@example.com · password123</span>
        </div>
        <p className="login-footer">Simple plans. Clear mind.</p>
      </section>
      <aside className="login-art" aria-label="A calm, sunlit workspace">
        <div className="art-orb" />
        <div className="art-window"><span /><span /><span /></div>
        <div className="art-plant"><i /><i /><i /><b /></div>
        <div className="art-desk" />
        <div className="art-caption"><span>01 — MAKE ROOM</span><p>Small steps add up<br />to meaningful days.</p></div>
        <div className="art-sun" />
      </aside>
    </main>
  );
}

function TodoPage({ user, onLogout }) {
  const [todos, setTodos] = useState(readTodos);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remaining = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = useMemo(() => todos.filter((todo) => {
    if (filter === 'Active') return !todo.completed;
    if (filter === 'Completed') return todo.completed;
    return true;
  }), [todos, filter]);

  function addTodo(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTodos((current) => [{ id: crypto.randomUUID(), title, completed: false }, ...current]);
    setDraft('');
  }

  function toggleTodo(id) {
    setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  }

  function deleteTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function startEditing(todo) {
    setEditingId(todo.id);
    setEditDraft(todo.title);
  }

  function saveEdit(event) {
    event.preventDefault();
    const title = editDraft.trim();
    if (!title) return;
    setTodos((current) => current.map((todo) => todo.id === editingId ? { ...todo, title } : todo));
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft('');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Daymark home"><span className="brand-icon" aria-hidden="true">✓</span> daymark</a>
        <div className="topbar-right"><span className="user-label">{user}</span><button className="button button-quiet" onClick={onLogout}>Log out <span aria-hidden="true">↗</span></button></div>
      </header>

      <section className="todo-content" aria-labelledby="todo-title">
        <div className="todo-heading">
          <div><p className="eyebrow">YOUR SPACE · TODAY</p><h1 id="todo-title">A clear day<br /><span>starts here.</span></h1></div>
          <div className="heading-mark" aria-hidden="true"><span>✳</span><small>TAKE IT<br />ONE THING<br />AT A TIME</small></div>
        </div>

        <form className="add-form" onSubmit={addTodo}>
          <span className="add-plus" aria-hidden="true">+</span>
          <label className="visually-hidden" htmlFor="new-todo">Add a task</label>
          <input id="new-todo" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What needs your attention?" maxLength={160} />
          <button className="button button-primary add-button" type="submit">Add task <span aria-hidden="true">↗</span></button>
        </form>

        <div className="list-toolbar">
          <p className="remaining"><strong>{remaining}</strong> {remaining === 1 ? 'thing' : 'things'} left to do</p>
          <div className="filter-tabs" role="group" aria-label="Filter tasks">
            {FILTERS.map((option) => <button key={option} className={`filter-tab ${filter === option ? 'selected' : ''}`} onClick={() => setFilter(option)} aria-pressed={filter === option}>{option}</button>)}
          </div>
        </div>

        <div className="todo-list" aria-live="polite">
          {visibleTodos.length > 0 ? visibleTodos.map((todo, index) => (
            <article className={`todo-row ${todo.completed ? 'is-completed' : ''}`} key={todo.id}>
              <button className="check-button" onClick={() => toggleTodo(todo.id)} aria-label={todo.completed ? `Mark ${todo.title} active` : `Complete ${todo.title}`} aria-pressed={todo.completed}>{todo.completed && <span aria-hidden="true">✓</span>}</button>
              <span className="todo-index">{String(index + 1).padStart(2, '0')}</span>
              {editingId === todo.id ? (
                <form className="edit-form" onSubmit={saveEdit}>
                  <label className="visually-hidden" htmlFor={`edit-${todo.id}`}>Edit task</label>
                  <input id={`edit-${todo.id}`} autoFocus maxLength={160} value={editDraft} onChange={(event) => setEditDraft(event.target.value)} />
                  <button className="edit-action save-edit" type="submit" disabled={!editDraft.trim()}>Save</button>
                  <button className="edit-action" type="button" onClick={cancelEdit}>Cancel</button>
                </form>
              ) : (
                <span className="todo-title">{todo.title}</span>
              )}
              {editingId !== todo.id && <button className="edit-button" onClick={() => startEditing(todo)} aria-label={`Edit ${todo.title}`} title="Edit task">✎</button>}
              <button className="delete-button" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`} title="Delete task">×</button>
            </article>
          )) : (
            <div className="empty-state"><span className="empty-spark" aria-hidden="true">✳</span><p className="empty-title">{filter === 'Completed' ? 'Nothing completed yet.' : filter === 'Active' ? 'You’re all caught up.' : 'A little space to begin.'}</p><p>{filter === 'All' ? 'Add a task above and make today yours.' : 'Your tasks will show up here.'}</p></div>
          )}
        </div>
        <footer className="list-footer"><span>DAYMARK · MAKE SPACE FOR WHAT MATTERS</span><span>{todos.length} {todos.length === 1 ? 'TASK' : 'TASKS'}</span></footer>
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('daymark-user'));

  function handleLogin(email) {
    localStorage.setItem('daymark-user', email);
    setUser(email);
  }

  function handleLogout() {
    localStorage.removeItem('daymark-user');
    setUser(null);
  }

  return user ? <TodoPage user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />;
}
