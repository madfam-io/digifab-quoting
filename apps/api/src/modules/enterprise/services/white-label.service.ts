import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export interface WhiteLabelConfiguration {
  tenantId: string;
  branding: BrandingConfiguration;
  customization: CustomizationConfiguration;
  domain: DomainConfiguration;
  features: FeatureConfiguration;
  deployment: DeploymentConfiguration;
}

export interface BrandingConfiguration {
  // Visual Identity
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Logo Configuration
  logoUrl?: string;
  logoSquareUrl?: string;
  faviconUrl?: string;
  watermarkUrl?: string;
  
  // Typography
  primaryFont?: string;
  secondaryFont?: string;
  fontWeights?: Record<string, number>;
  
  // Company Information
  companyName: string;
  companyDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
}

export interface CustomizationConfiguration {
  // UI Customization
  headerLayout: 'default' | 'minimal' | 'custom';
  sidebarStyle: 'default' | 'compact' | 'hidden';
  footerContent?: string;
  customCSS?: string;
  customJS?: string;
  
  // Content Customization
  welcomeMessage?: string;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  helpDocumentationUrl?: string;
  
  // Feature Labels
  customLabels?: Record<string, string>;
  customMessages?: Record<string, string>;
  
  // Workflow Customization
  customWorkflows?: Array<{
    name: string;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      required: boolean;
    }>;
  }>;
}

export interface DomainConfiguration {
  customDomain?: string;
  subdomain?: string;
  sslCertificateId?: string;
  redirectDomains?: string[];
  domainVerificationStatus: 'pending' | 'verified' | 'failed';
  dnsRecords?: Array<{
    type: 'CNAME' | 'A' | 'TXT';
    name: string;
    value: string;
    verified: boolean;
  }>;
}

export interface FeatureConfiguration {
  // Enabled Features
  enabledFeatures: string[];
  disabledFeatures: string[];
  
  // Feature Limits
  customLimits?: Record<string, number>;
  
  // Integration Settings
  enabledIntegrations: string[];
  customIntegrations?: Array<{
    name: string;
    type: 'webhook' | 'api' | 'sso';
    configuration: Record<string, unknown>;
  }>;
  
  // API Configuration
  customApiEndpoints?: Array<{
    path: string;
    method: string;
    handler: string;
  }>;
}

export interface DeploymentConfiguration {
  deploymentType: 'shared' | 'dedicated' | 'on_premise';
  region?: string;
  scalingConfiguration?: {
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
    targetMemory: number;
  };
  backupConfiguration?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    retentionDays: number;
  };
  monitoringConfiguration?: {
    enabled: boolean;
    alertEndpoints: string[];
    customMetrics: string[];
  };
}

@Injectable()
export class WhiteLabelService {
  private readonly logger = new Logger(WhiteLabelService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('S3_BUCKET', '');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
    });
  }

  async createWhiteLabelConfiguration(config: WhiteLabelConfiguration): Promise<WhiteLabelConfiguration> {
    // Validate configuration
    this.validateWhiteLabelConfiguration(config);

    // Store configuration in database
    const savedConfig = await this.prisma.whiteLabelConfiguration.create({
      data: {
        tenantId: config.tenantId,
        branding: JSON.stringify(config.branding) as any,
        customization: JSON.stringify(config.customization) as any,
        domain: JSON.stringify(config.domain) as any,
        features: JSON.stringify(config.features) as any,
        deployment: JSON.stringify(config.deployment) as any,
      },
    });

    // Cache configuration for fast access
    await this.cacheConfiguration(config.tenantId, config);

    // Initiate domain setup if custom domain is specified
    if (config.domain.customDomain) {
      await this.initiateDomainSetup(config.tenantId, config.domain);
    }

    this.logger.log(`Created white-label configuration for tenant ${config.tenantId}`);

    return config;
  }

  async getWhiteLabelConfiguration(tenantId: string): Promise<WhiteLabelConfiguration | null> {
    // Try cache first
    const cached = await this.getCachedConfiguration(tenantId);
    if (cached) return cached;

    // Fallback to database
    const config = await this.prisma.whiteLabelConfiguration.findUnique({
      where: { tenantId },
    });

    if (!config) return null;

    const whiteLabelConfig: WhiteLabelConfiguration = {
      tenantId: config.tenantId,
      branding: config.branding as BrandingConfiguration,
      customization: config.customization as CustomizationConfiguration,
      domain: config.domain as DomainConfiguration,
      features: config.features as FeatureConfiguration,
      deployment: config.deployment as DeploymentConfiguration,
    };

    // Cache for future requests
    await this.cacheConfiguration(tenantId, whiteLabelConfig);

    return whiteLabelConfig;
  }

  async updateWhiteLabelConfiguration(
    tenantId: string,
    updates: Partial<WhiteLabelConfiguration>
  ): Promise<WhiteLabelConfiguration> {
    const existingConfig = await this.getWhiteLabelConfiguration(tenantId);
    if (!existingConfig) {
      throw new Error('White-label configuration not found');
    }

    const updatedConfig = {
      ...existingConfig,
      ...updates,
    };

    this.validateWhiteLabelConfiguration(updatedConfig);

    await this.prisma.whiteLabelConfiguration.update({
      where: { tenantId },
      data: {
        branding: updatedConfig.branding,
        customization: updatedConfig.customization,
        domain: updatedConfig.domain,
        features: updatedConfig.features,
        deployment: updatedConfig.deployment,
      },
    });

    // Update cache
    await this.cacheConfiguration(tenantId, updatedConfig);

    // Handle domain changes
    if (updates.domain?.customDomain !== existingConfig.domain.customDomain) {
      await this.handleDomainChange(tenantId, existingConfig.domain, updates.domain!);
    }

    this.logger.log(`Updated white-label configuration for tenant ${tenantId}`);

    return updatedConfig;
  }

  async uploadBrandingAsset(
    tenantId: string,
    assetType: 'logo' | 'logoSquare' | 'favicon' | 'watermark',
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<{ url: string }> {
    const fileExtension = this.getFileExtension(mimeType);
    const key = `white-label/${tenantId}/branding/${assetType}${fileExtension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000', // 1 year
        Metadata: {
          tenantId,
          assetType,
          uploadedAt: new Date().toISOString(),
        },
      }),
    );

    const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    // Update configuration with new asset URL
    const config = await this.getWhiteLabelConfiguration(tenantId);
    if (config) {
      const brandingUpdate = { ...config.branding };
      switch (assetType) {
        case 'logo':
          brandingUpdate.logoUrl = url;
          break;
        case 'logoSquare':
          brandingUpdate.logoSquareUrl = url;
          break;
        case 'favicon':
          brandingUpdate.faviconUrl = url;
          break;
        case 'watermark':
          brandingUpdate.watermarkUrl = url;
          break;
      }

      await this.updateWhiteLabelConfiguration(tenantId, { branding: brandingUpdate });
    }

    return { url };
  }

  async deleteBrandingAsset(tenantId: string, assetType: 'logo' | 'logoSquare' | 'favicon' | 'watermark'): Promise<void> {
    const config = await this.getWhiteLabelConfiguration(tenantId);
    if (!config) return;

    let assetUrl: string | undefined;
    switch (assetType) {
      case 'logo':
        assetUrl = config.branding.logoUrl;
        break;
      case 'logoSquare':
        assetUrl = config.branding.logoSquareUrl;
        break;
      case 'favicon':
        assetUrl = config.branding.faviconUrl;
        break;
      case 'watermark':
        assetUrl = config.branding.watermarkUrl;
        break;
    }

    if (assetUrl) {
      const key = assetUrl.split('.com/')[1]; // Extract S3 key from URL
      
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      // Update configuration to remove asset URL
      const brandingUpdate = { ...config.branding };
      switch (assetType) {
        case 'logo':
          brandingUpdate.logoUrl = undefined;
          break;
        case 'logoSquare':
          brandingUpdate.logoSquareUrl = undefined;
          break;
        case 'favicon':
          brandingUpdate.faviconUrl = undefined;
          break;
        case 'watermark':
          brandingUpdate.watermarkUrl = undefined;
          break;
      }

      await this.updateWhiteLabelConfiguration(tenantId, { branding: brandingUpdate });
    }
  }

  async initiateDomainSetup(tenantId: string, domainConfig: DomainConfiguration): Promise<{
    dnsRecords: Array<{ type: string; name: string; value: string; }>;
    verificationInstructions: string;
  }> {
    if (!domainConfig.customDomain) {
      throw new Error('Custom domain not specified');
    }

    // Generate DNS records needed for domain verification and setup
    const dnsRecords = [
      {
        type: 'CNAME',
        name: domainConfig.customDomain,
        value: `${tenantId}.madfam-white-label.com`,
      },
      {
        type: 'TXT',
        name: `_madfam-verify.${domainConfig.customDomain}`,
        value: `madfam-site-verification=${this.generateVerificationToken(tenantId)}`,
      },
    ];

    // Update domain configuration with DNS records
    domainConfig.dnsRecords = dnsRecords.map(record => ({
      ...record,
      verified: false,
    }));
    domainConfig.domainVerificationStatus = 'pending';

    await this.updateWhiteLabelConfiguration(tenantId, { domain: domainConfig });

    const verificationInstructions = `
To complete domain setup for ${domainConfig.customDomain}:

1. Add the following DNS records to your domain:
   ${dnsRecords.map(record => `   ${record.type}: ${record.name} -> ${record.value}`).join('\n')}

2. DNS changes may take up to 24 hours to propagate.

3. Once DNS is updated, verification will happen automatically.

For assistance, contact support@cotiza.studio
    `;

    this.logger.log(`Initiated domain setup for ${domainConfig.customDomain} (tenant: ${tenantId})`);

    return {
      dnsRecords,
      verificationInstructions,
    };
  }

  async verifyCustomDomain(tenantId: string): Promise<{ verified: boolean; errors?: string[] }> {
    const config = await this.getWhiteLabelConfiguration(tenantId);
    if (!config?.domain.customDomain) {
      return { verified: false, errors: ['No custom domain configured'] };
    }

    const errors: string[] = [];
    let allVerified = true;

    // Verify each DNS record
    for (const record of config.domain.dnsRecords || []) {
      try {
        const verified = await this.verifyDNSRecord(record.type as any, record.name, record.value);
        record.verified = verified;
        
        if (!verified) {
          allVerified = false;
          errors.push(`${record.type} record for ${record.name} not found or incorrect`);
        }
      } catch (error) {
        allVerified = false;
        errors.push(`Failed to verify ${record.type} record: ${error.message}`);
      }
    }

    // Update verification status
    config.domain.domainVerificationStatus = allVerified ? 'verified' : 'failed';
    await this.updateWhiteLabelConfiguration(tenantId, { domain: config.domain });

    if (allVerified) {
      this.logger.log(`Domain ${config.domain.customDomain} verified for tenant ${tenantId}`);
      await this.provisionSSLCertificate(tenantId, config.domain.customDomain);
    }

    return {
      verified: allVerified,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private async cacheConfiguration(tenantId: string, config: WhiteLabelConfiguration): Promise<void> {
    const key = `white_label_config:${tenantId}`;
    await this.redis.set(key, JSON.stringify(config), 60 * 60); // Cache for 1 hour
  }

  private async getCachedConfiguration(tenantId: string): Promise<WhiteLabelConfiguration | null> {
    const key = `white_label_config:${tenantId}`;
    const cached = await this.redis.get(key);
    
    if (cached) {
      try {
        return JSON.parse(cached as string);
      } catch {
        await this.redis.del(key);
      }
    }
    
    return null;
  }

  private validateWhiteLabelConfiguration(config: WhiteLabelConfiguration): void {
    // Validate branding configuration
    if (!config.branding.companyName) {
      throw new Error('Company name is required');
    }

    // Validate colors are valid hex colors
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'];
    for (const field of colorFields) {
      const color = config.branding[field as keyof BrandingConfiguration] as string;
      if (color && !this.isValidHexColor(color)) {
        throw new Error(`Invalid hex color for ${field}: ${color}`);
      }
    }

    // Validate domain configuration
    if (config.domain.customDomain && !this.isValidDomain(config.domain.customDomain)) {
      throw new Error(`Invalid custom domain: ${config.domain.customDomain}`);
    }

    // Validate feature configuration
    if (!Array.isArray(config.features.enabledFeatures)) {
      throw new Error('Enabled features must be an array');
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'image/x-icon': '.ico',
    };
    return extensions[mimeType] || '';
  }

  private generateVerificationToken(tenantId: string): string {
    return Buffer.from(`${tenantId}-${Date.now()}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  private async handleDomainChange(
    tenantId: string,
    oldDomain: DomainConfiguration,
    newDomain: DomainConfiguration
  ): Promise<void> {
    if (newDomain.customDomain) {
      await this.initiateDomainSetup(tenantId, newDomain);
    }

    // Clean up old domain if necessary
    if (oldDomain.customDomain && oldDomain.customDomain !== newDomain.customDomain) {
      this.logger.log(`Domain changed from ${oldDomain.customDomain} to ${newDomain.customDomain} for tenant ${tenantId}`);
    }
  }

  private async verifyDNSRecord(type: 'CNAME' | 'A' | 'TXT', name: string, expectedValue: string): Promise<boolean> {
    // Implementation would use DNS lookup libraries like 'dns' or external services
    // For now, return mock verification
    this.logger.debug(`Verifying ${type} record: ${name} -> ${expectedValue}`);
    return true; // Mock verification
  }

  private async provisionSSLCertificate(tenantId: string, domain: string): Promise<void> {
    // Implementation would integrate with AWS Certificate Manager or Let's Encrypt
    this.logger.log(`Provisioning SSL certificate for ${domain} (tenant: ${tenantId})`);
  }
}