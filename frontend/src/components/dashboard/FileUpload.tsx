import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, CheckCircle2, Clock, Files, Trash2 } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onMultiFileSelect?: (files: File[]) => void;
  isUploading: boolean;
  uploadProgress?: { current: number; total: number } | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onMultiFileSelect,
  isUploading,
  uploadProgress,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);
    }
    // Reset input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartUpload = () => {
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length === 1) {
      onFileSelect(selectedFiles[0]);
    } else if (onMultiFileSelect) {
      onMultiFileSelect(selectedFiles);
    } else {
      // Fallback: upload first file only
      onFileSelect(selectedFiles[0]);
    }
    setSelectedFiles([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center space-y-4 bg-slate-900/40 backdrop-blur-md ${
          isDragging
            ? "border-blue-500 bg-blue-500/5 scale-[1.01]"
            : "border-slate-800 hover:border-blue-500/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Clock className="text-blue-500" size={32} />
                </motion.div>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg">
                  {uploadProgress
                    ? `Analyzing Report ${uploadProgress.current} of ${uploadProgress.total}...`
                    : "Analyzing Medical Report..."}
                </p>
                <p className="text-slate-500 text-sm">
                  Our Secure AI is extracting health insights
                </p>
                {uploadProgress && uploadProgress.total > 1 && (
                  <div className="mt-4 w-64 mx-auto">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                      <span>Progress</span>
                      <span>{uploadProgress.current}/{uploadProgress.total}</span>
                    </div>
                    <div className="bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                        className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : selectedFiles.length > 0 ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg space-y-3"
            >
              {/* File Count Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Files size={16} className="text-blue-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                  </span>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                >
                  + Add More
                </button>
              </div>

              {/* File List */}
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50"
                  >
                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                      <File size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-bold truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{formatSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartUpload}
                  className="flex-1 btn-premium justify-center py-3 rounded-xl text-sm"
                >
                  <Upload size={16} /> Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Report' : 'Reports'}
                </motion.button>
                <button
                  onClick={clearFiles}
                  className="p-3 rounded-xl bg-slate-800/50 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-slate-700/50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-blue-500/5">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-white font-black text-xl mb-1">
                  Upload Medical Documents
                </p>
                <p className="text-slate-500 text-sm">
                  PDF, PNG, JPG (Max 10MB) • Select multiple files or drag & drop
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient background glow */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/5 to-sky-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <div className="mt-4 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 size={14} className="text-emerald-500/50" />
          <span>Patient Data Anonymized</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 size={14} className="text-emerald-500/50" />
          <span>End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
