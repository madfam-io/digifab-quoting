import { Suspense } from 'react';
import { InteractiveDemoLanding } from '@/components/demo/InteractiveDemoLanding';
import { DemoHero } from '@/components/demo/DemoHero';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { FeatureShowcase } from '@/components/demo/FeatureShowcase';
import { PricingTiers } from '@/components/demo/PricingTiers';
import { LinkQuoteDemo } from '@/components/demo/LinkQuoteDemo';

export const metadata = {
  title: 'MADFAM Quoting Demo - See Manufacturing Costs in Real-Time',
  description: 'Get instant quotes for 3D printing, CNC machining, and laser cutting. See costs, compare materials, and optimize your designs in seconds.',
  keywords: 'manufacturing quotes, 3D printing cost, CNC pricing, laser cutting quotes, rapid prototyping',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Immediate Demo */}
      <section className="relative overflow-hidden">
        <DemoHero />
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
          <InteractiveDemoLanding />
        </Suspense>
      </section>

      {/* Persona Selection */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Choose Your Journey
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Whether you're a DIY maker or running a shop, we've got the perfect solution for your needs
          </p>
          <PersonaSelector />
        </div>
      </section>

      {/* Link-to-Quote Feature */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Turn Any Maker Project Into a Quote
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just paste a link from Instructables, Thingiverse, GitHub, or any maker platform. 
              We'll automatically extract the bill of materials and generate personalized quotes.
            </p>
          </div>
          <LinkQuoteDemo />
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <FeatureShowcase />
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <PricingTiers />
        </div>
      </section>

      {/* Social Proof & CTA */}
      <section className="py-20 bg-gradient-to-br from-green-400 to-blue-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join 10,000+ Makers Saving Money Every Day
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Average savings of $234 per project. 60% faster quoting. Technology previously only available to Fortune 500 companies.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}