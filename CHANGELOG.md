# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Migrated all payments from direct Stripe to Janua Payment Gateway
- Improved FFF (Fused Filament Fabrication) calculator accuracy

## [0.1.0] - 2024-11-27

### Added
- **Cotiza Studio** - Complete manufacturing quote calculator
- Multi-process support: 3D Printing (FDM/SLA/SLS), CNC, Laser Cutting, Sheet Metal
- Real-time pricing engine with material and process cost calculations
- `/try` demo route for instant quoting without signup
- Multi-tenant architecture for white-label deployments
- Janua Payment Gateway checkout integration
- Multi-currency support (USD, MXN, EUR)
- Bilingual interface (English/Spanish)
- STL/OBJ/STEP file upload and analysis
- Instant manufacturability feedback
- Quote PDF generation and email delivery
- Order management dashboard
- Webhook integrations for order status updates

### Technical
- Next.js 14 App Router with TypeScript
- PostgreSQL with Prisma ORM
- Redis for quote caching
- AWS S3 for file storage
- Docker containerization
- Comprehensive API documentation
