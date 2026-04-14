import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Zap,
  Info,
  CircleDot,
} from "lucide-react";
import { useDocuments } from "./Documents.logic";
import FileUpload from "../../../components/dashboard/FileUpload";

const DocumentsPage: React.FC = () => {
  const {
    documents,
    isLoading,
    isUploading,
    isProcessing,
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
    const isMedical = normalizedKey.includes("is medical");

    let icon = <CircleDot size={14} />;
    if (isGlucose) icon = <Droplets size={14} />;
    if (isBloodPressure) icon = <Zap size={14} />;
    if (isHeartRate) icon = <Heart size={14} />;
    if (isTemperature) icon = <Thermometer size={14} />;
    if (isMedical) icon = <ShieldAlert size={14} />;

    if (isGlucose && numericValue !== null) {
      if (numericValue >= 140) {
        return {
          label: "HIGH",
          tone: "critical",
          container: "border-red-500/40 bg-red-500/10 text-red-300",
          hint: "Immediate doctor review recommended",
          icon,
        };
      }
      if (numericValue >= 110) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
          icon,
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
          icon: <Activity size={14} />,
        };
      }
      if (numericValue >= 170) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
          icon: <Activity size={14} />,
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
          icon,
        };
      }
      if (numericValue >= 130) {
        return {
          label: "WARN",
          tone: "warning",
          container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          hint: "Needs attention",
          icon,
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
          icon,
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
          icon,
        };
      }
    }

    if (/high|abnormal|critical|urgent|elevated/.test(rawValue)) {
      return {
        label: "WARN",
        tone: "warning",
        container: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        hint: "Needs attention",
        icon,
      };
    }

    return {
      label: "OK",
      tone: "normal",
      container: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      hint: "Within normal range",
      icon,
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

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-slate-600 italic font-medium tracking-wide">
          Not Detected
        </span>
      );
    }
    if (typeof value === "boolean") {
      return value ? (
        <span className="text-emerald-400 font-bold">Yes</span>
      ) : (
        <span className="text-slate-500 font-bold">No</span>
      );
    }
    if (typeof value !== "object") return String(value);
    if (Array.isArray(value)) {
      return value.map((item, i) => (
        <React.Fragment key={i}>
          {formatValue(item)}
          {i < value.length - 1 ? ", " : ""}
        </React.Fragment>
      ));
    }
    return Object.entries(value)
      .map(([sk, sv]) => `${sk}: ${sv}`)
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

      {createPortal(
        <AnimatePresence>
          {selectedDoc && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5 flex flex-col relative"
              >
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -z-10" />

                {/* Header Section */}
                <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
                  <div className="flex gap-6">
                    {/* Circular Confidence Score */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="transparent"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="transparent"
                          stroke="url(#blue_grad)"
                          strokeWidth="8"
                          strokeDasharray="264"
                          initial={{ strokeDashoffset: 264 }}
                          animate={{
                            strokeDashoffset: 264 - (264 * selectedDoc.confidence),
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="blue_grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#2dd4bf" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black text-white leading-none">
                          {Math.round(selectedDoc.confidence * 100)}%
                        </span>
                        <span className="text-[8px] uppercase font-black text-slate-500 mt-1 tracking-tighter">
                          AI Match
                        </span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
                        Medical <span className="text-gradient">Analysis</span>
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                          <FileText size={12} className="text-blue-400" />
                          <span className="text-[11px] font-bold text-slate-400">
                            {selectedDoc.filename}
                          </span>
                        </div>
                        {selectedDoc.isApproved && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Verified
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      closeDetails();
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all group"
                  >
                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                {/* Sub-Header Stats */}
                <div className="px-8 py-4 bg-white/[0.01] border-b border-white/5 flex gap-12">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none mb-2">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedDoc.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`} />
                      <span className="text-xs font-black text-white uppercase tracking-wider">{selectedDoc.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none mb-2">Patient Class</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Out-Patient</span>
                    </div>
                  </div>
                  <div className="flex flex-col ml-auto text-right">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none mb-2">Last Sync</span>
                    <span className="text-xs font-black text-white">{selectedDoc.date}</span>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  {/* Risk Summary Tiles */}
                  <div className="grid grid-cols-3 gap-4">
                    {(() => {
                      const entries = Object.entries(selectedDoc.extractedData || {});
                      const counts = entries.reduce((acc, [key, value]) => {
                        const risk = classifyRiskLevel(key, value);
                        if (risk.tone === "critical") acc.red += 1;
                        else if (risk.tone === "warning") acc.yellow += 1;
                        else acc.green += 1;
                        return acc;
                      }, { red: 0, yellow: 0, green: 0 });

                      const statTiles = [
                        { label: "Critical Risks", count: counts.red, color: "from-rose-500/20 to-rose-600/5", text: "text-rose-400", border: "border-rose-500/20", icon: <ShieldAlert size={16} /> },
                        { label: "Potential Warnings", count: counts.yellow, color: "from-amber-500/20 to-amber-600/5", text: "text-amber-400", border: "border-amber-500/20", icon: <Activity size={16} /> },
                        { label: "Normal Indicators", count: counts.green, color: "from-emerald-500/20 to-emerald-600/5", text: "text-emerald-400", border: "border-emerald-500/20", icon: <CheckCircle2 size={16} /> }
                      ];

                      return statTiles.map((tile, idx) => (
                        <div key={idx} className={`relative group p-4 rounded-3xl border ${tile.border} bg-gradient-to-br ${tile.color}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`${tile.text} p-2 bg-white/5 rounded-xl`}>{tile.icon}</span>
                            <span className={`text-2xl font-black text-white`}>{tile.count}</span>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">{tile.label}</p>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Extracted Medical Data */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" />
                        Analysis Feed
                      </h4>
                      {!isEditing && (
                        <button onClick={startEditing} className="text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors tracking-widest border border-blue-500/30 px-3 py-1.5 rounded-full bg-blue-500/10">
                          Edit Data
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedDoc.extractedData ? (
                        Object.entries(selectedDoc.extractedData).map(([key, value]: [string, any], idx) => {
                          const risk = classifyRiskLevel(key, value);
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-3xl transition-all space-y-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shrink-0 ${risk.container}`}>
                                    {risk.icon}
                                  </div>
                                  <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em]">
                                    {key.replace("_", " ")}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border tracking-tighter ${risk.container}`}>
                                    {risk.label}
                                  </span>
                                </div>
                              </div>

                              <div className="pl-1 text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-relaxed break-words max-w-full">
                                {formatValue(value)}
                              </div>

                              <div className="pl-1 border-t border-white/5 pt-3">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{risk.hint}</span>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-3xl italic">
                          <Activity className="animate-pulse mb-3" size={32} />
                          Awaiting AI extraction sequence...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} className="flex-1 btn-premium justify-center py-5 shadow-blue-500/20">
                        <Check size={20} /> Save Changes
                      </button>
                      <button onClick={() => setIsEditing(false)} className="px-10 border border-white/10 text-slate-400 hover:bg-white/5 rounded-[2rem] transition-all font-black text-sm uppercase tracking-widest">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveDocument(selectedDoc.id)}
                        disabled={selectedDoc.isApproved || isProcessing}
                        className={`flex-1 font-black uppercase tracking-[0.2em] text-sm py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                          selectedDoc.isApproved
                            ? "bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20"
                            : isProcessing
                              ? "bg-blue-600/50 text-white cursor-wait"
                              : "btn-premium justify-center shadow-blue-500/25"
                        }`}
                      >
                        <CheckCircle2 size={24} className={isProcessing ? "animate-spin" : ""} />
                        {isProcessing ? "Processing..." : selectedDoc.isApproved ? "Analysis Verified" : "Approve & Verify"}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedDoc.id)}
                        className="px-8 border border-white/5 text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 rounded-[2rem] transition-all font-black text-sm uppercase tracking-widest"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default DocumentsPage;
