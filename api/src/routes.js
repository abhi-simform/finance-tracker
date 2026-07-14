import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from './middleware.js';
import { ensureConnected } from './db.js';
import { User, Account, Category, Transaction, Budget } from './models.js';

const router = Router();
router.use(ensureConnected);

const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income' },
  { name: 'Other Income', type: 'income' },
  { name: 'Food', type: 'expense' },
  { name: 'Rent', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Healthcare', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Other Expense', type: 'expense' },
];

const sign = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) return res.status(400).json({ error: 'Email and password (min 6 chars) required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10) });
    await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user._id, isDefault: true })));
    res.status(201).json({ token: sign(user._id), user: { id: user._id, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(user._id), user: { id: user._id, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('email createdAt');
  res.json({ user });
});

router.get('/accounts', auth, async (req, res) => {
  const accounts = await Account.find({ userId: req.userId }).sort({ createdAt: 1 });
  const results = [];
  for (const acc of accounts) {
    const txs = await Transaction.find({ userId: req.userId, $or: [{ accountId: acc._id }, { transferAccountId: acc._id }] });
    let balance = 0;
    for (const t of txs) {
      const isSource = String(t.accountId) === String(acc._id);
      if (t.type === 'income' && isSource) balance += t.amount;
      else if (t.type === 'expense' && isSource) balance -= t.amount;
      else if (t.type === 'transfer') {
        if (isSource) balance -= t.amount;
        if (String(t.transferAccountId) === String(acc._id)) balance += t.amount;
      }
    }
    results.push({ ...acc.toObject(), balance });
  }
  res.json(results);
});

router.post('/accounts', auth, async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type required' });
  res.status(201).json(await Account.create({ userId: req.userId, name, type }));
});

router.put('/accounts/:id', auth, async (req, res) => {
  const account = await Account.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  if (!account) return res.status(404).json({ error: 'Not found' });
  res.json(account);
});

router.delete('/accounts/:id', auth, async (req, res) => {
  const account = await Account.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { archivedAt: new Date() }, { new: true });
  if (!account) return res.status(404).json({ error: 'Not found' });
  res.json(account);
});

router.get('/categories', auth, async (req, res) => res.json(await Category.find({ userId: req.userId }).sort({ name: 1 })));

router.post('/categories', auth, async (req, res) => {
  const { name, type, parentCategoryId } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type required' });
  res.status(201).json(await Category.create({ userId: req.userId, name, type, parentCategoryId: parentCategoryId || null }));
});

router.delete('/categories/:id', auth, async (req, res) => {
  await Category.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

router.get('/transactions', auth, async (req, res) => {
  const { from, to, accountId, categoryId, minAmount, maxAmount, q } = req.query;
  const filter = { userId: req.userId };
  if (from || to) filter.date = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };
  if (accountId) filter.accountId = accountId;
  if (categoryId) filter.categoryId = categoryId;
  if (minAmount || maxAmount) filter.amount = { ...(minAmount ? { $gte: Number(minAmount) } : {}), ...(maxAmount ? { $lte: Number(maxAmount) } : {}) };
  if (q) filter.note = { $regex: q, $options: 'i' };
  res.json(await Transaction.find(filter).sort({ date: -1 }).populate('accountId categoryId transferAccountId'));
});

router.post('/transactions', auth, async (req, res) => {
  const { accountId, categoryId, amount, type, transferAccountId, date, note } = req.body;
  if (!accountId || !amount || !type || !date) return res.status(400).json({ error: 'Missing required fields' });
  if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
  if (type === 'transfer' && !transferAccountId) return res.status(400).json({ error: 'transferAccountId required for transfers' });
  if (new Date(date) > new Date()) return res.status(400).json({ error: 'Date cannot be in the future' });
  res.status(201).json(await Transaction.create({ userId: req.userId, accountId, categoryId: categoryId || null, amount, type, transferAccountId: transferAccountId || null, date, note }));
});

router.put('/transactions/:id', auth, async (req, res) => {
  const tx = await Transaction.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  if (!tx) return res.status(404).json({ error: 'Not found' });
  res.json(tx);
});

router.delete('/transactions/:id', auth, async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

router.post('/transactions/import', auth, async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const errors = [];
  const docs = [];
  rows.forEach((r, i) => {
    if (!r.date || !r.amount || !r.type || !r.accountId) { errors.push({ row: i, error: 'missing fields' }); return; }
    docs.push({ userId: req.userId, accountId: r.accountId, categoryId: r.categoryId || null, amount: Number(r.amount), type: r.type, transferAccountId: r.transferAccountId || null, date: new Date(r.date), note: r.note || '' });
  });
  const inserted = docs.length ? await Transaction.insertMany(docs) : [];
  res.json({ inserted: inserted.length, errors });
});

router.get('/budgets', auth, async (req, res) => {
  const filter = { userId: req.userId };
  if (req.query.month) filter.month = req.query.month;
  res.json(await Budget.find(filter).populate('categoryId'));
});

router.post('/budgets', auth, async (req, res) => {
  const { categoryId, month, amount } = req.body;
  if (!categoryId || !month || amount == null) return res.status(400).json({ error: 'Missing fields' });
  res.status(201).json(await Budget.findOneAndUpdate({ userId: req.userId, categoryId, month }, { amount }, { upsert: true, new: true }));
});

router.delete('/budgets/:id', auth, async (req, res) => {
  await Budget.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

router.get('/dashboard/summary', auth, async (req, res) => {
  const m = req.query.month || new Date().toISOString().slice(0, 7);
  const start = new Date(`${m}-01T00:00:00.000Z`);
  const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1);
  const txs = await Transaction.find({ userId: req.userId, date: { $gte: start, $lt: end } });
  let income = 0, expense = 0;
  const byCategory = {};
  for (const t of txs) {
    if (t.type === 'income') income += t.amount;
    if (t.type === 'expense') { expense += t.amount; const key = t.categoryId ? String(t.categoryId) : 'uncategorized'; byCategory[key] = (byCategory[key] || 0) + t.amount; }
  }
  const budgets = await Budget.find({ userId: req.userId, month: m }).populate('categoryId');
  const budgetVsActual = budgets.map((b) => ({ categoryId: b.categoryId?._id, categoryName: b.categoryId?.name, budget: b.amount, actual: byCategory[String(b.categoryId?._id)] || 0 }));
  res.json({ month: m, income, expense, net: income - expense, spendingByCategory: byCategory, budgetVsActual });
});

router.get('/dashboard/trend', auth, async (req, res) => {
  const months = Number(req.query.months || 6);
  const now = new Date();
  const results = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const m = d.toISOString().slice(0, 7);
    const start = new Date(`${m}-01T00:00:00.000Z`);
    const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1);
    const txs = await Transaction.find({ userId: req.userId, date: { $gte: start, $lt: end }, type: { $in: ['income', 'expense'] } });
    let income = 0, expense = 0;
    for (const t of txs) { if (t.type === 'income') income += t.amount; else expense += t.amount; }
    results.push({ month: m, income, expense });
  }
  res.json(results);
});

router.get('/export/transactions', auth, async (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  const txs = await Transaction.find({ userId: req.userId }).populate('accountId categoryId transferAccountId').sort({ date: -1 });
  if (format === 'json') return res.json(txs);
  const header = 'date,amount,type,account,category,transferAccount,note\n';
  const rows = txs.map((t) => [t.date.toISOString().slice(0, 10), t.amount, t.type, t.accountId?.name || '', t.categoryId?.name || '', t.transferAccountId?.name || '', (t.note || '').replace(/,/g, ';')].join(','));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send(header + rows.join('\n'));
});

export default router;
