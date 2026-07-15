import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import { installMockFetch } from '../helpers/mockFetch';

function renderApp() {
  return render(<App />);
}

describe('Todo App (page-level integration)', () => {
  beforeEach(() => {
    installMockFetch();
  });

  // Story: US-004, AC: 1
  it('shows the empty state when there are no todos', async () => {
    renderApp();
    expect(await screen.findByTestId('empty-state')).toHaveTextContent('No tasks yet.');
  });

  // Story: US-001, AC: 1
  it('adds a new todo when the form is submitted with valid text', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), 'Buy groceries');
    await user.click(screen.getByTestId('add-btn'));

    const items = await screen.findAllByTestId('todo-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByTestId('todo-input')).toHaveValue('');
  });

  // Story: US-001, AC: 2
  it('does not add a todo when the input is empty or whitespace', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), '   ');
    await user.click(screen.getByTestId('add-btn'));
    expect(screen.queryAllByTestId('todo-item')).toHaveLength(0);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  // Story: US-002, AC: 1
  it('toggles a todo to completed when its checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), 'Write report');
    await user.click(screen.getByTestId('add-btn'));

    const checkbox = await screen.findByTestId('todo-checkbox');
    await user.click(checkbox);

    expect(await screen.findByText('Write report')).toHaveClass('line-through');
    expect(screen.getByTestId('todo-checkbox')).toBeChecked();
    expect(screen.getByTestId('remaining-count')).toHaveTextContent('0 item(s) left');
  });

  // Story: US-003, AC: 1
  it('deletes a todo when the delete button is clicked', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), 'Temporary task');
    await user.click(screen.getByTestId('add-btn'));
    expect(await screen.findAllByTestId('todo-item')).toHaveLength(1);

    await user.click(screen.getByTestId('delete-btn'));

    await screen.findByTestId('empty-state');
    expect(screen.queryAllByTestId('todo-item')).toHaveLength(0);
  });

  // Story: US-004, AC: 2
  it('filters todos by active and completed', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), 'Task A');
    await user.click(screen.getByTestId('add-btn'));
    await screen.findByText('Task A');
    await user.type(screen.getByTestId('todo-input'), 'Task B');
    await user.click(screen.getByTestId('add-btn'));
    await screen.findByText('Task B');

    const checkboxes = screen.getAllByTestId('todo-checkbox');
    await user.click(checkboxes[0]); // complete Task A
    await screen.findByText('Task A');

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
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), 'Keep me');
    await user.click(screen.getByTestId('add-btn'));
    await screen.findByText('Keep me');
    await user.type(screen.getByTestId('todo-input'), 'Remove me');
    await user.click(screen.getByTestId('add-btn'));
    await screen.findByText('Remove me');

    const checkboxes = screen.getAllByTestId('todo-checkbox');
    await user.click(checkboxes[1]); // complete "Remove me"

    await user.click(screen.getByTestId('clear-completed-btn'));

    const items = await screen.findAllByTestId('todo-item');
    expect(items).toHaveLength(1);
    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  // Story: US-001, AC: 3
  it('persists todos via the backend API so they survive a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp();
    await screen.findByTestId('empty-state');
    await user.type(screen.getByTestId('todo-input'), 'Persisted task');
    await user.click(screen.getByTestId('add-btn'));
    await screen.findByText('Persisted task');
    unmount();

    renderApp();
    expect(await screen.findByText('Persisted task')).toBeInTheDocument();
  });
});
