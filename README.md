🩺 JeevanTrack
AI-Powered Personal Health Timeline Agent
<p align="center"> <img src="assets/logo.png" width="180" alt="JeevanTrack Logo"> </p> <p align="center"> <b>Your Health History, Understood by AI.</b> </p> <p align="center"> Transform scattered medical reports into a unified, searchable, and intelligent health timeline. </p>
🚀 InnovateZ 2026 Submission

Team Name: Code Blooded
College: VIT Bhopal University
Branch: B.Tech CSE (AI & ML) – 4th Year

Team Members
Saksham Trivedi
Mahi Singh


🌍 Live Demo
[Frontend](https://jeevan-track.vercel.app?utm_source=chatgpt.com)

Backend

[Backend API](https://jeevantrack-backend.onrender.com?utm_source=chatgpt.com)

Repository

[GitHub Repository](https://github.com/Mahi-S83/JeevanTrack?utm_source=chatgpt.com)

📌 Problem Statement

Healthcare data is fragmented.

Medical reports live in:

WhatsApp chats
Emails
Hospital portals
Physical files
Diagnostic lab websites

When patients visit a new doctor, they often struggle to answer simple but important questions:

When was my iron last low?
Have I had this condition before?
Which medicines did I take previously?
How have my lab values changed over time?

This leads to:

Repeated diagnostic tests
Missed health patterns
Poor continuity of care
Time wasted during consultations

Existing healthcare platforms primarily focus on storing documents rather than understanding them.

💡 Solution

JeevanTrack is an AI-powered Personal Health Timeline Agent that converts fragmented medical records into a structured, searchable, and interactive health history.

Users simply upload:

Lab Reports
Prescriptions
Imaging Reports
Discharge Summaries

JeevanTrack automatically:

✅ Extracts structured medical information

✅ Organizes records into conditions

✅ Builds a chronological health timeline

✅ Tracks health trends

✅ Generates doctor-ready summaries

✅ Allows natural-language queries over personal health records

🎯 Key Features
📂 AI Report Upload & Extraction

Upload:

PDF Reports
Images
Scanned Documents

Gemini Vision extracts:

Diagnoses
Medications
Lab Values
Doctor Information
Hospital Information
Report Dates
🕒 Condition-Centric Health Timeline

Instead of storing documents, JeevanTrack organizes healthcare information by condition.

Example:

Iron Deficiency Anemia
├── Blood Test
├── Prescription
└── Follow-up

Type 2 Diabetes
├── Lab Reports
├── Medications
└── Monitoring History

Status Indicators:

🔴 Active

🟡 Recurring

🔵 Resolved

📈 Health Trends Dashboard

Visualize:

Hemoglobin
Iron
Vitamin D
Cholesterol
Sodium
Blood Sugar

Features:

Historical Trends
Latest Values
Average Values
Normal Range Indicators
Trend Analysis
🤖 Ask AI

Users can ask:

What conditions do I have?
When was my iron lowest?
Show my latest reports.
How are my lab values trending?
What should I discuss with my doctor?

Supports:

Gemini AI responses
Rule-based fallback responses
🩺 Doctor Brief Generator

Generate a one-page clinical summary containing:

Active Conditions
Top Concerns
Follow-ups
Medications
Health History Summary

Designed specifically for doctor appointments.

📔 Health Journal

Track:

Symptoms
Notes
Medication Responses
Severity Levels
Recovery Progress
🔒 Secure Sharing

Generate temporary links for doctors to access health records.

Current MVP:

Share Link UI
Token-based architecture

Planned:

Full doctor collaboration workflow
🏆 Why JeevanTrack Is More Than ChatGPT
Capability	Generic LLM	JeevanTrack
Stores Medical Records	❌	✅
Condition-Based Organization	❌	✅
Health Timeline	❌	✅
Trend Visualization	❌	✅
Doctor Brief Generation	⚠️ Generic	✅ Clinical Structure
Health Journal	❌	✅
Medical Record Search	❌	✅
AI + Manual Fallback	❌	✅
User-Specific Health Memory	❌	✅

JeevanTrack doesn't just answer questions.

It remembers, organizes, and reasons over an individual's health journey.

🏗️ System Architecture
Current MVP Architecture
┌─────────────────────────────┐
│       Next.js Frontend      │
│        (Vercel)             │
└──────────────┬──────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────┐
│      FastAPI Backend        │
│        (Render)             │
└───────┬─────────┬───────────┘
        │         │
        ▼         ▼

┌─────────────┐   ┌──────────────┐
│ Supabase    │   │ Gemini 2.5   │
│ Auth        │   │ Flash Vision │
│ PostgreSQL  │   │ & AI Agent   │
│ Storage     │   └──────────────┘
└─────────────┘

        │
        ▼

Timeline
Health Trends
Doctor Brief
Ask AI
Journal
Planned Features (Future Roadmap)
pgvector Semantic Search
Gemini Embeddings
Doctor Collaboration Portal
Emergency QR Card
🛠️ Tech Stack
Frontend
Technology	Purpose
Next.js 14	Frontend Framework
TypeScript	Type Safety
Tailwind CSS	Styling
Framer Motion	Animations
Recharts	Health Graphs
Lucide React	Icons
Supabase Auth	Authentication
Backend
Technology	Purpose
FastAPI	API Server
Python	Backend Language
Gemini 2.5 Flash	AI Extraction & Chat
Supabase SDK	Database Access
HTTPX	External Requests
Pydantic	Validation
Infrastructure
Technology	Purpose
Supabase PostgreSQL	Database
Supabase Storage	File Storage
Supabase Auth	Authentication
Render	Backend Hosting
Vercel	Frontend Hosting
GitHub	Version Control
📸 Application Screenshots
Health Timeline

Condition-centric organization of health records.

Upload Flow
Condition Selection

Document Upload

Ask AI

Natural language interaction with personal health data.

Doctor Brief

AI-generated clinical summary.

Health Journal

Track symptoms and recovery progress.

Health Trends
Hemoglobin Trend

Sodium Trend

Blood Sugar Trend

🎮 Demo Credentials
Demo Account
Email:
demo82674@gmail.com

Password:
Demo@123

Pre-loaded with:

3 Conditions
9 Medical Documents
3 Journal Entries
Health Trends
Doctor Brief Data

No uploads required.

🔄 Demo Scenario
Scenario 1

Login using demo credentials.

Observe:

Iron Deficiency Anemia
Type 2 Diabetes
Fatty Liver

all automatically organized.

Scenario 2

Navigate to:

Health Trends

See historical lab value tracking.

Scenario 3

Open:

Doctor Brief

Generate an AI-assisted consultation summary.

Scenario 4

Ask:

What conditions do I have?

and receive contextual health responses.

📁 Project Structure
JeevanTrack/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── lib/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── main.py
│
├── screenshots/
│
├── assets/
│   └── logo.png
│
└── README.md
⚙️ Installation
Clone Repository
git clone https://github.com/Mahi-S83/JeevanTrack.git

cd JeevanTrack
Frontend Setup
cd frontend

npm install

npm run dev

Runs on:

http://localhost:3000
Backend Setup
cd backend

pip install -r requirements.txt

uvicorn main:app --reload

Runs on:

http://localhost:8000
🔑 Environment Variables
Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
Backend
SUPABASE_URL=
SUPABASE_KEY=

GEMINI_API_KEY=
📦 Key Dependencies
Frontend
next
react
typescript
recharts
framer-motion
lucide-react
@supabase/supabase-js
Backend
fastapi
uvicorn
python-dotenv
python-multipart
supabase
google-genai
httpx
pydantic
📄 Mock Data Used
Demo Conditions
Iron Deficiency Anemia
Type 2 Diabetes
Fatty Liver
Demo Reports
CBC Report
Lipid Profile
Blood Sugar Tests
Prescription Samples
Journal Entries
Fatigue Tracking
Recovery Tracking
Follow-up Notes
⚠️ Current Limitations
Working
Authentication
Timeline
Upload Flow
Doctor Brief
Health Trends
Ask AI
Journal
Demo Mode
Partial / Planned
PDF Preview
Voice Journal
Emergency QR Card
Doctor Collaboration
Vector Search
Infrastructure
Render free tier cold starts
Gemini free-tier quota limits
🔮 Future Roadmap
Emergency QR Card
Semantic Search (pgvector)
Gemini Embeddings
Family Health Vault
Doctor Collaboration
Mobile Application
ABDM / ABHA Integration
Predictive Health Insights
❤️ Built For InnovateZ 2026

JeevanTrack transforms scattered medical records into a living, AI-powered health timeline—helping patients and doctors understand the complete health story, instantly.🩺 JeevanTrack
AI-Powered Personal Health Timeline Agent
<p align="center"> <img src="assets/logo.png" width="180" alt="JeevanTrack Logo"> </p> <p align="center"> <b>Your Health History, Understood by AI.</b> </p> <p align="center"> Transform scattered medical reports into a unified, searchable, and intelligent health timeline. </p>
🚀 InnovateZ 2026 Submission

Team Name: Code Blooded
College: VIT Bhopal University
Branch: B.Tech CSE (AI & ML) – 4th Year

Team Members
Saksham Trivedi
Mahi Singh
🌍 Live Demo
Frontend

JeevanTrack Live Demo

Backend

Backend API

Repository

GitHub Repository

📌 Problem Statement

Healthcare data is fragmented.

Medical reports live in:

WhatsApp chats
Emails
Hospital portals
Physical files
Diagnostic lab websites

When patients visit a new doctor, they often struggle to answer simple but important questions:

When was my iron last low?
Have I had this condition before?
Which medicines did I take previously?
How have my lab values changed over time?

This leads to:

Repeated diagnostic tests
Missed health patterns
Poor continuity of care
Time wasted during consultations

Existing healthcare platforms primarily focus on storing documents rather than understanding them.

💡 Solution

JeevanTrack is an AI-powered Personal Health Timeline Agent that converts fragmented medical records into a structured, searchable, and interactive health history.

Users simply upload:

Lab Reports
Prescriptions
Imaging Reports
Discharge Summaries

JeevanTrack automatically:

✅ Extracts structured medical information

✅ Organizes records into conditions

✅ Builds a chronological health timeline

✅ Tracks health trends

✅ Generates doctor-ready summaries

✅ Allows natural-language queries over personal health records

🎯 Key Features
📂 AI Report Upload & Extraction

Upload:

PDF Reports
Images
Scanned Documents

Gemini Vision extracts:

Diagnoses
Medications
Lab Values
Doctor Information
Hospital Information
Report Dates
🕒 Condition-Centric Health Timeline

Instead of storing documents, JeevanTrack organizes healthcare information by condition.

Example:

Iron Deficiency Anemia
├── Blood Test
├── Prescription
└── Follow-up

Type 2 Diabetes
├── Lab Reports
├── Medications
└── Monitoring History

Status Indicators:

🔴 Active

🟡 Recurring

🔵 Resolved

📈 Health Trends Dashboard

Visualize:

Hemoglobin
Iron
Vitamin D
Cholesterol
Sodium
Blood Sugar

Features:

Historical Trends
Latest Values
Average Values
Normal Range Indicators
Trend Analysis
🤖 Ask AI

Users can ask:

What conditions do I have?
When was my iron lowest?
Show my latest reports.
How are my lab values trending?
What should I discuss with my doctor?

Supports:

Gemini AI responses
Rule-based fallback responses
🩺 Doctor Brief Generator

Generate a one-page clinical summary containing:

Active Conditions
Top Concerns
Follow-ups
Medications
Health History Summary

Designed specifically for doctor appointments.

📔 Health Journal

Track:

Symptoms
Notes
Medication Responses
Severity Levels
Recovery Progress
🔒 Secure Sharing

Generate temporary links for doctors to access health records.

Current MVP:

Share Link UI
Token-based architecture

Planned:

Full doctor collaboration workflow
🏆 Why JeevanTrack Is More Than ChatGPT
Capability	Generic LLM	JeevanTrack
Stores Medical Records	❌	✅
Condition-Based Organization	❌	✅
Health Timeline	❌	✅
Trend Visualization	❌	✅
Doctor Brief Generation	⚠️ Generic	✅ Clinical Structure
Health Journal	❌	✅
Medical Record Search	❌	✅
AI + Manual Fallback	❌	✅
User-Specific Health Memory	❌	✅

JeevanTrack doesn't just answer questions.

It remembers, organizes, and reasons over an individual's health journey.

🏗️ System Architecture
Current MVP Architecture
┌─────────────────────────────┐
│       Next.js Frontend      │
│        (Vercel)             │
└──────────────┬──────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────┐
│      FastAPI Backend        │
│        (Render)             │
└───────┬─────────┬───────────┘
        │         │
        ▼         ▼

┌─────────────┐   ┌──────────────┐
│ Supabase    │   │ Gemini 2.5   │
│ Auth        │   │ Flash Vision │
│ PostgreSQL  │   │ & AI Agent   │
│ Storage     │   └──────────────┘
└─────────────┘

        │
        ▼

Timeline
Health Trends
Doctor Brief
Ask AI
Journal
Planned Features (Future Roadmap)
pgvector Semantic Search
Gemini Embeddings
Doctor Collaboration Portal
Emergency QR Card
🛠️ Tech Stack
Frontend
Technology	Purpose
Next.js 14	Frontend Framework
TypeScript	Type Safety
Tailwind CSS	Styling
Framer Motion	Animations
Recharts	Health Graphs
Lucide React	Icons
Supabase Auth	Authentication
Backend
Technology	Purpose
FastAPI	API Server
Python	Backend Language
Gemini 2.5 Flash	AI Extraction & Chat
Supabase SDK	Database Access
HTTPX	External Requests
Pydantic	Validation
Infrastructure
Technology	Purpose
Supabase PostgreSQL	Database
Supabase Storage	File Storage
Supabase Auth	Authentication
Render	Backend Hosting
Vercel	Frontend Hosting
GitHub	Version Control
📸 Application Screenshots
Health Timeline

Condition-centric organization of health records.

Upload Flow
Condition Selection

Document Upload

Ask AI

Natural language interaction with personal health data.

Doctor Brief

AI-generated clinical summary.

Health Journal

Track symptoms and recovery progress.

Health Trends
Hemoglobin Trend

Sodium Trend

Blood Sugar Trend

🎮 Demo Credentials
Demo Account
Email:
demo82674@gmail.com

Password:
Demo@123

Pre-loaded with:

3 Conditions
9 Medical Documents
3 Journal Entries
Health Trends
Doctor Brief Data

No uploads required.

🔄 Demo Scenario
Scenario 1

Login using demo credentials.

Observe:

Iron Deficiency Anemia
Type 2 Diabetes
Fatty Liver

all automatically organized.

Scenario 2

Navigate to:

Health Trends

See historical lab value tracking.

Scenario 3

Open:

Doctor Brief

Generate an AI-assisted consultation summary.

Scenario 4

Ask:

What conditions do I have?

and receive contextual health responses.

📁 Project Structure
JeevanTrack/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── lib/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── main.py
│
├── screenshots/
│
├── assets/
│   └── logo.png
│
└── README.md
⚙️ Installation
Clone Repository
git clone https://github.com/Mahi-S83/JeevanTrack.git

cd JeevanTrack
Frontend Setup
cd frontend

npm install

npm run dev

Runs on:

http://localhost:3000
Backend Setup
cd backend

pip install -r requirements.txt

uvicorn main:app --reload

Runs on:

http://localhost:8000
🔑 Environment Variables
Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
Backend
SUPABASE_URL=
SUPABASE_KEY=

GEMINI_API_KEY=
📦 Key Dependencies
Frontend
next
react
typescript
recharts
framer-motion
lucide-react
@supabase/supabase-js
Backend
fastapi
uvicorn
python-dotenv
python-multipart
supabase
google-genai
httpx
pydantic
📄 Mock Data Used
Demo Conditions
Iron Deficiency Anemia
Type 2 Diabetes
Fatty Liver
Demo Reports
CBC Report
Lipid Profile
Blood Sugar Tests
Prescription Samples
Journal Entries
Fatigue Tracking
Recovery Tracking
Follow-up Notes
⚠️ Current Limitations
Working
Authentication
Timeline
Upload Flow
Doctor Brief
Health Trends
Ask AI
Journal
Demo Mode
Partial / Planned
PDF Preview
Voice Journal
Emergency QR Card
Doctor Collaboration
Vector Search
Infrastructure
Render free tier cold starts
Gemini free-tier quota limits
🔮 Future Roadmap
Emergency QR Card
Semantic Search (pgvector)
Gemini Embeddings
Family Health Vault
Doctor Collaboration
Mobile Application
ABDM / ABHA Integration
Predictive Health Insights
❤️ Built For InnovateZ 2026

JeevanTrack transforms scattered medical records into a living, AI-powered health timeline—helping patients and doctors understand the complete health story, instantly.
