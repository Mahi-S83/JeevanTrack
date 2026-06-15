# Database Schema

## users
- id (uuid, primary key)
- email (string)
- created_at (timestamp)

## reports
- id (uuid, primary key)
- user_id (uuid, references users)
- file_name (string)
- extracted_data (jsonb)
- uploaded_at (timestamp)

## timeline_entries
- id (uuid, primary key)
- report_id (uuid, references reports)
- date (date)
- summary (text)