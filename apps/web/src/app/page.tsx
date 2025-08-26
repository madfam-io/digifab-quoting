import Link from 'next/link';
import { ArrowRight, Zap, TrendingDown, BarChart, Users, Upload, Calculator, Clock, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Manufacturing Quotes
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Get instant quotes for 3D printing, CNC machining, and laser cutting. 
              Compare materials, optimize costs, and make informed decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/demo"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl flex items-center"
              >
                Try Interactive Demo
                <ArrowRight className="ml-2" size={24} />
              </Link>
              
              <div className="text-sm text-blue-200">
                ✓ No signup required • ✓ Results in seconds • ✓ Free forever
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-8 mt-16">
              {[
                { icon: <Users />, stat: '10,000+', label: 'Happy Users' },
                { icon: <Zap />, stat: '< 3sec', label: 'Average Quote Time' },
                { icon: <TrendingDown />, stat: '$234', label: 'Average Savings' },
                { icon: <BarChart />, stat: '99.9%', label: 'Uptime' }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex p-3 bg-white/20 rounded-full mb-3">
                    {item.icon}
                  </div>
                  <div className="text-3xl font-bold">{item.stat}</div>
                  <div className="text-blue-200 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Cotización en 5 minutos</h3>
              <p className="text-muted-foreground">
                Sistema automatizado que analiza tus archivos y genera cotizaciones precisas al
                instante.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Precios Transparentes</h3>
              <p className="text-muted-foreground">
                Desglose detallado de costos sin sorpresas. Siempre sabrás exactamente qué estás
                pagando.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Sostenibilidad</h3>
              <p className="text-muted-foreground">
                Cada cotización incluye métricas de sostenibilidad y opciones ecológicas cuando
                están disponibles.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Processes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Procesos</h2>
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
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de empresas que confían en nosotros para sus proyectos de fabricación.
          </p>
          <Link href="/demo">
            <Button size="lg" variant="secondary" className="gap-2">
              <Upload className="w-5 h-5" />
              Probar Demo Sin Registro
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
