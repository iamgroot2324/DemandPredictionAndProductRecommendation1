import { render, screen } from '@testing-library/react';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('Sidebar', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { name: 'Ada Lovelace', email: 'ada@example.com' },
      logout: jest.fn()
    });
  });

  test('renders when open and hides when closed', () => {
    const { rerender } = render(
      <Sidebar
        activePage="home"
        setActivePage={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('DPPRS')).toBeInTheDocument();

    rerender(
      <Sidebar
        activePage="home"
        setActivePage={jest.fn()}
        isOpen={false}
        onClose={jest.fn()}
      />
    );

    expect(screen.queryByText('DPPRS')).not.toBeInTheDocument();
  });
});
