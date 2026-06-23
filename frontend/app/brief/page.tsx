"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Download, Loader2, FileText, AlertCircle, CheckCircle, 
  Pill, Stethoscope, Activity, RefreshCw, Sparkles,
  Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isDemoUser, getDemoBrief } from "@/lib/demoMode";
import { getConditions, type Condition } from "@/lib/conditionStorage";

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

      // STEP 1: If demo user, show demo brief immediately
      if (isDemo) {
        const demoBrief = getDemoBrief();
        setBrief(demoBrief);
        setReportsCount(9);
        parseBrief(demoBrief);
        setLoading(false);
        return;
      }

      // STEP 2: Check if we have real data in localStorage
      const storedConditions = getConditions();
      const hasRealData = storedConditions.some(c => c.documents.length > 0);

      if (hasRealData) {
        const generatedBrief = generateBriefFromConditions(storedConditions);
        setBrief(generatedBrief);
        setReportsCount(storedConditions.reduce((acc, c) => acc + c.documents.length, 0));
        parseBrief(generatedBrief);
      }

      // STEP 3: Try the API (if not demo)
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        try {
          const response = await fetch('https://jeevantrack-backend.onrender.com/doctor-brief', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (typeof data === 'string' && data.length > 0) {
              setBrief(data);
              setReportsCount(1);
              parseBrief(data);
              setError("");
            } else if (data && data.brief) {
              setBrief(data.brief);
              setReportsCount(data.reports_count || 1);
              parseBrief(data.brief);
              setError("");
            }
          }
        } catch (apiError) {
          // API failed, but we already have a brief
          console.log('API failed, using generated brief');
        }
      }

      setLoading(false);
      
    } catch (err: any) {
      console.error('Failed to fetch brief:', err);
      
      // If we don't have a brief yet, try demo or generate
      if (!brief) {
        if (isDemo) {
          setBrief(getDemoBrief());
          setReportsCount(9);
          parseBrief(getDemoBrief());
          setError("");
        } else {
          const storedConditions = getConditions();
          const hasRealData = storedConditions.some(c => c.documents.length > 0);
          if (hasRealData) {
            const generatedBrief = generateBriefFromConditions(storedConditions);
            setBrief(generatedBrief);
            setReportsCount(storedConditions.reduce((acc, c) => acc + c.documents.length, 0));
            parseBrief(generatedBrief);
            setError("AI service temporarily unavailable. Showing summary from your stored data.");
          } else {
            setError(err.message || "Failed to load doctor brief.");
          }
        }
      }
      setLoading(false);
    }
  };

  // Generate a brief from stored conditions
  const generateBriefFromConditions = (conditions: Condition[]) => {
    const active = conditions.filter(c => c.status === 'active' && c.documents.length > 0);
    const recurring = conditions.filter(c => c.status === 'recurring' && c.documents.length > 0);
    const resolved = conditions.filter(c => c.status === 'resolved' && c.documents.length > 0);
    const totalDocs = conditions.reduce((acc, c) => acc + c.documents.length, 0);
    
    let briefText = "CLINICAL SUMMARY:\n";
    if (active.length > 0) {
      briefText += `The patient has ${active.length} active condition${active.length !== 1 ? 's' : ''}`;
      if (active.length === 1) {
        briefText += `: ${active[0].name}`;
      }
      briefText += `. `;
    }
    if (recurring.length > 0) {
      briefText += `${recurring.length} condition${recurring.length !== 1 ? 's' : ''} show recurring patterns. `;
    }
    if (resolved.length > 0) {
      briefText += `${resolved.length} condition${resolved.length !== 1 ? 's' : ''} have been resolved. `;
    }
    briefText += `Total of ${totalDocs} documents have been reviewed.\n\n`;
    
    briefText += "TOP 3 CONCERNS:\n";
    let concernIndex = 1;
    active.forEach(c => {
      briefText += `${concernIndex}. ${c.name} requires ongoing monitoring with ${c.documents.length} document${c.documents.length !== 1 ? 's' : ''} available.\n`;
      concernIndex++;
    });
    recurring.forEach(c => {
      if (concernIndex <= 3) {
        briefText += `${concernIndex}. ${c.name} shows recurring patterns that need regular follow-up.\n`;
        concernIndex++;
      }
    });
    if (concernIndex === 1) {
      briefText += "1. No active concerns identified. Routine monitoring recommended.\n";
    }
    briefText += "\n";
    
    briefText += "RECOMMENDED FOLLOW-UPS:\n";
    let recIndex = 1;
    active.forEach(c => {
      briefText += `${recIndex}. Schedule follow-up for ${c.name} within 3 months.\n`;
      recIndex++;
    });
    recurring.forEach(c => {
      briefText += `${recIndex}. Monitor ${c.name} with regular check-ups.\n`;
      recIndex++;
    });
    if (recIndex === 1) {
      briefText += "1. Routine annual health check-up recommended.\n";
    }
    
    return briefText;
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

    const summaryMatch = text.match(/CLINICAL SUMMARY:([\s\S]*?)(?=TOP 3 CONCERNS|RECOMMENDED|$)/i);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    const concernsMatch = text.match(/TOP 3 CONCERNS:([\s\S]*?)(?=RECOMMENDED|CLINICAL SUMMARY|$)/i);
    if (concernsMatch) {
      const concernsText = concernsMatch[1].trim();
      sections.concerns = concernsText.split(/\d+\.\s*/).filter(c => c.trim().length > 0).map(c => c.trim());
    }

    const recMatch = text.match(/RECOMMENDED FOLLOW-UPS:([\s\S]*?)(?=CLINICAL SUMMARY|TOP 3|$)/i);
    if (recMatch) {
      const recText = recMatch[1].trim();
      sections.recommendations = recText.split(/\d+\.\s*/).filter(r => r.trim().length > 0).map(r => r.trim());
    }

    const diagMatch = text.match(/DIAGNOSES HISTORY:([\s\S]*?)(?=CURRENT MEDICATIONS|KEY ABNORMAL|$)/i);
    if (diagMatch) {
      const diagText = diagMatch[1].trim();
      sections.diagnoses = diagText.split(/\n/).filter(l => l.trim().length > 0).slice(0, 5);
    }

    const medMatch = text.match(/CURRENT MEDICATIONS:([\s\S]*?)(?=KEY ABNORMAL|PATIENT HEALTH|$)/i);
    if (medMatch) {
      const medText = medMatch[1].trim();
      sections.medications = medText.split(/\n/).filter(m => m.trim().length > 0 && !m.includes('mentioned')).slice(0, 8);
    }

    const labMatch = text.match(/KEY ABNORMAL LAB VALUES:([\s\S]*?)(?=PATIENT HEALTH|$)/i);
    if (labMatch) {
      const labText = labMatch[1].trim();
      sections.abnormalValues = labText.split(/\n/).filter(l => l.trim().length > 0).slice(0, 10);
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