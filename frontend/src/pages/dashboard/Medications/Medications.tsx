import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Pill,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
  Download,
  Users,
  User,
  ChevronRight,
  Calendar,
} from "lucide-react";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useOverview } from "../Overview/Overview.logic";

const MedicationsPage: React.FC = () => {
  const { schedule, isLoading, patients, selectedPatientId, setSelectedPatientId } = useOverview();

  const downloadSummary = () => {
    window.open("/api/documents/analysis/summary-pdf", "_blank");
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case "Morning":
        return <Sunrise className="text-orange-400" />;
      case "Afternoon":
        return <Sun className="text-yellow-400" />;
      case "Evening":
        return <Sunset className="text-amber-500" />;
      case "Night":
        return <Moon className="text-indigo-400" />;
      default:
        return <Zap className="text-slate-400" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">
            Loading Medications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            {selectedPatientId ? `${patients.find((p: any) => p.id === selectedPatientId)?.name}'s` : 'Patient'} <span className="text-gradient">Medications</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="glass-pill text-emerald-400">
              <ShieldCheck size={14} /> HIPAA Secure
            </span>
            <span className="glass-pill text-blue-400">
              <Pill size={14} /> Active prescriptions
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <CustomSelect
            label="Select Patient"
            icon={Users}
            options={patients}
            value={selectedPatientId}
            onChange={(val) => setSelectedPatientId(val as number | null)}
            allLabel="All Patients"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadSummary}
            className="btn-premium"
          >
            <Download size={18} /> Export Summary
          </motion.button>
        </div>
      </motion.div>

      {/* Patient Info Card */}
      {selectedPatientId && (
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="glass-card p-5 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{patients.find((p: any) => p.id === selectedPatientId)?.name}</h3>
              <div className="flex items-center gap-4 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={10} /> Age: {patients.find((p: any) => p.id === selectedPatientId)?.age || 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Activity size={10} /> Gender: {patients.find((p: any) => p.id === selectedPatientId)?.gender || 'N/A'}
                </span>
                <span className="glass-pill text-[9px] text-blue-400">ID: #{selectedPatientId}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Medication Timeline (Full Width or Large Span) */}
        <motion.div variants={itemVariants} className="xl:col-span-8">
          <div className="glass-card p-8 min-h-[600px] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
            
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4 text-white">
              <Clock className="text-blue-400" size={32} /> 
              {selectedPatientId ? `${patients.find((p: any) => p.id === selectedPatientId)?.name}'s Schedule` : 'Daily Intake Schedule'}
            </h2>

            <div className="space-y-12">
              {Object.entries(schedule || {}).map(([time, meds]: [string, any]) => (
                <div key={time} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-lg">
                      {getTimeIcon(time)}
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                      {time} Intake
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                    {meds.length > 0 ? (
                      meds.map((med: any, i: number) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4 group transition-all hover:bg-white/10 hover:border-blue-500/30"
                        >
                          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                            <Pill size={24} />
                          </div>
                          <div>
                            <p className="font-black text-white text-base">
                              {med.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-blue-400">
                                {med.dosage}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-700" />
                              <span className="text-xs font-medium text-slate-500">
                                {med.frequency}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-4 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center">
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                          No medications scheduled for this period
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Insights on this page */}
        <div className="xl:col-span-4 space-y-8">
            <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="gradient-border p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 group-hover:scale-120 transition-all duration-700">
                  <TrendingUp size={160} />
                </div>
                <h3 className="font-black text-white text-xl mb-3">
                  Medication Adherence
                </h3>
                <p className="text-blue-200/80 text-sm font-medium mb-6">
                  Based on AI analysis, patient has a 92% adherence rate over the last 30 days.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/10 h-3 rounded-full overflow-hidden backdrop-blur-md">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                    />
                  </div>
                  <span className="text-sm font-black text-white">92%</span>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-8">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" /> Patient Status Summary
                </h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Health</span>
                        <span className="text-xs font-black text-emerald-400 uppercase">Stable</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compliance</span>
                        <span className="text-xs font-black text-blue-400 uppercase">Excellent</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Review</span>
                        <span className="text-xs font-black text-amber-500 uppercase">7 Days Left</span>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicationsPage;
