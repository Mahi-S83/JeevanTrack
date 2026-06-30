"use client";
import { useState, useEffect } from "react";
import { saveDocument } from '@/lib/dataService';
import {
  FlaskConical,
  Pill,
  Scan,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Shield,
  Search,
  FolderOpen,
  FolderPlus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  FileText,
  Calendar,
  User,
  Building2,
  PenLine
} from "lucide-react";
import { apiUpload } from "@/lib/api";
import {
  getConditions,
  upsertCondition,
  addDocumentToCondition,
  setNeedsRefresh,
  type Condition,
} from "@/lib/conditionStorage";
import { isDemoUser } from "@/lib/demoMode";

type ReportType = "lab" | "prescription" | "imaging" | null;
type StatusType = "active" | "recurring" | "resolved";

const statusColors = {
  active: "bg-[#DC3E26]/10 text-[#DC3E26] border-[#DC3E26]/30",
  recurring: "bg-[#EDCD44]/20 text-[#7a6200] border-[#EDCD44]/30",
  resolved: "bg-[#81CAD6]/20 text-[#2a7a86] border-[#81CAD6]/30",
};

const statusLabels = {
  active: "Active",
  recurring: "Recurring",
  resolved: "Resolved",
};

const typeOptions = [
  { type: "lab", icon: FlaskConical, label: "Lab Report", desc: "Blood tests, pathology reports", color: "#81CAD6" },
  { type: "prescription", icon: Pill, label: "Prescription", desc: "Doctor prescriptions, medications", color: "#EDCD44" },
  { type: "imaging", icon: Scan, label: "Imaging", desc: "X-rays, MRI, CT scans", color: "#DC3E26" },
];

const popularConditions = [
  { name: "Iron Deficiency Anemia", status: "active" },
  { name: "Vitamin D Deficiency", status: "recurring" },
  { name: "Dengue Fever", status: "resolved" },
  { name: "Hypertension", status: "active" },
];

export default function UploadPage() {
  // Step state: "condition" | "upload" | "review" | "manual"
  const [step, setStep] = useState<"condition" | "upload" | "review" | "manual">("condition");

  // Condition selection state
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isNewCondition, setIsNewCondition] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [newConditionName, setNewConditionName] = useState("");
  const [status, setStatus] = useState<StatusType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);

  // Upload state
  const [selectedType, setSelectedType] = useState<ReportType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadAttempted, setUploadAttempted] = useState(false);

  // Manual entry state
  const [manualData, setManualData] = useState({
    reportType: "Lab Report" as "Lab Report" | "Prescription" | "Imaging",
    date: "",
    doctor: "",
    hospital: "",
    diagnosis: "",
    notes: "",
  });

  // Load conditions on mount
  useEffect(() => {
    const allConditions = getConditions();
    setConditions(allConditions);
  }, []);

  const filteredConditions = conditions.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle condition selection
  const handleConditionSubmit = () => {
    if (isNewCondition && !newConditionName.trim()) {
      setError("Please enter a condition name.");
      return;
    }
    if (!isNewCondition && !selectedConditionId) {
      setError("Please select a condition.");
      return;
    }
    setError("");

    let condition: Condition;

    if (isNewCondition) {
      condition = {
        id: "cond_" + Date.now(),
        name: newConditionName.trim(),
        status: status,
        documents: [],
      };
      upsertCondition(condition);
    } else {
      const existing = conditions.find((c) => c.id === selectedConditionId);
      if (!existing) {
        setError("Condition not found.");
        return;
      }
      condition = existing;
    }

    setSelectedCondition(condition);
    setStep("upload");
    setUploadAttempted(false);
  };

  // Handle file upload with fallback
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setError("");
    setIsComplete(false);
    setUploadAttempted(true);

    try {
      const result = await apiUpload("/upload", selectedFile);
      setUploadResult(result);
      setIsComplete(true);
      setStep("review");
    } catch (err: any) {
      console.error("Upload error:", err);
      // Check if it's a Gemini quota error (429 or 503 or 500 with quota message)
      const errorMsg = err.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("503") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota")) {
        // Show manual entry fallback
        setError("AI extraction is temporarily unavailable. You can continue by entering the report details manually.");
        setStep("manual");
        // Pre-fill manual form with extracted info if available
        if (uploadResult?.extracted) {
          const extracted = uploadResult.extracted;
          setManualData({
            reportType: selectedType === "lab" ? "Lab Report" : selectedType === "prescription" ? "Prescription" : "Imaging",
            date: extracted.report_date || extracted.visit_date || "",
            doctor: extracted.doctor_name || extracted.physician || "",
            hospital: extracted.hospital_name || extracted.lab_name || "",
            diagnosis: extracted.diagnosis || "",
            notes: "",
          });
        }
      } else {
        setError(err.message || "Failed to process your file. Please try again.");
        setStep("upload");
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual save
 const handleManualSave = async () => {
  if (!selectedCondition) return;

  const document = {
    id: "doc_" + Date.now(),
    name: file?.name || "Manual Entry - " + manualData.reportType,
    type: (manualData.reportType === "Lab Report" ? "Lab Report" : manualData.reportType === "Prescription" ? "Prescription" : "Imaging") as "Lab Report" | "Prescription" | "Imaging",
    fileUrl: "",
    reportId: "manual_" + Date.now(),
    uploadedAt: new Date().toISOString(),
    reportDate: manualData.date || new Date().toISOString().split("T")[0],
    extractedData: manualData.diagnosis ? {
      lab_values: {
        "Diagnosis": {
          value: manualData.diagnosis,
          unit: "",
          normal_range: ""
        }
      }
    } : {}
  };

  await saveDocument(selectedCondition.id, document);
  resetForm();
  setStep("condition");
  setConditions(getConditions());
  
  alert("Report saved successfully to " + selectedCondition.name + "!");
};

  const resetForm = () => {
    setSelectedType(null);
    setFile(null);
    setUploadResult(null);
    setIsComplete(false);
    setError("");
    setSelectedConditionId("");
    setNewConditionName("");
    setIsNewCondition(false);
    setStatus("active");
    setSearchQuery("");
    setUploadAttempted(false);
    setManualData({
      reportType: "Lab Report",
      date: "",
      doctor: "",
      hospital: "",
      diagnosis: "",
      notes: "",
    });
  };

  const goBackToCondition = () => {
    setStep("condition");
    resetForm();
  };

  const goBackToUpload = () => {
    setStep("upload");
    setError("");
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.active;
  };

  // ========================
  // STEP 1: CONDITION SELECTION
  // ========================
  if (step === "condition") {
    return (
      <div className="min-h-screen bg-[#f5fafb] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#81CAD6] text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-[#1a2e32]">Condition</span>
            </div>
            <div className="w-12 h-0.5 bg-[#81CAD6]/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f5fafb] border-2 border-[#81CAD6]/30 text-[#5a7a80] flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-[#5a7a80]">Upload</span>
            </div>
            <div className="w-12 h-0.5 bg-[#81CAD6]/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f5fafb] border-2 border-[#81CAD6]/30 text-[#5a7a80] flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm text-[#5a7a80]">Review</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#1a2e32]">Upload Report</h1>
            <p className="text-[#5a7a80] mt-1">
              First, tell us which condition this report belongs to.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-[rgba(129,202,214,0.2)] p-8 shadow-sm">
            {/* Toggle */}
            <div className="bg-[#f5fafb] rounded-xl p-1 flex mb-6">
              <button
                onClick={() => { setIsNewCondition(false); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                  !isNewCondition
                    ? "bg-white text-[#1a2e32] shadow-sm"
                    : "text-[#5a7a80] hover:text-[#1a2e32]"
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Existing Condition
              </button>
              <button
                onClick={() => { setIsNewCondition(true); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                  isNewCondition
                    ? "bg-white text-[#1a2e32] shadow-sm"
                    : "text-[#5a7a80] hover:text-[#1a2e32]"
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                New Condition
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {isNewCondition ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                    Condition Name
                  </label>
                  <input
                    type="text"
                    value={newConditionName}
                    onChange={(e) => setNewConditionName(e.target.value)}
                    placeholder="e.g. Iron Deficiency Anemia"
                    className="w-full px-4 py-3 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm"
                  />
                  <p className="text-xs text-[#5a7a80] mt-1">
                    Examples: Iron Deficiency Anemia, Vitamin D Deficiency, Dengue Fever
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2e32] mb-2">
                    Status
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "active", label: "Active" },
                      { value: "recurring", label: "Recurring" },
                      { value: "resolved", label: "Resolved" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value as StatusType)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                          status === opt.value
                            ? getStatusColor(opt.value) + " ring-2 ring-offset-2 ring-[#81CAD6]"
                            : "bg-white border-[rgba(129,202,214,0.2)] text-[#5a7a80] hover:border-[#81CAD6]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a80]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a condition..."
                    className="w-full pl-9 pr-4 py-2.5 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm"
                  />
                </div>

                {conditions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#5a7a80] text-sm">No conditions yet.</p>
                    <p className="text-[#5a7a80] text-sm">Create one by selecting "New Condition".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {filteredConditions.map((c) => {
                      const statusColor = getStatusColor(c.status);
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedConditionId(c.id)}
                          className={`p-3 rounded-xl border text-left transition ${
                            selectedConditionId === c.id
                              ? "border-[#81CAD6] bg-[#81CAD6]/5 ring-2 ring-[#81CAD6]/20"
                              : "border-[rgba(129,202,214,0.2)] hover:border-[#81CAD6]"
                          }`}
                        >
                          <p className="font-medium text-[#1a2e32] text-sm">{c.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                              {statusLabels[c.status as keyof typeof statusLabels] || "Active"}
                            </span>
                            <span className="text-xs text-[#5a7a80]">
                              {c.documents.length} doc{c.documents.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {conditions.length === 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-[#5a7a80] mb-2">Popular conditions to get started:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularConditions.map((pc) => (
                        <button
                          key={pc.name}
                          onClick={() => {
                            setNewConditionName(pc.name);
                            setIsNewCondition(true);
                            setStatus(pc.status as StatusType);
                          }}
                          className="px-3 py-1.5 rounded-full text-xs bg-[#f5fafb] border border-[rgba(129,202,214,0.2)] hover:border-[#81CAD6] transition text-[#1a2e32]"
                        >
                          {pc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info Card */}
            <div className="mt-6 p-4 bg-[#81CAD6]/5 rounded-xl border border-[#81CAD6]/20 flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#81CAD6] shrink-0 mt-0.5" />
              <p className="text-sm text-[#5a7a80]">
                Select an existing condition to keep your medical history organized and easy to track.
              </p>
            </div>

            <button
              onClick={handleConditionSubmit}
              className="w-full mt-6 bg-linear-to-r from-[#81CAD6] to-[#6bb8c4] text-white py-3.5 rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              Next: Upload Documents
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#5a7a80]">
            <Shield className="w-3.5 h-3.5" />
            Your data is secure and private
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // STEP 2: UPLOAD
  // ========================
  if (step === "upload") {
    return (
      <div className="min-h-screen bg-[#f5fafb] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#81CAD6] text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-[#1a2e32]">Condition</span>
            </div>
            <div className="w-12 h-0.5 bg-[#81CAD6]"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#81CAD6] text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-[#1a2e32]">Upload</span>
            </div>
            <div className="w-12 h-0.5 bg-[#81CAD6]/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f5fafb] border-2 border-[#81CAD6]/30 text-[#5a7a80] flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm text-[#5a7a80]">Review</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-[#1a2e32]">Upload Report</h1>
              <p className="text-[#5a7a80] mt-1">
                Select the document type and upload your file.
              </p>
            </div>
            <button
              onClick={goBackToCondition}
              className="flex items-center gap-1.5 text-sm text-[#5a7a80] hover:text-[#1a2e32] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Condition
            </button>
          </div>

          {selectedCondition && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[rgba(129,202,214,0.2)] shadow-sm">
                <span className="text-sm font-medium text-[#1a2e32]">{selectedCondition.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedCondition.status)}`}>
                  {statusLabels[selectedCondition.status as keyof typeof statusLabels] || "Active"}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[rgba(129,202,214,0.2)] p-8 shadow-sm">
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1a2e32] mb-3">
                Choose Document Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {typeOptions.map((item) => {
                  const isSelected = selectedType === item.type;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => setSelectedType(item.type as ReportType)}
                      className={`p-4 rounded-xl border-2 text-center transition ${
                        isSelected
                          ? "border-[#81CAD6] bg-[#81CAD6]/5 shadow-sm"
                          : "border-[rgba(129,202,214,0.15)] hover:border-[rgba(129,202,214,0.3)]"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          isSelected ? "bg-[#81CAD6]/10" : "bg-[#f5fafb]"
                        }`}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: isSelected ? item.color : "#5a7a80" }}
                        />
                      </div>
                      <p className="text-sm font-medium" style={{ color: isSelected ? item.color : "#1a2e32" }}>
                        {item.label}
                      </p>
                      <p className="text-xs text-[#5a7a80] mt-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isLoading && !error && (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center bg-white transition ${
                  selectedType
                    ? "border-[#81CAD6] hover:bg-[#81CAD6]/5 cursor-pointer"
                    : "border-[rgba(129,202,214,0.25)] opacity-60"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0] && selectedType) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => {
                  if (selectedType) {
                    document.getElementById("fileInput")?.click();
                  }
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#81CAD6]/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-[#81CAD6]" />
                </div>
                <p className="text-[#1a2e32] font-medium">
                  Drag & drop your file here
                </p>
                <p className="text-[#5a7a80] text-sm mt-1">
                  PDF, image, or scan
                </p>
                <button
                  className={`mt-4 px-6 py-2 rounded-full text-sm font-medium transition ${
                    selectedType
                      ? "bg-[#81CAD6] text-white hover:bg-[#6bb8c4]"
                      : "bg-[#f5fafb] text-[#5a7a80] cursor-not-allowed"
                  }`}
                  disabled={!selectedType}
                >
                  Browse Files
                </button>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0] && selectedType) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                {!selectedType && (
                  <p className="text-xs text-[#DC3E26] mt-3">
                    Please select a document type first
                  </p>
                )}
              </div>
            )}

            {isLoading && (
              <div className="py-16 text-center">
                <Loader2 className="w-10 h-10 text-[#81CAD6] animate-spin mx-auto mb-4" />
                <p className="text-[#1a2e32] font-medium">AI is reading your report…</p>
                <p className="text-[#5a7a80] text-sm mt-1">Extracting fields automatically</p>
              </div>
            )}

            {error && !uploadAttempted && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">Upload Failed</p>
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      onClick={() => {
                        setError("");
                        setUploadAttempted(false);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // STEP 3: REVIEW (AI Success)
  // ========================
  if (step === "review" && uploadResult) {
    const extracted = uploadResult.extracted || {};
    return (
      <div className="min-h-screen bg-[#f5fafb] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">Report processed successfully</span>
          </div>

          <div className="bg-white rounded-2xl border border-[rgba(129,202,214,0.2)] p-8 shadow-sm">
            <h3 className="font-semibold text-[#1a2e32] mb-4">Review Document Details</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[#5a7a80] font-medium">File Name</p>
                <p className="text-sm text-[#1a2e32]">{uploadResult.file_name || file?.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#5a7a80] font-medium">Type</p>
                <p className="text-sm text-[#1a2e32]">{selectedType ? typeOptions.find(t => t.type === selectedType)?.label : "Unknown"}</p>
              </div>
              {extracted.report_date && (
                <div>
                  <p className="text-xs text-[#5a7a80] font-medium">Date</p>
                  <p className="text-sm text-[#1a2e32]">{extracted.report_date}</p>
                </div>
              )}
              {extracted.doctor_name && (
                <div>
                  <p className="text-xs text-[#5a7a80] font-medium">Doctor</p>
                  <p className="text-sm text-[#1a2e32]">{extracted.doctor_name}</p>
                </div>
              )}
              {extracted.hospital_name && (
                <div className="md:col-span-2">
                  <p className="text-xs text-[#5a7a80] font-medium">Hospital</p>
                  <p className="text-sm text-[#1a2e32]">{extracted.hospital_name}</p>
                </div>
              )}
              {extracted.diagnosis && (
                <div className="md:col-span-2">
                  <p className="text-xs text-[#5a7a80] font-medium">Diagnosis</p>
                  <p className="text-sm text-[#1a2e32]">{extracted.diagnosis}</p>
                </div>
              )}
            </div>

            <button
              onClick={async () => {
  if (!selectedCondition) return;
  const document = {
    id: "doc_" + Date.now(),
    name: uploadResult.file_name || file?.name || "Untitled",
    type: (selectedType === "lab" ? "Lab Report" : selectedType === "prescription" ? "Prescription" : "Imaging") as "Lab Report" | "Prescription" | "Imaging",
    fileUrl: uploadResult.file_url || "",
    reportId: uploadResult.report_id || "",
    uploadedAt: new Date().toISOString(),
    reportDate: extracted.report_date || extracted.visit_date || new Date().toISOString().split("T")[0],
    extractedData: extracted || {},
  };
  
  await saveDocument(selectedCondition.id, document);
  resetForm();
  setStep("condition");
  setConditions(getConditions());
  alert("Report saved successfully to " + selectedCondition.name + "!");
}}
              className="w-full mt-4 bg-linear-to-r from-[#81CAD6] to-[#6bb8c4] text-white py-3.5 rounded-xl font-medium hover:shadow-lg transition"
            >
              Save to {selectedCondition?.name}
            </button>

            <button
              onClick={() => { setStep("upload"); resetForm(); }}
              className="w-full mt-3 text-sm text-[#5a7a80] hover:text-[#1a2e32] transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // STEP 4: MANUAL ENTRY FALLBACK
  // ========================
  if (step === "manual") {
    return (
      <div className="min-h-screen bg-[#f5fafb] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Banner */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-3 rounded-2xl mb-6 text-sm flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-600 shrink-0" />
            <span>AI extraction is temporarily unavailable. You can continue by entering the report details manually.</span>
          </div>

          <div className="bg-white rounded-2xl border border-[rgba(129,202,214,0.2)] p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1a2e32] mb-2 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-[#81CAD6]" />
              Enter Report Details
            </h3>
            <p className="text-sm text-[#5a7a80] mb-6">
              Fill in the details manually. This will be saved to your timeline.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                  Report Type
                </label>
                <div className="flex gap-3">
                  {["Lab Report", "Prescription", "Imaging"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setManualData({ ...manualData, reportType: type as any })}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                        manualData.reportType === type
                          ? "border-[#81CAD6] bg-[#81CAD6]/10 text-[#1a2e32]"
                          : "border-[rgba(129,202,214,0.2)] text-[#5a7a80] hover:border-[#81CAD6]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={manualData.date}
                    onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                    Doctor
                  </label>
                  <input
                    type="text"
                    value={manualData.doctor}
                    onChange={(e) => setManualData({ ...manualData, doctor: e.target.value })}
                    placeholder="Dr. Name"
                    className="w-full px-4 py-2.5 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                    Hospital / Lab
                  </label>
                  <input
                    type="text"
                    value={manualData.hospital}
                    onChange={(e) => setManualData({ ...manualData, hospital: e.target.value })}
                    placeholder="Hospital name"
                    className="w-full px-4 py-2.5 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                    Diagnosis / Reason
                  </label>
                  <input
                    type="text"
                    value={manualData.diagnosis}
                    onChange={(e) => setManualData({ ...manualData, diagnosis: e.target.value })}
                    placeholder="e.g. Iron Deficiency Anemia"
                    className="w-full px-4 py-2.5 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a2e32] mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={manualData.notes}
                  onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2.5 border border-[rgba(129,202,214,0.25)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81CAD6] text-sm min-h-20"
                />
              </div>

              {selectedCondition && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#f5fafb] rounded-xl">
                  <span className="text-sm text-[#5a7a80]">Saving to:</span>
                  <span className="text-sm font-medium text-[#1a2e32]">{selectedCondition.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedCondition.status)}`}>
                    {statusLabels[selectedCondition.status as keyof typeof statusLabels] || "Active"}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleManualSave}
                  className="flex-1 bg-linear-to-r from-[#81CAD6] to-[#6bb8c4] text-white py-3 rounded-xl font-medium hover:shadow-lg transition"
                >
                  Save to Timeline
                </button>
                <button
                  onClick={() => { setStep("upload"); resetForm(); }}
                  className="px-6 py-3 rounded-xl border border-[rgba(129,202,214,0.2)] text-[#5a7a80] hover:bg-[#f5fafb] transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}