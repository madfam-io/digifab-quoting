import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as saml from 'samlp';
import * as jwt from 'jsonwebtoken';

export interface SSOProvider {
  id: string;
  tenantId: string;
  name: string;
  type: SSOProviderType;
  enabled: boolean;
  configuration: SSOConfiguration;
  metadata?: Record<string, unknown>;
}

export enum SSOProviderType {
  SAML = 'saml',
  OIDC = 'oidc',
  AZURE_AD = 'azure_ad',
  OKTA = 'okta',
  GOOGLE_WORKSPACE = 'google_workspace',
}

export interface SSOConfiguration {
  // SAML Configuration
  samlEntryPoint?: string;
  samlCert?: string;
  samlIssuer?: string;
  samlCallbackUrl?: string;
  samlLogoutUrl?: string;
  
  // OIDC Configuration
  oidcDiscoveryUrl?: string;
  oidcClientId?: string;
  oidcClientSecret?: string;
  oidcScope?: string;
  oidcResponseType?: string;
  
  // Azure AD Configuration
  azureTenantId?: string;
  azureClientId?: string;
  azureClientSecret?: string;
  
  // Common Configuration
  attributeMapping?: AttributeMapping;
  roleMapping?: RoleMapping[];
  autoProvisionUsers?: boolean;
  defaultRole?: string;
}

export interface AttributeMapping {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  department?: string;
  title?: string;
  phone?: string;
}

export interface RoleMapping {
  ssoRole: string;
  internalRole: string;
  permissions?: string[];
}

export interface SSOLoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  isNewUser: boolean;
}

@Injectable()
export class SSOService {
  private readonly logger = new Logger(SSOService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createSSOProvider(tenantId: string, providerData: Partial<SSOProvider>): Promise<SSOProvider> {
    // Validate configuration based on provider type
    this.validateSSOConfiguration(providerData.type!, providerData.configuration!);

    const provider = await this.prisma.ssoProvider.create({
      data: {
        tenantId,
        name: providerData.name!,
        type: providerData.type!,
        enabled: providerData.enabled ?? true,
        configuration: providerData.configuration!,
        metadata: providerData.metadata || {},
      },
    });

    this.logger.log(`Created SSO provider ${provider.name} for tenant ${tenantId}`);

    return {
      id: provider.id,
      tenantId: provider.tenantId,
      name: provider.name,
      type: provider.type as SSOProviderType,
      enabled: provider.enabled,
      configuration: provider.configuration as SSOConfiguration,
      metadata: provider.metadata as Record<string, unknown>,
    };
  }

  async getSSOProviders(tenantId: string): Promise<SSOProvider[]> {
    const providers = await this.prisma.ssoProvider.findMany({
      where: { tenantId },
    });

    return providers.map(provider => ({
      id: provider.id,
      tenantId: provider.tenantId,
      name: provider.name,
      type: provider.type as SSOProviderType,
      enabled: provider.enabled,
      configuration: provider.configuration as SSOConfiguration,
      metadata: provider.metadata as Record<string, unknown>,
    }));
  }

  async updateSSOProvider(tenantId: string, providerId: string, updates: Partial<SSOProvider>): Promise<SSOProvider> {
    if (updates.configuration) {
      const provider = await this.prisma.ssoProvider.findFirst({
        where: { id: providerId, tenantId },
      });

      if (provider) {
        this.validateSSOConfiguration(provider.type as SSOProviderType, updates.configuration);
      }
    }

    const provider = await this.prisma.ssoProvider.update({
      where: { id: providerId },
      data: {
        name: updates.name,
        enabled: updates.enabled,
        configuration: updates.configuration,
        metadata: updates.metadata,
      },
    });

    return {
      id: provider.id,
      tenantId: provider.tenantId,
      name: provider.name,
      type: provider.type as SSOProviderType,
      enabled: provider.enabled,
      configuration: provider.configuration as SSOConfiguration,
      metadata: provider.metadata as Record<string, unknown>,
    };
  }

  async deleteSSOProvider(tenantId: string, providerId: string): Promise<void> {
    await this.prisma.ssoProvider.delete({
      where: { id: providerId },
    });

    this.logger.log(`Deleted SSO provider ${providerId} for tenant ${tenantId}`);
  }

  async initiateSSOLogin(tenantId: string, providerId: string, redirectUrl?: string): Promise<{ loginUrl: string }> {
    const provider = await this.prisma.ssoProvider.findFirst({
      where: { id: providerId, tenantId, enabled: true },
    });

    if (!provider) {
      throw new BadRequestException('SSO provider not found or disabled');
    }

    const config = provider.configuration as SSOConfiguration;
    let loginUrl: string;

    switch (provider.type) {
      case SSOProviderType.SAML:
        loginUrl = await this.initiateSAMLLogin(config, redirectUrl);
        break;
        
      case SSOProviderType.OIDC:
        loginUrl = await this.initiateOIDCLogin(config, redirectUrl);
        break;
        
      case SSOProviderType.AZURE_AD:
        loginUrl = await this.initiateAzureADLogin(config, redirectUrl);
        break;
        
      case SSOProviderType.OKTA:
        loginUrl = await this.initiateOktaLogin(config, redirectUrl);
        break;
        
      default:
        throw new BadRequestException('Unsupported SSO provider type');
    }

    return { loginUrl };
  }

  async handleSSOCallback(tenantId: string, providerId: string, callbackData: any): Promise<SSOLoginResult> {
    const provider = await this.prisma.ssoProvider.findFirst({
      where: { id: providerId, tenantId, enabled: true },
    });

    if (!provider) {
      throw new BadRequestException('SSO provider not found or disabled');
    }

    const config = provider.configuration as SSOConfiguration;
    let userProfile: any;

    switch (provider.type) {
      case SSOProviderType.SAML:
        userProfile = await this.handleSAMLCallback(config, callbackData);
        break;
        
      case SSOProviderType.OIDC:
        userProfile = await this.handleOIDCCallback(config, callbackData);
        break;
        
      case SSOProviderType.AZURE_AD:
        userProfile = await this.handleAzureADCallback(config, callbackData);
        break;
        
      default:
        throw new BadRequestException('Unsupported SSO provider type');
    }

    // Map SSO profile to internal user
    const mappedUser = await this.mapSSOUserProfile(tenantId, config, userProfile);
    
    // Create or update user
    const { user, isNewUser } = await this.createOrUpdateUser(tenantId, mappedUser);
    
    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      tokens,
      isNewUser,
    };
  }

  private async initiateSAMLLogin(config: SSOConfiguration, redirectUrl?: string): Promise<string> {
    // Implementation for SAML login initiation
    const samlOptions = {
      entryPoint: config.samlEntryPoint,
      issuer: config.samlIssuer,
      callbackUrl: config.samlCallbackUrl,
      cert: config.samlCert,
    };

    return new Promise((resolve, reject) => {
      saml.getSamlRequestUrl(samlOptions, (err: any, url: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }

  private async initiateOIDCLogin(config: SSOConfiguration, redirectUrl?: string): Promise<string> {
    // Implementation for OIDC login initiation
    const params = new URLSearchParams({
      client_id: config.oidcClientId!,
      response_type: config.oidcResponseType || 'code',
      scope: config.oidcScope || 'openid profile email',
      redirect_uri: redirectUrl || config.samlCallbackUrl!,
      state: this.generateState(),
    });

    const discoveryDoc = await this.fetchOIDCDiscovery(config.oidcDiscoveryUrl!);
    return `${discoveryDoc.authorization_endpoint}?${params.toString()}`;
  }

  private async initiateAzureADLogin(config: SSOConfiguration, redirectUrl?: string): Promise<string> {
    // Implementation for Azure AD login initiation
    const params = new URLSearchParams({
      client_id: config.azureClientId!,
      response_type: 'code',
      redirect_uri: redirectUrl || config.samlCallbackUrl!,
      response_mode: 'query',
      scope: 'openid profile email',
      state: this.generateState(),
    });

    return `https://login.microsoftonline.com/${config.azureTenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  private async initiateOktaLogin(config: SSOConfiguration, redirectUrl?: string): Promise<string> {
    // Similar to OIDC but with Okta-specific endpoints
    return this.initiateOIDCLogin(config, redirectUrl);
  }

  private async handleSAMLCallback(config: SSOConfiguration, callbackData: any): Promise<any> {
    // Implementation for SAML callback handling
    return new Promise((resolve, reject) => {
      saml.parseResponse({
        cert: config.samlCert,
        samlResponse: callbackData.SAMLResponse,
      }, (err: any, profile: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(profile);
        }
      });
    });
  }

  private async handleOIDCCallback(config: SSOConfiguration, callbackData: any): Promise<any> {
    // Implementation for OIDC callback handling
    const tokenResponse = await this.exchangeCodeForTokens(config, callbackData.code);
    return this.decodeIDToken(tokenResponse.id_token);
  }

  private async handleAzureADCallback(config: SSOConfiguration, callbackData: any): Promise<any> {
    // Similar to OIDC but with Azure AD-specific token exchange
    return this.handleOIDCCallback(config, callbackData);
  }

  private async mapSSOUserProfile(tenantId: string, config: SSOConfiguration, profile: any): Promise<any> {
    const mapping = config.attributeMapping || {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      name: 'name',
    };

    const mappedUser = {
      email: profile[mapping.email],
      firstName: profile[mapping.firstName!] || null,
      lastName: profile[mapping.lastName!] || null,
      name: profile[mapping.name!] || `${profile[mapping.firstName!]} ${profile[mapping.lastName!]}`.trim() || null,
      department: profile[mapping.department!] || null,
      title: profile[mapping.title!] || null,
      phone: profile[mapping.phone!] || null,
    };

    // Map roles
    const ssoRoles = Array.isArray(profile.roles) ? profile.roles : [profile.role].filter(Boolean);
    mappedUser.role = this.mapSSORole(config.roleMapping || [], ssoRoles) || config.defaultRole || 'customer';

    return mappedUser;
  }

  private mapSSORole(roleMapping: RoleMapping[], ssoRoles: string[]): string | null {
    for (const ssoRole of ssoRoles) {
      const mapping = roleMapping.find(m => m.ssoRole === ssoRole);
      if (mapping) {
        return mapping.internalRole;
      }
    }
    return null;
  }

  private async createOrUpdateUser(tenantId: string, userData: any): Promise<{ user: any; isNewUser: boolean }> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: userData.email,
        tenantId,
      },
    });

    let user: any;
    let isNewUser = false;

    if (existingUser) {
      // Update existing user
      user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          lastLogin: new Date(),
        },
      });
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          tenantId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          active: true,
          emailVerified: true, // SSO users are pre-verified
          lastLogin: new Date(),
        },
      });
      isNewUser = true;
    }

    return { user, isNewUser };
  }

  private async generateTokens(user: any): Promise<any> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = jwt.sign(payload, this.configService.get('JWT_SECRET')!, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ sub: user.id }, this.configService.get('JWT_SECRET')!, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  private validateSSOConfiguration(type: SSOProviderType, config: SSOConfiguration): void {
    switch (type) {
      case SSOProviderType.SAML:
        if (!config.samlEntryPoint || !config.samlCert || !config.samlIssuer) {
          throw new BadRequestException('SAML configuration missing required fields');
        }
        break;
        
      case SSOProviderType.OIDC:
        if (!config.oidcDiscoveryUrl || !config.oidcClientId || !config.oidcClientSecret) {
          throw new BadRequestException('OIDC configuration missing required fields');
        }
        break;
        
      case SSOProviderType.AZURE_AD:
        if (!config.azureTenantId || !config.azureClientId || !config.azureClientSecret) {
          throw new BadRequestException('Azure AD configuration missing required fields');
        }
        break;
        
      default:
        throw new BadRequestException('Invalid SSO provider type');
    }
  }

  private async fetchOIDCDiscovery(discoveryUrl: string): Promise<any> {
    // Fetch OIDC discovery document
    const response = await fetch(discoveryUrl);
    return response.json();
  }

  private async exchangeCodeForTokens(config: SSOConfiguration, code: string): Promise<any> {
    // Exchange authorization code for tokens
    const response = await fetch(config.oidcDiscoveryUrl!.replace('/.well-known/openid_configuration', '/oauth2/token'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.oidcClientId!,
        client_secret: config.oidcClientSecret!,
        code,
        redirect_uri: config.samlCallbackUrl!,
      }),
    });

    return response.json();
  }

  private decodeIDToken(idToken: string): any {
    // Decode JWT ID token
    return jwt.decode(idToken);
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}