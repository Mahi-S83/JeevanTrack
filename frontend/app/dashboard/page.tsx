"use client";
import { useState, useEffect } from "react";
import { Search, X, ChevronDown, ChevronUp, FileText, Pill, Scan } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  hospital: string;
  doctor: string;
  values: string;
  status: string;
  statusColor: "teal" | "yellow" | "red";
  reportType: string;
  labValues?: any;
  medicines?: any[];
};

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
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

      const response = await fetch('https://jeevantrack-backend.onrender.com/timeline', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const items = data.timeline || [];

      const mappedItems = items.map((item: any) => {
        let title = item.diagnosis || item.file_name || "Untitled Report";
        if (title && title.length > 60) {
          title = title.substring(0, 60) + "...";
        }

        // Clean up doctor names - show only first doctor
let doctor = "Unknown";
let doctorCount = 1;

if (item.doctor) {
  doctor = String(item.doctor);
  if (doctor.includes(',')) {
    const doctors = doctor.split(',').map(function(d) {
      return d.trim();
    });
    doctor = doctors[0]; // Show only first doctor
    doctorCount = doctors.length;
  }
}

// If multiple doctors, add "+N more"
if (doctorCount > 1) {
  doctor = doctor + " +" + (doctorCount - 1) + " more";
}

        let date = item.date || item.uploaded_at || "Date not available";
        if (date.includes('T')) {
          const d = new Date(date);
          if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          }
        }

        let status = "Active";
        let statusColor: "teal" | "yellow" | "red" = "red";
        const reportType = item.report_type || "";
        if (reportType === "prescription") {
          status = "Prescription";
          statusColor = "yellow";
        } else if (reportType === "blood_test" || reportType === "scan") {
          status = "Lab Report";
          statusColor = "teal";
        }

        let values = "";
        let labValues = item.lab_values || {};
        if (labValues && typeof labValues === 'object') {
          const labEntries = Object.entries(labValues).slice(0, 4);
          values = labEntries
            .map(([key, val]: [string, any]) => {
              const value = val?.value || '';
              const unit = val?.unit || '';
              return `${key}: ${value} ${unit}`.trim();
            })
            .join(' · ');
        }

        return {
          id: item.id || String(Math.random()),
          title: title,
          date: date,
          hospital: item.hospital || "Unknown",
          doctor: doctor,
          values: values,
          status: status,
          statusColor: statusColor,
          reportType: reportType,
          labValues: labValues,
          medicines: item.medicines || [],
        };
      });

      setTimeline(mappedItems);
    } catch (err: any) {
      console.error('Failed to fetch timeline:', err);
      setError(err.message || "Failed to load timeline");
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this report?")) return;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      alert("Please log in again.");
      return;
    }

    // Call backend DELETE endpoint
    const response = await fetch(`https://jeevantrack-backend.onrender.com/reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      // Report already deleted - remove from UI
      setTimeline(prev => prev.filter(item => item.id !== id));
      alert("Report was already deleted.");
      return;
    }

    if (response.status === 403) {
      alert("You don't have permission to delete this report.");
      return;
    }

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    // Remove from UI on success
    setTimeline(prev => prev.filter(item => item.id !== id));
    alert("Report deleted successfully.");
    
  } catch (err) {
    console.error('Delete failed:', err);
    alert("Failed to delete. Please try again.");
    // Refresh to restore data if delete failed
    fetchTimeline();
  }
};
  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = timeline.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.hospital.toLowerCase().includes(search.toLowerCase()) ||
                          item.doctor.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || 
                          (filter === "Lab Reports" && item.reportType === "blood_test") ||
                          (filter === "Prescriptions" && item.reportType === "prescription");
    return matchesSearch && matchesFilter;
  });

  const statusColorMap = {
    teal: "border-l-[#81CAD6]",
    yellow: "border-l-[#EDCD44]",
    red: "border-l-[#DC3E26]",
  };

  const statusTagColor = {
    teal: "bg-[#81CAD6]/20 text-[#2a7a86]",
    yellow: "bg-[#EDCD44]/20 text-[#7a6200]",
    red: "bg-[#DC3E26]/20 text-[#DC3E26]",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#5a7a80]">Loading your timeline...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-medium text-[#1a2e32]">Timeline</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a80]" />
            <input
              type="text"
              placeholder="Search by condition, doctor, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81CAD6] w-full md:w-64"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Lab Reports", "Prescriptions"].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-3 py-1.5 text-sm rounded-full transition ${
                  filter === option
                    ? "bg-[#81CAD6] text-white"
                    : "bg-white border border-[rgba(129,202,214,0.25)] text-[#5a7a80] hover:bg-[#f5fafb]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTimeline}
            className="px-3 py-1.5 text-sm rounded-full bg-[#81CAD6]/20 text-[#2a7a86] hover:bg-[#81CAD6]/30 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#5a7a80]">
            {timeline.length === 0 
              ? "No reports found. Upload your first report to begin."
              : "No results match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg border border-[rgba(129,202,214,0.25)] p-5 border-l-4 ${
                statusColorMap[item.statusColor as keyof typeof statusColorMap] || "border-l-[#81CAD6]"
              } relative`}
            >
              {/* Delete button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-3 right-3 text-[#5a7a80] hover:text-[#DC3E26] transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-[#5a7a80]">{item.date}</span>
                 <span
  className={`text-xs px-2 py-0.5 rounded ${
    item.reportType === 'prescription' 
      ? 'bg-[#EDCD44]/20 text-[#7a6200]' 
      : item.reportType === 'blood_test' 
        ? 'bg-[#81CAD6]/20 text-[#2a7a86]' 
        : item.reportType === 'scan' 
          ? 'bg-[#DC3E26]/20 text-[#DC3E26]'
          : 'bg-[#f5fafb] text-[#5a7a80]'
  }`}
>
  {item.reportType === 'prescription' ? '💊 Prescription' : 
   item.reportType === 'blood_test' ? '🧪 Lab Report' : 
   item.reportType === 'scan' ? '📋 Imaging' : 
   item.reportType || '📄 Report'}
</span>
                </div>
                <h3 className="font-medium text-[#1a2e32] text-lg">{item.title}</h3>
                <p className="text-sm text-[#5a7a80]">{item.hospital} · {item.doctor}</p>
                {item.values && (
                  <p className="text-sm text-[#5a7a80] mt-1">{item.values}</p>
                )}
                
                {/* Expand button */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="mt-2 text-[#81CAD6] text-sm hover:underline flex items-center gap-1"
                >
                  {expanded[item.id] ? (
                    <>Show less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show more <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>

                {/* Expanded content */}
                {expanded[item.id] && (
  <div className="mt-3 pt-3 border-t border-[rgba(129,202,214,0.25)]">
    {/* Test Results - only if labValues exist */}
    {item.labValues && Object.keys(item.labValues).length > 0 && (
      <div className="mb-4">
        <p className="text-sm font-medium text-[#1a2e32] mb-2">Test Results</p>
        <div className="bg-[#f5fafb] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#e8f3f5]">
              <tr>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Test</th>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Value</th>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Unit</th>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Normal Range</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(item.labValues).slice(0, 10).map(([key, val]: [string, any], index) => {
                const value = val?.value || '';
                const unit = val?.unit || '';
                const normalRange = val?.normal_range || '';
                
                // Check if value is abnormal
                let isAbnormal = false;
                let isLow = false;
                if (normalRange && value) {
                  const rangeParts = normalRange.split(/[–\-]/);
                  if (rangeParts.length === 2) {
                    const min = parseFloat(rangeParts[0]);
                    const max = parseFloat(rangeParts[1]);
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && !isNaN(min) && !isNaN(max)) {
                      if (numValue < min) { isAbnormal = true; isLow = true; }
                      if (numValue > max) { isAbnormal = true; isLow = false; }
                    }
                  }
                }
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                    <td className="px-3 py-2 text-[#1a2e32]">{key}</td>
                    <td className={`px-3 py-2 font-medium ${isAbnormal ? (isLow ? 'text-[#DC3E26]' : 'text-[#EDCD44]') : 'text-[#1a2e32]'}`}>
                      {value}
                      {isAbnormal && (isLow ? ' ↓' : ' ↑')}
                    </td>
                    <td className="px-3 py-2 text-[#5a7a80]">{unit}</td>
                    <td className="px-3 py-2 text-[#5a7a80]">{normalRange || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Medicines - only if medicines exist */}
    {item.medicines && item.medicines.length > 0 && (
      <div className="mb-4">
        <p className="text-sm font-medium text-[#1a2e32] mb-2">Medicines Prescribed</p>
        <div className="bg-[#f5fafb] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f0d9]">
              <tr>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Medicine</th>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Dosage</th>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Frequency</th>
                <th className="px-3 py-2 text-left text-[#5a7a80] font-medium text-xs">Duration</th>
              </tr>
            </thead>
            <tbody>
              {item.medicines.map((med: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                  <td className="px-3 py-2 text-[#1a2e32]">{med.name || med}</td>
                  <td className="px-3 py-2 text-[#1a2e32]">{med.dosage || ''}</td>
                  <td className="px-3 py-2 text-[#1a2e32]">{med.frequency || ''}</td>
                  <td className="px-3 py-2 text-[#1a2e32]">{med.duration || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Report Type Badge */}
    <div className="flex gap-2 mt-2">
      <span className={`text-xs px-3 py-1 rounded-full ${
        item.reportType === 'prescription' 
          ? 'bg-[#EDCD44]/20 text-[#7a6200]' 
          : item.reportType === 'blood_test' 
            ? 'bg-[#81CAD6]/20 text-[#2a7a86]' 
            : 'bg-[#DC3E26]/20 text-[#DC3E26]'
      }`}>
        {item.reportType === 'prescription' ? '💊 Prescription' : 
         item.reportType === 'blood_test' ? '🧪 Lab Report' : 
         item.reportType === 'scan' ? '📋 Imaging' : '📄 Report'}
      </span>
    </div>
  </div>
)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}