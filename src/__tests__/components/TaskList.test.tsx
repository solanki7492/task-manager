import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskList, Task } from '@/components/tasks/TaskList';

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      done: false,
      createdAt: new Date().toISOString(),
      userId: 'user-123',
    },
    {
      id: '2',
      title: 'Task 2',
      done: true,
      createdAt: new Date().toISOString(),
      userId: 'user-123',
    },
  ];

  it('should render tasks', () => {
    const onToggle = jest.fn();
    render(<TaskList tasks={mockTasks} onToggle={onToggle} loading={false} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should show empty state when no tasks', () => {
    const onToggle = jest.fn();
    render(<TaskList tasks={[]} onToggle={onToggle} loading={false} />);

    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });

  it('should call onToggle when task is clicked', () => {
    const onToggle = jest.fn();
    render(<TaskList tasks={mockTasks} onToggle={onToggle} loading={false} />);

    const firstTaskButton = screen.getByRole('button', { name: /Task 1/i });
    fireEvent.click(firstTaskButton);

    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('should disable tasks when loading', () => {
    const onToggle = jest.fn();
    render(<TaskList tasks={mockTasks} onToggle={onToggle} loading={true} />);

    const firstTaskButton = screen.getByRole('button', { name: /Task 1/i });
    // MUI uses aria-disabled instead of disabled attribute on div elements
    expect(firstTaskButton).toHaveAttribute('aria-disabled', 'true');
  });
});
