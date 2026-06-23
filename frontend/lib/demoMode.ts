// lib/demoMode.ts

export const DEMO_EMAIL = 'demo82674@gmail.com';

export function isDemoUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === DEMO_EMAIL.toLowerCase();
}

export function getDemoConditions() {
  return [
    {
      id: "cond_demo_1",
      name: "Iron Deficiency Anemia",
      status: "active" as const,
      documents: [
        {
          id: "doc_demo_1",
          name: "CBC Lab Report - March 2025",
          type: "Lab Report" as const,
          fileUrl: "",
          reportId: "demo_1",
          uploadedAt: "2025-03-15T10:00:00Z",
          reportDate: "2025-03-15"
        },
        {
          id: "doc_demo_2",
          name: "Ferritin Test - March 2025",
          type: "Lab Report" as const,
          fileUrl: "",
          reportId: "demo_2",
          uploadedAt: "2025-03-15T10:00:00Z",
          reportDate: "2025-03-15"
        },
        {
          id: "doc_demo_3",
          name: "Iron Supplement Prescription",
          type: "Prescription" as const,
          fileUrl: "",
          reportId: "demo_3",
          uploadedAt: "2025-03-16T10:00:00Z",
          reportDate: "2025-03-16"
        }
      ]
    },
    {
      id: "cond_demo_2",
      name: "Type 2 Diabetes",
      status: "recurring" as const,
      documents: [
        {
          id: "doc_demo_4",
          name: "HbA1c Report - February 2025",
          type: "Lab Report" as const,
          fileUrl: "",
          reportId: "demo_4",
          uploadedAt: "2025-02-10T10:00:00Z",
          reportDate: "2025-02-10"
        },
        {
          id: "doc_demo_5",
          name: "Fasting Blood Sugar - February 2025",
          type: "Lab Report" as const,
          fileUrl: "",
          reportId: "demo_5",
          uploadedAt: "2025-02-10T10:00:00Z",
          reportDate: "2025-02-10"
        },
        {
          id: "doc_demo_6",
          name: "Metformin Prescription",
          type: "Prescription" as const,
          fileUrl: "",
          reportId: "demo_6",
          uploadedAt: "2025-02-12T10:00:00Z",
          reportDate: "2025-02-12"
        }
      ]
    },
    {
      id: "cond_demo_3",
      name: "Fatty Liver",
      status: "resolved" as const,
      documents: [
        {
          id: "doc_demo_7",
          name: "Ultrasound Report - January 2025",
          type: "Imaging" as const,
          fileUrl: "",
          reportId: "demo_7",
          uploadedAt: "2025-01-20T10:00:00Z",
          reportDate: "2025-01-20"
        },
        {
          id: "doc_demo_8",
          name: "Liver Function Test - January 2025",
          type: "Lab Report" as const,
          fileUrl: "",
          reportId: "demo_8",
          uploadedAt: "2025-01-20T10:00:00Z",
          reportDate: "2025-01-20"
        },
        {
          id: "doc_demo_9",
          name: "Gastroenterology Prescription",
          type: "Prescription" as const,
          fileUrl: "",
          reportId: "demo_9",
          uploadedAt: "2025-01-22T10:00:00Z",
          reportDate: "2025-01-22"
        }
      ]
    }
  ];
}

export function getDemoJournal() {
  return [
    {
      id: "j_demo_1",
      date: "2025-03-10T08:00:00Z",
      type: "symptom" as const,
      symptom: "Fatigue",
      severity: "moderate" as const,
      actionTaken: "Started iron supplements",
      relief: "partial" as const,
      timeToRelief: "1 week",
      notes: "Felt tired for 2 weeks before diagnosis"
    },
    {
      id: "j_demo_2",
      date: "2025-03-20T09:00:00Z",
      type: "symptom" as const,
      symptom: "Energy levels",
      severity: "mild" as const,
      actionTaken: "Iron supplements",
      relief: "full" as const,
      timeToRelief: "2 weeks",
      notes: "Feeling much better after starting supplements"
    },
    {
      id: "j_demo_3",
      date: "2025-02-15T08:00:00Z",
      type: "note" as const,
      notes: "Follow-up with endocrinologist scheduled for March 2025"
    }
  ];
}

export function getDemoBrief() {
  return `CLINICAL SUMMARY:
The patient is currently managing 1 active condition: Iron Deficiency Anemia. Type 2 Diabetes shows recurring patterns. Fatty Liver has been resolved. Total of 9 documents have been reviewed across all conditions.

TOP 3 CONCERNS:
1. Iron Deficiency Anemia requires ongoing monitoring of ferritin and hemoglobin levels. The patient is responding well to iron supplementation.
2. Type 2 Diabetes needs continued glycemic control and regular HbA1c monitoring to prevent complications.
3. Fatty Liver has resolved but requires periodic liver function testing to ensure it remains stable.

RECOMMENDED FOLLOW-UPS:
1. Complete blood count (CBC) and iron studies in 3 months to monitor anemia.
2. HbA1c check in 3 months to assess diabetes control.
3. Liver function test in 6 months to monitor fatty liver status.

CURRENT MEDICATIONS:
• Iron supplements 100mg daily
• Metformin 500mg twice daily
• Vitamin D3 60,000 IU weekly

KEY ABNORMAL LAB VALUES:
• Hemoglobin: 12.5 g/dL (Normal: 12-17)
• Ferritin: 45 ng/mL (Normal: 12-150)
• HbA1c: 6.8% (Normal: <5.7%)
• Fasting Blood Sugar: 120 mg/dL (Normal: 74-106)`;
}