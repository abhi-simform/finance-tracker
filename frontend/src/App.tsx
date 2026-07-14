// FILE: frontend/src/App.tsx
import { useEffect, useState } from 'react';
import { api, getToken } from './api';

type Tab = 'dashboard' | 'accounts' | 'transactions' | 'categories' | 'budgets';

export default function App() {
  const [token, setToken] = useState<string | null>(getToken());
  if (!token) return <AuthScreen onAuth={(t) => setToken(t)} />;
  return <MainApp onLogout={() => { localStorage.removeItem('token'); setToken(null); }} />;
}

export function AuthScreen({ onAuth }: { onAuth: (t: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', data.token);
      onAuth(data.token);
    } catch (err: any) { setError(err.message); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-80 space-y-4">
        <h1 className="text-xl font-bold">Finance Tracker</h1>
        <input className="border rounded w-full p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border rounded w-full p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white rounded w-full p-2" type="submit">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
        <button type="button" className="text-sm text-blue-600 underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}

export function MainApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const tabs: Tab[] = ['dashboard', 'accounts', 'transactions', 'categories', 'budgets'];
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Finance Tracker</h1>
        <button onClick={onLogout} className="text-sm text-red-600 underline">Log out</button>
      </header>
      <nav className="flex gap-2 p-4 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{t}</button>
        ))}
      </nav>
      <main className="p-4 max-w-5xl mx-auto">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'accounts' && <Accounts />}
        {tab === 'transactions' && <Transactions />}
        {tab === 'categories' && <Categories />}
        {tab === 'budgets' && <Budgets />}
      </main>
    </div>
  );
}

export function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api(`/dashboard/summary?month=${month}`).then(setSummary).catch(() => {});
    api('/dashboard/trend?months=6').then(setTrend).catch(() => {});
  }, [month]);

  return (
    <div className="space-y-6">
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded p-2" />
      {!summary && <p className="text-gray-500" role="status">Loading dashboard…</p>}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Income" value={summary.income} color="text-green-600" />
          <Stat label="Expense" value={summary.expense} color="text-red-600" />
          <Stat label="Net Savings" value={summary.net} color={summary.net >= 0 ? 'text-green-600' : 'text-red-600'} />
        </div>
      )}
      {summary && summary.budgetVsActual?.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Budget vs Actual</h2>
          {summary.budgetVsActual.map((b: any) => {
            const pct = b.budget > 0 ? Math.min(100, (b.actual / b.budget) * 100) : 0;
            const over = b.actual > b.budget;
            return (
              <div key={b.categoryId} className="mb-2">
                <div className="flex justify-between text-sm"><span>{b.categoryName}</span><span className={over ? 'text-red-600 font-bold' : ''}>{b.actual} / {b.budget}</span></div>
                <div className="w-full bg-gray-200 rounded h-2"><div className={`h-2 rounded ${over ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}
      {summary && summary.budgetVsActual?.length === 0 && (
        <p className="text-gray-500 text-sm">No budgets set for this month yet.</p>
      )}
      {trend.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Income vs Expense (last 6 months)</h2>
          <div className="flex items-end gap-3 h-40">
            {trend.map((t) => {
              const max = Math.max(1, ...trend.map((x) => Math.max(x.income, x.expense)));
              return (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end h-32">
                    <div className="flex-1 bg-green-500 rounded" style={{ height: `${(t.income / max) * 100}%` }} title={`Income ${t.income}`} />
                    <div className="flex-1 bg-red-500 rounded" style={{ height: `${(t.expense / max) * 100}%` }} title={`Expense ${t.expense}`} />
                  </div>
                  <span className="text-xs">{t.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value?.toFixed ? value.toFixed(2) : value}</p>
    </div>
  );
}

export function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');

  const load = () => api('/accounts').then((a) => { setAccounts(a); setLoaded(true); }).catch(() => setLoaded(true));
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api('/accounts', { method: 'POST', body: JSON.stringify({ name, type }) });
    setName(''); load();
  }
  async function archive(id: string) { await api(`/accounts/${id}`, { method: 'DELETE' }); load(); }

  const active = accounts.filter((a) => !a.archivedAt);

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded shadow flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Account name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="border rounded p-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="bank">Bank</option><option value="cash">Cash</option><option value="credit">Credit</option><option value="investment">Investment</option>
        </select>
        <button className="bg-blue-600 text-white rounded px-4">Add</button>
      </form>
      {loaded && active.length === 0 && <p className="text-gray-500 text-sm">No accounts yet. Add your first account above.</p>}
      <div className="bg-white rounded shadow divide-y">
        {active.map((a) => (
          <div key={a._id} className="p-3 flex justify-between items-center">
            <span>{a.name} <span className="text-xs text-gray-500">({a.type})</span></span>
            <div className="flex items-center gap-3">
              <span className={a.balance >= 0 ? 'text-green-600' : 'text-red-600'}>{a.balance?.toFixed(2)}</span>
              <button onClick={() => archive(a._id)} className="text-xs text-red-600 underline">Archive</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const load = () => api('/categories').then((c) => { setCategories(c); setLoaded(true); }).catch(() => setLoaded(true));
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api('/categories', { method: 'POST', body: JSON.stringify({ name, type }) });
    setName(''); load();
  }
  async function del(id: string) { await api(`/categories/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded shadow flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="border rounded p-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option><option value="income">Income</option>
        </select>
        <button className="bg-blue-600 text-white rounded px-4">Add</button>
      </form>
      {loaded && categories.length === 0 && <p className="text-gray-500 text-sm">No categories yet.</p>}
      <div className="bg-white rounded shadow divide-y">
        {categories.map((c) => (
          <div key={c._id} className="p-3 flex justify-between items-center">
            <span>{c.name} <span className="text-xs text-gray-500">({c.type})</span></span>
            {!c.isDefault && <button onClick={() => del(c._id)} className="text-xs text-red-600 underline">Delete</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ type: 'expense', date: new Date().toISOString().slice(0, 10), amount: '', accountId: '', categoryId: '', note: '', transferAccountId: '' });
  const [filters, setFilters] = useState<any>({});
  const [error, setError] = useState('');

  const load = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    api(`/transactions${params ? `?${params}` : ''}`).then((t) => { setTxs(t); setLoaded(true); }).catch(() => setLoaded(true));
  };
  useEffect(() => { load(); }, [filters]);
  useEffect(() => { api('/accounts').then(setAccounts); api('/categories').then(setCategories); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/transactions', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setForm({ ...form, amount: '', note: '' }); load();
    } catch (err: any) { setError(err.message); }
  }
  async function del(id: string) { await api(`/transactions/${id}`, { method: 'DELETE' }); load(); }

  function exportCsv() {
    window.open(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api'}/export/transactions?format=csv&token=${getToken()}`, '_blank');
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-4 gap-2">
        <select className="border rounded p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option>
        </select>
        <input className="border rounded p-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input className="border rounded p-2" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <select className="border rounded p-2" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} required>
          <option value="">Account</option>{accounts.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        {form.type === 'transfer' ? (
          <select className="border rounded p-2" value={form.transferAccountId} onChange={(e) => setForm({ ...form, transferAccountId: e.target.value })} required>
            <option value="">To Account</option>{accounts.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        ) : (
          <select className="border rounded p-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Category</option>{categories.filter((c) => c.type === form.type).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
        <input className="border rounded p-2 col-span-2" placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button className="bg-blue-600 text-white rounded px-4">Add Transaction</button>
        {error && <p className="text-red-600 text-sm col-span-4">{error}</p>}
      </form>

      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-2">
        <input className="border rounded p-2" type="date" onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input className="border rounded p-2" type="date" onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <input className="border rounded p-2" placeholder="Search note" onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <button onClick={exportCsv} className="bg-gray-200 rounded px-3">Export CSV</button>
      </div>

      {loaded && txs.length === 0 && <p className="text-gray-500 text-sm">No transactions match the current filters.</p>}
      <div className="bg-white rounded shadow divide-y">
        {txs.map((t) => (
          <div key={t._id} className="p-3 flex justify-between items-center text-sm">
            <span>{t.date?.slice(0, 10)} — {t.accountId?.name} {t.type === 'transfer' && `→ ${t.transferAccountId?.name}`} {t.categoryId?.name ? `(${t.categoryId.name})` : ''} {t.note}</span>
            <div className="flex items-center gap-3">
              <span className={t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-gray-600'}>{t.amount.toFixed(2)}</span>
              <button onClick={() => del(t._id)} className="text-xs text-red-600 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Budgets() {
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const load = () => api(`/budgets?month=${month}`).then((b) => { setBudgets(b); setLoaded(true); }).catch(() => setLoaded(true));
  useEffect(() => { api('/categories').then((c) => setCategories(c.filter((x: any) => x.type === 'expense'))); }, []);
  useEffect(() => { load(); }, [month]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api('/budgets', { method: 'POST', body: JSON.stringify({ categoryId, month, amount: Number(amount) }) });
    setAmount(''); load();
  }

  return (
    <div className="space-y-4">
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded p-2" />
      <form onSubmit={add} className="bg-white p-4 rounded shadow flex gap-2">
        <select className="border rounded p-2 flex-1" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Category</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input className="border rounded p-2" type="number" step="0.01" placeholder="Monthly amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <button className="bg-blue-600 text-white rounded px-4">Set Budget</button>
      </form>
      {loaded && budgets.length === 0 && <p className="text-gray-500 text-sm">No budgets set for this month.</p>}
      <div className="bg-white rounded shadow divide-y">
        {budgets.map((b) => (
          <div key={b._id} className="p-3 flex justify-between"><span>{b.categoryId?.name}</span><span>{b.amount.toFixed(2)}</span></div>
        ))}
      </div>
    </div>
  );
}
