'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileUpload } from '@/components/upload/FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { CurrencySelector } from '@/components/currency/CurrencySelector';
import { useCurrency } from '@/hooks/useCurrency';
// import { useTranslation } from '@/hooks/useTranslation';
import { Currency } from '@cotiza/shared';

export default function NewQuotePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { currency } = useCurrency();
  // const { t } = useTranslation('quotes');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const handleFilesUploaded = async (fileIds: string[]) => {
    setUploadedFiles(fileIds);
    setIsCreatingQuote(true);

    try {
      // Create quote
      const quote = await apiClient.post<{ id: string }>('/quotes', {
        currency: selectedCurrency,
        objective: {
          cost: 0.5,
          lead: 0.3,
          green: 0.2,
        },
      });

      // Navigate to quote configuration
      router.push(`/quote/${quote.id}/configure?files=${fileIds.join(',')}`);
    } catch (error) {
      console.error('Error creating quote:', error);
      setIsCreatingQuote(false);
      toast({
        title: 'Error',
        description: 'Failed to create quote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">Nueva Cotización</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Sube tus archivos para comenzar. Nuestro sistema analizará automáticamente tus
                    piezas y generará una cotización en minutos.
                  </p>
                </div>
                <div className="ml-4">
                  <CurrencySelector
                    value={selectedCurrency}
                    onChange={setSelectedCurrency}
                    size="sm"
                    showRates={true}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FileUpload onFilesUploaded={handleFilesUploaded} maxFiles={50} />

              {isCreatingQuote && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Creando cotización...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Formatos Aceptados</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• STL (Impresión 3D)</li>
                <li>• STEP, IGES (CNC)</li>
                <li>• DXF, DWG (Corte láser)</li>
                <li>• PDF (Dibujos técnicos)</li>
              </ul>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Análisis Automático</h3>
              <p className="text-sm text-muted-foreground">
                Detectamos el proceso ideal, calculamos el material necesario y verificamos la
                manufactura.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Precio al Instante</h3>
              <p className="text-sm text-muted-foreground">
                Obtén tu cotización en menos de 5 minutos con opciones de material y acabado.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
