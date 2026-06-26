<div align="center">

# 🩺 JeevanTrack

### AI-Powered Personal Health Timeline

**Transform scattered medical reports into a unified, intelligent health record.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-jeevan--track.vercel.app-teal?style=for-the-badge&logo=vercel)](https://jeevan-track.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-blueviolet?style=for-the-badge&logo=render)](https://jeevantrack-backend.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Mahi--S83%2FJeevanTrack-black?style=for-the-badge&logo=github)](https://github.com/Mahi-S83/JeevanTrack)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google)](https://deepmind.google/technologies/gemini/)

---

### 👥 Team Code Blooded 

| Role | Name |
|---|---|
| 👑 Team Leader | Mahi Singh |
| 🛠️ Member | Saksham Trivedi |

</div>

---

## 🎭 Demo Account

A pre-seeded demo account is available for judges and evaluators. No file uploads needed — all features work immediately.

| | |
|---|---|
| **Email** | `demo82674@gmail.com` |
| **Password** | `demo@123` |

---

## 📌 The Problem

Every time a patient visits a new doctor, they struggle to answer basic questions — *"when did this start?", "what medicines have you taken?", "do you have old reports?"*

Medical history lives scattered across WhatsApp forwards, physical folders, hospital portals, and memory. Tools like ABHA or Practo solve *storage* — they file documents. **None of them solve the understanding problem.**

JeevanTrack fills the temporal reasoning gap: *"your Vitamin D has been deficient in 3 out of 4 reports over 2 years"* or *"your blood sugar has been trending upward since 2022."*

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🗂️ **Condition-Centric Timeline** | Reports grouped by condition (Active / Recurring / Resolved) |
| 🤖 **AI Report Extraction** | Gemini 2.5 Flash Vision parses PDFs and images — 80+ lab values in ~10 seconds |
| 📊 **Health Trends** | Interactive charts with normal range reference lines |
| 🩻 **Doctor Brief** | One-click AI-generated clinical summary for any appointment |
| 💬 **Ask AI** | Natural language Q&A over your personal health data |
| 📓 **Health Journal** | Log symptoms, medications, and notes |
| 🔗 **Secure Share Links** | Expiring QR-code links for doctors — no account needed |
| 🛡️ **Manual Fallback** | Full functionality even when Gemini quota is exhausted |

---

## 🖼️ Screenshots

### Health Timeline — Condition-Centric View
![Health Timeline](screenshots/timeline.png)

All reports are grouped by medical condition with color-coded status badges: **Active** (red), **Recurring** (yellow), **Resolved** (blue).

### Upload Report — 3-Step Wizard
![Upload Report](screenshots/upload_condition.png)

Select an existing condition or create a new one, then upload any PDF or image. Gemini Vision extracts structured data automatically.

### Health Trends — Hemoglobin with Normal Range
![Health Trends Hemoglobin](screenshots/trends_hemoglobin.png)

Interactive charts across Hemoglobin, Iron, Vitamin D, Cholesterol, Sodium, and Blood Sugar — with hover tooltips and normal range overlays.

### Health Trends — Blood Sugar & Sodium
| Blood Sugar | Sodium |
|---|---|
| ![Blood Sugar](screenshots/trends_bloodsugar.png) | ![Sodium](screenshots/trends_sodium.png) |

### Doctor Brief — AI Clinical Summary
![Doctor Brief](screenshots/doctor_brief.png)

One-button generation of Clinical Summary, Top Concerns, and Recommended Follow-ups — ready to share with any doctor.

### Ask AI — Personal Health Assistant
![Ask AI](screenshots/ask_ai.png)

Chat with your own health data. Suggested questions for quick access. Answers grounded strictly in your uploaded reports.

### Health Journal
| Journal Overview | Log Symptom View |
|---|---|
| ![Journal](screenshots/journal.png) | ![Journal Log](screenshots/journal_log.png) |

Track symptoms with severity and relief data, linked medications, and freeform notes.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JeevanTrack Architecture                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Frontend (Vercel)                            │   │
│  │  Next.js 14 · TypeScript · Tailwind CSS · Recharts · Lucide React  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Pages: Landing · Login · Dashboard · Upload · Brief · Trends      │   │
│  │          Ask AI · Journal · Settings                                │   │
│  │  Storage: localStorage (conditions, cache, demo data, journal)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                               HTTPS + JWT                                  │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Backend (Render)                                 │   │
│  │                    FastAPI · Python                                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  POST /upload · GET /timeline · POST /chat · GET /doctor-brief     │   │
│  │  GET /trends/{metric} · POST /share · GET /shared/{token}          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         ▼                          ▼                          ▼            │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐  │
│  │   Supabase      │     │   Gemini AI     │     │   localStorage      │  │
│  │   PostgreSQL    │     │   2.5 Flash     │     │   (Browser)         │  │
│  │   Auth · Store  │     │   Vision+Chat   │     │   Cache · Demo Data │  │
│  └─────────────────┘     └─────────────────┘     └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 How It Works — Under the Hood

### Report Upload Pipeline

```
User uploads PDF/Image
        ↓
Frontend sends multipart/form-data POST /upload
  + Supabase JWT in Authorization header
        ↓
FastAPI extracts user UUID from JWT (supabase.auth.get_user)
        ↓
File bytes → Gemini 2.5 Flash Vision
  Prompt: return strict JSON — report_date, doctor_name,
  hospital_name, diagnosis, medicines[], lab_values{}
        ↓
Backend parses JSON (strips markdown fences)
JSONDecodeError → 500 with clear message (no silent failures)
        ↓
Structured data stored in Supabase PostgreSQL (jsonb column)
  alongside user_id, file_name, uploaded_at
        ↓
Returns report_id + full extracted data to frontend
```

### AI Chat — Temporal Reasoning

```
User question → POST /chat
        ↓
Backend fetches ALL reports for user (filtered by user_id)
        ↓
Builds structured context:
  date · hospital · doctor · diagnosis · medicines · lab values
        ↓
Gemini 2.5 Flash with strict system prompt:
  "Answer ONLY from the user's actual report data."
        ↓
Natural language answer with cited values
```

### Doctor Brief Generation

```
Fetch all user reports
        ↓
Extract all diagnoses, medicines, lab values
Identify abnormal values (value outside normal range)
        ↓
Gemini prompt → Clinical Summary (2-3 sentences)
               + Top 3 Concerns
               + Recommended Follow-ups
        ↓
Formatted text returned to frontend
```

### Secure Share Links

```
POST /share
  → secrets.token_urlsafe(32) generates token
  → token + expiry stored in Supabase shares table

GET /shared/{token}
  → Validate: exists, not revoked, not expired
  → Return timeline + doctor brief (no auth required)

DELETE /share/{token}
  → Sets revoked=true in database
```

### Biomarker Standardization

Different labs use different names for the same marker:

```
Hb · HGB · Hemoglobin           → Hemoglobin
TSH · T.S.H · Thyroid Stim...   → TSH
```

The standardization engine maps all variations into a unified internal representation before storage — enabling cross-report trend analysis.

---

## 🧠 Why JeevanTrack is More Than ChatGPT or Gemini

| Capability | Generic LLM | JeevanTrack |
|---|---|---|
| **Persistent memory across reports** | ❌ No memory between sessions | ✅ Every report stored permanently |
| **Temporal reasoning** | ❌ Single-report analysis only | ✅ "Iron was low Feb 2023, normal Aug 2023, low again Jan 2024" |
| **Structured extraction** | ❌ Returns prose summaries | ✅ Strict JSON with 80+ lab values, units, normal ranges |
| **Identity-linked records** | ❌ No concept of "your" data | ✅ Every report linked to verified user UUID |
| **Zero manual entry** | ❌ User must copy-paste values | ✅ Full extraction + storage in one API call |
| **Doctor-ready output** | ❌ Requires manual formatting | ✅ Aggregated clinical brief in one click |
| **Secure doctor sharing** | ❌ No sharing mechanism | ✅ Expiring QR-code links, no doctor account needed |

> **Real example:** Upload three CBC reports over six months. JeevanTrack automatically tracks hemoglobin from 8.9 → 10.5 → 12.1 g/dL, identifies anemia recovery, updates the health timeline, and generates progress insights — without any manual comparison.

---

## 🗂️ Repository Structure

```
JeevanTrack/
├── frontend/                   # Next.js 14 application
│   ├── app/                    # App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Auth pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── upload/             # Report upload wizard
│   │   ├── timeline/           # Condition timeline
│   │   ├── trends/             # Health trend charts
│   │   ├── ask/                # AI chat interface
│   │   ├── brief/              # Doctor brief
│   │   ├── journal/            # Health journal
│   │   └── settings/           # User settings
│   ├── components/             # Reusable React components
│   ├── lib/                    # Supabase client, utilities
│   ├── public/                 # Static assets
│   ├── package.json
│   └── .env.local              # Frontend environment variables
│
├── backend/                    # FastAPI Python application
│   ├── main.py                 # Entry point, all route definitions
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment variables
│
├── .env-example                # Environment variable template
├── api-contract.md             # API endpoint documentation
├── schema.md                   # Database schema
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase project
- A Google Gemini API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/Mahi-S83/JeevanTrack.git
cd JeevanTrack
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env-example .env
# Fill in your values (see Environment Variables section below)

# Run the backend
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`
API docs (auto-generated by FastAPI): `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp ../.env-example .env.local
# Fill in your values

# Run the development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend `.env`

```env
SUPABASE_URL=https:[//your-project.supabase.co](https://qmubwsojrctuttgzhdhv.supabase.co)
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
```

| Variable | Description | Where to Get |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role key (not anon key) | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/) |

> ⚠️ Use the **service role key** for the backend (not the anon key). The service key bypasses Row Level Security and is required for server-side operations.

---

### Frontend `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://qmubwsojrctuttgzhdhv.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (same as backend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon** (public) key |
| `NEXT_PUBLIC_API_URL` | Backend URL (localhost for dev, Render URL for production) |

---

## 📦 Key Dependencies

### Backend (`requirements.txt`)

```
fastapi          # Async Python web framework
uvicorn          # ASGI server
python-dotenv    # Environment variable loading
pydantic         # Data validation and serialization
python-multipart # File upload handling (multipart/form-data)
supabase         # Supabase Python client (auth + database)
google-genai     # Google Gemini AI SDK
httpx            # Async HTTP client
```

### Frontend (`package.json`)

```json
{
  "next": "^14.2.35",              // App Router, SSR
  "react": "^18.3.1",
  "@supabase/supabase-js": "^2.108.2",  // Auth + DB client
  "recharts": "^3.8.1",            // Health trend charts
  "lucide-react": "^1.21.0",       // Icon system
  "framer-motion": "^12.40.0",     // Animations
  "react-datepicker": "^9.1.0",    // Date input in journal
  "tailwindcss": "^4",             // Utility-first CSS
  "typescript": "^5"
}
```

---

## 🗄️ Database Schema

JeevanTrack uses Supabase PostgreSQL. The main tables are:

```sql
-- User reports with extracted data stored as JSONB
reports (
  id          UUID PRIMARY KEY,
  user_id     UUID REFERENCES auth.users,
  file_name   TEXT,
  uploaded_at TIMESTAMP,
  extracted   JSONB    -- { report_date, doctor, hospital, diagnosis,
                       --   medicines[], lab_values{} }
)

-- Timeline entries per condition
timeline_entries (
  id           UUID PRIMARY KEY,
  user_id      UUID REFERENCES auth.users,
  condition    TEXT,
  report_id    UUID REFERENCES reports,
  created_at   TIMESTAMP
)

-- Secure share tokens
shares (
  id         UUID PRIMARY KEY,
  user_id    UUID REFERENCES auth.users,
  token      TEXT UNIQUE,
  expires_at TIMESTAMP,
  revoked    BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

---

## 🎭 Demo Account

A pre-seeded demo account is available for judges and evaluators. No file uploads needed — all features work immediately.

| | |
|---|---|
| **Email** | `demo82674@gmail.com` |
| **Password** | `demo@123` |

**Pre-loaded data:**
- 3 conditions: Iron Deficiency Anemia (Active), Type 2 Diabetes (Recurring), Fatty Liver (Resolved)
- 9 documents spread across conditions
- 3 health journal entries (fatigue → iron supplements → follow-up note)
- Full health trends for Hemoglobin, Iron, Vitamin D, Cholesterol, Sodium, Blood Sugar

---

## 🧪 Sample / Mock Data

| Data | Type | Description |
|---|---|---|
| `fakeReports.pdf` | Mock PDF | Sample lab report with CBC, lipid profile, and metabolic panel |
| Demo conditions | localStorage seed | Iron Deficiency Anemia, Type 2 Diabetes, Fatty Liver |
| Demo journal | localStorage seed | 3 entries: fatigue (moderate), energy levels (mild), follow-up note |
| Test PDF | Real document | Sterling Accuris Pathology Laboratory 19-page report (used for extraction testing) |

Demo data is seeded automatically when the demo email logs in. All localStorage keys used:

| Key | Purpose |
|---|---|
| `jeevantrack_conditions` | Condition list with metadata |
| `jeevantrack_timeline_cache` | Cached timeline data |
| `jeevantrack_needs_refresh` | Cache invalidation flag |
| `jeevantrack_journal` | Health journal entries |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload report, trigger Gemini extraction |
| `GET` | `/timeline` | Fetch user's health timeline |
| `POST` | `/chat` | Ask a question against health data |
| `GET` | `/doctor-brief` | Generate AI clinical summary |
| `GET` | `/trends/{metric}` | Get historical values for a biomarker |
| `POST` | `/share` | Generate expiring share token |
| `GET` | `/shared/{token}` | Public view (no auth required) |
| `DELETE` | `/share/{token}` | Revoke a share link |

All endpoints except `/shared/{token}` require a Supabase JWT in the `Authorization: Bearer <token>` header.

---

## ✅ Feature Status

### Working

| Feature | Notes |
|---|---|
| ✅ Authentication (signup/login/logout) | Supabase Auth |
| ✅ Medical report upload | PDF + images |
| ✅ Gemini Vision extraction | Tested on real 19-page report — 80+ values |
| ✅ Condition-centric timeline | Color-coded, cached |
| ✅ Health trend charts | Normal range reference lines |
| ✅ AI health chat | Answers grounded in personal data |
| ✅ Doctor Brief | API + localStorage fallback |
| ✅ Secure share links with QR code | Expiring tokens via `secrets` module |
| ✅ Health Journal | Symptom logging with severity + relief |
| ✅ Demo account | Pre-seeded data, all features accessible |

### Partial

| Feature | Status |
|---|---|
| ⚠️ PDF preview | File URL stored; in-browser viewer not implemented |
| ⚠️ Voice journal | UI ready; voice recording not implemented |
| ⚠️ Advanced trend analysis | Basic tracking done; multi-condition correlation pending |

### Not Built (Post-Hackathon Roadmap)

| Feature |
|---|
| ❌ Family health profiles |
| ❌ Row Level Security (RLS) enabled |
| ❌ Push notifications for abnormal values |
| ❌ PDF download of Doctor Brief |

---

## ⚠️ Known Limitations

1. **Gemini API Quota** — Free tier allows ~20 requests/day. If exhausted, upload falls back to manual entry (no data loss, just no AI extraction).
2. **Render Cold Start** — Free tier backend may sleep after 15 minutes of inactivity. First request after sleep takes 30–60 seconds.
3. **Manual Entry ≠ Trends** — Manual fallback entry does not extract lab values; only AI-extracted reports populate Health Trends.
4. **Share Links** — Currently share all reports, not user-selected reports.
5. **Gemini Accuracy** — Extraction accuracy may vary with handwritten or very low-quality scanned reports.

---

## 🗺️ Deployment

| Component | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://jeevan-track.vercel.app |
| Backend | Render | https://jeevantrack-backend.onrender.com |
| Database | Supabase | https://qmubwsojrctuttgzhdhv.supabase.co |

---

## 🔮 Roadmap

**Short-term**
- Improve OCR accuracy across diverse report formats
- Expand biomarker extraction coverage
- Strengthen duplicate report detection

**Medium-term**
- Doctor and caregiver access modules
- Automated medication management
- Smart health reminders and follow-ups
- Personalized health risk scoring

**Long-term vision**
JeevanTrack aims to become a comprehensive lifelong health intelligence platform — transforming fragmented medical records into a continuously evolving digital health companion that supports preventive healthcare, clinical decision-making, and long-term patient wellness.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by **Team Code Blooded** 

*Mahi Singh (Team Leader) · Saksham Trivedi*

**JeevanTrack** — *Your health, remembered.*

</div>
