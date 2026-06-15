from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Path to a sample report - use a real lab report image/PDF you have
file_path = "uploads/br.pdf"  # change to your test file

with open(file_path, "rb") as f:
    file_bytes = f.read()

# Determine mime type based on extension
mime_type = "application/pdf" if file_path.endswith(".pdf") else "image/jpeg"

prompt = """
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

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
        prompt
    ]
)

print(response.text)

# Try parsing as JSON
try:
    # Remove markdown code fences if present
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    parsed = json.loads(text.strip())
    print("\n--- PARSED JSON ---")
    print(json.dumps(parsed, indent=2))
except json.JSONDecodeError as e:
    print(f"\n--- JSON PARSE FAILED: {e} ---")