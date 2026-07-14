// FILE: frontend/src/__tests__/pages.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthScreen, Dashboard, Accounts, Categories, Transactions, Budgets } from '../App';

vi.mock('../api', () => ({ api: vi.fn(), getToken: vi.fn(() => null) }));
import { api } from '../api';
const mockedApi = api as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => { mockedApi.mockReset(); });

describe('AuthScreen', () => {
  it('renders the login form by default', () => {
    render(<AuthScreen onAuth={() => {}} />);
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
});

describe('Dashboard', () => {
  it('shows a loading state before data arrives', () => {
    mockedApi.mockReturnValue(new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  });

  it('renders income/expense stats once loaded', async () => {
    mockedApi.mockImplementation((path: string) =>
      path.includes('summary')
        ? Promise.resolve({ income: 100, expense: 40, net: 60, budgetVsActual: [] })
        : Promise.resolve([]));
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Income')).toBeInTheDocument());
    expect(screen.getByText('60.00')).toBeInTheDocument();
  });
});

describe('Accounts', () => {
  it('shows an empty state when there are no accounts', async () => {
    mockedApi.mockResolvedValue([]);
    render(<Accounts />);
    await waitFor(() => expect(screen.getByText(/no accounts yet/i)).toBeInTheDocument());
  });

  it('lists active accounts with their balance', async () => {
    mockedApi.mockResolvedValue([{ _id: '1', name: 'Checking', type: 'bank', balance: 25, archivedAt: null }]);
    render(<Accounts />);
    await waitFor(() => expect(screen.getByText('Checking')).toBeInTheDocument());
  });
});

describe('Categories', () => {
  it('shows an empty state when there are no categories', async () => {
    mockedApi.mockResolvedValue([]);
    render(<Categories />);
    await waitFor(() => expect(screen.getByText(/no categories yet/i)).toBeInTheDocument());
  });
});

describe('Transactions', () => {
  it('shows an empty state when there are no transactions', async () => {
    mockedApi.mockResolvedValue([]);
    render(<Transactions />);
    await waitFor(() => expect(screen.getByText(/no transactions match/i)).toBeInTheDocument());
  });
});

describe('Budgets', () => {
  it('shows an empty state when no budgets are set for the month', async () => {
    mockedApi.mockResolvedValue([]);
    render(<Budgets />);
    await waitFor(() => expect(screen.getByText(/no budgets set/i)).toBeInTheDocument());
  });
});
