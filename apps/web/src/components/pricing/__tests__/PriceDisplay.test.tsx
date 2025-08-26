import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceDisplay, QuotePrice, ServicePrice, CompactPrice, PriceComparison } from '../PriceDisplay';
import { Currency } from '@cotiza/shared';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/hooks/useTranslation';

// Mock hooks
jest.mock('@/hooks/useCurrency', () => ({
  useCurrency: jest.fn(),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

describe('PriceDisplay', () => {
  const mockFormat = jest.fn((amount: number, currency: Currency) => {
    const symbol = currency === Currency.EUR ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  });

  const mockRates = {
    [Currency.USD]: 1,
    [Currency.EUR]: 0.92,
    [Currency.MXN]: 17.5,
  } as Record<Currency, number>;

  beforeEach(() => {
    (useCurrency as jest.Mock).mockReturnValue({
      currency: Currency.USD,
      rates: mockRates,
      format: mockFormat,
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render price with currency', () => {
      render(<PriceDisplay amount={100} currency={Currency.USD} />);
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<PriceDisplay amount={100} currency={Currency.USD} size="sm" />);
      expect(screen.getByText('$100.00')).toHaveClass('text-lg');

      rerender(<PriceDisplay amount={100} currency={Currency.USD} size="lg" />);
      expect(screen.getByText('$100.00')).toHaveClass('text-2xl');

      rerender(<PriceDisplay amount={100} currency={Currency.USD} size="xl" />);
      expect(screen.getByText('$100.00')).toHaveClass('text-3xl');
    });

    it('should render loading skeleton when loading', () => {
      render(<PriceDisplay amount={100} currency={Currency.USD} loading={true} />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
      expect(screen.queryByText('$100.00')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<PriceDisplay amount={100} currency={Currency.USD} className="custom-class" />);
      expect(screen.getByText('$100.00').closest('div')).toHaveClass('custom-class');
    });
  });

  describe('Currency Conversion', () => {
    it('should show conversion when different from user currency', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.EUR} 
          showConversion={true}
        />
      );
      
      // Original price in EUR
      expect(screen.getByText('€100.00')).toBeInTheDocument();
      // Converted price in USD (100 / 0.92 ≈ 108.70)
      expect(screen.getByText(/≈/)).toBeInTheDocument();
    });

    it('should not show conversion when same as user currency', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          showConversion={true}
        />
      );
      
      expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
    });

    it('should not show conversion when disabled', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.EUR} 
          showConversion={false}
        />
      );
      
      expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
    });

    it('should show conversion date when provided', () => {
      const date = new Date('2024-01-15');
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.EUR} 
          showConversion={true}
          conversionDate={date}
        />
      );
      
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render minimal variant', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          variant="minimal"
        />
      );
      
      // Should only show formatted price
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      // No badge or other elements
      expect(screen.queryByText('USD')).not.toBeInTheDocument();
    });

    it('should render inline variant', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          variant="inline"
        />
      );
      
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
    });

    it('should render card variant', () => {
      const { container } = render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          variant="card"
        />
      );
      
      expect(container.querySelector('.card')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('should render default variant', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          variant="default"
        />
      );
      
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  describe('Price Breakdown', () => {
    const breakdown = {
      subtotal: 100,
      tax: 10,
      fees: 5,
      discount: 15,
    };

    it('should show breakdown toggle when enabled', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          showBreakdown={true}
          breakdown={breakdown}
        />
      );
      
      expect(screen.getByText('pricing.showDetails')).toBeInTheDocument();
    });

    it('should toggle breakdown details on click', async () => {
      const user = userEvent.setup();
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          showBreakdown={true}
          breakdown={breakdown}
          variant="card"
        />
      );
      
      const toggleButton = screen.getByText('pricing.showDetails');
      await user.click(toggleButton);
      
      expect(screen.getByText('pricing.subtotal')).toBeInTheDocument();
      expect(screen.getByText('pricing.tax')).toBeInTheDocument();
      expect(screen.getByText('pricing.fees')).toBeInTheDocument();
      expect(screen.getByText('pricing.discount')).toBeInTheDocument();
      
      await user.click(screen.getByText('pricing.hideDetails'));
      
      expect(screen.queryByText('pricing.subtotal')).not.toBeInTheDocument();
    });

    it('should format breakdown amounts correctly', async () => {
      const user = userEvent.setup();
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.EUR} 
          showBreakdown={true}
          breakdown={breakdown}
          variant="card"
        />
      );
      
      await user.click(screen.getByText('pricing.showDetails'));
      
      // Check that all amounts are formatted with EUR
      expect(screen.getByText('€100.00')).toBeInTheDocument(); // subtotal
      expect(screen.getByText('€10.00')).toBeInTheDocument(); // tax
      expect(screen.getByText('€5.00')).toBeInTheDocument(); // fees
      expect(screen.getByText('-€15.00')).toBeInTheDocument(); // discount
    });
  });

  describe('Trend Display', () => {
    it('should show trend when enabled', () => {
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          showTrend={true}
        />
      );
      
      // Should show trend percentage
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it('should show upward trend with green', () => {
      // Mock positive trend
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // Will result in positive trend
      
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          showTrend={true}
        />
      );
      
      const trendBadge = screen.getByText(/%/).closest('.badge');
      expect(trendBadge).toHaveClass('text-green-700');
    });

    it('should show downward trend with red', () => {
      // Mock negative trend
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // Will result in negative trend
      
      render(
        <PriceDisplay 
          amount={100} 
          currency={Currency.USD} 
          showTrend={true}
        />
      );
      
      const trendBadge = screen.getByText(/%/).closest('.badge');
      expect(trendBadge).toHaveClass('text-red-700');
    });
  });

  describe('Minor Currencies', () => {
    it('should hide decimals for JPY when configured', () => {
      render(
        <PriceDisplay 
          amount={1000} 
          currency={Currency.JPY} 
          hideMinorCurrencies={true}
        />
      );
      
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('should show decimals for JPY when not configured', () => {
      mockFormat.mockImplementationOnce(() => '¥1000.00');
      render(
        <PriceDisplay 
          amount={1000} 
          currency={Currency.JPY} 
          hideMinorCurrencies={false}
        />
      );
      
      expect(screen.getByText('¥1000.00')).toBeInTheDocument();
    });
  });
});

describe('QuotePrice', () => {
  const mockFormat = jest.fn((amount: number) => `$${amount.toFixed(2)}`);

  beforeEach(() => {
    (useCurrency as jest.Mock).mockReturnValue({
      currency: Currency.USD,
      rates: {},
      format: mockFormat,
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
  });

  it('should render quote price with breakdown', () => {
    const quote = {
      totalPrice: 150,
      currency: Currency.USD,
      breakdown: {
        subtotal: 100,
        tax: 10,
        fees: 5,
      },
    };

    render(<QuotePrice quote={quote} />);
    
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('pricing.showDetails')).toBeInTheDocument();
  });

  it('should use large size and card variant by default', () => {
    const quote = {
      totalPrice: 150,
      currency: Currency.USD,
    };

    const { container } = render(<QuotePrice quote={quote} />);
    
    expect(screen.getByText('$150.00')).toHaveClass('text-2xl');
    expect(container.querySelector('.card')).toBeInTheDocument();
  });
});

describe('ServicePrice', () => {
  const mockFormat = jest.fn((amount: number) => `$${amount.toFixed(2)}`);

  beforeEach(() => {
    (useCurrency as jest.Mock).mockReturnValue({
      currency: Currency.USD,
      rates: { [Currency.EUR]: 0.92 },
      format: mockFormat,
    });
  });

  it('should render service price with trends', () => {
    render(
      <ServicePrice 
        price={100} 
        currency={Currency.USD}
      />
    );
    
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText(/%/)).toBeInTheDocument(); // Trend indicator
  });

  it('should show original price when different', () => {
    render(
      <ServicePrice 
        price={92} 
        currency={Currency.EUR}
        originalPrice={100}
        originalCurrency={Currency.USD}
      />
    );
    
    expect(screen.getByText('$92.00')).toBeInTheDocument(); // Current price
    // Should also show conversion
  });
});

describe('CompactPrice', () => {
  const mockFormat = jest.fn((amount: number) => `$${amount.toFixed(2)}`);

  beforeEach(() => {
    (useCurrency as jest.Mock).mockReturnValue({
      currency: Currency.USD,
      rates: {},
      format: mockFormat,
    });
  });

  it('should render minimal compact price', () => {
    render(<CompactPrice amount={50} currency={Currency.USD} />);
    
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    // Should not show currency code or conversion
    expect(screen.queryByText('USD')).not.toBeInTheDocument();
  });

  it('should use small size and minimal variant', () => {
    render(<CompactPrice amount={50} currency={Currency.USD} />);
    
    expect(screen.getByText('$50.00')).toHaveClass('text-lg');
  });
});

describe('PriceComparison', () => {
  const mockFormat = jest.fn((amount: number) => `$${amount.toFixed(2)}`);

  beforeEach(() => {
    (useCurrency as jest.Mock).mockReturnValue({
      currency: Currency.USD,
      rates: {},
      format: mockFormat,
    });
  });

  it('should render multiple price comparisons', () => {
    const prices = [
      { label: 'Basic', amount: 100, currency: Currency.USD },
      { label: 'Premium', amount: 200, currency: Currency.USD },
      { label: 'Enterprise', amount: 500, currency: Currency.USD },
    ];

    render(<PriceComparison prices={prices} />);
    
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const prices = [
      { label: 'Test', amount: 100, currency: Currency.USD },
    ];

    const { container } = render(
      <PriceComparison prices={prices} className="custom-comparison" />
    );
    
    expect(container.querySelector('.custom-comparison')).toBeInTheDocument();
  });
});