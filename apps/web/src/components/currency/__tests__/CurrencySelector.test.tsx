import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencySelector, CurrencyBadge, CurrencyToggle } from '../CurrencySelector';
import { Currency } from '@cotiza/shared';
import { useCurrency } from '@/hooks/useCurrency';

// Mock the useCurrency hook
jest.mock('@/hooks/useCurrency', () => ({
  useCurrency: jest.fn(),
}));

describe('CurrencySelector', () => {
  const mockSetCurrency = jest.fn();
  const mockRates = {
    [Currency.USD]: 1,
    [Currency.MXN]: 17.5,
    [Currency.EUR]: 0.92,
    [Currency.BRL]: 5.1,
    [Currency.GBP]: 0.79,
  } as Record<Currency, number>;

  beforeEach(() => {
    (useCurrency as jest.Mock).mockReturnValue({
      currency: Currency.USD,
      setCurrency: mockSetCurrency,
      rates: mockRates,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the currency selector', () => {
      render(<CurrencySelector />);
      expect(screen.getByRole('button', { name: /USD/i })).toBeInTheDocument();
    });

    it('should display the selected currency', () => {
      render(<CurrencySelector value={Currency.EUR} />);
      expect(screen.getByRole('button')).toHaveTextContent('EUR');
    });

    it('should show currency symbol', () => {
      render(<CurrencySelector value={Currency.EUR} />);
      expect(screen.getByRole('button')).toHaveTextContent('€');
    });

    it('should show flags when enabled', () => {
      render(<CurrencySelector showFlags={true} />);
      expect(screen.getByRole('img', { name: /USD flag/i })).toBeInTheDocument();
    });

    it('should hide flags when disabled', () => {
      render(<CurrencySelector showFlags={false} />);
      expect(screen.queryByRole('img', { name: /flag/i })).not.toBeInTheDocument();
    });

    it('should apply size classes correctly', () => {
      const { rerender } = render(<CurrencySelector size="sm" />);
      expect(screen.getByRole('button')).toHaveClass('h-8');

      rerender(<CurrencySelector size="md" />);
      expect(screen.getByRole('button')).toHaveClass('h-10');

      rerender(<CurrencySelector size="lg" />);
      expect(screen.getByRole('button')).toHaveClass('h-12');
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      expect(screen.getByPlaceholderText('Search currencies...')).toBeInTheDocument();
    });

    it('should display all supported currencies in dropdown', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector supportedCurrencies={[Currency.USD, Currency.EUR, Currency.MXN]} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.getByText('MXN')).toBeInTheDocument();
    });

    it('should show exchange rates when enabled', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector showRates={true} />);
      
      await user.click(screen.getByRole('button'));
      
      // Should show rate for MXN (17.5)
      expect(screen.getByText('17.50')).toBeInTheDocument();
    });

    it('should show currency trends when enabled', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector showTrends={true} />);
      
      await user.click(screen.getByRole('button'));
      
      // Should show trend indicators
      expect(screen.getAllByText(/%/)).toHaveLength(mockRates.length);
    });
  });

  describe('Search Functionality', () => {
    it('should filter currencies based on search query', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      await user.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Search currencies...');
      
      await user.type(searchInput, 'euro');
      
      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.queryByText('USD')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      await user.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Search currencies...');
      
      await user.type(searchInput, 'xyz');
      
      expect(screen.getByText(/No currencies found matching/)).toBeInTheDocument();
    });

    it('should search by currency code', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      await user.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Search currencies...');
      
      await user.type(searchInput, 'USD');
      
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });

  describe('Currency Selection', () => {
    it('should call onChange when currency is selected', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      render(<CurrencySelector onChange={mockOnChange} />);
      
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('EUR'));
      
      expect(mockOnChange).toHaveBeenCalledWith(Currency.EUR);
    });

    it('should call setCurrency from hook when no onChange provided', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('EUR'));
      
      expect(mockSetCurrency).toHaveBeenCalledWith(Currency.EUR);
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      await user.click(screen.getByRole('button'));
      expect(screen.getByPlaceholderText('Search currencies...')).toBeInTheDocument();
      
      await user.click(screen.getByText('EUR'));
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search currencies...')).not.toBeInTheDocument();
      });
    });

    it('should clear search after selection', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      await user.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Search currencies...');
      await user.type(searchInput, 'euro');
      
      await user.click(screen.getByText('EUR'));
      
      // Reopen dropdown to check search is cleared
      await user.click(screen.getByRole('button'));
      const newSearchInput = screen.getByPlaceholderText('Search currencies...');
      expect(newSearchInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(<CurrencySelector value={Currency.EUR} />);
      expect(screen.getByRole('button', { name: /Selected currency: EUR/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector />);
      
      // Tab to button
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      
      // Enter to open
      await user.keyboard('{Enter}');
      expect(screen.getByPlaceholderText('Search currencies...')).toBeInTheDocument();
      
      // Tab to search
      await user.tab();
      expect(screen.getByPlaceholderText('Search currencies...')).toHaveFocus();
    });

    it('should support disabled state', () => {
      render(<CurrencySelector disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty supported currencies list', () => {
      render(<CurrencySelector supportedCurrencies={[]} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle invalid value prop', () => {
      render(<CurrencySelector value={'INVALID' as Currency} />);
      // Should fallback to default currency
      expect(screen.getByRole('button')).toHaveTextContent('USD');
    });

    it('should handle rates loading state', () => {
      (useCurrency as jest.Mock).mockReturnValue({
        currency: Currency.USD,
        setCurrency: mockSetCurrency,
        rates: {},
      });
      
      render(<CurrencySelector showRates={true} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});

// Sub-component tests
describe('CurrencyBadge', () => {
  it('should render currency badge with flag and symbol', () => {
    render(<CurrencyBadge currency={Currency.EUR} />);
    
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('€')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /EUR flag/i })).toBeInTheDocument();
  });

  it('should hide flag when showFlag is false', () => {
    render(<CurrencyBadge currency={Currency.EUR} showFlag={false} />);
    
    expect(screen.queryByRole('img', { name: /flag/i })).not.toBeInTheDocument();
  });

  it('should hide symbol when showSymbol is false', () => {
    render(<CurrencyBadge currency={Currency.EUR} showSymbol={false} />);
    
    expect(screen.queryByText('€')).not.toBeInTheDocument();
  });
});

describe('CurrencyToggle', () => {
  it('should render toggle between two currencies', () => {
    const mockOnChange = jest.fn();
    
    render(
      <CurrencyToggle
        currencies={[Currency.USD, Currency.EUR]}
        value={Currency.USD}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByRole('button', { name: /USD/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EUR/i })).toBeInTheDocument();
  });

  it('should call onChange when toggled', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <CurrencyToggle
        currencies={[Currency.USD, Currency.EUR]}
        value={Currency.USD}
        onChange={mockOnChange}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /EUR/i }));
    expect(mockOnChange).toHaveBeenCalledWith(Currency.EUR);
  });

  it('should highlight selected currency', () => {
    const mockOnChange = jest.fn();
    
    render(
      <CurrencyToggle
        currencies={[Currency.USD, Currency.EUR]}
        value={Currency.EUR}
        onChange={mockOnChange}
      />
    );
    
    const eurButton = screen.getByRole('button', { name: /EUR/i });
    expect(eurButton).toHaveClass('bg-primary');
  });
});