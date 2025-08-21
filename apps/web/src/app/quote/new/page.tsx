'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/upload/FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewQuotePage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  const handleFilesUploaded = async (fileIds: string[]) => {
    setUploadedFiles(fileIds);
    setIsCreatingQuote(true);

    try {
      // Create quote
      const quoteResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify({
          currency: 'MXN',
          objective: {
            cost: 0.5,
            lead: 0.3,
            green: 0.2,
          },
        }),
      });

      if (!quoteResponse.ok) {
        throw new Error('Failed to create quote');
      }

      const quote = await quoteResponse.json();

      // Navigate to quote configuration
      router.push(`/quote/${quote.id}/configure?files=${fileIds.join(',')}`);
    } catch (error) {
      console.error('Error creating quote:', error);
      setIsCreatingQuote(false);
      // TODO: Show error toast
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
              <CardTitle className="text-2xl">Nueva Cotización</CardTitle>
              <p className="text-muted-foreground">
                Sube tus archivos para comenzar. Nuestro sistema analizará automáticamente
                tus piezas y generará una cotización en minutos.
              </p>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesUploaded={handleFilesUploaded}
                maxFiles={50}
              />

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
                Detectamos el proceso ideal, calculamos el material necesario
                y verificamos la manufactura.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Precio al Instante</h3>
              <p className="text-sm text-muted-foreground">
                Obtén tu cotización en menos de 5 minutos con opciones de
                material y acabado.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}