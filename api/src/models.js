import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const AccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['bank', 'cash', 'credit', 'investment'], required: true },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

const CategorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  parentCategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  transferAccountId: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
  date: { type: Date, required: true },
  note: { type: String, default: '' },
}, { timestamps: true });
TransactionSchema.index({ userId: 1, date: -1 });

const BudgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
}, { timestamps: true });
BudgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

export const User = model('User', UserSchema);
export const Account = model('Account', AccountSchema);
export const Category = model('Category', CategorySchema);
export const Transaction = model('Transaction', TransactionSchema);
export const Budget = model('Budget', BudgetSchema);
