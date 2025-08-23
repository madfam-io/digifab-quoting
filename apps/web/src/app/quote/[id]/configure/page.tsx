'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

interface Material {
  id: string;
  name: string;
  type: string;
  processTypes: string[];
  costPerUnit: number;
}

interface Machine {
  id: string;
  name: string;
  processType: string;
}

interface ProcessOption {
  id: string;
  process: string;
  name: string;
  type: 'material' | 'finish' | 'precision' | 'other';
}

export default function QuoteConfigurePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [processOptions, setProcessOptions] = useState<ProcessOption[]>([]);

  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [quantity, setQuantity] = useState('1');

  const fileIds = searchParams.get('files')?.split(',') || [];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadOptions();
  }, [session, status]);

  const loadOptions = async () => {
    try {
      const [materialsData, machinesData, processOptionsData] = await Promise.all([
        apiClient.get<Material[]>('/pricing/materials'),
        apiClient.get<Machine[]>('/pricing/machines'),
        apiClient.get<ProcessOption[]>('/pricing/process-options'),
      ]);

      setMaterials(materialsData);
      setMachines(machinesData);
      setProcessOptions(processOptionsData);

      // Set defaults
      if (materialsData.length > 0) setSelectedMaterial(materialsData[0].id);
      if (machinesData.length > 0) setSelectedMachine(machinesData[0].id);

      const finishes = processOptionsData.filter((po) => po.type === 'finish');
      if (finishes.length > 0) setSelectedFinish(finishes[0].id);

      setLoading(false);
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configuration options',
        variant: 'destructive',
      });
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);

    try {
      // For each file, add as quote item
      for (const fileId of fileIds) {
        await apiClient.post(`/quotes/${params.id}/items`, {
          fileId,
          processType: 'FFF', // This should be detected based on file type
          materialId: selectedMaterial,
          machineId: selectedMachine,
          selections: {
            finish: selectedFinish,
          },
          quantity: parseInt(quantity),
        });
      }

      // Calculate quote
      await apiClient.post(`/quotes/${params.id}/calculate`, {
        objective: {
          cost: 0.5,
          lead: 0.3,
          green: 0.2,
        },
      });

      // Navigate to quote review
      router.push(`/quote/${params.id}`);
    } catch (error) {
      console.error('Error calculating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate quote',
        variant: 'destructive',
      });
      setCalculating(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const finishOptions = processOptions.filter((po) => po.type === 'finish');

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/quote/new"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Quote</CardTitle>
              <p className="text-muted-foreground">Select materials and options for your parts</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger id="material">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="machine">Machine</Label>
                  <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                    <SelectTrigger id="machine">
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finish">Finish</Label>
                  <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                    <SelectTrigger id="finish">
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent>
                      {finishOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="w-full"
                  size="lg"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Quote'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
