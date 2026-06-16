from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from google import genai
from google.genai import types
import os
import shutil
import json
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
    allow_origins=["http://localhost:3000"],
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


@app.get("/")
def root():
    return {"message": "JeevanTrack API is running"}


@app.get("/test-db")
def test_db():
    response = supabase.table("reports").select("*").execute()
    return {"data": response.data}


@app.post("/upload")
async def upload_report(file: UploadFile = File(...)):
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
            "extracted_data": extracted_data
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")

    return {
        "message": "File uploaded and processed successfully",
        "report_id": result.data[0]["id"] if result.data else None,
        "file_name": file.filename,
        "extracted": extracted_data
    }


@app.get("/timeline")
def get_timeline():
    response = supabase.table("reports").select(
        "id, file_name, uploaded_at, extracted_data"
    ).order("uploaded_at", desc=False).execute()

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