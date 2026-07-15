import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';

const STORAGE_KEY = 'todo-app-items';

function renderApp() {
  return render(<App />);
}

describe('Todo App (page-level integration)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Story: US-004, AC: 1
  it('shows the empty state when there are no todos', () => {
    renderApp();
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No tasks yet.');
  });

  // Story: US-001, AC: 1
  it('adds a new todo when the form is submitted with valid text', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), 'Buy groceries');
    await user.click(screen.getByTestId('add-btn'));

    const items = screen.getAllByTestId('todo-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByTestId('todo-input')).toHaveValue('');
  });

  // Story: US-001, AC: 2
  it('does not add a todo when the input is empty or whitespace', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), '   ');
    await user.click(screen.getByTestId('add-btn'));
    expect(screen.queryAllByTestId('todo-item')).toHaveLength(0);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  // Story: US-002, AC: 1
  it('toggles a todo to completed when its checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), 'Write report');
    await user.click(screen.getByTestId('add-btn'));

    const checkbox = screen.getByTestId('todo-checkbox');
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText('Write report')).toHaveClass('line-through');
    expect(screen.getByTestId('remaining-count')).toHaveTextContent('0 item(s) left');
  });

  // Story: US-003, AC: 1
  it('deletes a todo when the delete button is clicked', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), 'Temporary task');
    await user.click(screen.getByTestId('add-btn'));
    expect(screen.getAllByTestId('todo-item')).toHaveLength(1);

    await user.click(screen.getByTestId('delete-btn'));

    expect(screen.queryAllByTestId('todo-item')).toHaveLength(0);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  // Story: US-004, AC: 2
  it('filters todos by active and completed', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), 'Task A');
    await user.click(screen.getByTestId('add-btn'));
    await user.type(screen.getByTestId('todo-input'), 'Task B');
    await user.click(screen.getByTestId('add-btn'));

    const checkboxes = screen.getAllByTestId('todo-checkbox');
    await user.click(checkboxes[0]); // complete Task A

    await user.click(screen.getByTestId('filter-active'));
    expect(screen.getAllByTestId('todo-item')).toHaveLength(1);
    expect(screen.getByText('Task B')).toBeInTheDocument();

    await user.click(screen.getByTestId('filter-completed'));
    expect(screen.getAllByTestId('todo-item')).toHaveLength(1);
    expect(screen.getByText('Task A')).toBeInTheDocument();

    await user.click(screen.getByTestId('filter-all'));
    expect(screen.getAllByTestId('todo-item')).toHaveLength(2);
  });

  // Story: US-005, AC: 1
  it('removes only completed todos when "Clear completed" is clicked', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), 'Keep me');
    await user.click(screen.getByTestId('add-btn'));
    await user.type(screen.getByTestId('todo-input'), 'Remove me');
    await user.click(screen.getByTestId('add-btn'));

    const checkboxes = screen.getAllByTestId('todo-checkbox');
    await user.click(checkboxes[1]); // complete "Remove me"

    await user.click(screen.getByTestId('clear-completed-btn'));

    const items = screen.getAllByTestId('todo-item');
    expect(items).toHaveLength(1);
    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  // Story: US-001, AC: 3
  it('persists todos to localStorage', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByTestId('todo-input'), 'Persisted task');
    await user.click(screen.getByTestId('add-btn'));

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe('Persisted task');
  });
});
