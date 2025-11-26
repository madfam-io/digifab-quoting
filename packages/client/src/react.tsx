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
} from './types';

// Context for shared client instance
interface CotizaContextValue {
  client: CotizaClient;
}

const CotizaContext = createContext<CotizaContextValue | null>(null);

interface CotizaProviderProps {
  children: ReactNode;
  config?: Partial<CotizaConfig>;
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
export function CotizaProvider({ children, config }: CotizaProviderProps) {
  const client = useMemo(() => createCotizaClient(config), [config]);

  return (
    <CotizaContext.Provider value={{ client }}>
      {children}
    </CotizaContext.Provider>
  );
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
    [client]
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
    [client]
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
    [client]
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
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'MXN' | 'EUR' = 'USD'
): string {
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
