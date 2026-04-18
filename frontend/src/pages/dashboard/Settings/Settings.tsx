import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Save,
  Zap,
  Cpu,
  Languages,
  Plus,
  X,
  ListFilter,
  Lightbulb,
  Palette,
  Building2,
  MapPin,
  Webhook,
  Upload,
} from "lucide-react";
import { useSettings } from "./Settings.logic";

const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSetting,
    saveSettings,
    isSaving,
    isLoading,
    addItem,
    removeItem,
  } = useSettings();

  const [newField, setNewField] = useState("");
  const [newInstruction, setNewInstruction] = useState("");

  const container = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1000px] mx-auto pb-32 animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Workspace <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-slate-400">
            Fine-tune the extraction engine, custom fields, and processing
            rules.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="btn-premium"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Core AI Config */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Orchestration</h2>
              <p className="text-sm text-slate-500">
                Core model and medical language preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Zap size={14} className="text-blue-400" />
                Processing Model
              </label>
              <select
                value={settings.ai_model}
                onChange={(e) => updateSetting("ai_model", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="llama-3.3-70b-versatile">
                  Llama 3.3 70B (Best Accuracy)
                </option>
                <option value="llama3-70b-8192">Llama 3 70B (Legacy)</option>
                <option value="llama3-8b-8192">Llama 3 8B (Fastest)</option>
                <option value="mixtral-8x7b-32768">
                  Mixtral 8x7B (Balanced)
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Languages size={14} className="text-blue-400" />
                Target Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting("language", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
              <ListFilter size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Custom Extraction Fields
              </h2>
              <p className="text-sm text-slate-500">
                Medical fields (Prescription, Vitals, Lab Results) are priority.
                Add extra fields for specialized reports.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {settings.custom_fields.map((field, idx) => (
                  <motion.div
                    key={field + idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    <span>{field}</span>
                    <button
                      onClick={() => removeItem("custom_fields", idx)}
                      className="hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="e.g. Blood Type, Cholesterol Level, BMI"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addItem("custom_fields", newField);
                    setNewField("");
                  }
                }}
                className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  addItem("custom_fields", newField);
                  setNewField("");
                }}
                className="p-3 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-2xl transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Rule Intelligence */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl">
              <Lightbulb size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Medical Processing Rules
              </h2>
              <p className="text-sm text-slate-500">
                Specific logic for the AI when analyzing medical documents.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <AnimatePresence>
                {settings.instructions.map((rule, idx) => (
                  <motion.div
                    key={rule + idx}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    className="flex items-start justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl group"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 text-blue-500/40 font-mono text-xs font-bold">
                        {idx + 1}.
                      </div>
                      <p className="text-sm text-slate-300 font-medium">
                        {rule}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem("instructions", idx)}
                      className="text-slate-600 hover:text-red-400 transition-colors pt-0.5"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-4">
              <textarea
                placeholder="Example: 'Flag any severe blood pressure results (above 140/90) for immediate doctor review.'"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                rows={2}
                className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
              <button
                onClick={() => {
                  addItem("instructions", newInstruction);
                  setNewInstruction("");
                }}
                className="p-4 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 rounded-2xl transition-all self-end"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Automation Config */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Automation Logic</h2>
              <p className="text-sm text-slate-500">
                Control accuracy thresholds and review workflow triggers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-bold text-slate-400">
                  Confidence Threshold
                </label>
                <span className="text-sm font-black text-emerald-500">
                  {Math.round((settings.confidence_threshold || 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.confidence_threshold || 0.85}
                onChange={(e) =>
                  updateSetting(
                    "confidence_threshold",
                    parseFloat(e.target.value),
                  )
                }
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-xs text-slate-600 italic">
                Extraction results below this score will trigger a Privacy
                Shield warning.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-white/80">
                    Auto-Approve High Quality
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Skip manual review for 95% + confidence
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting("auto_approve", !settings.auto_approve)
                  }
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.auto_approve ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-800"}`}
                >
                  <motion.div
                    animate={{ x: settings.auto_approve ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Branding & Customization */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Document Branding</h2>
              <p className="text-sm text-slate-500">
                Customize the appearance of exported PDF medical summaries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Building2 size={14} className="text-indigo-400" />
                Clinic / Entity Name
              </label>
              <input
                type="text"
                value={settings.clinic_name}
                onChange={(e) => updateSetting("clinic_name", e.target.value)}
                placeholder="e.g. Metropolitan General Hospital"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <MapPin size={14} className="text-indigo-400" />
                Clinic Address
              </label>
              <input
                type="text"
                value={settings.clinic_address}
                onChange={(e) => updateSetting("clinic_address", e.target.value)}
                placeholder="e.g. 123 Medical Drive, Suite 100, New York, NY"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Palette size={14} className="text-indigo-400" />
                Primary Theme Color
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={settings.pdf_theme_color}
                  onChange={(e) =>
                    updateSetting("pdf_theme_color", e.target.value)
                  }
                  className="w-12 h-12 bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.pdf_theme_color}
                  onChange={(e) =>
                    updateSetting("pdf_theme_color", e.target.value)
                  }
                  className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl py-3 px-4 text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <label className="text-sm font-bold text-slate-400 block mb-4">
              Clinic Logo
            </label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center overflow-hidden relative group">
                {settings.clinic_logo_url ? (
                  <img 
                    src={settings.clinic_logo_url.startsWith('http') ? settings.clinic_logo_url : `${settings.clinic_logo_url}`} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={32} className="text-slate-700" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <p className="text-[10px] font-bold text-white uppercase">Logo Preview</p>
                </div>
              </div>

              <div className="space-y-3">
                <input 
                  type="file" 
                  id="logo-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const response = await fetch('/api/documents/configuration/logo', {
                          method: 'POST',
                          body: formData
                        });
                        const data = await response.json();
                        if (data.logo_url) {
                          updateSetting('clinic_logo_url', data.logo_url);
                        }
                      } catch (err) {
                        console.error("Logo upload failed:", err);
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                >
                  <Upload size={14} /> Upload New Logo
                </button>
                <p className="text-[10px] text-slate-500">
                  Recommended size: 200x200px. Supports PNG, JPG.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FHIR Interoperability */}
        <div className="glass-card p-8 bg-gradient-to-br from-indigo-900/10 to-transparent">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
              <Webhook size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                FHIR Interoperability & Webhooks
              </h2>
              <p className="text-sm text-slate-500">
                Sync data with external EMRs and healthcare providers.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">
                Webhook Endpoint URL
              </label>
              <input
                type="url"
                value={settings.webhook_url}
                onChange={(e) => updateSetting("webhook_url", e.target.value)}
                placeholder="https://hospital-emr.io/api/v1/webhook"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-mono text-sm"
              />
              <p className="text-xs text-slate-600">
                We will send a POST request with FHIR R4 JSON payload whenever
                a document is approved.
              </p>
            </div>
          </div>
        </div>


      </motion.div>
    </div>
  );
};

export default SettingsPage;
