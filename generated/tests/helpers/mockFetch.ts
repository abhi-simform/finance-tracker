// In-memory fake backend used to mock `fetch` in frontend tests, mirroring
// the real Express + MongoDB Todo API contract: GET/POST /, PUT/DELETE /:id,
// POST /clear-completed.
type FakeTodo = { id: string; text: string; completed: boolean; createdAt: string };

let todos: FakeTodo[] = [];
let idSeq = 1;

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  } as Response);
}

export function resetMockFetch() {
  todos = [];
  idSeq = 1;
}

export function installMockFetch() {
  resetMockFetch();
  global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = (init?.method || 'GET').toUpperCase();

    if (method === 'GET' && /\/api\/todos$/.test(url)) {
      return jsonResponse(todos);
    }

    if (method === 'POST' && /\/api\/todos\/clear-completed$/.test(url)) {
      todos = todos.filter((t) => !t.completed);
      return jsonResponse(todos, 200);
    }

    if (method === 'POST' && /\/api\/todos$/.test(url)) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const text = (body.text || '').trim();
      if (!text) return jsonResponse({ error: 'Text is required' }, 400);
      const todo: FakeTodo = {
        id: String(idSeq++),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.push(todo);
      return jsonResponse(todo, 201);
    }

    const idMatch = url.match(/\/api\/todos\/([^/]+)$/);

    if (method === 'PUT' && idMatch) {
      const todo = todos.find((t) => t.id === idMatch[1]);
      if (!todo) return jsonResponse({ error: 'Todo not found' }, 404);
      const body = init?.body ? JSON.parse(init.body as string) : {};
      Object.assign(todo, body);
      return jsonResponse(todo, 200);
    }

    if (method === 'DELETE' && idMatch) {
      const before = todos.length;
      todos = todos.filter((t) => t.id !== idMatch[1]);
      if (todos.length === before) return jsonResponse({ error: 'Todo not found' }, 404);
      return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) } as Response);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  }) as unknown as typeof fetch;
}
