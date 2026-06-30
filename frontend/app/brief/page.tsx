"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Download, Loader2, FileText, AlertCircle, CheckCircle, 
  Pill, Stethoscope, Activity, RefreshCw, Sparkles,
  Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isDemoUser, getDemoConditions, getDemoBrief } from "@/lib/demoMode";
import { getConditions, type Condition, saveConditions, saveCache} from "@/lib/conditionStorage";
import { loadHealthData } from '@/lib/dataService';


type ParsedBrief = {
  summary: string;
  concerns: string[];
  recommendations: string[];
  diagnoses: string[];
  medications: string[];
  abnormalValues: string[];
};

export default function BriefPage() {
  const [brief, setBrief] = useState("");
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<ParsedBrief>({
    summary: "",
    concerns: [],
    recommendations: [],
    diagnoses: [],
    medications: [],
    abnormalValues: []
  });
  const [isDemo, setIsDemo] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    setIsDemo(isDemoUser(email));
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchBrief();
    }
  }, []);

  const fetchBrief = async () => {
  try {
    setLoading(true);
    setError("");

    // ── Load ALL data using unified loader ──
    const conditions = await loadHealthData();
    
    if (conditions.length === 0 || conditions.every(c => c.documents.length === 0)) {
      setError("No health data found. Upload a report first.");
      setLoading(false);
      return;
    }

    // ── Generate brief from ALL data ──
    const briefText = generateBriefFromData(conditions);
    setBrief(briefText);
    
    const totalDocs = conditions.reduce((acc, c) => acc + c.documents.length, 0);
    setReportsCount(totalDocs);
    parseBrief(briefText);
    
    // Update demo status
    const email = localStorage.getItem('user_email');
    setIsDemo(isDemoUser(email));

  } catch (err: any) {
    console.error('Failed to fetch brief:', err);
    setError(err.message || "Failed to load doctor brief.");
    
    // Fallback: try to use demo data
    try {
      const demoData = getDemoConditions();
      const briefText = generateBriefFromData(demoData);
      setBrief(briefText);
      const totalDocs = demoData.reduce((acc, c) => acc + c.documents.length, 0);
      setReportsCount(totalDocs);
      parseBrief(briefText);
      setError("Showing demo data. Upload reports to see your own data.");
    } catch (fallbackErr) {
      // Last resort: hardcoded demo brief
      setBrief(getDemoBrief());
      setReportsCount(9);
      parseBrief(getDemoBrief());
      setError("AI service temporarily unavailable. Showing demo data.");
    }
  } finally {
    setLoading(false);
  }
};
  // Generate a brief from stored conditions
  const generateBrief = async () => {
  setLoading(true);
  setError("");

  try {
    const email = localStorage.getItem('user_email');
    let conditions = getConditions();

    // If demo user or no data, use demo data
    if (isDemoUser(email) || conditions.length === 0) {
      console.log("📋 Using demo data for doctor brief");
      conditions = getDemoConditions();
      
      // Save to localStorage so other pages can use it
      saveConditions(conditions);
      saveCache(conditions);
    }

    if (conditions.length === 0 || conditions.every(c => c.documents.length === 0)) {
      setError("No health data found. Upload a report first.");
      setLoading(false);
      return;
    }

    // Generate brief from data
    const briefText = generateBriefFromData(conditions);
    setBrief(briefText);

  } catch (err: any) {
    console.error("Brief generation failed:", err);
    // Fallback to pre-written demo brief
    setBrief(getDemoBrief());
  } finally {
    setLoading(false);
  }
};
const generateBriefFromData = (conditions: any[]) => {
  const allDocs = conditions.flatMap(c => c.documents);
  const totalDocs = allDocs.length;
  
  // ── Get conditions by status ──
  const activeConditions = conditions.filter(c => c.status === 'active').map(c => c.name);
  const recurringConditions = conditions.filter(c => c.status === 'recurring').map(c => c.name);
  const resolvedConditions = conditions.filter(c => c.status === 'resolved').map(c => c.name);
  
  // ── Get ONLY the most important lab values ──
  const keyLabValues: Record<string, any> = {};
  allDocs.forEach(doc => {
    if (doc.extractedData?.lab_values) {
      Object.entries(doc.extractedData.lab_values).forEach(([key, value]: [string, any]) => {
        const importantMarkers = [
          'hemoglobin', 'hba1c', 'blood sugar', 'cholesterol', 
          'blood pressure', 'ferritin', 'glucose', 'hdl', 'ldl',
          'triglyceride', 'vitamin', 'iron'
        ];
        const keyLower = key.toLowerCase();
        if (importantMarkers.some(m => keyLower.includes(m))) {
          if (!keyLabValues[key]) {
            keyLabValues[key] = value;
          }
        }
      });
    }
  });

  // ── Build summary ──
  let summary = `The patient has ${conditions.length} condition(s) tracked.\n\n`;
  
  if (activeConditions.length > 0) {
    summary += `Active: ${activeConditions.join(', ')}\n`;
  }
  if (recurringConditions.length > 0) {
    summary += `Recurring: ${recurringConditions.join(', ')}\n`;
  }
  if (resolvedConditions.length > 0) {
    summary += `Resolved: ${resolvedConditions.join(', ')}\n`;
  }
  
  summary += `\nTotal health records: ${totalDocs}`;

  // ── Key lab values ──
  const labEntries = Object.entries(keyLabValues);
  if (labEntries.length > 0) {
    summary += '\n\nKey Lab Values:\n';
    labEntries.slice(0, 6).forEach(([key, val]: [string, any]) => {
      summary += `  • ${key}: ${val.value} ${val.unit || ''}\n`;
    });
  }

  // ── Recommendations ──
  const recommendations = [];
  if (activeConditions.length > 0) {
    recommendations.push(`Continue monitoring: ${activeConditions.join(', ')}`);
  }
  if (recurringConditions.length > 0) {
    recommendations.push(`Schedule follow-up for: ${recurringConditions.join(', ')}`);
  }
  if (resolvedConditions.length > 0) {
    recommendations.push(`Maintain healthy lifestyle for: ${resolvedConditions.join(', ')}`);
  }
  recommendations.push('Review all reports with your healthcare provider');
  recommendations.push('Keep your health timeline updated with new reports');

  summary += '\n\nRecommendations:\n';
  recommendations.forEach((rec, i) => {
    summary += `  ${i + 1}. ${rec}\n`;
  });

  // ── ADD CONDITIONS SECTION FOR PARSING ──
  summary += '\n--- Conditions ---\n';
  conditions.forEach(c => {
    summary += `${c.name}|${c.status}|${c.documents.length}\n`;
  });

  return summary;
};
  const parseBrief = (text: string) => {
  const sections: ParsedBrief = {
    summary: "",
    concerns: [],
    recommendations: [],
    diagnoses: [],
    medications: [],
    abnormalValues: []
  };

  // ── Extract summary (everything before "Recommendations:") ──
  const summaryMatch = text.match(/^([\s\S]*?)(?=\n\nRecommendations:|$)/);
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim();
  }

  // ── Extract recommendations ──
  const recMatch = text.match(/Recommendations:\s*([\s\S]*?)(?=\n--- Conditions ---|$)/);
  if (recMatch) {
    const recText = recMatch[1].trim();
    sections.recommendations = recText
      .split(/\d+\.\s*/)
      .filter(r => r.trim().length > 0)
      .map(r => r.trim());
  }

  // ── Extract lab values as "abnormal values" ──
  const labMatch = text.match(/Key Lab Values:\s*([\s\S]*?)(?=\n\nRecommendations:|$)/);
  if (labMatch) {
    const labText = labMatch[1].trim();
    sections.abnormalValues = labText
      .split('\n')
      .filter(l => l.includes('•'))
      .map(l => l.trim().replace('• ', ''));
  }

  // ── Extract conditions for Diagnoses section ──
  const conditionsMatch = text.match(/--- Conditions ---\s*([\s\S]*?)$/);
  if (conditionsMatch) {
    const condText = conditionsMatch[1].trim();
    const lines = condText.split('\n').filter(l => l.includes('|'));
    sections.diagnoses = lines.map(l => {
      const parts = l.split('|');
      const name = parts[0] || 'Unknown';
      const status = parts[1] || 'active';
      const count = parts[2] || '0';
      return `${name} (${status}) - ${count} document(s)`;
    });
  }

  // ── If no conditions found, try to extract from summary ──
  if (sections.diagnoses.length === 0 && sections.summary) {
    const summary = sections.summary;
    const activeMatch = summary.match(/Active:\s*([^\n]+)/);
    const recurringMatch = summary.match(/Recurring:\s*([^\n]+)/);
    const resolvedMatch = summary.match(/Resolved:\s*([^\n]+)/);
    
    if (activeMatch) {
      sections.diagnoses.push(`Active: ${activeMatch[1]}`);
    }
    if (recurringMatch) {
      sections.diagnoses.push(`Recurring: ${recurringMatch[1]}`);
    }
    if (resolvedMatch) {
      sections.diagnoses.push(`Resolved: ${resolvedMatch[1]}`);
    }
  }

  setParsedData(sections);
};
  const handleDownload = () => {
    if (!brief) return;
    const element = document.createElement("a");
    const file = new Blob([brief], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "doctor-brief-" + new Date().toISOString().split('T')[0] + ".txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/###/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
        <p className="text-[#5a7a80]">Generating your doctor brief...</p>
      </div>
    );
  }

  return (
    <div className="pt-6 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#1a2e32] flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-[#F97316]" />
            Doctor Brief
            {isDemo && (
              <span className="text-xs bg-[#81CAD6]/20 text-[#2a7a86] px-2.5 py-0.5 rounded-full font-medium">Demo</span>
            )}
          </h1>
          <p className="text-sm text-[#5a7a80] mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {isDemo ? "Demo data" : `${reportsCount} reports`} · Click Refresh to update
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchBrief}
            disabled={loading}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-full border border-orange-200 text-[#1a2e32] font-medium hover:bg-orange-50 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleDownload}
            disabled={!brief}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA580C] transition text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-3 rounded-2xl mb-6 text-sm flex items-center gap-3">
          <Shield className="w-5 h-5 text-yellow-600 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchBrief}
            className="ml-auto text-yellow-700 hover:text-yellow-900 font-medium text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Brief Content */}
      {brief && (
        <div className="space-y-8">
          {/* Summary Card */}
          <div className="bg-linear-to-br from-orange-50 via-white to-amber-50 rounded-3xl border border-orange-100 p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-[#1a2e32]">Clinical Summary</h2>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-medium">AI</span>
                </div>
                <p className="text-[#1a2e32] leading-relaxed text-base mt-2 max-w-4xl">
                  {cleanText(parsedData.summary) || "No summary available."}
                </p>
              </div>
            </div>
          </div>

          {/* Concerns */}
          {parsedData.concerns.length > 0 && (
            <div className="bg-linear-to-br from-red-50/60 via-white to-red-50/20 rounded-2xl border border-red-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-orange-400 flex items-center justify-center">
                  <AlertCircle className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2e32]">Top Concerns</h3>
                  <p className="text-xs text-[#5a7a80]">Priorities for immediate attention</p>
                </div>
              </div>
              <ul className="space-y-3">
                {parsedData.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-[#1a2e32] leading-relaxed">{cleanText(concern)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-ups */}
          {parsedData.recommendations.length > 0 && (
            <div className="bg-linear-to-br from-green-50/60 via-white to-green-50/20 rounded-2xl border border-green-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2e32]">Follow-ups</h3>
                  <p className="text-xs text-[#5a7a80]">Recommended next steps</p>
                </div>
              </div>
              <ul className="space-y-3">
                {parsedData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-[#1a2e32] leading-relaxed">{cleanText(rec)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diagnoses + Medications Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {parsedData.diagnoses.length > 0 && (
              <div className="bg-linear-to-br from-amber-50/60 via-white to-amber-50/20 rounded-2xl border border-amber-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-300 flex items-center justify-center">
                    <Activity className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a2e32]">Diagnoses</h3>
                    <p className="text-xs text-[#5a7a80]">Identified conditions</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {parsedData.diagnoses.map((diag, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-[#1a2e32] border-b border-amber-100/50 pb-2.5 last:border-0 last:pb-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                      <span>{cleanText(diag)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parsedData.medications.length > 0 && (
              <div className="bg-linear-to-br from-orange-50/60 via-white to-orange-50/20 rounded-2xl border border-orange-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                    <Pill className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a2e32]">Medications</h3>
                    <p className="text-xs text-[#5a7a80]">Current prescriptions</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {parsedData.medications.map((med, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-[#1a2e32] border-b border-orange-100/50 pb-2.5 last:border-0 last:pb-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5"></span>
                      <span>{cleanText(med)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Abnormal Lab Values */}
          {parsedData.abnormalValues.length > 0 && (
            <div className="bg-linear-to-br from-red-50/40 via-white to-orange-50/20 rounded-2xl border border-red-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-orange-400 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2e32]">Abnormal Lab Values</h3>
                  <p className="text-xs text-[#5a7a80]">Out-of-range results</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {parsedData.abnormalValues.map((lab, index) => (
                  <div key={index} className="bg-red-50/70 border border-red-200/60 text-red-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-red-100 transition">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {cleanText(lab)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Full Brief */}
          <details className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
            <summary className="text-sm font-medium text-[#5a7a80] cursor-pointer hover:text-[#1a2e32] transition flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Full Clinical Brief
            </summary>
            <div className="whitespace-pre-wrap text-[#1a2e32] leading-relaxed text-sm mt-4 pt-4 border-t border-orange-100/60">
              {cleanText(brief)}
            </div>
          </details>
        </div>
      )}

      {/* Empty State */}
      {!loading && !brief && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#F97316]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1a2e32]">No brief available</h3>
          <p className="text-[#5a7a80] mt-2 text-sm max-w-md mx-auto">
            Upload at least one report to generate your doctor brief.
          </p>
          <a href="/upload">
            <button className="mt-4 px-6 py-2.5 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA580C] transition text-sm">
              Upload your first report
            </button>
          </a>
        </div>
      )}
    </div>
  );
}