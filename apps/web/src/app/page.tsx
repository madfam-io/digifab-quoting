import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Calculator, Clock, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Cotización Instantánea para Fabricación Digital
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Obtén precios al instante para impresión 3D, mecanizado CNC y corte láser. 
              Sube tus archivos y recibe tu cotización en menos de 5 minutos.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/quote/new">
                <Button size="lg" className="gap-2">
                  <Upload className="w-5 h-5" />
                  Subir Archivos
                </Button>
              </Link>
              <Link href="/quote/wizard">
                <Button size="lg" variant="outline" className="gap-2">
                  <Calculator className="w-5 h-5" />
                  Cotizador Guiado
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Cotización en 5 minutos
              </h3>
              <p className="text-muted-foreground">
                Sistema automatizado que analiza tus archivos y genera cotizaciones precisas al instante.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Precios Transparentes
              </h3>
              <p className="text-muted-foreground">
                Desglose detallado de costos sin sorpresas. Siempre sabrás exactamente qué estás pagando.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Sostenibilidad
              </h3>
              <p className="text-muted-foreground">
                Cada cotización incluye métricas de sostenibilidad y opciones ecológicas cuando están disponibles.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Processes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nuestros Procesos
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Impresión 3D FFF</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ideal para prototipos y piezas funcionales
              </p>
              <ul className="text-sm space-y-1">
                <li>• PLA, PETG, ABS</li>
                <li>• Resolución desde 0.1mm</li>
                <li>• Volumen hasta 300x300x400mm</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Impresión 3D SLA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Alta precisión para detalles finos
              </p>
              <ul className="text-sm space-y-1">
                <li>• Resinas estándar y especiales</li>
                <li>• Resolución 0.025mm</li>
                <li>• Acabados suaves</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">CNC 3 Ejes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mecanizado de precisión en metales
              </p>
              <ul className="text-sm space-y-1">
                <li>• Aluminio, Acero, Plásticos</li>
                <li>• Tolerancias ±0.05mm</li>
                <li>• Acabados profesionales</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Corte Láser</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Corte preciso en materiales planos
              </p>
              <ul className="text-sm space-y-1">
                <li>• Acrílico, MDF, Madera</li>
                <li>• Espesores hasta 20mm</li>
                <li>• Grabado disponible</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de empresas que confían en nosotros para sus proyectos de fabricación.
          </p>
          <Link href="/quote/new">
            <Button size="lg" variant="secondary" className="gap-2">
              <Upload className="w-5 h-5" />
              Obtener Cotización Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}