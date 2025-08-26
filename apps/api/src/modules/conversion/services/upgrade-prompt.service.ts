import { Injectable, Logger } from '@nestjs/common';
import { ConversionTrackingService, UpgradeTrigger, TriggerType, ConversionStage } from './conversion-tracking.service';
import { UsageTrackingService, UsageEventType } from '@/modules/billing/services/usage-tracking.service';
import { PricingTierService } from '@/modules/billing/services/pricing-tier.service';
import { TenantContextService } from '@/modules/tenant/tenant-context.service';

export interface UpgradePrompt {
  id: string;
  type: PromptType;
  priority: number;
  title: string;
  message: string;
  cta: string;
  ctaUrl: string;
  dismissible: boolean;
  context: UpgradePromptContext;
  expiresAt?: Date;
  metadata: Record<string, unknown>;
}

export enum PromptType {
  MODAL = 'modal',
  BANNER = 'banner',
  INLINE = 'inline',
  TOAST = 'toast',
  PAGE_GATE = 'page_gate',
  FEATURE_GATE = 'feature_gate',
}

export interface UpgradePromptContext {
  currentUsage?: Record<UsageEventType, number>;
  limits?: Record<UsageEventType, number>;
  overage?: Record<UsageEventType, number>;
  currentTier?: string;
  suggestedTier?: string;
  potentialSavings?: number;
  featuresBenefits?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PromptRule {
  id: string;
  trigger: TriggerType;
  stage: ConversionStage[];
  conditions: PromptCondition[];
  template: UpgradePrompt;
  cooldownHours: number;
  maxShowCount: number;
  active: boolean;
}

export interface PromptCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

@Injectable()
export class UpgradePromptService {
  private readonly logger = new Logger(UpgradePromptService.name);
  private readonly PROMPT_KEY_PREFIX = 'upgrade_prompts';
  private readonly SHOWN_KEY_PREFIX = 'prompts_shown';

  constructor(
    private readonly conversionTracking: ConversionTrackingService,
    private readonly usageTracking: UsageTrackingService,
    private readonly pricingTierService: PricingTierService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async getUpgradePrompts(userId: string, context: 'dashboard' | 'quotes' | 'files' | 'billing' = 'dashboard'): Promise<UpgradePrompt[]> {
    try {
      const funnel = await this.conversionTracking.getConversionFunnel(userId);
      if (!funnel) return [];

      const triggers = await this.conversionTracking.getUpgradeTriggers(userId, 10);
      const prompts: UpgradePrompt[] = [];

      for (const trigger of triggers) {
        const prompt = await this.createPromptFromTrigger(userId, trigger, context);
        if (prompt && await this.shouldShowPrompt(userId, prompt)) {
          prompts.push(prompt);
        }
      }

      // Sort by priority (highest first)
      return prompts.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      this.logger.error(`Failed to get upgrade prompts for user ${userId}: ${error.message}`);
      return [];
    }
  }

  private async createPromptFromTrigger(userId: string, trigger: UpgradeTrigger, context: string): Promise<UpgradePrompt | null> {
    const tenantId = this.tenantContext.getTenantId();
    const currentUsage = await this.usageTracking.getUsageSummary(tenantId);
    
    const promptContext: UpgradePromptContext = {
      currentUsage: currentUsage.events,
      currentTier: currentUsage.billingTier,
      urgency: this.calculateUrgency(trigger, currentUsage.events),
    };

    const basePrompt: Partial<UpgradePrompt> = {
      id: `${trigger.type}_${Date.now()}`,
      priority: trigger.priority,
      dismissible: true,
      context: promptContext,
      metadata: { triggerId: trigger.type, context, userId },
    };

    switch (trigger.type) {
      case TriggerType.USAGE_LIMIT:
        return this.createUsageLimitPrompt(basePrompt, trigger, currentUsage.events);
        
      case TriggerType.FEATURE_GATE:
        return this.createFeatureGatePrompt(basePrompt, trigger, context);
        
      case TriggerType.VALUE_DEMONSTRATION:
        return this.createValueDemonstrationPrompt(basePrompt, trigger, currentUsage.events);
        
      case TriggerType.TIME_BASED:
        return this.createTimeBased Prompt(basePrompt, trigger);
        
      case TriggerType.BEHAVIOR_BASED:
        return this.createBehaviorBasedPrompt(basePrompt, trigger);
        
      default:
        return null;
    }
  }

  private createUsageLimitPrompt(basePrompt: Partial<UpgradePrompt>, trigger: UpgradeTrigger, usage: Record<UsageEventType, number>): UpgradePrompt {
    const limitType = trigger.context.eventType as UsageEventType;
    const current = usage[limitType] || 0;
    
    return {
      ...basePrompt,
      type: PromptType.MODAL,
      title: "Usage Limit Reached",
      message: `You've used ${current} ${this.getUsageTypeLabel(limitType)} this month. Upgrade to continue with unlimited access.`,
      cta: "Upgrade to Pro",
      ctaUrl: "/billing/upgrade?plan=pro&trigger=usage_limit",
      dismissible: false, // Force user decision
      context: {
        ...basePrompt.context!,
        urgency: 'critical',
        featuresBenefits: [
          `Unlimited ${this.getUsageTypeLabel(limitType)}`,
          'Priority support',
          'Advanced features',
          'Team collaboration',
        ],
      },
    } as UpgradePrompt;
  }

  private createFeatureGatePrompt(basePrompt: Partial<UpgradePrompt>, trigger: UpgradeTrigger, context: string): UpgradePrompt {
    const features = this.getContextFeatures(context);
    
    return {
      ...basePrompt,
      type: PromptType.FEATURE_GATE,
      title: "Unlock Pro Features",
      message: `This feature is available in our Pro plan. Upgrade to access ${features.join(', ')} and more.`,
      cta: "See Pro Features",
      ctaUrl: "/billing/upgrade?plan=pro&trigger=feature_gate",
      dismissible: true,
      context: {
        ...basePrompt.context!,
        urgency: 'medium',
        featuresBenefits: features,
      },
    } as UpgradePrompt;
  }

  private createValueDemonstrationPrompt(basePrompt: Partial<UpgradePrompt>, trigger: UpgradeTrigger, usage: Record<UsageEventType, number>): UpgradePrompt {
    const quotesCreated = usage[UsageEventType.QUOTE_GENERATION] || 0;
    const potentialSavings = quotesCreated * 0.5; // Estimate time savings
    
    return {
      ...basePrompt,
      type: PromptType.BANNER,
      title: "You're Getting Great Value!",
      message: `You've created ${quotesCreated} quotes and saved approximately ${potentialSavings.toFixed(1)} hours. Upgrade for unlimited access and advanced features.`,
      cta: "Upgrade Now",
      ctaUrl: "/billing/upgrade?plan=pro&trigger=value_demo",
      dismissible: true,
      context: {
        ...basePrompt.context!,
        urgency: 'low',
        potentialSavings,
        featuresBenefits: [
          'Unlimited quotes',
          'Faster processing',
          'Advanced analytics',
          'API access',
        ],
      },
    } as UpgradePrompt;
  }

  private createTimeBasedPrompt(basePrompt: Partial<UpgradePrompt>, trigger: UpgradeTrigger): UpgradePrompt {
    return {
      ...basePrompt,
      type: PromptType.TOAST,
      title: "Special Offer",
      message: "You've been using Cotiza Studio for a week! Upgrade now and save 20% on your first month.",
      cta: "Claim Offer",
      ctaUrl: "/billing/upgrade?plan=pro&trigger=time_based&discount=20",
      dismissible: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      context: {
        ...basePrompt.context!,
        urgency: 'medium',
        potentialSavings: 20, // Discount percentage
      },
    } as UpgradePrompt;
  }

  private createBehaviorBasedPrompt(basePrompt: Partial<UpgradePrompt>, trigger: UpgradeTrigger): UpgradePrompt {
    return {
      ...basePrompt,
      type: PromptType.INLINE,
      title: "Power User Detected!",
      message: "Based on your usage patterns, you'd benefit from our Pro features. Get advanced tools and priority support.",
      cta: "Upgrade to Pro",
      ctaUrl: "/billing/upgrade?plan=pro&trigger=behavior",
      dismissible: true,
      context: {
        ...basePrompt.context!,
        urgency: 'medium',
        featuresBenefits: [
          'Advanced file analysis',
          'Custom branding',
          'Team collaboration',
          'Priority support',
        ],
      },
    } as UpgradePrompt;
  }

  private async shouldShowPrompt(userId: string, prompt: UpgradePrompt): Promise<boolean> {
    // Check if prompt was recently shown
    const shownKey = `${this.SHOWN_KEY_PREFIX}:${userId}:${prompt.type}:${prompt.metadata.triggerId}`;
    const lastShown = await this.usageTracking['redis'].get(shownKey);
    
    if (lastShown) {
      const hoursSinceShown = (Date.now() - parseInt(lastShown as string)) / (1000 * 60 * 60);
      const cooldownHours = this.getCooldownHours(prompt.type);
      
      if (hoursSinceShown < cooldownHours) {
        return false;
      }
    }

    // Check if prompt is expired
    if (prompt.expiresAt && prompt.expiresAt < new Date()) {
      return false;
    }

    // Additional business logic for prompt display
    return true;
  }

  async markPromptShown(userId: string, promptId: string, prompt: UpgradePrompt): Promise<void> {
    const shownKey = `${this.SHOWN_KEY_PREFIX}:${userId}:${prompt.type}:${prompt.metadata.triggerId}`;
    await this.usageTracking['redis'].set(shownKey, Date.now().toString(), 7 * 24 * 60 * 60); // 7 days

    // Track analytics
    await this.conversionTracking.markTriggerShown(userId, prompt.metadata.triggerId as any);
    
    this.logger.debug(`Marked prompt ${promptId} as shown for user ${userId}`);
  }

  async markPromptClicked(userId: string, promptId: string, prompt: UpgradePrompt): Promise<void> {
    // Track click analytics
    await this.conversionTracking.markTriggerClicked(userId, prompt.metadata.triggerId as any);
    
    this.logger.debug(`Marked prompt ${promptId} as clicked for user ${userId}`);
  }

  async markPromptDismissed(userId: string, promptId: string, prompt: UpgradePrompt): Promise<void> {
    // Set longer cooldown for dismissed prompts
    const dismissedKey = `${this.SHOWN_KEY_PREFIX}:${userId}:${prompt.type}:${prompt.metadata.triggerId}:dismissed`;
    await this.usageTracking['redis'].set(dismissedKey, Date.now().toString(), 24 * 60 * 60); // 24 hours
    
    this.logger.debug(`Marked prompt ${promptId} as dismissed for user ${userId}`);
  }

  private calculateUrgency(trigger: UpgradeTrigger, usage: Record<UsageEventType, number>): 'low' | 'medium' | 'high' | 'critical' {
    switch (trigger.type) {
      case TriggerType.USAGE_LIMIT:
        return 'critical';
      case TriggerType.FEATURE_GATE:
        return 'high';
      case TriggerType.BEHAVIOR_BASED:
        return 'medium';
      case TriggerType.VALUE_DEMONSTRATION:
        return 'low';
      case TriggerType.TIME_BASED:
        return 'medium';
      default:
        return 'low';
    }
  }

  private getUsageTypeLabel(eventType: UsageEventType): string {
    const labels = {
      [UsageEventType.API_CALL]: 'API calls',
      [UsageEventType.QUOTE_GENERATION]: 'quotes',
      [UsageEventType.FILE_ANALYSIS]: 'file analyses',
      [UsageEventType.DFM_REPORT]: 'DFM reports',
      [UsageEventType.PDF_GENERATION]: 'PDF downloads',
      [UsageEventType.STORAGE_GB_HOUR]: 'GB-hours of storage',
      [UsageEventType.COMPUTE_SECONDS]: 'compute seconds',
    };
    
    return labels[eventType] || 'units';
  }

  private getContextFeatures(context: string): string[] {
    const contextFeatures = {
      dashboard: ['Advanced analytics', 'Custom dashboards', 'Data export'],
      quotes: ['Unlimited quotes', 'Advanced templates', 'Custom branding'],
      files: ['Unlimited file storage', 'Advanced analysis', 'Batch processing'],
      billing: ['Usage analytics', 'Cost optimization', 'Custom reporting'],
    };
    
    return contextFeatures[context] || ['Advanced features', 'Priority support', 'Unlimited access'];
  }

  private getCooldownHours(promptType: PromptType): number {
    const cooldowns = {
      [PromptType.MODAL]: 24, // 24 hours
      [PromptType.BANNER]: 8, // 8 hours
      [PromptType.INLINE]: 4, // 4 hours
      [PromptType.TOAST]: 2, // 2 hours
      [PromptType.PAGE_GATE]: 48, // 48 hours
      [PromptType.FEATURE_GATE]: 12, // 12 hours
    };
    
    return cooldowns[promptType] || 8;
  }

  // A/B testing methods
  async getPromptVariant(userId: string, promptType: string): Promise<'control' | 'variant_a' | 'variant_b'> {
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashUserId(userId + promptType);
    const bucket = hash % 100;
    
    if (bucket < 33) return 'control';
    if (bucket < 66) return 'variant_a';
    return 'variant_b';
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}