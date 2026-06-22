"use client";
import { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  Pill,
  Stethoscope,
  Activity,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<ParsedBrief>({
    summary: "",
    concerns: [],
    recommendations: [],
    diagnoses: [],
    medications: [],
    abnormalValues: []
  });

  useEffect(() => {
    fetchBrief();
  }, []);

  const fetchBrief = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch('https://jeevantrack-backend.onrender.com/doctor-brief', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
  // If we get a 500 error, show a more helpful message with delete instructions
  if (response.status === 500) {
    // Try to get the response text for more detail
    let errorDetail = "";
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || "";
    } catch (e) {
      // If we can't parse JSON, use the status text
      errorDetail = response.statusText || "";
    }
    
    console.error("Server error details:", errorDetail);
    throw new Error("The server encountered an error. This often happens with duplicate reports. Please delete duplicate reports from the timeline and try again. If the issue persists, contact support.");
  }
  throw new Error(`API error: ${response.status}`);
}

      const data = await response.json();
      
      setBrief(data.brief || "No brief available.");
      setReportsCount(data.reports_count || 0);
      
      if (data.brief) {
        parseBrief(data.brief);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch brief:', err);
      setError(err.message || "Failed to load doctor brief.");
    } finally {
      setLoading(false);
    }
  };

  // Clean markdown syntax from text
  const cleanText = function(text: string) {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "") // Remove bold
      .replace(/\*/g, "") // Remove italic
      .replace(/###/g, "") // Remove headings
      .replace(/^[\s]*[-•*]\s*/gm, "• ") // Convert markdown bullets
      .replace(/^[\s]*\d+\.\s*/gm, "") // Remove numbered list markers
      .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
      .trim();
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

    // Extract TOP 3 CONCERNS
    const concernsMatch = text.match(/TOP 3 CONCERNS:([\s\S]*?)(?=RECOMMENDED FOLLOW-UPS|$)/);
    if (concernsMatch) {
      const concernsText = concernsMatch[1].trim();
      const items = concernsText.split(/\d+\.\s*/).filter(function(c) {
        return c.trim().length > 0;
      });
      sections.concerns = items.map(function(c) {
        return cleanText(c.trim());
      });
    }

    // Extract RECOMMENDED FOLLOW-UPS
    const recMatch = text.match(/RECOMMENDED FOLLOW-UPS:([\s\S]*?)(?=CLINICAL SUMMARY|$)/);
    if (recMatch) {
      const recText = recMatch[1].trim();
      const items = recText.split(/\d+\.\s*/).filter(function(r) {
        return r.trim().length > 0;
      });
      sections.recommendations = items.map(function(r) {
        return cleanText(r.trim());
      });
    }

    // Extract CLINICAL SUMMARY
    const summaryMatch = text.match(/CLINICAL SUMMARY:([\s\S]*?)(?=TOP 3 CONCERNS|$)/);
    if (summaryMatch) {
      sections.summary = cleanText(summaryMatch[1].trim());
    }

    // Extract DIAGNOSES HISTORY
    const diagMatch = text.match(/DIAGNOSES HISTORY:([\s\S]*?)(?=CURRENT MEDICATIONS|$)/);
    if (diagMatch) {
      const diagText = diagMatch[1].trim();
      const lines = diagText.split(/\n/).filter(function(l) {
        return l.trim().length > 0;
      });
      sections.diagnoses = lines.slice(0, 5).map(function(l) {
        return cleanText(l.trim());
      });
    }

    // Extract CURRENT MEDICATIONS
    const medMatch = text.match(/CURRENT MEDICATIONS:([\s\S]*?)(?=KEY ABNORMAL LAB VALUES|$)/);
    if (medMatch) {
      const medText = medMatch[1].trim();
      const meds = medText.split(/\n/).filter(function(m) {
        return m.trim().length > 0 && !m.includes('mentioned');
      });
      sections.medications = meds.slice(0, 8).map(function(m) {
        return cleanText(m.trim());
      });
    }

    // Extract KEY ABNORMAL LAB VALUES
    const labMatch = text.match(/KEY ABNORMAL LAB VALUES:([\s\S]*?)(?=PATIENT HEALTH BRIEF|$)/);
    if (labMatch) {
      const labText = labMatch[1].trim();
      const labs = labText.split(/\n/).filter(function(l) {
        return l.trim().length > 0;
      });
      sections.abnormalValues = labs.slice(0, 10).map(function(l) {
        return cleanText(l.trim());
      });
    }

    setParsedData(sections);
  };

  const handleDownload = function() {
    const element = document.createElement("a");
    const cleanBrief = cleanText(brief);
    const file = new Blob([cleanBrief], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "doctor-brief-" + new Date().toISOString().split('T')[0] + ".txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
        <p className="text-[#5a7a80]">Generating your doctor brief...</p>
        <p className="text-sm text-[#5a7a80]/60">This may take a few moments</p>
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
          </h1>
          <p className="text-sm text-[#5a7a80] mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Based on {reportsCount} report{reportsCount !== 1 ? 's' : ''}
            <span className="w-1 h-1 rounded-full bg-[#5a7a80]/30"></span>
            <span className="text-[#F97316]">AI-generated summary</span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={function() { fetchBrief(); }}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-full border border-orange-200 text-[#1a2e32] font-medium hover:bg-orange-50 transition text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA580C] transition text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm flex items-start gap-3">
    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
    <div>
      <p className="font-medium">Error generating brief</p>
      <p className="text-red-600/80">{error}</p>
      <p className="text-xs text-red-500/70 mt-1">
        Try deleting duplicate reports from your timeline and then refresh this page.
      </p>
    </div>
  </div>
)}
      {brief ? (
        <div className="space-y-8">

          {/* Summary Hero Card */}
          <div className="bg-linear-to-br from-orange-50 via-white to-amber-50 rounded-3xl border border-orange-100 p-8 shadow-sm hover:shadow-md transition-all duration-300">
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
                  {parsedData.summary || "No summary available. Upload some reports to generate a clinical summary."}
                </p>
                {parsedData.summary && (
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#5a7a80] border-t border-orange-100 pt-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Last updated: Today
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {reportsCount} reports analyzed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Top Concerns */}
            {parsedData.concerns.length > 0 && (
              <div className="bg-linear-to-br from-red-50/60 via-white to-red-50/20 rounded-2xl border border-red-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
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
                  {parsedData.concerns.map(function(concern, index) {
                    return (
                      <li key={index} className="flex items-start gap-3 group/item">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 group-hover/item:bg-red-200 transition">
                          {index + 1}
                        </span>
                        <span className="text-[#1a2e32] leading-relaxed">{concern}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Recommended Follow-ups */}
            {parsedData.recommendations.length > 0 && (
              <div className="bg-linear-to-br from-green-50/60 via-white to-green-50/20 rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
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
                  {parsedData.recommendations.map(function(rec, index) {
                    return (
                      <li key={index} className="flex items-start gap-3 group/item">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 group-hover/item:bg-green-200 transition">
                          {index + 1}
                        </span>
                        <span className="text-[#1a2e32] leading-relaxed">{rec}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Diagnoses & Medications Grid */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Diagnoses */}
            {parsedData.diagnoses.length > 0 && (
              <div className="bg-linear-to-br from-amber-50/60 via-white to-amber-50/20 rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
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
                  {parsedData.diagnoses.map(function(diag, index) {
                    return (
                      <li key={index} className="flex items-start gap-3 text-sm text-[#1a2e32] border-b border-amber-100/50 pb-2.5 last:border-0 last:pb-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                        <span>{diag}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Medications */}
            {parsedData.medications.length > 0 && (
              <div className="bg-linear-to-br from-orange-50/60 via-white to-orange-50/20 rounded-2xl border border-orange-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
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
                  {parsedData.medications.map(function(med, index) {
                    return (
                      <li key={index} className="flex items-start gap-3 text-sm text-[#1a2e32] border-b border-orange-100/50 pb-2.5 last:border-0 last:pb-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5"></span>
                        <span>{med}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Abnormal Lab Values */}
          {parsedData.abnormalValues.length > 0 && (
            <div className="bg-linear-to-br from-red-50/40 via-white to-orange-50/20 rounded-2xl border border-red-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-orange-400 flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2e32]">Abnormal Lab Values</h3>
                  <p className="text-xs text-[#5a7a80]">Out-of-range results requiring attention</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {parsedData.abnormalValues.map(function(lab, index) {
                  return (
                    <div key={index} className="bg-red-50/70 border border-red-200/60 text-red-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-red-100 transition">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lab}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View Full Brief */}
          <details className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <summary className="text-sm font-medium text-[#5a7a80] cursor-pointer hover:text-[#1a2e32] transition flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Full Clinical Brief
            </summary>
            <div className="whitespace-pre-wrap text-[#1a2e32] leading-relaxed text-sm mt-4 pt-4 border-t border-orange-100/60">
              {cleanText(brief)}
            </div>
          </details>

        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#F97316]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1a2e32]">No brief available</h3>
          <p className="text-[#5a7a80] mt-2">Upload some reports to generate your doctor brief.</p>
        </div>
      )}
    </div>
  );
}