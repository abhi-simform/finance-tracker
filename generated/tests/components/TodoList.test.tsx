import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';

// NOTE: src/App.jsx currently renders the todo list inline (no extracted
// <TodoItem>/<TodoList> component yet). These tests exercise that rendered
// list markup in isolation from full page flows (see pages/App.test.tsx).

describe('Todo list rendering (component-level)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  async function addTodo(text: string) {
    const user = userEvent.setup();
    await user.type(screen.getByTestId('todo-input'), text);
    await user.click(screen.getByTestId('add-btn'));
    return user;
  }

  // Story: US-002, AC: 3
  it('renders a checkbox and delete button for each todo item', async () => {
    render(<App />);
    await addTodo('Item 1');
    const item = screen.getByTestId('todo-item');
    expect(item).toBeInTheDocument();
    expect(screen.getByTestId('todo-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
  });

  // Story: US-002, AC: 4
  it('applies strikethrough styling only to completed items', async () => {
    render(<App />);
    const user = await addTodo('Style me');
    const checkbox = screen.getByTestId('todo-checkbox');
    expect(screen.getByText('Style me')).not.toHaveClass('line-through');
    await user.click(checkbox);
    expect(screen.getByText('Style me')).toHaveClass('line-through');
  });

  // Story: US-004, AC: 3
  it('renders multiple todo items independently with correct text', async () => {
    render(<App />);
    await addTodo('First');
    await addTodo('Second');
    const items = screen.getAllByTestId('todo-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('First');
    expect(items[1]).toHaveTextContent('Second');
  });
});
