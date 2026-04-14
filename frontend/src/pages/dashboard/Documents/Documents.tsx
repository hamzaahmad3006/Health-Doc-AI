import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  MoreVertical,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  Edit2,
  Check,
  ShieldAlert,
  X,
} from "lucide-react";
import { useDocuments } from "./Documents.logic";
import FileUpload from "../../../components/dashboard/FileUpload";

const DocumentsPage: React.FC = () => {
  const {
    documents,
    isLoading,
    isUploading,
    uploadProgress,
    handleUpload,
    handleMultiUpload,
    selectedDoc,
    viewDetails,
    closeDetails,
    handleDelete,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    handleExport,
    handleUpdateDocument,
    handleApproveDocument,
    rejectionAlert,
    dismissRejectionAlert,
  } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Fix: Lock body scroll when modal is open
  React.useEffect(() => {
    if (selectedDoc) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedDoc]);

  const normalizeFieldKey = (key: string) =>
    key
      .toLowerCase()
      .replace(/[_\s]+/g, " ")
      .trim();

  const extractNumericValue = (value: any) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    const match = String(value).match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  };

  const classifyRiskLevel = (key: string, value: any) => {
    const normalizedKey = normalizeFieldKey(key);
    const numericValue = extractNumericValue(value);
    const rawValue = String(value ?? "").toLowerCase();

    const isGlucose =
      normalizedKey.includes("glucose") ||
      normalizedKey.includes("blood sugar");
    const isCholesterol = normalizedKey.includes("cholesterol");
    const isBloodPressure =
      normalizedKey.includes("bp") || normalizedKey.includes("blood pressure");
    const isHeartRate = normalizedKey.includes("heart rate");
    const isTemperature = normalizedKey.includes("temperature");

    if (isGlucose && numericValue !== null) {
      if (numericValue >= 140) {
        return {
          label: "HIGH",
          tone: "critical",
          container: "border-red-500/40 bg-red-500/10 text-red-300",
          hint: "Immediate doctor review recommended",
        };
      }
      if (numericValue >= 110) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
        };
      }
    }

    if (isCholesterol && numericValue !== null) {
      if (numericValue >= 200) {
        return {
          label: "HIGH",
          tone: "critical",
          container: "border-red-500/40 bg-red-500/10 text-red-300",
          hint: "Immediate doctor review recommended",
        };
      }
      if (numericValue >= 170) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
        };
      }
    }

    if (isBloodPressure && numericValue !== null) {
      if (numericValue >= 160) {
        return {
          label: "HIGH",
          tone: "critical",
          container: "border-red-500/40 bg-red-500/10 text-red-300",
          hint: "Immediate doctor review recommended",
        };
      }
      if (numericValue >= 130) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
        };
      }
    }

    if (isHeartRate && numericValue !== null) {
      if (numericValue >= 100 || numericValue <= 60) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
        };
      }
    }

    if (isTemperature && numericValue !== null) {
      if (numericValue >= 99.5) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
        };
      }
    }

    if (/high|abnormal|critical|urgent|elevated/.test(rawValue)) {
      return {
        label: "WARN",
        tone: "warning",
        container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        hint: "Needs attention",
      };
    }

    return {
      label: "OK",
      tone: "normal",
      container: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      hint: "Within normal range",
    };
  };

  const renderRiskBadge = (key: string, value: any) => {
    const risk = classifyRiskLevel(key, value);
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.2em] border ${risk.container}`}
      >
        {risk.label}
      </span>
    );
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value !== "object") return String(value);
    if (Array.isArray(value)) {
      return value.map((item) => formatValue(item)).join(", ");
    }
    return Object.entries(value)
      .map(([sk, sv]) => `${sk}: ${formatValue(sv)}`)
      .join(" | ");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const startEditing = () => {
    setEditForm(selectedDoc.extractedData || {});
    setIsEditing(true);
  };

  const saveEdit = async () => {
    await handleUpdateDocument(selectedDoc.id, { extracted_data: editForm });
    setIsEditing(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            My <span className="text-gradient">Documents</span>
          </h1>
          <p className="text-slate-400">
            Securely managing your medical processing pipeline.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
          />

          <button onClick={() => handleExport("csv")} className="btn-premium">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FileUpload
          onFileSelect={handleUpload}
          onMultiFileSelect={handleMultiUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </motion.div>

      {/* Non-Medical Document Rejection Alert */}
      <AnimatePresence>
        {rejectionAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 animate-pulse" />
            <div className="relative flex items-center gap-5 p-5 bg-slate-900/90 border border-red-500/30 rounded-2xl backdrop-blur-xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 flex-shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">
                  Document Rejected
                </h4>
                <p className="text-xs text-slate-400 font-bold">
                  <span className="text-white">{rejectionAlert.filename}</span>{" "}
                  — {rejectionAlert.message}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Please upload only medical reports, lab results, or
                  prescriptions.
                </p>
              </div>
              <button
                onClick={dismissRejectionAlert}
                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-sm text-slate-400 hover:text-white transition-colors border border-slate-800">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <span className="text-slate-800 text-xl font-thin px-2">|</span>
          <div className="flex gap-1">
            {["All", "Completed", "Processing", "Error"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${filter === tab ? "bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Showing {documents.length}{" "}
          {filter !== "All" ? filter.toLowerCase() : ""} documents
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 animate-pulse">
            Synchronizing workspace...
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                variants={item}
                layout
                whileHover={{ y: -5 }}
                onClick={() => viewDetails(doc)}
                className="glass-card p-6 flex flex-col group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:opacity-10 transition-opacity">
                  <FileText size={120} />
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`p-4 rounded-2xl ${doc.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-400"}`}
                  >
                    <FileText size={24} />
                  </div>
                  {doc.isApproved && (
                    <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-900">
                      <Check size={14} />
                    </div>
                  )}
                  <button className="text-slate-500 hover:text-white transition-colors ml-auto">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate pr-8">
                    {doc.filename}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    {doc.date}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      {doc.status === "completed" ? (
                        <span className="text-emerald-500 flex items-center gap-1.5 text-sm font-bold">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      ) : doc.status === "error" ? (
                        <span className="text-rose-500 flex items-center gap-1.5 text-sm font-bold">
                          <AlertCircle size={16} /> Error
                        </span>
                      ) : (
                        <span className="text-blue-400 flex items-center gap-1.5 text-sm font-bold">
                          <Clock className="animate-spin" size={16} />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>

                  {doc.confidence !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1">
                        AI Confidence
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${doc.confidence * 100}%` }}
                            className={`h-full ${doc.confidence > 0.9 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"}`}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-300">
                          {Math.round(doc.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Delete Button */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end pr-4 pointer-events-none">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg pointer-events-auto"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 md:pt-20 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Medical Analysis
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedDoc.filename}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {selectedDoc.isApproved && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20">
                      Doctor Approved
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      closeDetails();
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
                  >
                    <AlertCircle size={24} className="rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Current Status
                    </p>
                    <p
                      className={`text-lg font-black ${selectedDoc.status === "completed" ? "text-emerald-500" : selectedDoc.status === "error" ? "text-rose-500" : "text-blue-500"}`}
                    >
                      {selectedDoc.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      AI Accuracy Score
                    </p>
                    <p
                      className={`text-lg font-black ${selectedDoc.status === "error" ? "text-rose-500" : "text-white"}`}
                    >
                      {(selectedDoc.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Extracted Medical Data
                    </p>
                    {!isEditing && (
                      <button
                        onClick={startEditing}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
                      >
                        <Edit2 size={12} /> Edit Data
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedDoc.extractedData ? (
                      Object.entries(selectedDoc.extractedData).map(
                        ([key, value]: [string, any]) => {
                          const risk = classifyRiskLevel(key, value);

                          return (
                            <div
                              key={key}
                              className={`flex justify-between items-start gap-4 p-4 rounded-2xl border transition-all ${risk.container}`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-slate-200 font-semibold capitalize text-sm">
                                    {key.replace("_", " ")}
                                  </span>
                                  {renderRiskBadge(key, value)}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  {risk.hint}
                                </p>
                              </div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={
                                    typeof editForm[key] === "object"
                                      ? JSON.stringify(editForm[key])
                                      : String(editForm[key] || "")
                                  }
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      [key]: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-right text-sm min-w-[180px]"
                                />
                              ) : (
                                <span className="text-white font-bold text-right max-w-[60%] text-sm break-words leading-6">
                                  {formatValue(value)}
                                </span>
                              )}
                            </div>
                          );
                        },
                      )
                    ) : (
                      <div className="p-8 text-center text-slate-600 italic border border-dashed border-slate-800 rounded-2xl">
                        Awaiting extraction results...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && selectedDoc.extractedData && (
                <div className="px-8 py-4 border-t border-slate-800">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3">
                    Risk Summary
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(() => {
                      const entries = Object.entries(selectedDoc.extractedData);
                      const counts = entries.reduce(
                        (acc, [key, value]) => {
                          const risk = classifyRiskLevel(key, value);
                          if (risk.tone === "critical") acc.red += 1;
                          else if (risk.tone === "warning") acc.yellow += 1;
                          else acc.green += 1;
                          return acc;
                        },
                        { red: 0, yellow: 0, green: 0 },
                      );

                      return (
                        <>
                          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-black">
                              Red
                            </p>
                            <p className="text-2xl font-black text-white mt-1">
                              {counts.red}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-black">
                              Yellow
                            </p>
                            <p className="text-2xl font-black text-white mt-1">
                              {counts.yellow}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-black">
                              Green
                            </p>
                            <p className="text-2xl font-black text-white mt-1">
                              {counts.green}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="flex-1 btn-premium justify-center"
                    >
                      <Check size={20} /> Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-8 border border-slate-800 text-slate-400 hover:bg-white/5 rounded-2xl transition-all font-bold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleApproveDocument(selectedDoc.id)}
                      disabled={selectedDoc.isApproved}
                      className={`flex-1 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                        selectedDoc.isApproved
                          ? "bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20"
                          : "btn-premium justify-center"
                      }`}
                    >
                      <CheckCircle2 size={20} />
                      {selectedDoc.isApproved
                        ? "Verification Complete"
                        : "Approve & Verify"}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="px-8 border border-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 rounded-2xl transition-all font-bold"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;
