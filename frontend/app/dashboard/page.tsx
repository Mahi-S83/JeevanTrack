"use client";
import { useState, useEffect } from "react";
import { loadHealthData } from '@/lib/dataService';
import { 
  Search, FolderOpen, FileText, Download, ExternalLink, 
  ChevronDown, ChevronUp, Trash2, Calendar, User, Building2, 
  Loader2, FlaskConical, Pill, Scan, Sparkles 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getConditions,
  saveConditions,
  getCache,
  saveCache,
  getNeedsRefresh,
  clearNeedsRefresh,
  setNeedsRefresh,

  removeDocumentFromCondition,
  type Condition,
  type Document,
} from "@/lib/conditionStorage";
import { isDemoUser, getDemoConditions, getDemoJournal } from "@/lib/demoMode";


// Color mapping for document types
const typeColors = {
  "Lab Report": { bg: "bg-[#81CAD6]/10", border: "border-[#81CAD6]", text: "text-[#81CAD6]", icon: FlaskConical },
  "Prescription": { bg: "bg-[#EDCD44]/15", border: "border-[#EDCD44]", text: "text-[#7a6200]", icon: Pill },
  "Imaging": { bg: "bg-[#DC3E26]/10", border: "border-[#DC3E26]", text: "text-[#DC3E26]", icon: Scan },
  "Other": { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600", icon: FileText },
};

const statusColors = {
  active: "border-l-[#DC3E26] bg-[#DC3E26]/5",
  recurring: "border-l-[#EDCD44] bg-[#EDCD44]/10",
  resolved: "border-l-[#81CAD6] bg-[#81CAD6]/10",
};

const statusBadgeColors = {
  active: "bg-[#DC3E26]/10 text-[#DC3E26]",
  recurring: "bg-[#EDCD44]/20 text-[#7a6200]",
  resolved: "bg-[#81CAD6]/20 text-[#2a7a86]",
};

const statusLabels = {
  active: "Active",
  recurring: "Recurring",
  resolved: "Resolved",
};

export default function DashboardPage() {
 const [conditions, setConditions] = useState<Condition[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [expanded, setExpanded] = useState<Record<string, boolean>>({});
const [deleting, setDeleting] = useState<string | null>(null);
const [isDemo, setIsDemo] = useState(false); // ← ADD THIS LINE
const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get user email
    const email = localStorage.getItem('user_email');
    setUserEmail(email);
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
  try {
    setLoading(true);
    setError("");

    // ── Use unified data loader ──
    const conditions = await loadHealthData();
    setConditions(conditions);
    saveCache(conditions);
    
    // Update demo status
    const email = localStorage.getItem('user_email');
    setIsDemo(isDemoUser(email));
    
  } catch (err: any) {
    console.error('Failed to load timeline:', err);
    setError(err.message || 'Failed to load timeline.');
    
    // Fallback to demo data
    const demoData = getDemoConditions();
    setConditions(demoData);
    saveCache(demoData);
  } finally {
    setLoading(false);
  }
};
  const handleDeleteDocument = async (conditionId: string, documentId: string) => {
    if (!confirm("Delete this document?")) return;
    
    setDeleting(documentId);
    try {
      removeDocumentFromCondition(conditionId, documentId);
      const updated = getConditions();
      setConditions(updated);
      saveCache(updated);
      setNeedsRefresh(true);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const filteredConditions = conditions
    .filter((condition) => condition.documents.length > 0)
    .filter((condition) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      if (condition.name.toLowerCase().includes(q)) return true;
      return condition.documents.some((d) => 
        d.name.toLowerCase().includes(q) || 
        d.type.toLowerCase().includes(q)
      );
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-[#81CAD6] animate-spin" />
        <p className="text-[#5a7a80]">Loading your health timeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a2e32] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#81CAD6]" />
            Health Timeline
          </h1>
          <p className="text-sm text-[#5a7a80] mt-0.5">
            {conditions.reduce((acc, c) => acc + c.documents.length, 0)} documents · {conditions.filter(c => c.documents.length > 0).length} conditions
            {isDemoUser(userEmail) && (
              <span className="ml-2 px-2 py-0.5 bg-[#81CAD6]/20 text-[#2a7a86] text-xs rounded-full">Demo Account</span>
            )}
          </p>
        </div>
        <button
          onClick={loadTimeline}
          className="px-4 py-2 rounded-full text-sm bg-gray-100 hover:bg-gray-200 transition text-[#5a7a80]"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a80]" />
        <input
          type="text"
          placeholder="Search conditions or documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm bg-white"
        />
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {filteredConditions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-[#5a7a80]/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1a2e32]">No conditions yet</h3>
          <p className="text-[#5a7a80] mt-2 text-sm">
            Upload a report to create your first health condition.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConditions.map((condition) => {
            const statusColor = statusColors[condition.status as keyof typeof statusColors] || statusColors.active;
            const statusBadge = statusBadgeColors[condition.status as keyof typeof statusBadgeColors] || statusBadgeColors.active;
            const isExpanded = expanded[condition.id] || false;
            const docCount = condition.documents.length;

            return (
              <div
                key={condition.id}
                className={`bg-white rounded-2xl border-l-4 ${statusColor} border border-gray-100 p-5 shadow-sm hover:shadow-md transition`}
              >
                {/* Condition Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-semibold text-[#1a2e32]">
                        {condition.name}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                        {statusLabels[condition.status as keyof typeof statusLabels] || "Active"}
                      </span>
                      <span className="text-xs text-[#5a7a80]">
                        {docCount} document{docCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-[#5a7a80] mt-1">
                      Most recent: {condition.documents.length > 0 ? formatDate(condition.documents[0].reportDate) : "No documents"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpand(condition.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#5a7a80]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5a7a80]" />
                    )}
                  </button>
                </div>

                {/* Documents List */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {condition.documents.length === 0 ? (
                      <p className="text-sm text-[#5a7a80]">No documents yet.</p>
                    ) : (
                      condition.documents.map((doc) => {
                        const typeInfo = typeColors[doc.type as keyof typeof typeColors] || typeColors["Other"];
                        const TypeIcon = typeInfo.icon;
                        return (
                          <div
                            key={doc.id}
                            className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition group ${typeInfo.bg}`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-full ${typeInfo.bg} flex items-center justify-center shrink-0`}>
                                <TypeIcon className={`w-4 h-4 ${typeInfo.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1a2e32] truncate">
                                  {doc.name}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-[#5a7a80] flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {doc.reportDate ? formatDate(doc.reportDate) : "No date"}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded ${typeInfo.bg} ${typeInfo.text} font-medium`}>
                                    {doc.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {doc.fileUrl && (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-[#5a7a80] hover:bg-blue-50 hover:text-blue-600 transition"
                                  title="Open document"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteDocument(condition.id, doc.id)}
                                disabled={deleting === doc.id}
                                className="p-1.5 rounded-lg text-[#5a7a80] hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
                                title="Delete document"
                              >
                                {deleting === doc.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}