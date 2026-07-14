// FILE: frontend/src/types.ts
/**
 * Shared TypeScript data-model types for the Finance Tracker MVP.
 * These mirror the shape of documents returned by the Express/Mongoose API
 * (api/src/models.js) after JSON serialization (Mongo ObjectIds and Dates
 * become strings on the wire).
 */

/** Type of financial account a user can hold. */
export type AccountType = 'bank' | 'cash' | 'credit' | 'investment';

/** Whether a category is used for money coming in or going out. */
export type CategoryType = 'income' | 'expense';

/** Kind of ledger entry recorded against an account. */
export type TransactionType = 'income' | 'expense' | 'transfer';

/** A registered application user. */
export interface User {
  /** Mongo document id */
  _id: string;
  /** Unique, lowercased email address used for login */
  email: string;
  /** ISO timestamp the user was created */
  createdAt: string;
  /** ISO timestamp the user was last updated */
  updatedAt: string;
}

/** Payload to register a new user. */
export interface RegisterUserDto {
  email: string;
  /** Plain-text password, min 6 chars (hashed server-side) */
  password: string;
}

/** Payload to authenticate an existing user. */
export interface LoginUserDto {
  email: string;
  password: string;
}

/** Response returned by /auth/register and /auth/login. */
export interface AuthResponse {
  /** Signed JWT to send as a Bearer token */
  token: string;
  user: Pick<User, '_id' | 'email'>;
}

/** A bank/cash/credit/investment account belonging to a user. */
export interface Account {
  _id: string;
  /** Owning user's id */
  userId: string;
  name: string;
  type: AccountType;
  /** Set when the account has been archived (soft delete); null if active */
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Computed running balance, present only on GET /accounts list responses */
  balance?: number;
}

/** Payload to create a new account. */
export interface CreateAccountDto {
  name: string;
  type: AccountType;
}

/** Payload to update/archive an existing account. */
export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  archivedAt?: string | null;
}

/** A spending/income category, optionally nested under a parent. */
export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: CategoryType;
  /** Parent category id for sub-categories, or null for top-level */
  parentCategoryId: string | null;
  /** True for the seeded default categories created at registration */
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload to create a new category. */
export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  parentCategoryId?: string | null;
}

/** Payload to update an existing category. */
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

/** A single ledger entry: income, expense, or transfer between accounts. */
export interface Transaction {
  _id: string;
  userId: string;
  /** Source account id */
  accountId: string;
  /** Category id, or null for uncategorized/transfers */
  categoryId: string | null;
  /** Always a positive amount; direction is determined by `type` */
  amount: number;
  type: TransactionType;
  /** Destination account id, required when type === 'transfer' */
  transferAccountId: string | null;
  /** ISO date the transaction occurred (cannot be in the future) */
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/** Populated variant returned by list/detail endpoints (relations expanded). */
export interface TransactionWithRelations
  extends Omit<Transaction, 'accountId' | 'categoryId' | 'transferAccountId'> {
  accountId: Pick<Account, '_id' | 'name'> | null;
  categoryId: Pick<Category, '_id' | 'name'> | null;
  transferAccountId: Pick<Account, '_id' | 'name'> | null;
}

/** Payload to create a new transaction. */
export interface CreateTransactionDto {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  type: TransactionType;
  transferAccountId?: string | null;
  date: string;
  note?: string;
}

/** Payload to update an existing transaction. */
export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

/** Row shape accepted by the bulk CSV/JSON transaction importer. */
export interface ImportTransactionRow {
  date: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId?: string | null;
  transferAccountId?: string | null;
  note?: string;
}

/** Result of a bulk import operation. */
export interface ImportResult {
  inserted: number;
  errors: Array<{ row: number; error: string }>;
}

/** A monthly spending limit set for a single expense category. */
export interface Budget {
  _id: string;
  userId: string;
  categoryId: string;
  /** Month the budget applies to, formatted YYYY-MM */
  month: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

/** Populated variant returned by GET /budgets (categoryId expanded). */
export interface BudgetWithRelations extends Omit<Budget, 'categoryId'> {
  categoryId: Pick<Category, '_id' | 'name'> | null;
}

/** Payload to create or upsert a budget for a category/month. */
export interface CreateBudgetDto {
  categoryId: string;
  month: string;
  amount: number;
}

/** Payload to update an existing budget. */
export interface UpdateBudgetDto extends Partial<CreateBudgetDto> {}

/** One category's contribution to a budget-vs-actual comparison. */
export interface BudgetVsActual {
  categoryId: string;
  categoryName: string;
  budget: number;
  actual: number;
}

/** Response of GET /dashboard/summary for a given month. */
export interface DashboardSummary {
  month: string;
  income: number;
  expense: number;
  net: number;
  spendingByCategory: Record<string, number>;
  budgetVsActual: BudgetVsActual[];
}

/** One point in the GET /dashboard/trend income/expense series. */
export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

/** Generic API error shape returned by the Express error handlers. */
export interface ApiError {
  error: string;
}
