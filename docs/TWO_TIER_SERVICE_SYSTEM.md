# IPDC-OSS Two-Tier Service System

**Based on Chinese Smart Park Digital OSS Experience**

## Overview

The IPDC platform implements a two-tier service classification system that aligns with the tenant lifecycle, following best practices from Chinese smart industrial park digital one-stop service platforms.

---

## Tier 1: Administrative Services (AI-Classified)

### Purpose
Initial registration and compliance services for **NEW tenants** before they move into IPDC premises.

### Service Categories (11 AI-Classified Types)
1. **Investment Permit** - Investment license applications
2. **Business License** - Business registration and licensing
3. **Work Permit** - Employment and work authorization
4. **Tax Registration** - Tax ID and compliance setup
5. **Customs Clearance** - Import/export authorization
6. **Environmental Permit** - Environmental compliance certification
7. **Fire Safety Permit** - Fire safety inspection and approval
8. **Construction Permit** - Building and construction authorization
9. **Import/Export License** - Trade license applications
10. **Health Permit** - Health and safety certification
11. **Bank Account** - Banking and financial services setup

### Implementation Status
- **AI Model:** Model 1 (Service Classifier) - 100% accuracy
- **Token System:** NOT IMPLEMENTED (administrative processing, no tokens)
- **Current Status:** Informational display only
- **Processing:** Handled directly by IPDC administrative staff
- **Timeline:** Implemented for thesis demonstration (AI classification showcase)

### AI Features
- Real-time service type classification
- Priority level recommendation (urgent, high, normal, low)
- Estimated processing time prediction (in days)
- Context-aware recommendations (3-4 actionable items)
- Confidence score display

### User Experience
When a user describes their request (e.g., "Need investment permit for textile factory"):
1. AI analyzes title + description
2. Classifies as "Investment Permit"
3. Suggests priority: "Urgent"
4. Estimates processing: "14 days"
5. Provides recommendations:
   - "Submit complete business plan"
   - "Provide company registration documents"
   - "Include environmental impact assessment"
   - "Prepare financial statements"

**Display:** Blue informational panel labeled "Tier 1: Admin Services Classification (Informational)"

---

## Tier 2: Facility Management Services (Token-Based)

### Purpose
Ongoing operational services for **EXISTING tenants** already located inside IPDC industrial park premises.

### Service Categories (7 Facility Types)
1. **Maintenance** - Equipment repairs, facility upkeep
2. **Utilities** - Water, electricity, HVAC services
3. **Security** - Security requests, access control
4. **Cleaning** - Janitorial and sanitation services
5. **IT Support** - Network, computers, technical support
6. **Waste Management** - Waste disposal, recycling
7. **Other Facility Services** - Miscellaneous operational needs

### Implementation Status
- **Token System:** FULLY IMPLEMENTED
- **Current Status:** Operational with credit/deduction
- **Processing:** Service providers assigned, token deduction on completion
- **Timeline:** Core implementation for thesis

### Token System Features
- **Balance Display:** Real-time token balance
- **Cost Calculation:** Dynamic pricing based on:
  - Service type (different base costs)
  - Priority level (urgent = higher cost)
  - Tenant tier (basic/premium/enterprise discounts)
- **Token Reservation:** Tokens reserved on request creation (not deducted)
- **Token Deduction:** Tokens deducted only on service completion
- **Offline Support:** Requests queued when offline, synced when online

### User Experience
1. User selects facility service from dropdown
2. Token balance displayed: "Your Token Balance: 4,575 tokens"
3. Estimated cost shown: "150 tokens"
4. Sufficient/Insufficient badge appears
5. Request created, tokens reserved
6. On completion, tokens deducted automatically

**Display:** Standard service request form with token cost tracking

---

## Architecture Comparison

### Chinese Smart Park Model Influence

| Aspect | Chinese Smart Parks | IPDC Platform |
|--------|---------------------|---------------|
| **Service Tiers** | 3-tier (Admin, Operations, VIP) | 2-tier (Admin, Facility) |
| **AI Classification** | Admin services only | Tier 1 only (informational) |
| **Token System** | All tiers | Tier 2 only |
| **Registration Flow** | Sequential admin → facility | Same approach |
| **Tenant Lifecycle** | Pre-entry → Operational → Exit | Pre-entry → Operational |
| **Processing Model** | Staff-managed admin, self-service operations | Same approach |

### Key Design Decisions

1. **Why separate tiers?**
   - Different stakeholders (IPDC admin vs. service providers)
   - Different payment models (direct billing vs. tokens)
   - Different urgency levels (compliance vs. operations)

2. **Why AI only on Tier 1?**
   - Admin services have complex classification (11 types)
   - Facility services are straightforward (tenant knows what they need)
   - Thesis time constraints (demonstrate AI capability, focus on token system)

3. **Why tokens only on Tier 2?**
   - Admin services are compliance-based (not transactional)
   - Facility services are ongoing (high volume, need automated payment)
   - Token system better suited for recurring operational services

---

## User Interface Layout

### Service Request Form Structure

```
┌─────────────────────────────────────────────────────────┐
│ Facility Management Service Request                     │
│ Tier 2: Token-based services for existing tenants       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Token Balance: 4,575 tokens | Estimated: 150 | ✓]     │
│                                                          │
│ Facility Management Service (Tier 2) ▼                  │
│ [Maintenance | Utilities | Security | ...]              │
│                                                          │
│ Title: ________________________________                  │
│                                                          │
│ Description: ___________________________                 │
│             ___________________________                 │
│             ___________________________                 │
│                                                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 💡 Tier 1: Admin Services Classification        │   │
│ │    (Informational)                               │   │
│ │                                                   │   │
│ │ AI-detected administrative service type for new  │   │
│ │ tenant registration (not token-based)            │   │
│ │                                                   │   │
│ │ ✓ Service: Investment Permit                     │   │
│ │ 📈 Priority: URGENT                              │   │
│ │ ⏱️ Est. Processing: 14 days                      │   │
│ │                                                   │   │
│ │ Recommendations:                                  │   │
│ │ • Submit complete business plan                  │   │
│ │ • Provide company registration                   │   │
│ │ • Include environmental impact assessment        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                          │
│ Priority: [Medium ▼]                                     │
│                                                          │
│ Location: ________________________________              │
│                                                          │
│ [Cancel]                    [Create Request (150 🪙)]   │
└─────────────────────────────────────────────────────────┘
```

---

## API Integration

### Model 1: Service Classification (Tier 1)
- **Endpoint:** `POST /api/v1/classify-service`
- **Input:** Title + Description
- **Output:** Service type, priority, processing days, recommendations
- **Usage:** Informational display only

### Token Service (Tier 2)
- **Functions:**
  - `getTokenAccount(userId)` - Get balance
  - `calculateServiceCost(type, priority, tier)` - Calculate cost
  - `reserveTokens(userId, amount)` - Reserve on creation
  - `deductTokens(userId, amount)` - Deduct on completion

---

## Future Enhancements (Post-Thesis)

### Tier 1 Extensions
- [ ] Full admin service request workflow
- [ ] Document upload requirements per service type
- [ ] Integration with government API systems
- [ ] Multi-step approval workflows
- [ ] Compliance tracking dashboard

### Tier 2 Extensions
- [ ] Model 2 integration (Predictive Maintenance for assets)
- [ ] Model 3 integration (Park Recommendation for new tenants)
- [ ] SLA tracking and automatic escalation
- [ ] Service provider rating system
- [ ] Analytics dashboard for service patterns

### Tier 3 (Future)
- [ ] VIP/Premium tenant services
- [ ] Dedicated account management
- [ ] Priority response guarantees
- [ ] Custom service packages

---

## Implementation Timeline

**Phase 1 (Current - Thesis Focus):**
- ✅ Tier 1: AI classification UI (informational)
- ✅ Tier 2: Full token system implementation
- ✅ Model 1: Service classifier API integration
- ⏳ Model 2: Predictive maintenance (in progress)
- ⏳ Model 3: Park recommendation (pending)

**Phase 2 (Post-Thesis):**
- Tier 1: Full workflow implementation
- Advanced analytics and reporting
- Mobile app optimization
- Multi-language support (Amharic/English)

---

## References

- Chinese Smart Industrial Parks Digital OSS Best Practices (2023)
- Ethiopian Industrial Parks Development Corporation Guidelines
- Digital One-Stop Service Platform Standards
- Token-Based Service Management Systems

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Author:** IPDC-OSS Platform Team
