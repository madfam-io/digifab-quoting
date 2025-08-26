'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { QuoteStatus } from '@cotiza/shared';

interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  createdAt: string;
  items: QuoteItem[];
}

interface QuoteItem {
  id: string;
  partName: string;
  process: string;
  material: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  leadTime: number;
}

export default function QuoteDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadQuote();
  }, [session, status, params.id]);

  const loadQuote = async () => {
    try {
      const quoteData = await apiClient.get<Quote>(`/quotes/${params.id}`);
      setQuote(quoteData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quote details',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  };

  const handleApprove = async () => {
    setApproving(true);

    try {
      await apiClient.post(`/quotes/${params.id}/approve`);

      // For MVP, redirect to success page
      // In production, this would redirect to payment
      toast({
        title: 'Success',
        description: 'Quote approved successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error approving quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve quote',
        variant: 'destructive',
      });
      setApproving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const pdfData = await apiClient.get<{ url: string }>(`/quotes/${params.id}/pdf`);
      window.open(pdfData.url, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!quote) return null;

  const statusColors: Record<QuoteStatus, string> = {
    draft: 'secondary',
    submitted: 'default',
    auto_quoted: 'default',
    needs_review: 'secondary',
    quoted: 'default',
    approved: 'default',
    ordered: 'default',
    in_production: 'default',
    qc: 'default',
    shipped: 'default',
    closed: 'secondary',
    cancelled: 'destructive',
    rejected: 'destructive',
    expired: 'secondary',
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quote {quote.quoteNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Created on {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge
            variant={
              statusColors[quote.status] as 'default' | 'secondary' | 'destructive' | 'outline'
            }
          >
            {quote.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quote.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.partName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.process} • {item.material}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} • Lead time: {item.leadTime} days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${item.subtotal.toFixed(2)} {quote.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${quote.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${quote.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      ${quote.total.toFixed(2)} {quote.currency}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                </div>

                {quote.status === 'quoted' && (
                  <Button onClick={handleApprove} disabled={approving} className="w-full" size="lg">
                    {approving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Approve & Pay
                      </>
                    )}
                  </Button>
                )}

                <Button variant="outline" onClick={handleDownloadPdf} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>

                <Link href="/dashboard" className="block">
                  <Button variant="ghost" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
