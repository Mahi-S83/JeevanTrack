"use client";
import { useState } from "react";
import { 
  FlaskConical, 
  Pill, 
  Scan, 
  Upload, 
  Loader2, 
  Check, 
  X, 
  Plus
} from "lucide-react";
import { apiUpload } from "@/lib/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Types
type ReportType = "lab" | "prescription" | "imaging" | null;
type Status = "Resolved" | "Recurring" | "Active";
type ComplaintType = "Acute" | "Chronic";

// Lab test row
type LabTest = {
  id: string;
  name: string;
  value: string;
  unit: string;
  normalRange: string;
};

// Medicine row
type Medicine = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

// Imaging types
var imagingTypes = ["X-ray", "MRI", "CT Scan", "Ultrasound", "Discharge Summary", "Other"];
type Visit = {
  id: string;
  type?: string;
  title?: string;
  date?: string;
  doctor?: string;
  hospital?: string;
  linkedDocuments?: any[];
};

type LinkMatch = {
  visit: Visit;
  reason: string;
};
// Generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Find related visit with strict matching logic
function findRelatedVisit(
  newVisit: Visit,
  allVisits: Visit[]
): LinkMatch | null {
  // Safety check - if newVisit or allVisits is invalid, return null
  if (!newVisit || !allVisits || allVisits.length === 0) {
    return null;
  }

  // Remove the visit being saved from the list
  var others = [];
  for (var i = 0; i < allVisits.length; i++) {
    if (allVisits[i].id !== newVisit.id) {
      others.push(allVisits[i]);
    }
  }
  
  if (others.length === 0) {
    return null;
  }

  // Safety check for date
  var newDate = newVisit.date ? new Date(newVisit.date) : new Date();
  if (isNaN(newDate.getTime())) {
    newDate = new Date();
  }

  var newDoctor = '';
  var newHospital = '';

  if (newVisit.doctor) {
    newDoctor = newVisit.doctor.toLowerCase().trim();
  }
  if (newVisit.hospital) {
    newHospital = newVisit.hospital.toLowerCase().trim();
  }

  for (var j = 0; j < others.length; j++) {
    var v = others[j];
    
    // Safety check for v.date
    var vDate = v.date ? new Date(v.date) : new Date();
    if (isNaN(vDate.getTime())) {
      vDate = new Date();
    }
    
    var timeDiff = newDate.getTime() - vDate.getTime();
    var daysDiff = Math.abs(timeDiff / (1000 * 60 * 60 * 24));
    
    var sameDoctor = false;
    if (newDoctor && v.doctor) {
      sameDoctor = (v.doctor.toLowerCase().trim() === newDoctor);
    }
    
    var sameHospital = false;
    if (newHospital && v.hospital) {
      sameHospital = (v.hospital.toLowerCase().trim() === newHospital);
    }
    
    var within7Days = (daysDiff <= 7);
    var within30Days = (daysDiff <= 30);

    // Strong match: same doctor AND within 7 days
    if (sameDoctor && within7Days) {
      var daysText = Math.round(daysDiff) + ' day';
      if (Math.round(daysDiff) !== 1) {
        daysText = daysText + 's';
      }
      return {
        visit: v,
        reason: 'Same doctor · ' + Math.round(daysDiff) + ' ' + daysText + ' apart'
      };
    }

    // Medium match: same hospital AND within 7 days
    if (sameHospital && within7Days) {
      return {
        visit: v,
        reason: 'Same hospital · ' + Math.round(daysDiff) + ' days apart'
      };
    }

    // Weak match: same doctor within 30 days with complementary types
    var complementary = false;
    var newType = newVisit.type || '';
    var vType = v.type || '';
    if ((newType === 'lab_report' && vType === 'prescription') ||
        (newType === 'prescription' && vType === 'lab_report')) {
      complementary = true;
    }
    
    if (sameDoctor && within30Days && complementary) {
      return {
        visit: v,
        reason: 'Same doctor · ' + Math.round(daysDiff) + ' days apart · Possibly related'
      };
    }
  }

  // No match found
  return null;
}

export default function UploadPage() {
  // State for flow
  var [step, setStep] = useState<"type" | "upload" | "processing" | "form" | "link" | "add">("type");
  var [selectedType, setSelectedType] = useState<ReportType>(null);
  var [file, setFile] = useState<File | null>(null);
  var [error, setError] = useState("");
  var [linkMatch, setLinkMatch] = useState<LinkMatch | null>(null);
  
  // Lab report state
  var [labDate, setLabDate] = useState<Date | null>(new Date());
  var [labHospital, setLabHospital] = useState("");
  var [labDoctor, setLabDoctor] = useState("");
  var [labDiagnosis, setLabDiagnosis] = useState("");
  var [labStatus, setLabStatus] = useState<Status>("Active");
  var [labTests, setLabTests] = useState<LabTest[]>([
    { id: generateId(), name: "", value: "", unit: "", normalRange: "" }
  ]);

  // Prescription state
  var [prescriptionDate, setPrescriptionDate] = useState<Date | null>(new Date());
  var [prescriptionDoctor, setPrescriptionDoctor] = useState("");
  var [prescriptionHospital, setPrescriptionHospital] = useState("");
  var [prescriptionDiagnosis, setPrescriptionDiagnosis] = useState("");
  var [prescriptionComplaint, setPrescriptionComplaint] = useState<ComplaintType>("Acute");
  var [medicines, setMedicines] = useState<Medicine[]>([
    { id: generateId(), name: "", dosage: "", frequency: "", duration: "" }
  ]);

  // Imaging state
  var [imagingType, setImagingType] = useState("X-ray");
  var [imagingDate, setImagingDate] = useState<Date | null>(new Date());
  var [imagingBodyPart, setImagingBodyPart] = useState("");
  var [imagingHospital, setImagingHospital] = useState("");
  var [imagingDoctor, setImagingDoctor] = useState("");
  var [imagingFinding, setImagingFinding] = useState("");
  var [imagingImpression, setImagingImpression] = useState("");

  // Link state
  var [showLinkPrompt, setShowLinkPrompt] = useState(false);
  var [showAddPrompt, setShowAddPrompt] = useState(false);

  // Get theme color based on type
  function getTheme() {
    switch(selectedType) {
      case "lab": return { color: "#81CAD6", bg: "bg-[#81CAD6]", lightBg: "bg-[#81CAD6]/10", text: "text-[#81CAD6]", border: "border-[#81CAD6]" };
      case "prescription": return { color: "#EDCD44", bg: "bg-[#EDCD44]", lightBg: "bg-[#EDCD44]/10", text: "text-[#EDCD44]", border: "border-[#EDCD44]" };
      case "imaging": return { color: "#DC3E26", bg: "bg-[#DC3E26]", lightBg: "bg-[#DC3E26]/10", text: "text-[#DC3E26]", border: "border-[#DC3E26]" };
      default: return { color: "#81CAD6", bg: "bg-[#81CAD6]", lightBg: "bg-[#81CAD6]/10", text: "text-[#81CAD6]", border: "border-[#81CAD6]" };
    }
  }

  var theme = getTheme();

  // Lab test handlers
  function addLabTest() {
    var newTests = labTests.slice();
    newTests.push({ id: generateId(), name: "", value: "", unit: "", normalRange: "" });
    setLabTests(newTests);
  }

  function removeLabTest(id: string) {
    if (labTests.length > 1) {
      setLabTests(labTests.filter(function(t) { return t.id !== id; }));
    }
  }

  function updateLabTest(id: string, field: keyof LabTest, value: string) {
    setLabTests(labTests.map(function(t) {
      if (t.id === id) {
        var updated = { ...t };
        updated[field] = value;
        return updated;
      }
      return t;
    }));
  }

  // Medicine handlers
  function addMedicine() {
    var newMeds = medicines.slice();
    newMeds.push({ id: generateId(), name: "", dosage: "", frequency: "", duration: "" });
    setMedicines(newMeds);
  }

  function removeMedicine(id: string) {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(function(m) { return m.id !== id; }));
    }
  }

  function updateMedicine(id: string, field: keyof Medicine, value: string) {
    setMedicines(medicines.map(function(m) {
      if (m.id === id) {
        var updated = { ...m };
        updated[field] = value;
        return updated;
      }
      return m;
    }));
  }

  // Handle file upload
  var handleFileSelect = async function(selectedFile: File) {
    setFile(selectedFile);
    setStep("processing");
    setError("");

    try {
      var result = await apiUpload('/upload', selectedFile);
      var extracted = result.extracted || {};
      
      // Auto-fill based on extracted data
      if (selectedType === "lab") {
        if (extracted.report_date) {
          setLabDate(new Date(extracted.report_date));
        }
        setLabHospital(extracted.hospital_name || "");
        setLabDoctor(extracted.doctor_name || "");
        setLabDiagnosis(extracted.diagnosis || "");
        
        // Map lab values to test rows
        if (extracted.lab_values) {
          var testEntries = Object.entries(extracted.lab_values);
          var tests = testEntries.map(function([key, val]: [string, any]) {
            return {
              id: generateId(),
              name: key,
              value: val.value ? val.value.toString() : "",
              unit: val.unit || "",
              normalRange: val.normal_range || "",
            };
          });
          if (tests.length > 0) {
            setLabTests(tests.slice(0, 10));
          }
        }
      } else if (selectedType === "prescription") {
        if (extracted.report_date) {
          setPrescriptionDate(new Date(extracted.report_date));
        }
        setPrescriptionDoctor(extracted.doctor_name || "");
        setPrescriptionHospital(extracted.hospital_name || "");
        setPrescriptionDiagnosis(extracted.diagnosis || "");
        
        if (extracted.medicines && extracted.medicines.length > 0) {
          var meds = extracted.medicines.map(function(m: string) {
            return {
              id: generateId(),
              name: m,
              dosage: "",
              frequency: "",
              duration: "",
            };
          });
          setMedicines(meds);
        }
      }
      
      setStep("form");
    } catch (err: any) {
      setError(err.message || "Failed to process report. Please try again.");
      setStep("upload");
    }
  };

  // Handle save
  var handleSave = function() {
    // Get existing visits from localStorage
   var existingVisits: Visit[] = [];
    try {
      existingVisits = JSON.parse(localStorage.getItem('jeevantrack_visits') || '[]');
    } catch (e) {
      existingVisits = [];
    }
    
    // Create the new visit object
    var newVisit = {
      id: 'v_' + Date.now(),
      type: selectedType || 'unknown',
      title: labDiagnosis || prescriptionDiagnosis || imagingFinding || 'Untitled',
      date: labDate ? labDate.toISOString() : (prescriptionDate ? prescriptionDate.toISOString() : (imagingDate ? imagingDate.toISOString() : new Date().toISOString())),
      doctor: labDoctor || prescriptionDoctor || imagingDoctor || '',
      hospital: labHospital || prescriptionHospital || imagingHospital || '',
      status: labStatus || prescriptionComplaint || 'active',
      testResults: labTests || [],
      medicines: medicines || [],
      file_name: file ? file.name : '',
      linkedDocuments: [],
      createdAt: new Date().toISOString()
    };

    // Find related visit
    var related = findRelatedVisit(newVisit, existingVisits);

    if (related) {
      // Show the link prompt with real data
      setLinkMatch(related);
      setStep('link');
      setShowLinkPrompt(true);
    } else {
      // No match found - save the visit separately
      existingVisits.push(newVisit);
      localStorage.setItem('jeevantrack_visits', JSON.stringify(existingVisits));
      // Skip to "Add another document?"
      setStep('add');
      setShowAddPrompt(true);
    }
  };

  var handleLinkExisting = function() {
    // Link the visits
    var visits: Visit[] = JSON.parse(
  localStorage.getItem('jeevantrack_visits') || '[]'
);
    var updatedVisits = visits.map(function(v: Visit) {
      if (linkMatch && v.id === linkMatch.visit.id) {
        if (!v.linkedDocuments) {
          v.linkedDocuments = [];
        }
        // Create a copy of the new visit without the id
        var newVisitCopy = {
          type: selectedType,
          title: labDiagnosis || prescriptionDiagnosis || imagingFinding || 'Untitled',
          date: labDate ? labDate.toISOString() : (prescriptionDate ? prescriptionDate.toISOString() : (imagingDate ? imagingDate.toISOString() : new Date().toISOString())),
          doctor: labDoctor || prescriptionDoctor || imagingDoctor || '',
          hospital: labHospital || prescriptionHospital || imagingHospital || '',
          testResults: labTests || [],
          medicines: medicines || [],
        };
        v.linkedDocuments.push(newVisitCopy);
      }
      return v;
    });
    
    // Remove the new visit as standalone (it's now linked)
    var newVisitId = 'v_' + Date.now();
    var withoutNew = updatedVisits.filter(function(v: Visit) {
      return v.id !== newVisitId;
    });
    
    localStorage.setItem('jeevantrack_visits', JSON.stringify(withoutNew));
    setShowLinkPrompt(false);
    setStep('add');
    setShowAddPrompt(true);
  };

  var handleSaveSeparate = function() {
    // Save the visit separately
 var visits: Visit[] = JSON.parse(
  localStorage.getItem('jeevantrack_visits') || '[]'
);
    var newVisit = {
      id: 'v_' + Date.now(),
      type: selectedType || 'unknown',
      title: labDiagnosis || prescriptionDiagnosis || imagingFinding || 'Untitled',
      date: labDate ? labDate.toISOString() : (prescriptionDate ? prescriptionDate.toISOString() : (imagingDate ? imagingDate.toISOString() : new Date().toISOString())),
      doctor: labDoctor || prescriptionDoctor || imagingDoctor || '',
      hospital: labHospital || prescriptionHospital || imagingHospital || '',
      status: labStatus || prescriptionComplaint || 'active',
      testResults: labTests || [],
      medicines: medicines || [],
      file_name: file ? file.name : '',
      linkedDocuments: [],
      createdAt: new Date().toISOString()
    };
    visits.push(newVisit);
    localStorage.setItem('jeevantrack_visits', JSON.stringify(visits));
    
    setShowLinkPrompt(false);
    setStep('add');
    setShowAddPrompt(true);
  };

  var handleAddAnother = function(type: ReportType) {
    setSelectedType(type);
    setStep("upload");
    setShowAddPrompt(false);
  };

  var handleDone = function() {
    setShowAddPrompt(false);
    // Reset everything
    setStep("type");
    setSelectedType(null);
    setFile(null);
    setLabTests([{ id: generateId(), name: "", value: "", unit: "", normalRange: "" }]);
    setMedicines([{ id: generateId(), name: "", dosage: "", frequency: "", duration: "" }]);
    setLinkMatch(null);
  };

  // Type selector
  if (step === "type") {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-medium text-[#1a2e32] mb-2">Upload Report</h1>
        <p className="text-[#5a7a80] mb-8">What type of report are you uploading?</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { type: "lab", icon: FlaskConical, title: "Lab Report", desc: "Blood, urine, thyroid, CBC", color: "#81CAD6", borderColor: "border-[#81CAD6]", hoverBg: "hover:bg-[#81CAD6]/5" },
            { type: "prescription", icon: Pill, title: "Prescription", desc: "Medicines, doctor visit", color: "#EDCD44", borderColor: "border-[#EDCD44]", hoverBg: "hover:bg-[#EDCD44]/5" },
            { type: "imaging", icon: Scan, title: "Imaging / Other", desc: "X-ray, MRI, CT, discharge", color: "#DC3E26", borderColor: "border-[#DC3E26]", hoverBg: "hover:bg-[#DC3E26]/5" },
          ].map(function(item) {
            return (
              <div
                key={item.type}
                onClick={function() {
                  setSelectedType(item.type as ReportType);
                  setStep("upload");
                }}
                className={"bg-white rounded-2xl border-2 " + item.borderColor + " p-6 cursor-pointer transition hover:shadow-lg " + item.hoverBg}
              >
                <item.icon className="w-10 h-10 mb-3" style={{ color: item.color }} />
                <h3 className="font-medium text-[#1a2e32] text-base">{item.title}</h3>
                <p className="text-[#5a7a80] text-sm mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button className="text-[#81CAD6] text-sm hover:underline">
            Not sure? Let AI detect automatically →
          </button>
        </div>
      </div>
    );
  }

  // Upload zone
  if (step === "upload") {
    var typeLabels = {
      lab: "Lab Report",
      prescription: "Prescription",
      imaging: "Imaging"
    };

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-medium text-[#1a2e32]">Upload Report</h1>
          <span className={"px-3 py-1 rounded-full text-xs font-medium " + theme.bg + " text-white"}>
            {typeLabels[selectedType!]}
          </span>
          <button
            onClick={function() { setStep("type"); }}
            className="text-sm text-[#5a7a80] hover:text-[#1a2e32] ml-auto"
          >
            Change type
          </button>
        </div>
        <p className="text-[#5a7a80] mb-8">Upload your {typeLabels[selectedType!].toLowerCase()}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div
          className={"border-2 border-dashed " + theme.border + " rounded-xl p-12 text-center bg-white hover:" + theme.lightBg + " transition cursor-pointer"}
          onDragOver={function(e) { e.preventDefault(); }}
          onDrop={function(e) {
            e.preventDefault();
            if (e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={function() { 
            var input = document.getElementById("fileInput");
            if (input) input.click();
          }}
        >
          <Upload className={"w-12 h-12 mx-auto mb-4 " + theme.text} />
          <p className="text-[#1a2e32] font-medium">
            Drop your {typeLabels[selectedType!].toLowerCase()} here — PDF, image, or scan
          </p>
          <p className="text-[#5a7a80] text-sm mt-1">or browse files</p>
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={function(e) {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Processing state
  if (step === "processing") {
    var typeLabels2 = {
      lab: "Lab Report",
      prescription: "Prescription",
      imaging: "Imaging"
    };

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-[rgba(129,202,214,0.25)] p-12 text-center">
          <Loader2 className={"w-10 h-10 animate-spin mx-auto mb-4 " + theme.text} />
          <p className="text-[#1a2e32] font-medium text-lg">
            AI is reading your {typeLabels2[selectedType!].toLowerCase()}…
          </p>
          <p className="text-[#5a7a80] text-sm mt-2">
            Extracting fields automatically — takes about 10 seconds
          </p>
        </div>
      </div>
    );
  }

  // Form - Lab Report
  if (step === "form" && selectedType === "lab") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#81CAD6] rounded-t-xl p-5 flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-white" />
          <h2 className="text-white font-medium">Lab Report Details</h2>
        </div>

        <div className="bg-white rounded-b-xl border border-[rgba(129,202,214,0.25)] border-t-0 p-6">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">Report processed successfully</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Date of test</label>
              <DatePicker
                selected={labDate}
                onChange={function(date: Date | null) { setLabDate(date); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81CAD6]"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Lab / Hospital</label>
              <input
                type="text"
                value={labHospital}
                onChange={function(e) { setLabHospital(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="City Lab"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Referring doctor</label>
              <input
                type="text"
                value={labDoctor}
                onChange={function(e) { setLabDoctor(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="Dr. Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Diagnosis</label>
              <input
                type="text"
                value={labDiagnosis}
                onChange={function(e) { setLabDiagnosis(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="Iron Deficiency Anemia"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1a2e32] mb-2">Test Results</label>
            <div className="border border-[rgba(129,202,214,0.25)] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f5fafb]">
                  <tr>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Test Name</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Your Value</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Unit</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Normal Range</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {labTests.map(function(test) {
                    return (
                      <tr key={test.id} className="border-t border-[rgba(129,202,214,0.15)]">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={test.name}
                            onChange={function(e) { updateLabTest(test.id, "name", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="e.g. Hemoglobin"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={test.value}
                            onChange={function(e) { updateLabTest(test.id, "value", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="9.8"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={test.unit}
                            onChange={function(e) { updateLabTest(test.id, "unit", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="g/dL"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={test.normalRange}
                            onChange={function(e) { updateLabTest(test.id, "normalRange", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="12-17"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={function() { removeLabTest(test.id); }}
                            className="text-[#5a7a80] hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              onClick={addLabTest}
              className={"mt-3 px-4 py-2 rounded-full text-sm font-medium border-2 " + theme.border + " " + theme.text + " hover:" + theme.bg + " hover:text-white transition"}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add another test
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1a2e32] mb-2">Status</label>
            <div className="flex gap-2">
              {["Resolved", "Recurring", "Active"].map(function(status) {
                return (
                  <button
                    key={status}
                    onClick={function() { setLabStatus(status as Status); }}
                    className={"px-4 py-1.5 rounded-full text-sm transition " + (
                      labStatus === status
                        ? "bg-[#81CAD6] text-white"
                        : "bg-white border border-[rgba(129,202,214,0.25)] text-[#5a7a80] hover:bg-[#f5fafb]"
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#81CAD6] text-white py-3 rounded-full font-medium hover:bg-[#6bb8c4] transition"
          >
            Save to Timeline
          </button>
        </div>
      </div>
    );
  }

  // Form - Prescription
  if (step === "form" && selectedType === "prescription") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#EDCD44] rounded-t-xl p-5 flex items-center gap-3">
          <Pill className="w-5 h-5 text-[#3d3000]" />
          <h2 className="text-[#3d3000] font-medium">Prescription Details</h2>
        </div>

        <div className="bg-white rounded-b-xl border border-[rgba(129,202,214,0.25)] border-t-0 p-6">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">Report processed successfully</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Date of visit</label>
              <DatePicker
                selected={prescriptionDate}
                onChange={function(date: Date | null) { setPrescriptionDate(date); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EDCD44]"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Doctor name</label>
              <input
                type="text"
                value={prescriptionDoctor}
                onChange={function(e) { setPrescriptionDoctor(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="Dr. Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Hospital / Clinic</label>
              <input
                type="text"
                value={prescriptionHospital}
                onChange={function(e) { setPrescriptionHospital(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="City Clinic"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Diagnosis</label>
              <input
                type="text"
                value={prescriptionDiagnosis}
                onChange={function(e) { setPrescriptionDiagnosis(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="Iron Deficiency"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1a2e32] mb-2">Medicines Prescribed</label>
            <div className="border border-[rgba(129,202,214,0.25)] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f5fafb]">
                  <tr>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Medicine name</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Dosage</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Frequency</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium">Duration</th>
                    <th className="px-3 py-2 text-left text-[#5a7a80] font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(function(med) {
                    return (
                      <tr key={med.id} className="border-t border-[rgba(129,202,214,0.15)]">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={med.name}
                            onChange={function(e) { updateMedicine(med.id, "name", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="Iron tablets"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={function(e) { updateMedicine(med.id, "dosage", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="100mg"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={function(e) { updateMedicine(med.id, "frequency", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="Twice/day"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={med.duration}
                            onChange={function(e) { updateMedicine(med.id, "duration", e.target.value); }}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="30 days"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={function() { removeMedicine(med.id); }}
                            className="text-[#5a7a80] hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              onClick={addMedicine}
              className="mt-3 px-4 py-2 rounded-full text-sm font-medium border-2 border-[#EDCD44] text-[#b09000] hover:bg-[#EDCD44] hover:text-[#3d3000] transition"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add medicine
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1a2e32] mb-2">Complaint type</label>
            <div className="flex gap-2">
              {["Acute", "Chronic"].map(function(type) {
                return (
                  <button
                    key={type}
                    onClick={function() { setPrescriptionComplaint(type as ComplaintType); }}
                    className={"px-4 py-1.5 rounded-full text-sm transition " + (
                      prescriptionComplaint === type
                        ? "bg-[#EDCD44] text-[#3d3000]"
                        : "bg-white border border-[rgba(129,202,214,0.25)] text-[#5a7a80] hover:bg-[#f5fafb]"
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#EDCD44] text-[#3d3000] py-3 rounded-full font-medium hover:bg-[#d4b83d] transition"
          >
            Save to Timeline
          </button>
        </div>
      </div>
    );
  }

  // Form - Imaging
  if (step === "form" && selectedType === "imaging") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#DC3E26] rounded-t-xl p-5 flex items-center gap-3">
          <Scan className="w-5 h-5 text-white" />
          <h2 className="text-white font-medium">Imaging / Other Report</h2>
        </div>

        <div className="bg-white rounded-b-xl border border-[rgba(129,202,214,0.25)] border-t-0 p-6">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">Report processed successfully</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Report type</label>
              <select
                value={imagingType}
                onChange={function(e) { setImagingType(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
              >
                {imagingTypes.map(function(type) {
                  return (
                    <option key={type} value={type}>{type}</option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Date</label>
              <DatePicker
                selected={imagingDate}
                onChange={function(date: Date | null) { setImagingDate(date); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC3E26]"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Body part / area</label>
              <input
                type="text"
                value={imagingBodyPart}
                onChange={function(e) { setImagingBodyPart(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="Chest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Hospital</label>
              <input
                type="text"
                value={imagingHospital}
                onChange={function(e) { setImagingHospital(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="City Hospital"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e32] mb-1">Radiologist / Doctor</label>
              <input
                type="text"
                value={imagingDoctor}
                onChange={function(e) { setImagingDoctor(e.target.value); }}
                className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg"
                placeholder="Dr. Mehta"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1a2e32] mb-1">Finding</label>
            <textarea
              value={imagingFinding}
              onChange={function(e) { setImagingFinding(e.target.value); }}
              className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg min-h-[80px]"
              placeholder="Describe the finding..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1a2e32] mb-1">Impression / Conclusion</label>
            <textarea
              value={imagingImpression}
              onChange={function(e) { setImagingImpression(e.target.value); }}
              className="w-full px-3 py-2 border border-[rgba(129,202,214,0.25)] rounded-lg min-h-[60px]"
              placeholder="Final impression..."
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#DC3E26] text-white py-3 rounded-full font-medium hover:bg-[#c03520] transition"
          >
            Save to Timeline
          </button>
        </div>
      </div>
    );
  }

  // Link visit prompt
  if (step === "link" && showLinkPrompt && linkMatch) {
    // Format the date for display
    var visitDate = linkMatch.visit.date ? new Date(linkMatch.visit.date) : new Date();
    var dateStr = visitDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    var doctorName = linkMatch.visit.doctor || 'Unknown Doctor';
    var title = linkMatch.visit.title || 'Untitled';

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-[rgba(129,202,214,0.25)] p-8 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-[#1a2e32] mb-2">Saved to your timeline!</h3>
          
          <div className="bg-[#f5fafb] rounded-lg p-4 text-left my-6">
            <p className="text-sm text-[#5a7a80] mb-2">Is this related to an existing visit?</p>
            <div className="bg-white rounded-lg border border-[rgba(129,202,214,0.25)] p-4">
              <p className="font-medium text-[#1a2e32]">{title} · {dateStr} · {doctorName}</p>
              <p className="text-sm text-[#5a7a80]">{linkMatch.reason}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleLinkExisting}
              className="px-6 py-2.5 rounded-full bg-[#81CAD6] text-white font-medium hover:bg-[#6bb8c4] transition"
            >
              Yes, link to this visit
            </button>
            <button
              onClick={handleSaveSeparate}
              className="px-6 py-2.5 rounded-full border border-[rgba(129,202,214,0.25)] text-[#1a2e32] font-medium hover:bg-[#f5fafb] transition"
            >
              Save separately
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add another document prompt
  if (step === "add" && showAddPrompt) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-[rgba(129,202,214,0.25)] p-8 text-center">
          <h3 className="text-xl font-medium text-[#1a2e32] mb-2">Do you have another document from this visit?</h3>
          <p className="text-[#5a7a80] mb-6">Add multiple reports from the same visit to keep them together.</p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={function() { handleAddAnother("lab"); }}
              className="px-6 py-2.5 rounded-full bg-[#81CAD6] text-white font-medium hover:bg-[#6bb8c4] transition"
            >
              + Add Lab Report
            </button>
            <button
              onClick={function() { handleAddAnother("prescription"); }}
              className="px-6 py-2.5 rounded-full bg-[#EDCD44] text-[#3d3000] font-medium hover:bg-[#d4b83d] transition"
            >
              + Add Prescription
            </button>
            <button
              onClick={handleDone}
              className="px-6 py-2.5 rounded-full border border-[rgba(129,202,214,0.25)] text-[#5a7a80] font-medium hover:bg-[#f5fafb] transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
