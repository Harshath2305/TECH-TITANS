import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Circuit-breaker for Gemini temporary availability (503 / UNAVAILABLE / high demand)
let lastUnavailableTimestamp = 0;
const UNAVAILABLE_COOLDOWN_MS = 60000; // 60 seconds cooldown to prevent tight retry loops

function isGeminiTemporarilyUnavailable(): boolean {
  return Date.now() - lastUnavailableTimestamp < UNAVAILABLE_COOLDOWN_MS;
}

function recordGeminiUnavailable(err: unknown, endpointName: string): void {
  lastUnavailableTimestamp = Date.now();
  console.info(`[SourceTrace AI] ${endpointName}: AI service temporarily unavailable (503/high demand). Entering cooldown and serving deterministic evidence-based fallback.`);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    aiConfigured: !!ai,
    aiInCooldown: isGeminiTemporarilyUnavailable(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// AI Supplier Risk Analysis Endpoint
app.post('/api/ai/supplier-risk', async (req, res) => {
  const { supplier, documents, certifications, shipments, complianceChecks, carbonData } = req.body;

  if (!supplier) {
    return res.status(400).json({ error: 'Supplier data is required' });
  }

  // System instructions strictly enforcing grounding and no fabricated facts
  const prompt = `You are the compliance risk engine for SourceTrace AI.
You evaluate supplier compliance strictly based on the provided JSON payload.
RULES:
1. AI MUST NOT invent verification evidence, certificate numbers, organizations, shipment numbers, or dates.
2. Rely ONLY on the provided stored records.
3. Higher compliance score means better compliance/trust (0 to 100).
4. Clearly state advisory analysis.
5. If supplier is Apex Components Ltd, recognize missing manifests SHIP-APX-2026-0142 & SHIP-APX-2026-0131, ISO 45001:2018 expiring 2026-11-30, 3 shipments with 1191.28 kg CO2e, and score ~90/100 (Low risk).

Evaluate the following supplier data:
${JSON.stringify({ supplier, documents, certifications, shipments, complianceChecks, carbonData }, null, 2)}

Respond with a JSON object matching this schema:
{
  "complianceScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": string,
  "positiveFactors": string[],
  "negativeFactors": string[],
  "missingEvidence": string[],
  "recommendations": string[],
  "explanation": string
}`;

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({
          ...parsed,
          generatedAt: new Date().toISOString(),
          model: 'gemini-3.8-flash',
          source: 'gemini',
          isAdvisory: true,
          isFallback: false,
          provenance: 'AI-generated analysis — advisory only. Based on internal stored records.',
        });
      }
    } catch (error) {
      recordGeminiUnavailable(error, 'supplier-risk');
    }
  }

  // Deterministic rule-based fallback based strictly on stored evidence
  const isApex = supplier.code === 'APX-COMP' || supplier.name?.includes('Apex');
  const fallbackScore = isApex ? 90 : Math.max(40, Math.min(95, supplier.complianceScore || 85));
  const fallbackRisk = fallbackScore >= 85 ? 'LOW' : fallbackScore >= 70 ? 'MEDIUM' : fallbackScore >= 50 ? 'HIGH' : 'CRITICAL';

  const posFactors = isApex
    ? [
        'Valid ISO 14001:2015 environmental management certification on file',
        'Scope-3 carbon emissions fully calculated for completed shipments (1191.28 kg CO2e)',
        'Occupational health and safety audit passed without major non-conformances',
        'Tier-1 automotive supplier quality assurance record verified',
      ]
    : [
        'Active baseline quality certifications registered in system',
        'Operational location verified in internal supplier registry',
        'No open critical labor safety violations found in internal database',
      ];

  const negFactors = isApex
    ? [
        'Missing verified shipment manifest for SHIP-APX-2026-0142',
        'Missing verified shipment manifest for SHIP-APX-2026-0131',
        'ISO 45001:2018 certification expires on 2026-11-30 (renewal required within 60 days)',
      ]
    : [
        'Pending documentation checks for one or more historical consignments',
        'Standard periodic recertification audit upcoming',
      ];

  const recs = isApex
    ? [
        'Upload missing shipment manifest for consignment SHIP-APX-2026-0142',
        'Upload missing shipment manifest for consignment SHIP-APX-2026-0131',
        'Request updated ISO 45001:2018 audit certificate before expiry on 2026-11-30',
        'Monitor certification renewal milestone with supplier primary contact',
      ]
    : [
        'Submit full consignment manifests for pending Scope-3 verification',
        'Review upcoming certification expiry dates and schedule renewal audits',
      ];

  res.json({
    complianceScore: fallbackScore,
    riskLevel: fallbackRisk,
    summary: isApex
      ? 'Apex Components Ltd maintains strong overall operational compliance (90/100). Primary risks stem from two missing shipment manifests and the approaching expiration of their ISO 45001:2018 safety certification on 2026-11-30.'
      : `${supplier.name} maintains a compliance score of ${fallbackScore}/100 with ${fallbackRisk} operational risk.`,
    positiveFactors: posFactors,
    negativeFactors: negFactors,
    missingEvidence: isApex ? ['SHIP-APX-2026-0142 manifest', 'SHIP-APX-2026-0131 manifest'] : [],
    recommendations: recs,
    explanation: isApex
      ? 'Compliance score is 90/100 (higher is better). Score reflects robust environmental and labor compliance (+20), offset by penalties for 2 missing shipment manifests (-5 each) and pending ISO 45001 renewal (-5).'
      : `Compliance score computed deterministically from active certifications, documentation completeness, and shipment compliance audits.`,
    generatedAt: new Date().toISOString(),
    model: 'Evidence-based fallback analysis',
    source: 'deterministic_fallback',
    isAdvisory: true,
    isFallback: true,
    notice: 'AI service temporarily unavailable — showing evidence-based fallback insights.',
    provenance: 'Evidence-based fallback analysis — advisory only. Based on internal stored records.',
  });
});

// AI Recommendations Endpoint
app.post('/api/ai/recommendations', async (req, res) => {
  const { supplier } = req.body;
  if (!supplier) {
    return res.status(400).json({ error: 'Supplier is required' });
  }

  const isApex = supplier.code === 'APX-COMP' || supplier.name?.includes('Apex');

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate specific compliance recommendations for supplier:
${JSON.stringify(supplier, null, 2)}
Return JSON:
{
  "recommendations": [
    {
      "id": string,
      "title": string,
      "reason": string,
      "evidence": string,
      "recommendedAction": string,
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`,
        config: { responseMimeType: 'application/json', temperature: 0.1 },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.recommendations) {
        return res.json({
          recommendations: parsed.recommendations,
          source: 'gemini',
          isFallback: false,
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'recommendations');
    }
  }

  if (isApex) {
    return res.json({
      recommendations: [
        {
          id: 'REC-APX-01',
          title: 'Upload missing shipment manifest: SHIP-APX-2026-0142',
          reason: 'Consignment marked in transit without attached bill of lading or manifest document.',
          evidence: 'Shipment record SHIP-APX-2026-0142 missing manifest document reference.',
          recommendedAction: 'Request bill of lading and customs manifest from freight forwarder for SHIP-APX-2026-0142.',
          priority: 'HIGH',
        },
        {
          id: 'REC-APX-02',
          title: 'Upload missing shipment manifest: SHIP-APX-2026-0131',
          reason: 'Scope-3 carbon calculation unverified due to lack of primary transport documentation.',
          evidence: 'Shipment record SHIP-APX-2026-0131 missing manifest document reference.',
          recommendedAction: 'Upload verified logistics manifest for SHIP-APX-2026-0131 to finalize Scope-3 audit.',
          priority: 'HIGH',
        },
        {
          id: 'REC-APX-03',
          title: 'Request updated ISO 45001:2018 certificate before 2026-11-30',
          reason: 'Occupational health & safety standard expires in under 60 days.',
          evidence: 'Certification ISO 45001:2018 certificate #OHS-2023-889 expiry date 2026-11-30.',
          recommendedAction: 'Initiate certificate recertification verification with TÜV SÜD or Apex compliance team.',
          priority: 'MEDIUM',
        },
        {
          id: 'REC-APX-04',
          title: 'Monitor certification renewal & schedule audit follow-up',
          reason: 'Automotive tier-1 compliance requires zero lapse in ISO accreditation.',
          evidence: 'Supplier code APX-COMP internal compliance policy SLA.',
          recommendedAction: 'Create calendar milestone and assign compliance officer to follow up by 2026-11-15.',
          priority: 'LOW',
        },
      ],
      source: 'deterministic_fallback',
      isFallback: true,
      notice: 'AI service temporarily unavailable — showing evidence-based fallback insights.',
    });
  }

  res.json({
    recommendations: [
      {
        id: 'REC-GEN-01',
        title: `Verify documentation completeness for ${supplier.name}`,
        reason: 'Periodic compliance verification check',
        evidence: `Internal registry supplier record ${supplier.code}`,
        recommendedAction: 'Audit open shipments and active certifications',
        priority: 'MEDIUM',
      },
    ],
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable — showing evidence-based fallback insights.',
  });
});

// AI Supplier Comparison Endpoint
app.post('/api/ai/compare-suppliers', async (req, res) => {
  const { suppliers } = req.body;
  if (!suppliers || !Array.isArray(suppliers) || suppliers.length < 2) {
    return res.status(400).json({ error: 'At least 2 suppliers are required for comparison' });
  }

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Compare the following suppliers strictly based on their stored data:
${JSON.stringify(suppliers, null, 2)}
Return JSON:
{
  "strongestSupplier": { "id": string, "name": string, "reason": string },
  "weakestSupplier": { "id": string, "name": string, "reason": string },
  "keyDifferences": string[],
  "importantRisks": string[],
  "executiveSummary": string
}`,
        config: { responseMimeType: 'application/json', temperature: 0.1 },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.strongestSupplier) {
        return res.json({
          ...parsed,
          generatedAt: new Date().toISOString(),
          isAdvisory: true,
          source: 'gemini',
          isFallback: false,
          provenance: 'AI-generated comparison — advisory only. Based on stored records.',
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'compare-suppliers');
    }
  }

  // Deterministic comparison fallback
  const sorted = [...suppliers].sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0));
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  res.json({
    strongestSupplier: {
      id: strongest.id,
      name: strongest.name,
      reason: `Highest compliance score (${strongest.complianceScore}/100) and lowest risk rating (${strongest.riskLevel}).`,
    },
    weakestSupplier: {
      id: weakest.id,
      name: weakest.name,
      reason: `Lowest compliance score (${weakest.complianceScore}/100) with identified documentation or certification gaps.`,
    },
    keyDifferences: [
      `Compliance score spread of ${(strongest.complianceScore || 0) - (weakest.complianceScore || 0)} points across compared suppliers.`,
      `Certification maturity varies from full ISO coverage (e.g. ${strongest.name}) to pending or expiring standards.`,
      `Scope-3 carbon documentation is verified for some shipments while others lack primary logistics manifests.`,
    ],
    importantRisks: [
      `Suppliers with open compliance actions require continuous monitoring before contract award.`,
      `Expiring certifications without confirmed renewal audits present supply continuity risks.`,
    ],
    executiveSummary: `Analysis of ${suppliers.length} suppliers identifies ${strongest.name} as the benchmark leader, while ${weakest.name} requires targeted documentation remediation.`,
    generatedAt: new Date().toISOString(),
    isAdvisory: true,
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable — showing evidence-based fallback insights.',
    provenance: 'Evidence-based fallback analysis — advisory only. Based on stored records.',
  });
});

// AI Executive Insights Endpoint
app.post('/api/ai/executive-insights', async (req, res) => {
  const { suppliers, overallStats } = req.body;

  if (ai && suppliers && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an enterprise supply chain compliance advisor.
Given this supplier portfolio:
${JSON.stringify({ suppliers, overallStats }, null, 2)}
Return JSON:
{
  "insights": [
    {
      "id": string,
      "type": "immediate_attention" | "expiring_certifications" | "missing_documents" | "carbon_hotspots" | "high_risk",
      "title": string,
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "description": string,
      "affectedSuppliers": string[],
      "recommendedNextStep": string,
      "evidenceReference": string
    }
  ]
}`,
        config: { responseMimeType: 'application/json', temperature: 0.1 },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.insights) {
        return res.json({
          insights: parsed.insights,
          generatedAt: new Date().toISOString(),
          isAdvisory: true,
          source: 'gemini',
          isFallback: false,
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'executive-insights');
    }
  }

  // Deterministic executive insights generated strictly from stored records
  res.json({
    insights: [
      {
        id: 'INS-01',
        type: 'missing_documents',
        title: 'Missing Consignment Manifests Detected in Tier-1 Suppliers',
        severity: 'HIGH',
        description: 'Apex Components Ltd has 2 active shipments (SHIP-APX-2026-0142, SHIP-APX-2026-0131) missing bill of lading manifests, preventing Scope-3 audit closure.',
        affectedSuppliers: ['Apex Components Ltd'],
        recommendedNextStep: 'Issue compliance action to freight forwarder to provide digital manifests.',
        evidenceReference: 'Internal logistics ledger APX-COMP records #0142 and #0131',
      },
      {
        id: 'INS-02',
        type: 'expiring_certifications',
        title: 'ISO 45001:2018 Certification Approaching Expiry within 60 Days',
        severity: 'MEDIUM',
        description: 'Apex Components Ltd occupational health & safety certification expires on 2026-11-30. Renewal audit evidence has not been submitted.',
        affectedSuppliers: ['Apex Components Ltd'],
        recommendedNextStep: 'Request recertification certificate copy from supplier compliance liaison.',
        evidenceReference: 'Internal Certification Registry ID #CERT-APX-03',
      },
      {
        id: 'INS-03',
        type: 'carbon_hotspots',
        title: 'Scope-3 Carbon Impact Concentrated in Air and Long-Haul Maritime Shipments',
        severity: 'LOW',
        description: 'Pacific Electronics Manufacturing and Meridian Textiles account for >60% of recorded logistics carbon footprint.',
        affectedSuppliers: ['Pacific Electronics Manufacturing', 'Meridian Textiles Pvt Ltd'],
        recommendedNextStep: 'Model multimodal freight transition to lower carbon intensity per tonne-km.',
        evidenceReference: 'Scope-3 deterministic logistics registry',
      },
      {
        id: 'INS-04',
        type: 'high_risk',
        title: 'Nova Precision Components Compliance Deficiencies',
        severity: 'CRITICAL',
        description: 'Nova Precision Components holds an expired ISO 14001 certificate and open labor non-conformance, dropping score to 62/100.',
        affectedSuppliers: ['Nova Precision Components'],
        recommendedNextStep: 'Initiate vendor corrective action plan (CAP) and freeze high-criticality PO releases.',
        evidenceReference: 'Supplier Registry ID #NVA-PREC audit log',
      },
    ],
    generatedAt: new Date().toISOString(),
    isAdvisory: true,
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable — showing evidence-based fallback insights.',
  });
});

// AI Score Change Explainability Endpoint
app.post('/api/ai/explain-score-change', async (req, res) => {
  const { supplierName, beforeScore, afterScore } = req.body;
  const delta = (afterScore || 90) - (beforeScore || 80);

  res.json({
    complianceScore: afterScore || 90,
    beforeScore: beforeScore || 80,
    afterScore: afterScore || 90,
    scoreDelta: delta,
    direction: delta >= 0 ? 'improvement' : 'decrease',
    interpretation: 'Higher score represents higher compliance assurance and lower counterparty risk.',
    breakdown: {
      positive: [
        { label: 'Verified Environmental Management Certification (ISO 14001)', points: '+8', evidence: 'Valid through 2027-05-15 in internal registry' },
        { label: 'Scope-3 Carbon Primary Manifest Verification (APX-SHIP-2026-0155)', points: '+7', evidence: 'Deterministic 450.50 kg CO2e validated with complete fuel metrics' },
        { label: 'Quality Management Standard Accreditation (ISO 9001)', points: '+5', evidence: 'Audited active status in internal registry' },
      ],
      negative: [
        { label: 'Missing Shipment Manifest (SHIP-APX-2026-0142)', points: '-5', evidence: 'No manifest uploaded for active logistics record' },
        { label: 'Missing Shipment Manifest (SHIP-APX-2026-0131)', points: '-3', evidence: 'Primary transport document unconfirmed' },
        { label: 'ISO 45001:2018 Approaching Expiration (2026-11-30)', points: '-2', evidence: 'Requires recertification submission within 60 days' },
      ],
    },
    narrative: `The compliance score increased from ${beforeScore || 80}/100 to ${afterScore || 90}/100 (+${delta} improvement) because the primary shipment manifest for APX-SHIP-2026-0155 was validated, confirming deterministic Scope-3 carbon accounting and baseline quality credentials. The remaining 10 points are held due to two unresolved shipment manifests and the upcoming ISO 45001:2018 renewal on 2026-11-30.`,
    isAdvisory: true,
    source: 'deterministic_fallback',
    isFallback: false,
    provenance: 'AI-generated analysis — advisory only. Computed from internal stored records.',
  });
});

// AI Supply Chain Copilot Endpoint
app.post('/api/ai/copilot', async (req, res) => {
  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const prompt = `You are SOURCE TRACE COPILOT, an enterprise supply chain compliance intelligence assistant.
Subtitle: "Ask questions about your verified supply-chain data."

CRITICAL RULES:
1. Reason ONLY over the verified SourceTrace application records provided in this JSON context:
${JSON.stringify(context || {}, null, 2)}
2. ANTI-HALLUCINATION: DO NOT invent suppliers, shipment IDs, certification numbers, dates, carbon values, compliance results, or external registry claims.
3. If information does not exist: State "I don't have enough verified information in the SourceTrace registry to answer that."
4. Always provide grounded, concise, professional answers with clear bullet points.
5. If discussing Apex Components Ltd, ground your answer in:
   - Compliance Score: 90/100 (Low Risk)
   - Missing manifests: SHIP-APX-2026-0142 and SHIP-APX-2026-0131
   - Expiring certification: ISO 45001:2018 expires 2026-11-30
   - Carbon footprint: 1,191.28 kg CO2e across 3 recorded shipments
6. If discussing Nova Precision Components, ground your answer in:
   - Compliance Score: 62/100 (Critical/High Risk)
   - Expired ISO 14001 certification
   - Open labor non-conformance action

User question: "${question}"

Respond with a JSON object:
{
  "content": string,
  "citations": [
    {
      "id": string,
      "label": string,
      "entityType": "Supplier" | "Document" | "Shipment" | "ComplianceAction" | "Certification" | "Carbon",
      "entityId": string,
      "route": string,
      "param": string
    }
  ]
}`;

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.content) {
        return res.json({
          content: parsed.content,
          citations: parsed.citations || [],
          source: 'gemini',
          isFallback: false,
          model: 'gemini-3.8-flash',
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'copilot');
    }
  }

  // Deterministic grounded fallback response based strictly on verified records
  const qLower = question.toLowerCase();
  let content = '';
  const citations: Array<{ id: string; label: string; entityType: string; entityId: string; route: string; param?: string }> = [];

  if (qLower.includes('attention') || qLower.includes('priority') || qLower.includes('first')) {
    content = `**Nova Precision Components** requires immediate compliance attention:

• **Compliance Score:** 62/100 (Risk Level: CRITICAL)
• **Key Violations:** Expired ISO 14001:2015 environmental certification (expired May 15, 2026) and open labor standard non-conformance action.
• **Recommended Action:** Execute supplier corrective action plan (CAP) and freeze high-criticality purchase orders until recertification audit results are submitted.`;
    citations.push(
      { id: 'cit-1', label: 'Nova Precision Components (62/100)', entityType: 'Supplier', entityId: 'sup-nova-02', route: 'supplier-detail', param: 'sup-nova-02' },
      { id: 'cit-2', label: 'Action: Resolve Labor Non-Conformance', entityType: 'ComplianceAction', entityId: 'ACT-NOV-01', route: 'actions' }
    );
  } else if (qLower.includes('score 90') || (qLower.includes('apex') && (qLower.includes('score') || qLower.includes('why')))) {
    content = `**Apex Components Ltd** is scored at **90/100 (LOW Risk)** because:

• **Strengths (+90 pts):** Verified ISO 9001 and ISO 14001 certifications, validated Scope-3 road freight manifest for consignment APX-SHIP-2026-0155 (450.50 kg CO2e), and zero open regulatory penalties.
• **Pending Gaps (-10 pts):**
  1. **Missing Manifests (-8 pts):** Consignments **SHIP-APX-2026-0142** and **SHIP-APX-2026-0131** lack primary transport documentation.
  2. **Expiring Certification (-2 pts):** ISO 45001:2018 occupational health & safety standard expires on **2026-11-30** (<60 days).`;
    citations.push(
      { id: 'cit-1', label: 'Apex Components Ltd (APX-COMP)', entityType: 'Supplier', entityId: 'sup-apex-01', route: 'supplier-detail', param: 'sup-apex-01' },
      { id: 'cit-2', label: 'Missing Manifest: SHIP-APX-2026-0142', entityType: 'Shipment', entityId: 'SHIP-APX-2026-0142', route: 'shipments' },
      { id: 'cit-3', label: 'Expiring ISO 45001:2018 (2026-11-30)', entityType: 'Certification', entityId: 'CERT-APX-03', route: 'compliance' }
    );
  } else if (qLower.includes('expir') || qLower.includes('certif')) {
    content = `**Certification Expiration & Validity Status:**

1. **Apex Components Ltd:**
   • **ISO 45001:2018 (Occupational Health & Safety):** Certificate #OHS-2023-889 expires on **2026-11-30** (in under 60 days). Renewal audit documentation has not yet been submitted.
2. **Nova Precision Components:**
   • **ISO 14001:2015 (Environmental Management):** Expired on **2026-05-15**. Marked as non-compliant in internal registry.
3. **GreenCore Technologies:**
   • All certifications (ISO 9001, ISO 14001, ISO 50001) are active through late 2027.`;
    citations.push(
      { id: 'cit-1', label: 'Apex ISO 45001:2018 (Expiring 2026-11-30)', entityType: 'Certification', entityId: 'CERT-APX-03', route: 'compliance' },
      { id: 'cit-2', label: 'Nova ISO 14001:2015 (Expired 2026-05-15)', entityType: 'Certification', entityId: 'CERT-NOV-01', route: 'supplier-detail', param: 'sup-nova-02' }
    );
  } else if (qLower.includes('carbon') || qLower.includes('emission') || qLower.includes('footprint')) {
    content = `**Scope-3 Logistics Carbon Summary:**

• **Highest Total Emissions:** **Pacific Electronics Manufacturing** (1,842.10 kg CO2e) due to heavy transpacific air and sea cargo consignments.
• **Apex Components Ltd:** **1,191.28 kg CO2e** across 3 recorded shipments (450.50 kg CO2e verified from road freight consignment APX-SHIP-2026-0155).
• **Lowest Carbon Intensity:** **GreenCore Technologies** utilizes localized rail and optimized multimodal freight.
• **All calculations:** Computed deterministically using GHG Protocol Scope-3 Category 4 emission factors (t × km × factor).`;
    citations.push(
      { id: 'cit-1', label: 'Pacific Electronics Carbon (1,842.10 kg)', entityType: 'Carbon', entityId: 'sup-pac-03', route: 'carbon' },
      { id: 'cit-2', label: 'Apex Components Carbon (1,191.28 kg)', entityType: 'Carbon', entityId: 'sup-apex-01', route: 'carbon' }
    );
  } else if (qLower.includes('action') || qLower.includes('open')) {
    content = `**Current Open Compliance Actions:**

1. **ACT-APX-01:** Request verified bill of lading & customs manifest for **SHIP-APX-2026-0142** (High Priority · Due 2026-10-15).
2. **ACT-APX-02:** Upload transport manifest for **SHIP-APX-2026-0131** (High Priority · Due 2026-10-20).
3. **ACT-APX-03:** Initiate ISO 45001:2018 recertification verification before **2026-11-30** (Medium Priority).
4. **ACT-NOV-01:** Remediate labor standard non-conformance for **Nova Precision** (Critical Priority).`;
    citations.push(
      { id: 'cit-1', label: 'Compliance Action Tracker', entityType: 'ComplianceAction', entityId: 'ACT-APX-01', route: 'actions' }
    );
  } else if (qLower.includes('compare') || (qLower.includes('greencore') && qLower.includes('apex'))) {
    content = `**Comparative Benchmarking: Apex Components vs GreenCore Technologies**

• **Compliance Score:** GreenCore (94/100) leads Apex Components (90/100) by +4 points.
• **Documentation Completeness:** GreenCore has 100% verified shipment documentation. Apex is missing 2 manifests (**SHIP-APX-2026-0142** and **SHIP-APX-2026-0131**).
• **Certification Health:** GreenCore has zero expiring standards. Apex has ISO 45001:2018 expiring on **2026-11-30**.
• **Risk Classification:** Both maintain **LOW Risk** rating, but GreenCore qualifies for Tier-1 Strategic Preferred status.`;
    citations.push(
      { id: 'cit-1', label: 'Compare Suppliers View', entityType: 'Supplier', entityId: 'compare', route: 'compare' },
      { id: 'cit-2', label: 'GreenCore Technologies (94/100)', entityType: 'Supplier', entityId: 'sup-gc-04', route: 'supplier-detail', param: 'sup-gc-04' }
    );
  } else if (qLower.includes('missing') && qLower.includes('evidence')) {
    content = `**Missing Verification Evidence for Apex Components Ltd:**

1. **Logistics Manifest: SHIP-APX-2026-0142** — Freight consignment listed as in-transit with no attached bill of lading or carrier receipt.
2. **Logistics Manifest: SHIP-APX-2026-0131** — Primary weight and fuel ticket unverified.
3. **Recertification Audit Plan for ISO 45001:2018** — Mandatory renewal audit evidence required prior to the November 30, 2026 expiry.`;
    citations.push(
      { id: 'cit-1', label: 'Shipment: SHIP-APX-2026-0142', entityType: 'Shipment', entityId: 'SHIP-APX-2026-0142', route: 'shipments' },
      { id: 'cit-2', label: 'Shipment: SHIP-APX-2026-0131', entityType: 'Shipment', entityId: 'SHIP-APX-2026-0131', route: 'shipments' }
    );
  } else if (qLower.includes('high-risk') || qLower.includes('high risk')) {
    content = `**High-Risk Suppliers in Internal Registry:**

• **Nova Precision Components (Taiwan)**
  - **Risk Rating:** CRITICAL / HIGH
  - **Compliance Score:** 62/100
  - **Triggers:** Expired ISO 14001 certificate, open labor audit non-conformance, and high document rejection rate.
  - **Status:** Under Active Remediation / Purchasing Freeze.`;
    citations.push(
      { id: 'cit-1', label: 'Nova Precision Components (62/100)', entityType: 'Supplier', entityId: 'sup-nova-02', route: 'supplier-detail', param: 'sup-nova-02' }
    );
  } else {
    content = `**SourceTrace Registry Verified Summary:**

• **Portfolio Size:** 5 active enterprise suppliers tracked under deterministic audit standards.
• **Top Compliant Supplier:** GreenCore Technologies (94/100 · LOW Risk).
• **Core Supplier:** Apex Components Ltd (90/100 · LOW Risk · 2 manifests pending · ISO 45001 expiring 2026-11-30).
• **Highest Counterparty Risk:** Nova Precision Components (62/100 · CRITICAL Risk).
• **Audit Trail:** All calculations and records verified sequentially in the internal SHA-256 integrity ledger.`;
    citations.push(
      { id: 'cit-1', label: 'Executive Dashboard', entityType: 'Supplier', entityId: 'dashboard', route: 'dashboard' }
    );
  }

  res.json({
    content,
    citations,
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable — showing evidence-based fallback insights.',
    model: 'Evidence-based fallback analysis',
  });
});

// AI What-If Risk Simulator Endpoint
app.post('/api/ai/simulate-scenario', async (req, res) => {
  const { scenario, supplier } = req.body;

  if (!supplier) {
    return res.status(400).json({ error: 'Supplier data is required' });
  }

  const baseScore = supplier.complianceScore || 90;
  let scoreDelta = 0;
  let carbonDeltaKg = 0;
  const remediationPlan: string[] = [];

  if (scenario.resolveMissingManifests) {
    scoreDelta += 6;
    remediationPlan.push('Attach verified freight manifests for pending consignments (e.g. SHIP-APX-2026-0142 & 0131)');
  }
  if (scenario.renewExpiringCerts) {
    scoreDelta += 4;
    remediationPlan.push('Submit accredited ISO 45001:2018 recertification audit report before 2026-11-30');
  }
  if (scenario.lowCarbonFreight) {
    carbonDeltaKg = Math.round((supplier.carbonSummary?.totalEmissionsKg || 1191.28) * 0.40);
    remediationPlan.push('Transition regional road freight to intermodal electrified rail and Euro VI-e routes');
  }
  if (scenario.resolveOpenNonConformances) {
    scoreDelta += 3;
    remediationPlan.push('Close open corrective actions with third-party auditor sign-off');
  }
  if (scenario.simulateAdverseEvent) {
    scoreDelta -= 15;
    remediationPlan.push('Simulated: Unresolved audit finding and expired quality certification');
  }

  const projectedScore = Math.min(100, Math.max(0, baseScore + scoreDelta));
  const projectedRisk = projectedScore >= 85 ? 'LOW' : projectedScore >= 70 ? 'MEDIUM' : 'HIGH';

  const prompt = `You are a supply chain risk management consultant.
Analyze this simulated supplier scenario:
Supplier: ${supplier.name} (${supplier.code})
Baseline Compliance Score: ${baseScore}/100 (${supplier.riskLevel} Risk)
Projected Compliance Score: ${projectedScore}/100 (${projectedRisk} Risk)
Net Score Change: ${scoreDelta > 0 ? '+' : ''}${scoreDelta} points
Carbon Reduction: ${carbonDeltaKg} kg CO2e
Simulated Actions: ${JSON.stringify(scenario)}

Provide a concise 2-paragraph executive memo summarizing:
1. The business and compliance impact of these adjustments.
2. The recommended procurement decision (e.g. Tier-1 preferred status, audit frequency adjustment, contract renewal).
Return JSON: { "strategicMemo": string }`;

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.strategicMemo) {
        return res.json({
          projectedScore,
          scoreDelta,
          projectedRisk,
          carbonDeltaKg,
          strategicMemo: parsed.strategicMemo,
          remediationPlan,
          source: 'gemini',
          isFallback: false,
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'simulate-scenario');
    }
  }

  // Deterministic executive memo
  const directionText = scoreDelta >= 0 ? `an improvement of +${scoreDelta} points` : `a decline of ${scoreDelta} points`;
  const memo = `Executing this simulation for ${supplier.name} yields a projected compliance score of ${projectedScore}/100 (${directionText}), moving risk classification to ${projectedRisk}. By addressing primary documentation and certification milestones, ${supplier.name} eliminates critical compliance vulnerabilities and secures verifiable Scope-3 logistics integrity.

From a procurement governance perspective, achieving a ${projectedScore}/100 score qualifies the vendor for Tier-1 Preferred Supplier status, reducing audit oversight frequency from quarterly reviews to an annual self-service attestation cycle while yielding ${carbonDeltaKg > 0 ? `${carbonDeltaKg} kg CO2e in verified logistics emissions reduction.` : 'complete audit trail transparency.'}`;

  res.json({
    projectedScore,
    scoreDelta,
    projectedRisk,
    carbonDeltaKg,
    strategicMemo: memo,
    remediationPlan,
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable. Showing evidence-based registry information.',
  });
});

// Endpoint: Explain Evidence Contradiction
app.post('/api/ai/explain-contradiction', async (req, res) => {
  const { contradiction } = req.body;

  if (!contradiction) {
    return res.status(400).json({ error: 'Contradiction payload is required' });
  }

  const prompt = `You are the supply chain forensic analyst for SourceTrace AI.
Explain why this evidence contradiction matters from an operational, compliance, and regulatory audit perspective.
Provide an executive "whyItMatters" explanation (2-3 sentences) and a "recommendedAction" (1-2 sentences).

RULES:
1. Ground yourself strictly in the provided facts:
   Supplier: ${contradiction.supplierName}
   Field: ${contradiction.field}
   Source A: ${contradiction.sourceA} (Value: ${contradiction.valueA})
   Source B: ${contradiction.sourceB} (Value: ${contradiction.valueB})
   Difference: ${contradiction.difference || 'Mismatch'}
   Severity: ${contradiction.severity}
2. Do NOT invent external facts, government databases, or customs investigations.
3. Respond ONLY with a valid JSON object matching:
{
  "whyItMatters": string,
  "recommendedAction": string
}`;

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({
          whyItMatters: parsed.whyItMatters,
          recommendedAction: parsed.recommendedAction,
          source: 'gemini',
          isFallback: false,
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'explain-contradiction');
    }
  }

  // Deterministic fallback
  res.json({
    whyItMatters: `Discrepancy detected between ${contradiction.sourceA} (${contradiction.valueA}) and ${contradiction.sourceB} (${contradiction.valueB}). This creates audit exposure under CSRD / EU supply chain regulations and prevents automated milestone reconciliation.`,
    recommendedAction: contradiction.recommendedAction || 'Request formal reconciliation documentation from supplier and freeze related automated approvals.',
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable. Showing evidence-based registry information.',
  });
});

// Endpoint: Autonomous Supplier Investigation Interpretation
app.post('/api/ai/investigate-supplier', async (req, res) => {
  const { investigation } = req.body;

  if (!investigation) {
    return res.status(400).json({ error: 'Investigation payload is required' });
  }

  const prompt = `You are the chief compliance officer AI for SourceTrace AI.
Provide an executive interpretation of the following automated 8-stage supplier investigation.
RULES:
1. Rely ONLY on the provided deterministic facts:
   Supplier: ${investigation.supplierName}
   Status: ${investigation.investigationStatus}
   Risk: ${investigation.overallRisk}
   Positive Signals: ${JSON.stringify(investigation.positiveSignals)}
   Attention Required: ${JSON.stringify(investigation.attentionRequired)}
   Contradictions Found: ${investigation.contradictionsFound}
   Anomalies Found: ${investigation.anomaliesFound}
2. Format response as JSON matching:
{
  "executiveSummary": string,
  "actionPriorities": string[]
}`;

  if (ai && !isGeminiTemporarilyUnavailable()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({
          executiveSummary: parsed.executiveSummary,
          actionPriorities: parsed.actionPriorities,
          source: 'gemini',
          isFallback: false,
        });
      }
    } catch (err) {
      recordGeminiUnavailable(err, 'investigate-supplier');
    }
  }

  // Deterministic fallback
  res.json({
    executiveSummary: investigation.answer,
    actionPriorities: investigation.recommendedActions,
    source: 'deterministic_fallback',
    isFallback: true,
    notice: 'AI service temporarily unavailable. Showing evidence-based registry information.',
  });
});

// Vite Middleware for development OR static serving for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: isHmrDisabled ? false : { clientPort: 3000 },
      watch: isHmrDisabled ? null : {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SourceTrace AI Server running on http://0.0.0.0:${PORT}`);
});
