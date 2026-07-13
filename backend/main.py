from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from google import genai
from google.genai import types
import os
import shutil
import json
import secrets
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="JeevanTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://jeevantrack-backend.onrender.com",
        "https://jeevan-track.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXTRACTION_PROMPT = """
You are a medical report parser. Analyze this medical report and extract the following information in valid JSON format ONLY (no markdown, no explanation):

{
  "report_date": "YYYY-MM-DD or null if not found",
  "doctor_name": "string or null",
  "hospital_name": "string or null",
  "diagnosis": "string or null",
  "medicines": ["list of medicine names with dosage if available"],
  "lab_values": {
    "test_name": {"value": "number", "unit": "string", "normal_range": "string or null"}
  },
  "report_type": "one of: blood_test, prescription, discharge_summary, scan, other"
}

Extract ALL lab values you find (hemoglobin, vitamin D, iron, sodium, cholesterol, blood sugar, etc.) with their exact values and units.
If a field is not present in the report, use null.
"""


def extract_with_gemini(file_bytes: bytes, mime_type: str) -> dict:
    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            EXTRACTION_PROMPT
        ]
    )
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def get_user_id_from_token(authorization: str = None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        return None


def build_chunk_text(extracted_data: dict) -> str:
    parts = []

    if extracted_data.get("report_date"):
        parts.append(f"Report date: {extracted_data['report_date']}")
    if extracted_data.get("doctor_name"):
        parts.append(f"Doctor: {extracted_data['doctor_name']}")
    if extracted_data.get("hospital_name"):
        parts.append(f"Hospital: {extracted_data['hospital_name']}")
    if extracted_data.get("diagnosis"):
        parts.append(f"Diagnosis: {extracted_data['diagnosis']}")
    if extracted_data.get("medicines"):
        medicines = extracted_data["medicines"]
        if medicines:
            parts.append(f"Medicines: {', '.join(medicines)}")
    if extracted_data.get("report_type"):
        parts.append(f"Report type: {extracted_data['report_type']}")

    lab_values = extracted_data.get("lab_values") or {}
    for test_name, test_data in lab_values.items():
        value = test_data.get("value")
        unit = test_data.get("unit", "")
        normal = test_data.get("normal_range", "")
        parts.append(f"{test_name}: {value} {unit} (normal range: {normal})")

    return "\n".join(parts)


def generate_embedding(text: str) -> list:
    result = gemini_client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
        config={"output_dimensionality": 768}
    )
    return result.embeddings[0].values


@app.get("/")
def root():
    return {"message": "JeevanTrack API is running"}


@app.get("/test-db")
def test_db():
    response = supabase.table("reports").select("*").execute()
    return {"data": response.data}


@app.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    user_id = get_user_id_from_token(authorization)

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.lower().endswith(".pdf"):
        mime_type = "application/pdf"
    elif file.filename.lower().endswith((".png",)):
        mime_type = "image/png"
    else:
        mime_type = "image/jpeg"

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    try:
        extracted_data = extract_with_gemini(file_bytes, mime_type)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse extraction result as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini extraction failed: {str(e)}")

    try:
        result = supabase.table("reports").insert({
            "file_name": file.filename,
            "extracted_data": extracted_data,
            "user_id": user_id
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")

    report_id = result.data[0]["id"] if result.data else None

    # RAG — generate embedding and store chunk
    if report_id:
        try:
            chunk_text = build_chunk_text(extracted_data)
            embedding = generate_embedding(chunk_text)

            supabase.table("report_chunks").insert({
                "report_id": report_id,
                "user_id": user_id,
                "content": chunk_text,
                "embedding": embedding
            }).execute()
        except Exception as e:
            # Don't fail the upload if embedding fails
            print(f"Embedding generation failed: {str(e)}")

    return {
        "message": "File uploaded and processed successfully",
        "report_id": report_id,
        "file_name": file.filename,
        "extracted": extracted_data
    }


@app.get("/timeline")
def get_timeline(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)

    query = supabase.table("reports").select(
        "id, file_name, uploaded_at, extracted_data"
    ).order("uploaded_at", desc=False)

    if user_id:
        query = query.eq("user_id", user_id)

    response = query.execute()

    timeline = []
    for report in response.data:
        extracted = report.get("extracted_data") or {}
        timeline.append({
            "id": report["id"],
            "file_name": report["file_name"],
            "date": extracted.get("report_date"),
            "hospital": extracted.get("hospital_name"),
            "doctor": extracted.get("doctor_name"),
            "diagnosis": extracted.get("diagnosis"),
            "report_type": extracted.get("report_type"),
            "uploaded_at": report["uploaded_at"]
        })

    return {"timeline": timeline}


@app.get("/trends/{metric}")
def get_trends(metric: str, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)

    query = supabase.table("reports").select(
        "id, extracted_data, uploaded_at"
    ).order("uploaded_at", desc=False)

    if user_id:
        query = query.eq("user_id", user_id)

    response = query.execute()

    trend_points = []
    for report in response.data:
        extracted = report.get("extracted_data") or {}
        lab_values = extracted.get("lab_values") or {}

        for test_name, test_data in lab_values.items():
            if metric.lower() in test_name.lower():
                trend_points.append({
                    "report_id": report["id"],
                    "date": extracted.get("report_date"),
                    "test_name": test_name,
                    "value": test_data.get("value"),
                    "unit": test_data.get("unit"),
                    "normal_range": test_data.get("normal_range"),
                    "uploaded_at": report["uploaded_at"]
                })

    return {"metric": metric, "data_points": trend_points}


@app.post("/chat")
async def chat(request: dict, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    user_message = request.get("message", "")

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    reports_context = ""

    # PRIMARY: RAG — semantic vector search
    if user_id:
        try:
            query_embedding = generate_embedding(user_message)

            results = supabase.rpc("match_chunks", {
                "query_embedding": query_embedding,
                "match_user_id": user_id,
                "match_count": 5
            }).execute()

            if results.data:
                for chunk in results.data:
                    similarity = chunk.get("similarity", 0)
                    if similarity >= 0.3:
                        reports_context += f"""
[Similarity: {similarity:.2f}]
{chunk['content']}
---
"""
        except Exception as e:
            print(f"Vector search failed, falling back to SQL: {str(e)}")

    # FALLBACK: SQL-based retrieval if RAG returns nothing
    if not reports_context:
        query = supabase.table("reports").select(
            "file_name, extracted_data, uploaded_at"
        ).order("uploaded_at", desc=False)

        if user_id:
            query = query.eq("user_id", user_id)

        response = query.execute()

        for report in response.data:
            extracted = report.get("extracted_data") or {}
            lab_values = extracted.get("lab_values") or {}
            key_labs = {k: v for i, (k, v) in enumerate(lab_values.items()) if i < 20}

            reports_context += f"""
Report: {report['file_name']} (uploaded: {report['uploaded_at']})
Date: {extracted.get('report_date')}
Hospital: {extracted.get('hospital_name')}
Doctor: {extracted.get('doctor_name')}
Diagnosis: {extracted.get('diagnosis')}
Medicines: {extracted.get('medicines')}
Lab Values: {json.dumps(key_labs)}
---
"""

    chat_prompt = f"""
You are a personal health assistant. You have access to the user's medical records below.
Answer the user's question based ONLY on their actual report data.
Be concise, clear, and helpful. Cite specific values from the reports.
If the data doesn't contain the answer, say so honestly.
Do not make up values or diagnoses.

USER'S HEALTH RECORDS:
{reports_context}

USER QUESTION: {user_message}

Answer:"""

    try:
        ai_response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=chat_prompt,
            config={
                "max_output_tokens": 300,
                "temperature": 0.1
            }
        )
        return {
            "question": user_message,
            "answer": ai_response.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/doctor-brief")
def get_doctor_brief(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)

    query = supabase.table("reports").select(
        "file_name, extracted_data, uploaded_at"
    ).order("uploaded_at", desc=False)

    if user_id:
        query = query.eq("user_id", user_id)

    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No reports found")

    reports_context = ""
    all_diagnoses = []
    all_medicines = []
    abnormal_values = []

    for report in response.data:
        extracted = report.get("extracted_data") or {}

        if extracted.get("diagnosis"):
            all_diagnoses.append(f"{extracted.get('report_date', 'Unknown date')}: {extracted.get('diagnosis')}")

        medicines = extracted.get("medicines") or []
        all_medicines.extend(medicines)

        lab_values = extracted.get("lab_values") or {}
        for test_name, test_data in lab_values.items():
            value = test_data.get("value")
            normal_range = test_data.get("normal_range")
            unit = test_data.get("unit", "")
            if value and normal_range:
                abnormal_values.append(
                    f"{test_name}: {value} {unit} (Normal: {normal_range}) - from {extracted.get('report_date', 'unknown date')}"
                )

        reports_context += f"""
Report: {report['file_name']} | Date: {extracted.get('report_date')} | Hospital: {extracted.get('hospital_name')}
"""

    brief_prompt = f"""
You are a medical summarization assistant. Based on the patient's medical reports below, generate a concise doctor brief in this exact format:

PATIENT HEALTH BRIEF
====================

VISIT HISTORY:
{reports_context}

DIAGNOSES HISTORY:
{chr(10).join(all_diagnoses) if all_diagnoses else 'None recorded'}

CURRENT MEDICATIONS:
{chr(10).join(set(all_medicines)) if all_medicines else 'None recorded'}

KEY ABNORMAL LAB VALUES:
{chr(10).join(abnormal_values[:15]) if abnormal_values else 'None found'}

Based on all the above data, write:
1. A 2-3 sentence CLINICAL SUMMARY of the patient's health status
2. TOP 3 CONCERNS a doctor should be aware of
3. RECOMMENDED FOLLOW-UPS based on the data

Keep it concise, clinical, and factual. Do not invent any information.
"""

    try:
        ai_response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=brief_prompt
        )
        return {
            "brief": ai_response.text,
            "reports_count": len(response.data),
            "generated_at": "now"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brief generation failed: {str(e)}")


@app.post("/share")
def create_share_link(expiry_hours: int = 24):
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=expiry_hours)

    try:
        result = supabase.table("shares").insert({
            "token": token,
            "expires_at": expires_at.isoformat(),
            "revoked": False
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create share link: {str(e)}")

    return {
        "token": token,
        "share_url": f"https://jeevantrack-backend.onrender.com/shared/{token}",
        "expires_at": expires_at.isoformat(),
        "expires_in_hours": expiry_hours
    }


@app.get("/shared/{token}")
def view_shared_report(token: str):
    try:
        result = supabase.table("shares").select("*").eq("token", token).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not result.data:
        raise HTTPException(status_code=404, detail="Share link not found")

    share = result.data[0]

    if share["revoked"]:
        raise HTTPException(status_code=403, detail="This share link has been revoked")

    expires_at = datetime.fromisoformat(share["expires_at"])
    if datetime.utcnow() > expires_at:
        raise HTTPException(status_code=403, detail="This share link has expired")

    reports = supabase.table("reports").select(
        "file_name, extracted_data, uploaded_at"
    ).order("uploaded_at", desc=False).execute()

    timeline = []
    for report in reports.data:
        extracted = report.get("extracted_data") or {}
        timeline.append({
            "file_name": report["file_name"],
            "date": extracted.get("report_date"),
            "hospital": extracted.get("hospital_name"),
            "doctor": extracted.get("doctor_name"),
            "diagnosis": extracted.get("diagnosis"),
            "report_type": extracted.get("report_type"),
        })

    reports_context = ""
    for report in reports.data:
        extracted = report.get("extracted_data") or {}
        reports_context += f"""
Report: {report['file_name']} | Date: {extracted.get('report_date')} | Hospital: {extracted.get('hospital_name')}
Lab Values: {json.dumps(extracted.get('lab_values', {}))}
Diagnosis: {extracted.get('diagnosis')}
Medicines: {extracted.get('medicines')}
---
"""

    brief_prompt = f"""
You are a medical summarization assistant. Generate a concise doctor brief based on this patient's reports.
Write:
1. A 2-3 sentence CLINICAL SUMMARY
2. TOP 3 CONCERNS a doctor should know
3. RECOMMENDED FOLLOW-UPS

Keep it concise, clinical, and factual. Do not invent any information.

PATIENT REPORTS:
{reports_context}
"""

    try:
        ai_response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=brief_prompt
        )
        doctor_brief = ai_response.text
    except Exception:
        doctor_brief = "Could not generate brief at this time."

    return {
        "message": "Shared health records - read only",
        "expires_at": share["expires_at"],
        "timeline": timeline,
        "doctor_brief": doctor_brief
    }


@app.delete("/share/{token}")
def revoke_share_link(token: str):
    try:
        supabase.table("shares").update({"revoked": True}).eq("token", token).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Share link revoked successfully"}


@app.delete("/reports/{report_id}")
def delete_report(report_id: str, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)

    try:
        report = supabase.table("reports").select("id, user_id").eq("id", report_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    if user_id and report.data[0].get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")

    try:
        supabase.table("reports").delete().eq("id", report_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

    return {"message": "Report deleted successfully", "report_id": report_id}