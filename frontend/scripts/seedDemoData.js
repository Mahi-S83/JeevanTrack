// scripts/seedDemoData.js
// Run this in the browser console after logging in as demo82674@gmail.com

const DEMO_EMAIL = 'demo82674@gmail.com';

// Check if we're on the right account
const userEmail = localStorage.getItem('user_email');
if (userEmail !== DEMO_EMAIL) {
  console.warn('⚠️ You are not logged in as demo82674@gmail.com');
  console.warn('Current user:', userEmail);
  console.warn('Please log in as demo82674@gmail.com first.');
} else {
  console.log('✅ Logged in as demo82674@gmail.com. Seeding data...');
}

const demoConditions = [
  {
    id: "cond_demo_1",
    name: "Iron Deficiency Anemia",
    status: "active",
    documents: [
      {
        id: "doc_demo_1",
        name: "CBC Lab Report - March 2025",
        type: "Lab Report",
        fileUrl: "",
        reportId: "demo_1",
        uploadedAt: "2025-03-15T10:00:00Z",
        reportDate: "2025-03-15"
      },
      {
        id: "doc_demo_2",
        name: "Ferritin Test - March 2025",
        type: "Lab Report",
        fileUrl: "",
        reportId: "demo_2",
        uploadedAt: "2025-03-15T10:00:00Z",
        reportDate: "2025-03-15"
      },
      {
        id: "doc_demo_3",
        name: "Iron Supplement Prescription",
        type: "Prescription",
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
    status: "recurring",
    documents: [
      {
        id: "doc_demo_4",
        name: "HbA1c Report - February 2025",
        type: "Lab Report",
        fileUrl: "",
        reportId: "demo_4",
        uploadedAt: "2025-02-10T10:00:00Z",
        reportDate: "2025-02-10"
      },
      {
        id: "doc_demo_5",
        name: "Fasting Blood Sugar - February 2025",
        type: "Lab Report",
        fileUrl: "",
        reportId: "demo_5",
        uploadedAt: "2025-02-10T10:00:00Z",
        reportDate: "2025-02-10"
      },
      {
        id: "doc_demo_6",
        name: "Metformin Prescription",
        type: "Prescription",
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
    status: "resolved",
    documents: [
      {
        id: "doc_demo_7",
        name: "Ultrasound Report - January 2025",
        type: "Imaging",
        fileUrl: "",
        reportId: "demo_7",
        uploadedAt: "2025-01-20T10:00:00Z",
        reportDate: "2025-01-20"
      },
      {
        id: "doc_demo_8",
        name: "Liver Function Test - January 2025",
        type: "Lab Report",
        fileUrl: "",
        reportId: "demo_8",
        uploadedAt: "2025-01-20T10:00:00Z",
        reportDate: "2025-01-20"
      },
      {
        id: "doc_demo_9",
        name: "Gastroenterology Prescription",
        type: "Prescription",
        fileUrl: "",
        reportId: "demo_9",
        uploadedAt: "2025-01-22T10:00:00Z",
        reportDate: "2025-01-22"
      }
    ]
  }
];

const demoJournal = [
  {
    id: "j_demo_1",
    date: "2025-03-10T08:00:00Z",
    type: "symptom",
    symptom: "Fatigue",
    severity: "moderate",
    actionTaken: "Started iron supplements",
    relief: "partial",
    timeToRelief: "1 week",
    notes: "Felt tired for 2 weeks before diagnosis"
  },
  {
    id: "j_demo_2",
    date: "2025-03-20T09:00:00Z",
    type: "symptom",
    symptom: "Energy levels",
    severity: "mild",
    actionTaken: "Iron supplements",
    relief: "full",
    timeToRelief: "2 weeks",
    notes: "Feeling much better after starting supplements"
  },
  {
    id: "j_demo_3",
    date: "2025-02-15T08:00:00Z",
    type: "note",
    notes: "Follow-up with endocrinologist scheduled for March 2025"
  }
];

// Save to localStorage
localStorage.setItem('jeevantrack_conditions', JSON.stringify(demoConditions));
localStorage.setItem('jeevantrack_journal', JSON.stringify(demoJournal));
localStorage.setItem('jeevantrack_needs_refresh', 'true');

const cache = {
  conditions: demoConditions,
  lastUpdated: new Date().toISOString()
};
localStorage.setItem('jeevantrack_timeline_cache', JSON.stringify(cache));

console.log('✅ Demo data seeded successfully for', DEMO_EMAIL);
console.log('📋 Conditions:', demoConditions.length);
console.log('📄 Documents:', demoConditions.reduce((acc, c) => acc + c.documents.length, 0));
console.log('📝 Journal entries:', demoJournal.length);
console.log('🔄 Refresh the page to see the timeline.');