// lib/dataService.ts
import { supabase } from './supabase';
import { 
  getConditions, 
  saveConditions, 
  saveCache,
  setNeedsRefresh,
  type Condition,
  type Document
} from './conditionStorage';
import { isDemoUser, getDemoConditions } from './demoMode';

/**
 * LOAD DATA - One source of truth
 * 
 * Priority:
 * 1. localStorage (fastest, offline-first)
 * 2. Supabase (only for real users)
 * 3. Demo data (last resort)
 */
export async function loadHealthData(): Promise<Condition[]> {
  const email = localStorage.getItem('user_email');
  const isDemo = isDemoUser(email);

  // ── DEMO USER: Use localStorage only ──
  if (isDemo) {
    console.log('🎯 Demo user - loading from localStorage');
    let data = getConditions();
    
    // If empty, seed with demo data
    if (data.length === 0) {
      console.log('📋 Seeding demo data...');
      data = getDemoConditions();
      saveConditions(data);
      saveCache(data);
    }
    
    return data;
  }

  // ── REAL USER: Try localStorage first ──
  const localData = getConditions();
  if (localData.length > 0) {
    console.log('💾 Using localStorage data');
    return localData;
  }

  // ── REAL USER: Try Supabase ──
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      console.log('🌐 Fetching from Supabase...');
      const response = await fetch('https://jeevantrack-backend.onrender.com/timeline', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const reports = data.timeline || [];
        
        if (reports.length > 0) {
          // Convert to our format
          const conditions = reports.map((report: any) => ({
            id: report.condition_id || 'cond_' + Math.random(),
            name: report.condition || 'Uncategorized',
            status: report.status || 'active',
            documents: [{
              id: report.id || 'doc_' + Math.random(),
              name: report.file_name || 'Untitled Report',
              type: report.report_type === 'prescription' ? 'Prescription' : 
                     report.report_type === 'blood_test' ? 'Lab Report' : 'Other',
              fileUrl: report.file_url || '',
              reportId: report.id || '',
              uploadedAt: report.uploaded_at || new Date().toISOString(),
              reportDate: report.date || report.uploaded_at?.split('T')[0] || '',
              extractedData: report.extracted_data || {},
            }]
          }));
          
          saveConditions(conditions);
          saveCache(conditions);
          return conditions;
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Supabase fetch failed:', err);
  }

  // ── LAST RESORT: Demo data ──
  console.log('📋 No data found - using demo data');
  const demoData = getDemoConditions();
  saveConditions(demoData);
  return demoData;
}

/**
 * SAVE DOCUMENT - Local first, sync second
 * 
 * Rule: localStorage ALWAYS succeeds. Supabase is "fire and forget".
 * User never sees Supabase errors.
 */
export async function saveDocument(
  conditionId: string,
  document: Document
): Promise<Condition[]> {
  const email = localStorage.getItem('user_email');
  const isDemo = isDemoUser(email);

  // ── STEP 1: Save to localStorage (MUST SUCCEED) ──
  const conditions = getConditions();
  const condition = conditions.find(c => c.id === conditionId);
  
  if (!condition) {
    console.error('❌ Condition not found:', conditionId);
    return conditions;
  }

  // Add document to condition
  condition.documents.push(document);
  saveConditions(conditions);
  saveCache(conditions);
  setNeedsRefresh(true);

  // ── STEP 2: Try Supabase sync (FIRE AND FORGET) ──
  // This NEVER blocks the user or shows errors
  if (!isDemo) {
    // Use setTimeout to run in background
    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (token) {
          console.log('☁️ Attempting Supabase sync...');
          const response = await fetch('https://jeevantrack-backend.onrender.com/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conditionId,
              document,
            }),
          });

          if (response.ok) {
            console.log('✅ Supabase sync successful');
          } else {
            // SILENT FAIL - User never sees this
            console.warn('⚠️ Supabase sync failed:', response.status);
          }
        }
      } catch (err) {
        // SILENT FAIL - Log only for debugging
        console.warn('⚠️ Supabase sync error (user unaffected):', err);
      }
    }, 100); // Small delay so UI isn't blocked
  }

  // ── STEP 3: Always return success ──
  return getConditions();
}