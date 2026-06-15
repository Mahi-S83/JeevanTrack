# API Endpoints

## POST /upload
Request: file (image or PDF)
Response: {
  "report_id": "string",
  "extracted": {
    "date": "string",
    "lab_values": {},
    "medications": []
  }
}

## GET /timeline
Response: {
  "entries": [
    {
      "id": "string",
      "date": "string",
      "summary": "string"
    }
  ]
}