import { supabase } from './supabase'

const API_BASE = 'https://jeevantrack-backend.onrender.com'

export async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function apiGet(endpoint: string) {
  const token = await getAuthToken()
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function apiPost(endpoint: string, body: any) {
  const token = await getAuthToken()
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function apiUpload(endpoint: string, file: File) {
  const token = await getAuthToken()
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}