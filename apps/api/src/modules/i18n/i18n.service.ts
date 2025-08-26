import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';

export type Locale = 'es' | 'en' | 'pt-BR';

interface TranslationParams {
  [key: string]: string | number;
}

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private readonly translations = new Map<string, any>();
  private readonly cachePrefix = 'i18n:';
  private readonly cacheTTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    this.loadStaticTranslations();
  }

  /**
   * Load static translation files from filesystem
   */
  private loadStaticTranslations() {
    const locales: Locale[] = ['es', 'en', 'pt-BR'];
    const translationsDir = path.join(__dirname, '../../../locales');

    locales.forEach(locale => {
      const localeDir = path.join(translationsDir, locale);
      
      try {
        if (fs.existsSync(localeDir)) {
          const files = fs.readdirSync(localeDir);
          
          files.forEach(file => {
            if (file.endsWith('.json')) {
              const namespace = file.replace('.json', '');
              const filePath = path.join(localeDir, file);
              const content = fs.readFileSync(filePath, 'utf-8');
              const key = `${locale}.${namespace}`;
              
              this.translations.set(key, JSON.parse(content));
              this.logger.log(`Loaded translations: ${key}`);
            }
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to load translations for ${locale}:`, error);
      }
    });
  }

  /**
   * Get translation for a given key
   */
  async translate(
    key: string,
    locale: Locale = 'es',
    params?: TranslationParams,
    namespace = 'common'
  ): Promise<string> {
    // Try cache first
    const cacheKey = `${this.cachePrefix}${locale}:${namespace}:${key}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return this.interpolate(cached, params);
    }

    // Try static translations
    const staticTranslation = this.getStaticTranslation(key, locale, namespace);
    if (staticTranslation) {
      await this.redis.set(cacheKey, staticTranslation, this.cacheTTL);
      return this.interpolate(staticTranslation, params);
    }

    // Try database
    const dbTranslation = await this.getDatabaseTranslation(key, locale, namespace);
    if (dbTranslation) {
      await this.redis.set(cacheKey, dbTranslation, this.cacheTTL);
      return this.interpolate(dbTranslation, params);
    }

    // Fallback to default locale
    if (locale !== 'es') {
      return this.translate(key, 'es', params, namespace);
    }

    // Return key if no translation found
    this.logger.warn(`Translation not found: ${locale}.${namespace}.${key}`);
    return key;
  }

  /**
   * Get static translation from memory
   */
  private getStaticTranslation(key: string, locale: Locale, namespace: string): string | null {
    const translations = this.translations.get(`${locale}.${namespace}`);
    if (!translations) return null;

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  /**
   * Get translation from database
   */
  private async getDatabaseTranslation(
    key: string,
    locale: Locale,
    namespace: string
  ): Promise<string | null> {
    try {
      const translation = await this.prisma.translation.findFirst({
        where: {
          key: `${namespace}.${key}`,
          locale,
        },
      });

      return translation?.value || null;
    } catch (error) {
      this.logger.error('Database translation fetch failed:', error);
      return null;
    }
  }

  /**
   * Interpolate parameters into translation string
   */
  private interpolate(text: string, params?: TranslationParams): string {
    if (!params) return text;

    return Object.entries(params).reduce(
      (str, [key, value]) => str.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
      text
    );
  }

  /**
   * Translate error messages
   */
  async translateError(
    errorCode: string,
    locale: Locale = 'es',
    params?: TranslationParams
  ): Promise<string> {
    return this.translate(errorCode, locale, params, 'errors');
  }

  /**
   * Translate email templates
   */
  async translateEmail(
    templateKey: string,
    locale: Locale = 'es',
    params?: TranslationParams
  ): Promise<{ subject: string; body: string }> {
    const [subject, body] = await Promise.all([
      this.translate(`${templateKey}.subject`, locale, params, 'emails'),
      this.translate(`${templateKey}.body`, locale, params, 'emails'),
    ]);

    return { subject, body };
  }

  /**
   * Get all translations for a namespace
   */
  async getNamespaceTranslations(
    namespace: string,
    locale: Locale = 'es'
  ): Promise<Record<string, any>> {
    // Check static translations first
    const staticKey = `${locale}.${namespace}`;
    if (this.translations.has(staticKey)) {
      return this.translations.get(staticKey);
    }

    // Fetch from database
    const dbTranslations = await this.prisma.translation.findMany({
      where: {
        key: { startsWith: `${namespace}.` },
        locale,
      },
    });

    const result: Record<string, any> = {};
    
    dbTranslations.forEach(t => {
      const keys = t.key.replace(`${namespace}.`, '').split('.');
      let current = result;
      
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = t.value;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    });

    return result;
  }

  /**
   * Format number according to locale
   */
  formatNumber(num: number, locale: Locale = 'es'): string {
    return new Intl.NumberFormat(locale === 'pt-BR' ? 'pt-BR' : locale).format(num);
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, locale: Locale = 'es', currency?: string): string {
    const currencyMap: Record<Locale, string> = {
      'es': 'MXN',
      'en': 'USD',
      'pt-BR': 'BRL'
    };
    
    const localeCurrency = currency || currencyMap[locale];
    
    return new Intl.NumberFormat(locale === 'pt-BR' ? 'pt-BR' : locale, {
      style: 'currency',
      currency: localeCurrency
    }).format(amount);
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date | string, locale: Locale = 'es'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : locale).format(dateObj);
  }

  /**
   * Validate locale
   */
  isValidLocale(locale: string): locale is Locale {
    return ['es', 'en', 'pt-BR'].includes(locale);
  }

  /**
   * Get user's preferred locale
   */
  async getUserLocale(userId: string): Promise<Locale> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLocale: true },
      });

      if (user?.preferredLocale && this.isValidLocale(user.preferredLocale)) {
        return user.preferredLocale as Locale;
      }
    } catch (error) {
      this.logger.error('Failed to get user locale:', error);
    }

    return 'es';
  }

  /**
   * Update user's preferred locale
   */
  async updateUserLocale(userId: string, locale: Locale): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { preferredLocale: locale },
      });
    } catch (error) {
      this.logger.error('Failed to update user locale:', error);
    }
  }
}