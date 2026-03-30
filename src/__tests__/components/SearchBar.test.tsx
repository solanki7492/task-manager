import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/tasks/SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);

    expect(
      screen.getByPlaceholderText('Search tasks by title...')
    ).toBeInTheDocument();
  });

  it('should display current value', () => {
    const onChange = jest.fn();
    render(<SearchBar value="test search" onChange={onChange} />);

    const input = screen.getByPlaceholderText(
      'Search tasks by title...'
    ) as HTMLInputElement;
    expect(input.value).toBe('test search');
  });

  it('should call onChange when value changes', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search tasks by title...');
    fireEvent.change(input, { target: { value: 'new search' } });

    expect(onChange).toHaveBeenCalledWith('new search');
  });
});
