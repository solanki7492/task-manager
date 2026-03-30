import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';

describe('CreateTaskDialog', () => {
  it('should render when open', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    render(
      <CreateTaskDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={false}
      />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    render(
      <CreateTaskDialog
        open={false}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={false}
      />
    );

    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });

  it('should call onSubmit with title', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    render(
      <CreateTaskDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={false}
      />
    );

    const input = screen.getByLabelText('Task Title');
    fireEvent.change(input, { target: { value: 'New Task' } });

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    expect(onSubmit).toHaveBeenCalledWith('New Task');
  });

  it('should show error for empty title', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    render(
      <CreateTaskDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={false}
      />
    );

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show error for title exceeding 200 characters', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    render(
      <CreateTaskDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={false}
      />
    );

    const input = screen.getByLabelText('Task Title');
    const longTitle = 'a'.repeat(201);
    fireEvent.change(input, { target: { value: longTitle } });

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    expect(
      screen.getByText('Title must be 200 characters or less')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onClose when cancel is clicked', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    render(
      <CreateTaskDialog
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={false}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });
});
