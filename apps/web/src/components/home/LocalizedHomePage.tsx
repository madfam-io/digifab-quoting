'use client';

import { Suspense } from 'react';
import { DemoHero } from '@/components/demo/DemoHero';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { FeatureShowcase } from '@/components/demo/FeatureShowcase';
import { PricingTiers } from '@/components/demo/PricingTiers';
import { LinkQuoteDemo } from '@/components/demo/LinkQuoteDemo';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingDown, BarChart, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function LocalizedHomePage() {
  const { t } = useTranslation('common');

  const stats = [
    { icon: <Users className="w-6 h-6" />, stat: '10,000+', labelKey: 'stats.users' },
    { icon: <Zap className="w-6 h-6" />, stat: '< 3sec', labelKey: 'stats.quoteTime' },
    { icon: <TrendingDown className="w-6 h-6" />, stat: '63%', labelKey: 'stats.savings' },
    { icon: <BarChart className="w-6 h-6" />, stat: '99.9%', labelKey: 'stats.uptime' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with animated examples */}
      <section className="relative overflow-hidden">
        <DemoHero />
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex p-2 bg-white/20 rounded-full mb-2">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold">{item.stat}</div>
                <div className="text-blue-100 text-sm">{t(item.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persona Selection */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('persona.title')}
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            {t('persona.description')}
          </p>
          <PersonaSelector />
        </div>
      </section>

      {/* Link-to-Quote Feature */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {t('linkQuote.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('linkQuote.description')}
            </p>
          </div>
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            <LinkQuoteDemo />
          </Suspense>
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

      {/* Interactive Demo CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('cta.ready')}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Link 
            href="/try"
            className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl"
          >
            {t('hero.cta')}
            <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
          <p className="text-sm opacity-75 mt-4">
            {t('hero.ctaSecondary')}
          </p>
        </div>
      </section>

      {/* Social Proof & Final CTA */}
      <section className="py-20 bg-gradient-to-br from-green-400 to-blue-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('footer.joinCommunity')}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('stats.savings')}: $234 • {t('stats.quoteTime')}: 60% • {t('footer.tagline')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t('cta.startTrial')}
            </Link>
            <Link 
              href="/try"
              className="text-white underline hover:no-underline"
            >
              {t('cta.continueGuest')} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}