# MADFAM Quoting MVP — Deploy‑Ready Software Spec (v1.0)

*Audience: Founders, PM, Tech Lead, Ops, Finance. Goal: ship a secure, multi‑tenant MVP usable by MADFAM and pilot tenants within 6–8 weeks.*

---

## 0) Product Charter (MVP)

**Primary Objectives (first 90 days post‑launch)**

* Auto‑quote ≥70% of eligible jobs in <5 minutes end‑to‑end.
* +15% quote→order conversion vs. baseline.
* Zero margin‑floor violations (audited).
* Display sustainability score per quote; offer at least one greener alternative when feasible.

**In‑Scope (MVP P0)**

* Processes: 3D (FFF, SLA), CNC 3‑axis (Al, steel, plastics), 2D laser cut.
* Journeys: Drop‑and‑Quote Autopilot, Guided Wizard.
* Regions: MX & US; Currencies: MXN & USD; Languages: ES & EN.
* Payments: Card (Stripe). Bank transfer (SPEI) as manual instructions + back‑office reconciliation.
* DFM basics, Audit logs, Quote PDF, Role‑based admin, FX daily snapshot.

**Out‑of‑Scope (Push to P1+)**

* Supplier self‑serve portal, dynamic scheduling, EU region/EUR currency, 5‑axis CNC, advanced post‑processing, tax engine automation, full ERP.

---

## 1) Personas & Roles

* **Admin:** full configuration; can approve large overrides; financial settings.
* **Manager:** reviews flagged quotes, applies discounts within threshold; approves orders.
* **Operator:** views production notes; no pricing access.
* **Support:** impersonate user (audited) to help with quotes.
* **End‑Customer:** guest or account; uploads files, receives quotes, pays.

**Permissions (summary)**

* Admin: `*` on tenant resources.
* Manager: CRUD quotes, approve overrides ≤10%, view costs; read configs.
* Operator: read assigned orders (no costs).
* Support: read quotes, impersonate (requires ticket id).
* Customer: own quotes/orders.

---

## 2) User Journeys & Acceptance Criteria

### 2.1 Drop‑and‑Quote Autopilot (P0)

**Flow**: Upload → Auto detect (process/material candidates) → Price/Lead/Sustain optimize → Present best option + alternatives → Add shipping → Checkout.
**AC**

1. Upload up to 50 files (≤200MB each). Supported: STL/STEP/IGES/DXF/DWG/PDF.
2. System returns an auto‑quote or flags *Needs Review* within 60s for 3D/laser, 120s for CNC.
3. Margin floors and discount rules enforced; audit log records inputs and decision path.
4. Sustainability score shown with “Why this option?” explainer.

### 2.2 Guided Wizard (P0)

**Flow**: Process → Material → Specs (tolerance, finish, infill/layer) → Quantity → Date → Price.
**AC**

1. Live price updates on each step; min/max constraints validated.
2. Alternative greener/cheaper options presented if within policy thresholds.
3. Quote validity clearly displayed (default 14 days).
4. Bilingual UI toggle (ES/EN) persists per user/tenant.

### 2.3 Admin Config (P0)

**Flow**: Processes → Materials → Machines → Pricing rules → Taxes/FX → Templates.
**AC**

1. Versioned configs with effective dates; draft→published workflow.
2. Bulk import via CSV for materials/pricing.
3. Role/permission editor; audit log for every change.

---

## 3) System Architecture

### 3.1 Tech Stack (opinionated)

* **Frontend**: Next.js (App Router) + TypeScript, TailwindCSS, i18next for ES/EN, React Query, shadcn/ui.
* **Backend API**: NestJS (TypeScript) + REST; OpenAPI docs; Zod validation.
* **Worker Services**: Python microservice for geometry/DFM analysis (FastAPI), connected via SQS.
* **DB**: PostgreSQL (RDS‑compatible), Prisma ORM.
* **Cache/Queue**: Redis (cache), AWS SQS (jobs).
* **Object Storage**: S3 (file uploads, PDFs).
* **Auth**: NextAuth (email/password + Google OAuth), JWT + rotating refresh tokens.
* **Payments**: Stripe (cards) + manual bank transfer workflow for SPEI.
* **Infra**: AWS (ECS Fargate or EKS P1), CloudFront CDN, Route 53, SES for email.
* **Observability**: OpenTelemetry, CloudWatch logs, Sentry.

### 3.2 Multi‑Tenant Model

* All core tables include `tenant_id`.
* Row‑level access via Prisma middleware; every API call requires tenant context from subdomain or header.
* Per‑tenant S3 prefixes and KMS keys.
* White‑label branding (domain, logo, theme) stored per tenant.

### 3.3 Services

* **API Gateway** → **Auth** → **Quote Service** (pricing, state machine) → **DFM Service** (files → geometry metrics) → **PDF Service** (quote docs) → **Payment Service** → **Notification Service**.

---

## 4) Data Model (ER outline)

**Entities (key fields)**

* `Tenant(id, name, domain, currency_default, locales[], features{}, settings{})`
* `User(id, tenant_id, email, name, roles[])`
* `Role(id, tenant_id, name)`, `Permission(id, code)`; `RolePermission(role_id, perm_id)`
* `Material(id, tenant_id, process, name, density, co2e_factor, cost_uom, price_per_uom, recycled_pct, active, v_effective_from, v_effective_to)`
* `Machine(id, tenant_id, process, model, power_w, hourly_rate, setup_minutes, active, specs{})`
* `ProcessOption(id, tenant_id, process, options_schema_json, margin_floor_pct)`
* `FXRate(id, base, quote, rate, as_of_date, tenant_id nullable)`
* `Quote(id, tenant_id, customer_id nullable, status, currency, objective{cost,lead,green}, validity_until, totals{}, sustainability{})`
* `QuoteItem(id, quote_id, name, process, qty, selections{}, cost_breakdown{}, sustainability{}, flags{})`
* `File(id, tenant_id, quote_id, quote_item_id, type, path, size, hash, version, nda_acceptance_id)`
* `DFMReport(id, quote_item_id, metrics{}, issues[], risk_score)`
* `SupplierBid(id, tenant_id, quote_item_id, supplier_id, price, lead_days, co2e, selected)` (P1)
* `PaymentIntent(id, tenant_id, quote_id, provider, amount, currency, status, external_ref)`
* `AuditLog(id, tenant_id, actor_id, entity, entity_id, action, before, after, at)`
* `NDAAcceptance(id, tenant_id, user_id/email, ip, user_agent, version, at)`
* `DiscountRule(id, tenant_id, scope, formula, thresholds{})`
* `ShippingRate(id, tenant_id, carrier, service_code, lead_days, price_formula)`

> **Note:** `selections{}` stores customer‑visible choices (e.g., material, tolerance band). `cost_breakdown{material, machine, energy, post, overhead, margin}`.

---

## 5) Pricing & Optimization Engine (MVP)

### 5.1 Inputs per QuoteItem

* **Geometry metrics** (from DFM Service): volume\_cm3, surface\_area\_cm2, bbox\_xyz\_mm, length\_cut\_mm (2D), estimated\_toolpath\_len\_mm (CNC heuristic), holes/overhang flags, material\_thickness\_mm (2D).
* **Process selection**: chosen by user or auto suggestion list.
* **Options**: material, layer\_height, infill\_preset, tolerance\_band, finish\_class, qty, required\_by\_date.
* **Tenant config**: machine rates, energy tariffs, material prices, setup times, margin floors, discount tables.
* **FX snapshot** and **objective weights** {cost, lead, green}.

### 5.2 Cost Formulas (simplified, configurable)

**3D – FFF**

* Mass\_g = volume\_cm3 × density\_g\_per\_cm3 × infill\_factor(0.35 default).
* MaterialCost = (Mass\_g / 1000) × material\_cost\_per\_kg.
* DepositionRate\_cm3\_per\_hr = machine\_profile (e.g., 12).
* PrintTime\_hr = (volume\_cm3 / rate) × layer\_height\_factor × quality\_factor + setup\_hr.
* Energy\_kWh = (machine\_power\_w × PrintTime\_hr) / 1000.
* EnergyCost = Energy\_kWh × tariff\_per\_kWh.
* MachineCost = PrintTime\_hr × machine\_hourly\_rate.
* PostProcessCost = (deburr\_min + support\_removal\_min)/60 × labor\_rate.
* CostSubtotal = sum + overhead\_pct × subtotal.
* Price = max(CostSubtotal × (1 + margin\_floor), competitor\_adjustments) − volume\_discounts.

**3D – SLA**

* ResinVolume\_ml ≈ volume\_cm3 / packing\_efficiency (0.92). ResinCost = (ResinVolume\_ml/1000) × resin\_cost\_per\_l.
* PrintTime\_hr = layer\_count × exposure\_time\_per\_layer + setup; same energy/machine logic.

**CNC 3‑Axis**

* StockVolume\_cm3 = bbox × stock\_factor; RemovalVolume = StockVolume − volume\_cm3.
* MRR\_cm3\_per\_min = material\_profile (e.g., 3 for Al, 1 for steel, 6 for ABS).
* CutTime\_hr = (RemovalVolume / (MRR×60)) × complexity\_factor (1–1.5).
* ToolChange/setup adds fixed minutes. Costs: machine, labor, tooling wear (per hr), energy.

**2D Laser**

* CutLength\_m from DXF; Pierces\_n; MaterialArea\_m2.
* Cost = (CutLength\_m × rate\_per\_m) + (Pierces × pierce\_fee) + (MaterialArea × sheet\_cost) + setup.

### 5.3 Lead‑Time Model (P0)

* Static tiers per process: `Standard` and `Rush`.
* Rush adds % uplift and must respect daily cut‑off times from tenant config.

### 5.4 Sustainability Score (0–100)

* CO₂e\_kg = (Energy\_kWh × grid\_co2e\_factor) + (MaterialMass\_kg × material\_co2e\_factor) + logistics\_estimate.
* Score = 100 − normalize(CO₂e\_kg)×50 − normalize(Energy\_kWh)×30 − waste\_pct×20 + recycled\_bonus.
* Show alt: If an alternative process yields ≥15 score improvement within +10% cost and +20% lead, surface it.

### 5.5 Governance

* Margin floors per process enforced pre‑discount.
* Manager override up to ±10% with reason; >10% requires Admin approval (two‑man rule).
* All calculations, inputs, and overrides logged in `AuditLog`.

---

## 6) Workflow & State Machine

```
Draft → Submitted → (Auto‑Quoted | Needs‑Review) → Quoted → Approved → Ordered → In‑Production → QC → Shipped → Closed
                                 ↘ Requote ↗               ↘ Change‑Order ↗        ↘ Cancelled
```

**Transitions & Guards**

* `Submitted→Auto‑Quoted`: pricing computed, margin >= floor, no high risk flags.
* `Submitted→Needs‑Review`: risk\_score>thresh, tolerance=tight, new high‑value customer, file anomaly.
* `Quoted→Approved`: customer accepts terms & pays deposit (or PO approved).
* `Approved→Ordered`: payment/PO verified.
* Requote/Change‑Order create new `QuoteItem` revisions; both retain audit trail.

**Notifications**

* Customer: submission, quote ready, payment link, production start, shipment tracking.
* Internal: high‑value quote, margin breach attempt, DFM fail, rush order, overdue review SLA.

---

## 7) API Design (REST, v1)

**Auth**: Bearer JWT; tenant via subdomain or `X-Tenant-ID` header.

### 7.1 OpenAPI Sketch

```yaml
openapi: 3.0.3
info: { title: MADFAM Quoting API, version: 1.0.0 }
servers: [{ url: https://api.{tenant}.madfam.app/v1 }]
paths:
  /auth/login:
    post: { summary: Login }
  /files:
    post:
      summary: Upload file (pre-signed URL)
      requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/FileInit' } } } }
      responses: { '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Presign' } } } } }
  /quotes:
    post: { summary: Create quote (empty or with items) }
    get: { summary: List quotes }
  /quotes/{id}:
    get: { summary: Get quote }
    patch: { summary: Update objective/notes }
  /quotes/{id}/items:
    post: { summary: Add item with file refs and options }
  /quotes/{id}/price:
    post: { summary: Compute price; returns Auto-Quoted or Needs-Review }
  /quotes/{id}/actions/approve:
    post: { summary: Customer approves }
  /quotes/{id}/payment-intents:
    post: { summary: Create Stripe intent }
  /admin/materials: { get: { }, post: { } }
  /admin/machines: { get: { }, post: { } }
  /admin/process-options: { get: { }, post: { } }
components:
  schemas:
    FileInit: { type: object, properties: { filename: {type: string}, kind: {enum: [stl, step, iges, dxf, dwg, pdf]}, size: {type: integer} } }
    Presign: { type: object, properties: { url: {type: string}, fields: {type: object}, fileId: {type: string} } }
```

### 7.2 Example — Compute Price

**Request** `POST /v1/quotes/{id}/price`

```json
{
  "objective": {"cost": 0.5, "lead": 0.3, "green": 0.2},
  "items": [
    {
      "fileId": "f_123",
      "process": "3d_fff",
      "qty": 10,
      "options": {"material": "PLA", "layer_height": 0.2, "infill": "standard"}
    }
  ]
}
```

**Response**

```json
{
  "status": "auto_quoted",
  "totals": {"subtotal": 245.50, "tax": 39.28, "grand_total": 284.78, "currency": "MXN"},
  "items": [
    {
      "id": "qi_1",
      "price": 24.55,
      "lead_days": 3,
      "sustainability": {"score": 68, "co2e_kg": 1.8},
      "alternatives": [
        {"process": "3d_sla", "price": 26.90, "lead_days": 2, "score": 75}
      ]
    }
  ]
}
```

---

## 8) Frontend UX Spec (MVP)

### 8.1 Pages (Next.js routes)

* `/` Landing (tenant‑themed), CTA upload.
* `/quote/new` Upload & Autopilot flow.
* `/wizard` Guided flow with progress steps.
* `/quote/{id}` Quote view; accept/pay; download PDF.
* `/admin` Dashboard with tabs: Processes, Materials, Machines, Pricing Rules, Taxes/FX, Templates, Users/Roles, Audit.

### 8.2 Components

* **Uploader**: drag‑and‑drop; file list with parse status; NDA gate modal on first upload.
* **PriceCard**: best option + toggles for alternatives; sustainability badge; details accordion.
* **ObjectiveSlider**: cost/lead/green weights with presets.
* **CheckoutPanel**: contact, billing, shipping, payment method.
* **AdminTables**: versioned rows with diff highlights; CSV import; inline validation.

### 8.3 i18n Content (examples)

* ES: *“Sube tus archivos para cotizar al instante.”*
* EN: *“Upload your files for an instant quote.”*

---

## 9) Security, Privacy & Compliance

* **NDA Gate**: First upload requires acceptance; store `NDAAcceptance` with IP, UA, timestamp, doc version.
* **Data Retention**: Auto‑delete files 90 days after last activity if no order; 3 years for orders (configurable).
* **Access Control**: RBAC enforced at API and DB layers; impersonation requires `support_impersonate` perm and ticket id.
* **Encryption**: TLS 1.2+ in transit; S3/KMS at rest; hashed tokens.
* **PII & Exports**: User export/delete requests supported (DSAR‑ready); audit trail immutable.
* **Content Controls**: Blocked categories list; manual override with admin justification.

---

## 10) DevOps & Environments

* **Branches**: `main`, `develop`; PR checks: lint, unit, E2E smoke.
* **Envs**: `dev`, `staging`, `prod`.
* **CI/CD**: GitHub Actions → build Docker images → push to ECR → deploy to ECS Fargate.
* **Infra as Code**: Terraform modules (networking, RDS, ECS, S3, CloudFront).
* **Secrets**: AWS Secrets Manager.
* **Backups**: RDS automated snapshots (7–30 days), S3 versioning + lifecycle.
* **Monitoring**: SLOs (availability 99.9%); alerting on p95 latency, error rate, pricing job failures.

**Environment Variables (sample)**

```
NODE_ENV, DATABASE_URL, REDIS_URL, S3_BUCKET, S3_REGION, KMS_KEY_ID,
JWT_SECRET, NEXTAUTH_SECRET, STRIPE_KEY, STRIPE_WEBHOOK_SECRET,
DEFAULT_CURRENCY=MXN, SUPPORTED_CURRENCIES=MXN,USD,
DEFAULT_LOCALES=es,en, FX_SOURCE=openexchangerates
```

---

## 11) Seeding & Migrations

* **Migrations** via Prisma migrate.
* **Seed**: baseline materials (PLA, PETG, ABS, Resin Standard, Al 6061, Steel 1018, Acrylic 3mm), machine profiles (FFF MK3S, SLA Form 3, CNC HAAS 3‑axis, Laser 60W), default process options and margin floors, MXN/USD FX snapshot.

---

## 12) Templates & PDFs

* **Quote PDF**: bilingual (ES/EN), tenant branding, validity date, line items with collapsible cost drivers, sustainability score, terms.
* **Email Templates**: submission received, quote ready, payment link, order confirmation, shipment.

---

## 13) Feature Flags (Config)

* `features.supplier_portal` (false)
* `features.dynamic_scheduling` (false)
* `features.eu_region` (false)
* `features.whatsapp_notifications` (false)
* `features.bank_transfer_reconciliation` (true)

---

## 14) Test Plan (MVP)

**Unit Tests**

* Pricing math per process (boundary conditions: tiny/large parts, qty 1 vs 1000).
* Margin floor enforcement; discount application; FX conversion stability.
* Sustainability score normalization.

**Integration Tests**

* File upload → DFM → pricing pipeline (mock S3).
* Payments: Stripe intent create & webhook handling.
* Admin config versioning (effective dates).

**E2E (Playwright)**

* Autopilot happy path (STL upload → quote <60s → pay deposit).
* Wizard path with tight tolerance triggers Needs‑Review.
* Manager override within 10% records audit log.

**Performance**

* p95 API latency < 400ms (cached), pricing jobs complete < 60s (3D/laser), <120s (CNC heuristic).
* Concurrency: 50 simultaneous quotes without degradation on t3.medium‑class infra (baseline).

---

## 15) Risks & Mitigations

* **Geometry parsing variability** → Use robust libs; fall back to manual review with clear SLA.
* **FX volatility** → Noon snapshot + buffer %.
* **Under‑quoting complex CNC** → Conservative MRR defaults + auto flag for manual review.
* **Sustainability data quality** → Start with reference factors; allow tenant overrides and visible provenance.

---

## 16) Delivery Plan (suggested)

**Week 1–2**: Data model, auth, uploads, DFM stub, pricing v0 (FFF/SLA), Autopilot UI.
**Week 3–4**: CNC & laser pricing, Wizard UI, Quote PDF, Stripe.
**Week 5**: Admin configs, audit logs, sustainability score, i18n.
**Week 6**: Hardening, tests, observability, staging UAT → prod.

**Go/No‑Go Checklist**

* [ ] 20+ E2E tests green
* [ ] Security review passed
* [ ] Operational runbooks prepared
* [ ] Pilot tenant enabled
* [ ] Support playbook & SLAs set

---

## 17) Appendix — Example Prisma Schema (excerpt)

```prisma
model Tenant { id String @id @default(cuid()) name String domain String? defaultCurrency String defaultLocales String[] features Json? settings Json? Users User[] Materials Material[] Quotes Quote[] }
model User { id String @id @default(cuid()) tenantId String email String @unique name String? roles String[] Tenant Tenant @relation(fields: [tenantId], references: [id]) }
model Material { id String @id @default(cuid()) tenantId String process String name String density Float co2eFactor Float costUom String pricePerUom Float recycledPct Float? active Boolean @default(true) vFrom DateTime vTo DateTime? Tenant Tenant @relation(fields: [tenantId], references: [id]) }
model Quote { id String @id @default(cuid()) tenantId String status String currency String objective Json validityUntil DateTime totals Json? sustainability Json? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt Tenant Tenant @relation(fields: [tenantId], references: [id]) Items QuoteItem[] }
model QuoteItem { id String @id @default(cuid()) quoteId String process String qty Int selections Json costBreakdown Json sustainability Json flags Json? Quote Quote @relation(fields: [quoteId], references: [id]) DFM DFMReport? }
model DFMReport { id String @id @default(cuid()) quoteItemId String metrics Json issues Json riskScore Int QuoteItem QuoteItem @relation(fields: [quoteItemId], references: [id]) }
model FXRate { id String @id @default(cuid()) base String quote String rate Float asOf DateTime tenantId String? }
model AuditLog { id String @id @default(cuid()) tenantId String actorId String? entity String entityId String action String before Json? after Json? at DateTime @default(now()) }
```

---

## 18) Appendix — Sample Sustainability Factors (per tenant editable)

* Grid CO₂e: MX 0.42 kg/kWh; US 0.38 kg/kWh (defaults).
* Materials CO₂e: PLA 1.6 kg/kg; PETG 3.0; Resin 6.0; Al billet 10.0; Steel 2.1; Acrylic 6.3.
* Logistics: 0.0002 kg CO₂e per kg·km (baseline).
* Recycled bonus: +10 score if recycled\_pct ≥ 50%.

---

**End of Spec (v1.0)**
