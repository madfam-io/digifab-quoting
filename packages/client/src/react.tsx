/**
 * React hooks and components for @cotiza/client
 *
 * Provides easy integration with React applications like Primavera3D
 */

import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { CotizaClient, createCotizaClient } from './client';
import type {
  CotizaConfig,
  InstantQuoteInput,
  InstantQuoteResult,
  CreateQuoteInput,
  Quote,
  CotizaError,
  CheckoutConfig,
  CreateCheckoutInput,
  CheckoutSession,
  CheckoutResult,
  ProviderInfo,
} from './types';

// Re-export types for convenience
export type {
  CotizaConfig,
  InstantQuoteInput,
  InstantQuoteResult,
  CreateQuoteInput,
  Quote,
  ManufacturingProcess,
  Material,
  Currency,
  OptimizationObjective,
  // Checkout types
  CheckoutConfig,
  CreateCheckoutInput,
  CheckoutSession,
  CheckoutResult,
  CheckoutLineItem,
  PaymentProvider,
  PaymentMethod,
  PaymentMethodInfo,
  ProviderInfo,
} from './types';

// Context for shared client instance
interface CotizaContextValue {
  client: CotizaClient;
}

const CotizaContext = createContext<CotizaContextValue | null>(null);

interface CotizaProviderProps {
  children: ReactNode;
  config?: Partial<CotizaConfig>;
  checkoutConfig?: CheckoutConfig;
}

/**
 * Provider component for Cotiza client
 *
 * @example
 * ```tsx
 * <CotizaProvider config={{ baseUrl: 'https://api.cotiza.studio' }}>
 *   <QuoteCalculator />
 * </CotizaProvider>
 * ```
 */
export function CotizaProvider({ children, config, checkoutConfig }: CotizaProviderProps) {
  const client = useMemo(
    () => createCotizaClient(config, checkoutConfig),
    [config, checkoutConfig],
  );

  return <CotizaContext.Provider value={{ client }}>{children}</CotizaContext.Provider>;
}

/**
 * Hook to access the Cotiza client
 */
export function useCotiza(): CotizaClient {
  const context = useContext(CotizaContext);
  if (!context) {
    throw new Error('useCotiza must be used within a CotizaProvider');
  }
  return context.client;
}

interface UseInstantQuoteResult {
  quote: InstantQuoteResult | null;
  isLoading: boolean;
  error: CotizaError | null;
  calculate: (input: InstantQuoteInput) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for instant quote calculations
 *
 * @example
 * ```tsx
 * const { quote, isLoading, calculate } = useInstantQuote();
 *
 * const handleCalculate = () => {
 *   calculate({
 *     process: 'fdm',
 *     material: 'pla',
 *     quantity: 1,
 *     volume: 15000, // mm³
 *   });
 * };
 * ```
 */
export function useInstantQuote(): UseInstantQuoteResult {
  const client = useCotiza();
  const [quote, setQuote] = useState<InstantQuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CotizaError | null>(null);

  const calculate = useCallback(
    async (input: InstantQuoteInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.calculateInstant(input);
        setQuote(result);
      } catch (err) {
        setError(err as CotizaError);
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return { quote, isLoading, error, calculate, reset };
}

interface UseCreateQuoteResult {
  quote: Quote | null;
  isLoading: boolean;
  error: CotizaError | null;
  create: (input: CreateQuoteInput) => Promise<Quote | null>;
  reset: () => void;
}

/**
 * Hook for creating full quotes
 */
export function useCreateQuote(): UseCreateQuoteResult {
  const client = useCotiza();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CotizaError | null>(null);

  const create = useCallback(
    async (input: CreateQuoteInput): Promise<Quote | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.createQuote(input);
        setQuote(result);
        return result;
      } catch (err) {
        setError(err as CotizaError);
        setQuote(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return { quote, isLoading, error, create, reset };
}

interface UseFileUploadResult {
  fileData: {
    fileId: string;
    fileName: string;
    dimensions: { x: number; y: number; z: number };
    volume: number;
    surfaceArea: number;
  } | null;
  isUploading: boolean;
  error: CotizaError | null;
  upload: (file: File) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for uploading 3D files
 */
export function useFileUpload(): UseFileUploadResult {
  const client = useCotiza();
  const [fileData, setFileData] = useState<UseFileUploadResult['fileData']>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<CotizaError | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);

      try {
        const result = await client.uploadFile(file);
        setFileData(result);
      } catch (err) {
        setError(err as CotizaError);
        setFileData(null);
      } finally {
        setIsUploading(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setFileData(null);
    setError(null);
  }, []);

  return { fileData, isUploading, error, upload, reset };
}

/**
 * Utility to format currency
 */
export function formatCurrency(amount: number, currency: 'USD' | 'MXN' | 'EUR' = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Utility to format estimated time
 */
export function formatEstimatedTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  if (hours < 24) {
    return `${Math.round(hours)} hr`;
  }
  const days = Math.ceil(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

// ============================================================================
// Checkout Hooks (via Janua Payment Gateway)
// ============================================================================

interface UseCheckoutResult {
  session: CheckoutSession | null;
  isLoading: boolean;
  error: CotizaError | null;
  createCheckout: (input: CreateCheckoutInput) => Promise<CheckoutSession | null>;
  checkoutQuote: (
    quoteId: string,
    customerEmail: string,
    options?: {
      customerName?: string;
      successUrl?: string;
      cancelUrl?: string;
      countryCode?: string;
    },
  ) => Promise<CheckoutSession | null>;
  redirectToCheckout: () => void;
  reset: () => void;
}

/**
 * Hook for creating checkout sessions via Janua Payment Gateway
 *
 * @example
 * ```tsx
 * const { createCheckout, session, redirectToCheckout } = useCheckout();
 *
 * const handleCheckout = async () => {
 *   await createCheckout({
 *     quoteId: 'quote_123',
 *     customerEmail: 'user@example.com',
 *     lineItems: [{ name: 'FDM Print', amount: 15000, currency: 'MXN', quantity: 1 }],
 *   });
 *   redirectToCheckout();
 * };
 * ```
 */
export function useCheckout(): UseCheckoutResult {
  const client = useCotiza();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CotizaError | null>(null);

  const createCheckout = useCallback(
    async (input: CreateCheckoutInput): Promise<CheckoutSession | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.createCheckout(input);
        setSession(result);
        return result;
      } catch (err) {
        setError(err as CotizaError);
        setSession(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const checkoutQuote = useCallback(
    async (
      quoteId: string,
      customerEmail: string,
      options?: {
        customerName?: string;
        successUrl?: string;
        cancelUrl?: string;
        countryCode?: string;
      },
    ): Promise<CheckoutSession | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.checkoutQuote(quoteId, customerEmail, options);
        setSession(result);
        return result;
      } catch (err) {
        setError(err as CotizaError);
        setSession(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const redirectToCheckout = useCallback(() => {
    if (session?.url && typeof window !== 'undefined') {
      window.location.href = session.url;
    }
  }, [session]);

  const reset = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return { session, isLoading, error, createCheckout, checkoutQuote, redirectToCheckout, reset };
}

interface UseCheckoutResultResult {
  result: CheckoutResult | null;
  isLoading: boolean;
  error: CotizaError | null;
  fetchResult: (sessionId: string) => Promise<CheckoutResult | null>;
  reset: () => void;
}

/**
 * Hook for fetching checkout results after payment
 *
 * @example
 * ```tsx
 * const { result, fetchResult } = useCheckoutResult();
 *
 * useEffect(() => {
 *   const sessionId = new URLSearchParams(window.location.search).get('session_id');
 *   if (sessionId) {
 *     fetchResult(sessionId);
 *   }
 * }, []);
 *
 * if (result?.success) {
 *   return <OrderConfirmation orderId={result.orderId} />;
 * }
 * ```
 */
export function useCheckoutResult(): UseCheckoutResultResult {
  const client = useCotiza();
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CotizaError | null>(null);

  const fetchResult = useCallback(
    async (sessionId: string): Promise<CheckoutResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await client.getCheckoutResult(sessionId);
        setResult(res);
        return res;
      } catch (err) {
        setError(err as CotizaError);
        setResult(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, fetchResult, reset };
}

interface UseProviderInfoResult {
  providerInfo: ProviderInfo | null;
  isLoading: boolean;
  error: CotizaError | null;
  fetchProviderInfo: (countryCode?: string) => Promise<ProviderInfo | null>;
  reset: () => void;
}

/**
 * Hook for fetching available payment provider info
 *
 * @example
 * ```tsx
 * const { providerInfo, fetchProviderInfo } = useProviderInfo();
 *
 * useEffect(() => {
 *   fetchProviderInfo('MX'); // Get Mexico payment options
 * }, []);
 *
 * // Show available payment methods
 * providerInfo?.paymentMethods.map(pm => (
 *   <PaymentMethodOption key={pm.type} {...pm} />
 * ));
 * ```
 */
export function useProviderInfo(): UseProviderInfoResult {
  const client = useCotiza();
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CotizaError | null>(null);

  const fetchProviderInfo = useCallback(
    async (countryCode?: string): Promise<ProviderInfo | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const info = await client.getProviderInfo(countryCode);
        setProviderInfo(info);
        return info;
      } catch (err) {
        setError(err as CotizaError);
        setProviderInfo(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setProviderInfo(null);
    setError(null);
  }, []);

  return { providerInfo, isLoading, error, fetchProviderInfo, reset };
}

// ============================================================================
// Checkout Components
// ============================================================================

interface CheckoutButtonProps {
  /** Quote ID to checkout */
  quoteId: string;
  /** Customer email */
  customerEmail: string;
  /** Customer name */
  customerName?: string;
  /** Success URL after payment */
  successUrl?: string;
  /** Cancel URL */
  cancelUrl?: string;
  /** Country code for provider selection */
  countryCode?: string;
  /** Button text */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Callback when checkout starts */
  onCheckoutStart?: () => void;
  /** Callback on error */
  onError?: (error: CotizaError) => void;
}

/**
 * Pre-built checkout button component
 *
 * @example
 * ```tsx
 * <CheckoutButton
 *   quoteId="quote_123"
 *   customerEmail="user@example.com"
 *   countryCode="MX"
 *   successUrl="/orders/success"
 * >
 *   Pay Now
 * </CheckoutButton>
 * ```
 */
export function CheckoutButton({
  quoteId,
  customerEmail,
  customerName,
  successUrl,
  cancelUrl,
  countryCode,
  children = 'Proceed to Payment',
  className,
  disabled,
  onCheckoutStart,
  onError,
}: CheckoutButtonProps) {
  const { checkoutQuote, redirectToCheckout, isLoading, error } = useCheckout();

  const handleClick = useCallback(async () => {
    onCheckoutStart?.();

    const session = await checkoutQuote(quoteId, customerEmail, {
      customerName,
      successUrl,
      cancelUrl,
      countryCode,
    });

    if (session) {
      redirectToCheckout();
    } else if (error) {
      onError?.(error);
    }
  }, [
    quoteId,
    customerEmail,
    customerName,
    successUrl,
    cancelUrl,
    countryCode,
    checkoutQuote,
    redirectToCheckout,
    error,
    onCheckoutStart,
    onError,
  ]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
      type="button"
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
}

/**
 * Payment method icons/badges
 */
export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  card: '💳',
  oxxo: '🏪',
  spei: '🏦',
  bank_transfer: '🏦',
};

/**
 * Format payment method for display
 */
export function formatPaymentMethod(method: string): string {
  const names: Record<string, string> = {
    card: 'Credit/Debit Card',
    oxxo: 'OXXO (Cash)',
    spei: 'SPEI (Bank Transfer)',
    bank_transfer: 'Bank Transfer',
  };
  return names[method] || method;
}
