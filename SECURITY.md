# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Cotiza, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security@madfam.io with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Measures

### Authentication & Authorization

- **Janua SSO Integration**: Enterprise authentication via Janua identity provider
- **Multi-Tenant Isolation**: Strict tenant data separation at database level
- **API Key Management**: Secure API key generation with scoped permissions
- **Role-Based Access**: Admin, Operator, and Customer role separation

### Payment Security

- **Janua Payment Gateway**: All payments processed through PCI-compliant Janua
- **No Card Storage**: Credit card data never touches Cotiza servers
- **Webhook Verification**: Cryptographic signature verification on all webhooks
- **Audit Trail**: Complete payment history logging

### Data Protection

- **Transport Security**: TLS 1.3 enforced for all connections
- **Database Encryption**: PostgreSQL with encrypted connections and at-rest encryption
- **File Storage**: AWS S3 with server-side encryption (AES-256)
- **Quote Data**: Customer quotes encrypted at rest
- **PII Handling**: Minimal PII collection, encrypted storage

### File Upload Security

- **Type Validation**: Strict file type checking (STL, OBJ, STEP only)
- **Size Limits**: Maximum file size enforced (100MB default)
- **Malware Scanning**: Files scanned before processing
- **Sandboxed Processing**: File analysis in isolated containers
- **Content Validation**: 3D file structure validation before acceptance

### API Security

- **Rate Limiting**: Per-tenant and per-endpoint rate limits
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM
- **CORS Configuration**: Strict origin allowlisting

### Infrastructure Security

- **Container Isolation**: Docker containers with minimal privileges
- **Network Segmentation**: Internal services not exposed to internet
- **Secret Rotation**: Regular credential rotation schedule
- **Dependency Scanning**: Automated via Dependabot and Snyk

## Multi-Tenant Security

Cotiza implements strict multi-tenant isolation:

```
- Database: Row-level security policies per tenant
- Storage: Tenant-prefixed S3 paths with IAM policies
- Cache: Redis key namespacing per tenant
- Logs: Tenant ID in all log entries for audit
```

## Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.janua.io;
X-Frame-Options: SAMEORIGIN (for embed support)
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Incident Response

1. **Detection**: Automated alerting on anomalous patterns
2. **Containment**: Immediate tenant isolation if breach suspected
3. **Notification**: Affected tenants notified within 24 hours
4. **Recovery**: Full incident report within 7 days

## Compliance

- PCI DSS compliant payment handling (via Janua)
- GDPR compliant for EU customers
- Mexico's LFPDPPP compliance

## Contact

Security Team: security@madfam.io
