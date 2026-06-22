"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Calendar, Mic, FileText, 
  Clock, Sparkles, ChevronDown, ChevronUp,
  Edit, Save, X, CheckCircle, AlertCircle,
  Pill, Stethoscope, Activity, Smile, Frown,
  Zap, Heart, Brain, Moon, Sun, Cloud,
  Loader2, StopCircle, Volume2, VolumeX,
  TrendingUp, BarChart3, ListChecks, Timer,
  Check, ChevronRight, NotebookPen
} from "lucide-react";

type JournalEntry = {
  id: string;
  date: string;
  type: "symptom" | "note";
  // For symptoms
  symptom?: string;
  severity?: "mild" | "moderate" | "severe";
  actionTaken?: string;
  relief?: "none" | "partial" | "full";
  timeToRelief?: string;
  // For both
  notes: string;
  source?: "voice" | "text";
};

const severityOptions = [
  { value: "mild", label: "Mild", icon: <Smile className="w-4 h-4" />, color: "bg-blue-100 text-blue-700" },
  { value: "moderate", label: "Moderate", icon: <Activity className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700" },
  { value: "severe", label: "Severe", icon: <AlertCircle className="w-4 h-4" />, color: "bg-red-100 text-red-700" },
];

const reliefOptions = [
  { value: "none", label: "No Relief", color: "bg-red-100 text-red-700" },
  { value: "partial", label: "Partial Relief", color: "bg-yellow-100 text-yellow-700" },
  { value: "full", label: "Full Relief", color: "bg-green-100 text-green-700" },
];

const commonSymptoms = [
  "Headache", "Fever", "Nausea", "Cough", 
  "Stomach Ache", "Fatigue", "Body Pain", 
  "Dizziness", "Sore Throat", "Cold",
  "Chest Pain", "Shortness of Breath", "Back Pain",
  "Joint Pain", "Muscle Cramp", "Rash"
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [entryType, setEntryType] = useState<"symptom" | "note">("symptom");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Form state
  const [rawInput, setRawInput] = useState("");
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    type: "symptom",
    symptom: "",
    severity: "mild",
    actionTaken: "",
    relief: "partial",
    timeToRelief: "",
    notes: "",
    source: "text",
  });

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jeevantrack_journal');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load journal entries');
      }
    }
  }, []);

  // Save entries to localStorage
  const saveEntries = (updatedEntries: JournalEntry[]) => {
    setEntries(updatedEntries);
    localStorage.setItem('jeevantrack_journal', JSON.stringify(updatedEntries));
  };

  // AI extraction from natural language
  const extractSymptomData = (text: string) => {
    const result = {
      symptom: "",
      severity: "mild" as "mild" | "moderate" | "severe",
      actionTaken: "",
      relief: "partial" as "none" | "partial" | "full",
      timeToRelief: "",
      notes: ""
    };

    const lower = text.toLowerCase();

    // Extract symptom
    const symptomMatch = text.match(/(headache|fever|nausea|cough|stomach ache|stomach|fatigue|body pain|dizziness|sore throat|cold|chest pain|shortness of breath|back pain|joint pain|muscle cramp|rash)/i);
    if (symptomMatch) {
      result.symptom = symptomMatch[0].charAt(0).toUpperCase() + symptomMatch[0].slice(1);
    }

    // Extract severity
    if (lower.includes('severe') || lower.includes('extreme') || lower.includes('unbearable') || lower.includes('very bad')) {
      result.severity = "severe";
    } else if (lower.includes('moderate') || lower.includes('some') || lower.includes('noticeable')) {
      result.severity = "moderate";
    }

    // Extract action taken
    const actionMatch = text.match(/(took|taken|taking|had|used|applied|drank|ate)\s+([a-zA-Z0-9\s]+?)(\s+for|\s+and|\s+with|\s*\.|$)/i);
    if (actionMatch) {
      result.actionTaken = actionMatch[2].trim();
    }

    // Extract relief
    if (lower.includes('no relief') || lower.includes('didn\'t help') || lower.includes('not better') || lower.includes('worse')) {
      result.relief = "none";
    } else if (lower.includes('full relief') || lower.includes('completely better') || lower.includes('all better') || lower.includes('cured')) {
      result.relief = "full";
    }

    // Extract time to relief
    const timeMatch = text.match(/(\d+)\s*(minute|hour|day)s?/i);
    if (timeMatch) {
      result.timeToRelief = timeMatch[0];
    }

    // Extract notes
    const notesParts = [];
    if (lower.includes('after dinner')) notesParts.push('Occurred after dinner');
    if (lower.includes('after lunch')) notesParts.push('Occurred after lunch');
    if (lower.includes('morning')) notesParts.push('Occurred in morning');
    if (lower.includes('evening')) notesParts.push('Occurred in evening');
    if (lower.includes('night')) notesParts.push('Occurred at night');
    if (lower.includes('stress')) notesParts.push('Stress-related');
    if (lower.includes('after eating')) notesParts.push('Occurred after eating');
    
    result.notes = notesParts.join(' · ');

    return result;
  };

  const handleProcessInput = () => {
    if (!rawInput.trim()) return;
    
    setIsProcessing(true);
    const extracted = extractSymptomData(rawInput);
    
    setFormData({
      type: entryType,
      symptom: extracted.symptom || "",
      severity: extracted.severity,
      actionTaken: extracted.actionTaken || "",
      relief: extracted.relief,
      timeToRelief: extracted.timeToRelief || "",
      notes: extracted.notes || rawInput.trim(),
      source: "text",
    });
    
    setIsProcessing(false);
    setShowReview(true);
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRawInput("I had a mild headache since morning. I took Crocin around 2 PM. After two hours I felt much better.");
      setTimeout(() => {
        const extracted = extractSymptomData(rawInput);
        setFormData({
          type: entryType,
          symptom: extracted.symptom || "Headache",
          severity: extracted.severity,
          actionTaken: extracted.actionTaken || "Crocin",
          relief: extracted.relief,
          timeToRelief: extracted.timeToRelief || "2 hours",
          notes: "Occurred in morning, felt better after medication",
          source: "voice",
        });
        setShowReview(true);
      }, 300);
    }, 2000);
  };

  const handleSaveEntry = () => {
    if (entryType === "symptom" && !formData.symptom?.trim()) return;
    if (entryType === "note" && !formData.notes?.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: entryType,
      ...(entryType === "symptom" ? {
        symptom: formData.symptom!.trim(),
        severity: formData.severity || "mild",
        actionTaken: formData.actionTaken || "None",
        relief: formData.relief || "partial",
        timeToRelief: formData.timeToRelief || "Unknown",
        source: formData.source || "text",
        notes: formData.notes || "",
      } : {
        notes: formData.notes!.trim(),
      }),
    };

    saveEntries([entry, ...entries]);
    resetForm();
    setShowAdd(false);
    setShowReview(false);
  };

  const resetForm = () => {
    setFormData({
      type: "symptom",
      symptom: "",
      severity: "mild",
      actionTaken: "",
      relief: "partial",
      timeToRelief: "",
      notes: "",
      source: "text",
    });
    setRawInput("");
    setShowReview(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Delete this entry?")) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSeverityColor = (severity: string) => {
    const found = severityOptions.find(s => s.value === severity);
    return found?.color || "bg-gray-100 text-gray-700";
  };

  const getReliefColor = (relief: string) => {
    const found = reliefOptions.find(r => r.value === relief);
    return found?.color || "bg-gray-100 text-gray-700";
  };

  // Calculate stats from symptoms only
  const getStats = () => {
    const symptoms = entries.filter(e => e.type === "symptom");
    const stats = {
      total: symptoms.length,
      bySymptom: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      commonRemedies: {} as Record<string, number>,
    };

    symptoms.forEach(entry => {
      if (entry.symptom) {
        stats.bySymptom[entry.symptom] = (stats.bySymptom[entry.symptom] || 0) + 1;
      }
      if (entry.severity) {
        stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
      }
      if (entry.actionTaken && entry.actionTaken !== "None") {
        stats.commonRemedies[entry.actionTaken] = (stats.commonRemedies[entry.actionTaken] || 0) + 1;
      }
    });

    return stats;
  };

  const stats = getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center">
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1a2e32]">Health Journal</h1>
            <p className="text-xs text-[#5a7a80]">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · Track symptoms & notes
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); if (!showAdd) resetForm(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition text-sm ${
            showAdd ? 'bg-gray-100 text-[#5a7a80] hover:bg-gray-200' : 'bg-[#F97316] text-white hover:bg-[#EA580C]'
          }`}
        >
          {showAdd ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Entry</>}
        </button>
      </div>

      {/* Stats Bar */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-blue-600">Symptoms Logged</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-3 text-center border border-yellow-100">
            <p className="text-2xl font-bold text-yellow-600">{stats.bySeverity.moderate || 0}</p>
            <p className="text-xs text-yellow-600">Moderate</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
            <p className="text-2xl font-bold text-red-600">{stats.bySeverity.severe || 0}</p>
            <p className="text-xs text-red-600">Severe</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
            <p className="text-2xl font-bold text-green-600">{Object.keys(stats.commonRemedies).length}</p>
            <p className="text-xs text-green-600">Remedies Used</p>
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 animate-fade-in">
          {/* Entry Type Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setEntryType("symptom"); resetForm(); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                entryType === "symptom"
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-[#5a7a80] hover:bg-gray-200'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-1.5" />
              Log Symptom
            </button>
            <button
              onClick={() => { setEntryType("note"); resetForm(); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                entryType === "note"
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-[#5a7a80] hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1.5" />
              Write Note
            </button>
          </div>

          {!showReview ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a2e32]">
                    {entryType === "symptom" ? "How are you feeling?" : "What's on your mind?"}
                  </p>
                  <p className="text-xs text-[#5a7a80]">
                    {entryType === "symptom" ? "Describe your symptom naturally" : "Write a quick health note"}
                  </p>
                </div>
                {entryType === "symptom" && (
                  <button
                    onClick={handleVoiceInput}
                    disabled={isRecording}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                      isRecording 
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {isRecording ? (
                      <><StopCircle className="w-4 h-4" /> Recording...</>
                    ) : (
                      <><Mic className="w-4 h-4" /> Voice</>
                    )}
                  </button>
                )}
              </div>

              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={entryType === "symptom" 
                  ? "e.g. I had a mild headache since morning. I took Crocin and felt better after 2 hours."
                  : "e.g. Feeling better today. Energy levels are improving."}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] min-h-25 text-sm"
              />

              {entryType === "symptom" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs text-[#5a7a80] font-medium self-center mr-1">Quick select:</span>
                  {commonSymptoms.slice(0, 8).map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setRawInput(rawInput ? `${rawInput}, ${sym}` : sym)}
                      className="px-3 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200 transition text-[#5a7a80]"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleProcessInput}
                  disabled={!rawInput.trim() || isProcessing}
                  className="px-6 py-2 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA580C] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> {entryType === "symptom" ? "Extract & Review" : "Review"}</>
                  )}
                </button>
              </div>
            </>
          ) : (
            // Review Screen
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-orange-600 mb-4">
                <CheckCircle className="w-4 h-4" />
                {entryType === "symptom" ? "Review extracted details — edit if needed" : "Review your note"}
              </div>

              {entryType === "symptom" ? (
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5a7a80] block mb-1">Symptom</label>
                    <input
                      type="text"
                      value={formData.symptom || ""}
                      onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Headache"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5a7a80] block mb-1">Severity</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {severityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, severity: opt.value as any })}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                            formData.severity === opt.value
                              ? opt.color + ' ring-2 ring-offset-1 ring-blue-400'
                              : 'bg-gray-100 text-[#5a7a80] hover:bg-gray-200'
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#5a7a80] block mb-1">Action Taken</label>
                    <input
                      type="text"
                      value={formData.actionTaken || ""}
                      onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Crocin, Rest, Warm water"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5a7a80] block mb-1">Relief</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {reliefOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, relief: opt.value as any })}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            formData.relief === opt.value
                              ? opt.color + ' ring-2 ring-offset-1 ring-blue-400'
                              : 'bg-gray-100 text-[#5a7a80] hover:bg-gray-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#5a7a80] block mb-1">Time to Relief</label>
                    <input
                      type="text"
                      value={formData.timeToRelief || ""}
                      onChange={(e) => setFormData({ ...formData, timeToRelief: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 30 minutes, 2 hours"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#5a7a80] block mb-1">Notes</label>
                    <input
                      type="text"
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional context..."
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-[#5a7a80] block mb-1">Your Note</label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-25 text-sm"
                    placeholder="Write your health note..."
                  />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveEntry}
                  disabled={entryType === "symptom" ? !formData.symptom?.trim() : !formData.notes?.trim()}
                  className="px-6 py-2 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA580C] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Entry
                </button>
                <button
                  onClick={() => { setShowReview(false); setRawInput(""); }}
                  className="px-6 py-2 rounded-full border border-gray-200 text-[#5a7a80] hover:bg-gray-50 transition text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Raw Text
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <NotebookPen className="w-8 h-8 text-[#F97316]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1a2e32]">No journal entries yet</h3>
          <p className="text-[#5a7a80] mt-2 text-sm">
            Log your symptoms, medications, and health notes.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 px-6 py-2.5 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA580C] transition text-sm"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isSymptom = entry.type === "symptom";
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition ${
                  isSymptom ? 'border-blue-100' : 'border-orange-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isSymptom ? (
                        <>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(entry.severity || "mild")}`}>
                            {entry.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getReliefColor(entry.relief || "partial")}`}>
                            Relief: {entry.relief}
                          </span>
                          {entry.source === "voice" && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 flex items-center gap-1">
                              <Mic className="w-3 h-3" /> Voice
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            Symptom
                          </span>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Note
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      {isSymptom ? (
                        <>
                          <h4 className="font-semibold text-[#1a2e32] text-base">
                            {entry.symptom}
                            {entry.actionTaken && entry.actionTaken !== "None" && (
                              <span className="font-normal text-[#5a7a80] text-sm ml-2">
                                → {entry.actionTaken}
                              </span>
                            )}
                          </h4>
                          {entry.notes && (
                            <p className="text-sm text-[#5a7a80] mt-1">{entry.notes}</p>
                          )}
                          {entry.timeToRelief && entry.timeToRelief !== "Unknown" && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-[#5a7a80]">
                              <Timer className="w-3 h-3" />
                              Relief in {entry.timeToRelief}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[#1a2e32]">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#5a7a80] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-[#5a7a80] hover:text-red-500 transition p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}