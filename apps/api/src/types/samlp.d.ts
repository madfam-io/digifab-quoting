declare module 'samlp' {
  export interface SamlpOptions {
    issuer: string;
    cert: string;
    key?: string;
    audience?: string;
    recipient?: string;
    destination?: string;
    sessionIndex?: string;
    nameIdentifier?: string;
    nameIdentifierFormat?: string;
    authnContextClassRef?: string;
    signatureAlgorithm?: string;
    digestAlgorithm?: string;
    lifetimeInSeconds?: number;
    entryPoint?: string;
    callbackUrl?: string;
  }

  export interface ParsedRequest {
    id: string;
    issuer: string;
    destination?: string;
    assertionConsumerServiceURL?: string;
  }

  export interface ParsedResponse {
    user: {
      email?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      [key: string]: any;
    };
    sessionIndex?: string;
  }

  export function parseRequest(
    req: any,
    callback: (err: Error | null, data: ParsedRequest) => void,
  ): void;
  export function getSamlResponse(
    options: SamlpOptions,
    user: any,
    callback: (err: Error | null, response: string) => void,
  ): void;
  export function getSamlRequestUrl(
    options: any,
    callback: (err: Error | null, url: string) => void,
  ): void;
  export function parseResponse(
    options: any,
    callback: (err: Error | null, profile: ParsedResponse) => void,
  ): void;
  export function auth(options: any): any;
}
