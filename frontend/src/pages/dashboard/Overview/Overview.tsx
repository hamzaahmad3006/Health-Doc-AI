import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Bell,
  Download,
  ShieldCheck,
  Activity,
  AlertCircle,
  ChevronRight,
  Lightbulb,
  TrendingDown,
  FilePlus,
  Share2,
  Edit3,
  Heart,
  Wind,
  Thermometer,
  Calendar,
  Moon,
  Zap,
  Users,
  User,
} from "lucide-react";
import CustomSelect from "../../../components/ui/CustomSelect";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  LabelList,
} from "recharts";
import { useOverview } from "./Overview.logic";

const OverviewPage: React.FC = () => {
  const {
    stats,
    recentDocs,
    trends,
    alerts,
    insights,
    quickActions,
    vitals,
    dateRange,
    setDateRange,
    isLoading,
    searchQuery,
    setSearchQuery,
    patients,
    selectedPatientId,
    setSelectedPatientId,
  } = useOverview();

  // Helper to trigger PDF download
  const downloadSummary = () => {
    window.open("/api/documents/analysis/summary-pdf", "_blank");
  };

  const chartData = trends.map((entry: any) => ({
    date: entry.date,
    glucose: entry.metrics?.Glucose ?? entry.glucose ?? 0,
    hemoglobin: entry.metrics?.Hemoglobin ?? entry.hemoglobin ?? 0,
  }));

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto"
    >
      {/* Premium Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Overview Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <span className="glass-pill text-emerald-400">
              <ShieldCheck size={14} /> Shield Active
            </span>
            <span className="glass-pill text-blue-400 font-mono text-[10px]">
              ENGINE v2.4
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Enhanced Patient Selector */}
          <CustomSelect
            label="Select Patient"
            icon={Users}
            options={patients}
            value={selectedPatientId}
            onChange={(val) => setSelectedPatientId(val as number | null)}
            allLabel="All Active Patients"
          />

          <div className="relative flex-1 lg:w-72">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-slate-500" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search reports or patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all backdrop-blur-md"
            />
          </div>
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

      {/* Patient Specific Insight Card (New) */}
      {selectedPatientId && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">
                  {patients.find((p) => p.id === selectedPatientId)?.name}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Age:{" "}
                    {patients.find((p) => p.id === selectedPatientId)?.age ||
                      "N/A"}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Activity size={12} /> Gender:{" "}
                    {patients.find((p) => p.id === selectedPatientId)?.gender ||
                      "N/A"}
                  </span>
                  <span className="glass-pill text-[10px] text-blue-400">
                    Patient ID: #{selectedPatientId}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pr-10">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Total Records
                </p>
                <p className="text-xl font-black text-white">
                  {recentDocs.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Last Visit
                </p>
                <p className="text-xl font-black text-white">Today</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {alerts.length > 0 && (
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse" />
          <div className="glass-card relative flex items-center justify-between p-5 border-l-4 border-l-red-500 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white/90 uppercase tracking-widest mb-0.5">
                  Critical System Alert
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  {alerts[0].message}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-xs font-black text-red-400 border border-red-500/20 px-4 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all uppercase tracking-widest"
            >
              {alerts[0].action} <ChevronRight size={14} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Dynamic Overall Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="glass-card p-6 border-b-4 border-b-blue-500 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <FileText size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
              +12%
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
            Total Records
          </h3>
          <p className="text-3xl font-black text-white tracking-tighter">
            {stats.totalProcessed}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="glass-card p-6 border-b-4 border-b-emerald-500 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg font-mono">
              Live
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
            AI Accuracy
          </h3>
          <p className="text-3xl font-black text-white tracking-tighter">
            98.4%
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="glass-card p-6 border-b-4 border-b-amber-500 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Clock size={24} />
            </div>
            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg">
              Pending
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
            Queue Size
          </h3>
          <p className="text-3xl font-black text-white tracking-tighter">
            {stats.pendingReview}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="glass-card p-6 border-b-4 border-b-indigo-500 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Zap size={24} />
            </div>
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg">
              v2.4
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
            Processing Power
          </h3>
          <p className="text-3xl font-black text-white tracking-tighter">
            Stable
          </p>
        </motion.div>
      </div>

      {/* Main Grid: Fully Refined Overview */}
      <div className="space-y-8">
        {/* Top Section: Health Trends + Vital Signs Grid (Phase 4) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <motion.div
            variants={itemVariants}
            className="xl:col-span-9 glass-card p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                  <Activity className="text-blue-500" size={26} />
                  Health Metrics
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  AI-driven analysis of your latest lab results.
                </p>
              </div>

              {/* Corrected position for Chart Filters */}
              <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                {["7D", "30D", "90D"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      dateRange === range
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {range}
                  </button>
                ))}
                <div className="w-[1px] bg-white/5 mx-2 my-1" />
                <button className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                  <Calendar size={14} />
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full relative">
              {/* Subtle Medical Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  key={selectedPatientId || "all"}
                  data={chartData}
                  margin={{ top: 24, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorGlucose"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop
                        offset="50%"
                        stopColor="#3b82f6"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                    <linearGradient id="colorHemo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                      <stop
                        offset="50%"
                        stopColor="#0ea5e9"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0ea5e9"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{
                      stroke: "#3b82f6",
                      strokeWidth: 2,
                      strokeDasharray: "6 6",
                    }}
                    contentStyle={{
                      background: "rgba(11, 18, 33, 0.95)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "20px",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
                      padding: "15px",
                    }}
                    itemStyle={{
                      fontSize: "13px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 0",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                      fontWeight: "800",
                      marginBottom: "8px",
                      fontSize: "11px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={11}
                    fontWeight="700"
                    tickLine={false}
                    axisLine={false}
                    tick={{ dy: 10 }}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    fontWeight="700"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 150]}
                    ticks={[0, 35, 70, 105, 140]}
                  />
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#1e293b"
                    vertical={false}
                    opacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="glucose"
                    stroke="#3b82f6"
                    strokeWidth={5}
                    dot={{
                      r: 6,
                      fill: "#3b82f6",
                      strokeWidth: 3,
                      stroke: "#0f172a",
                    }}
                    activeDot={{ r: 8, fill: "#3b82f6", strokeWidth: 0 }}
                    fillOpacity={0.85}
                    fill="url(#colorGlucose)"
                    name="Glucose (mg/dL)"
                    animationDuration={1500}
                  >
                    <LabelList
                      dataKey="glucose"
                      position="top"
                      offset={12}
                      content={(props: any) => {
                        const { x, y, value } = props;
                        return (
                          <text
                            x={x}
                            y={y - 12}
                            fill="#3b82f6"
                            fontSize={10}
                            fontWeight="900"
                            textAnchor="middle"
                            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                          >
                            {value}
                          </text>
                        );
                      }}
                    />
                  </Area>
                  <Line
                    type="monotone"
                    dataKey="hemoglobin"
                    stroke="#0ea5e9"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                      fill: "#0ea5e9",
                      strokeWidth: 3,
                      stroke: "#0f172a",
                    }}
                    activeDot={{ r: 8, fill: "#0ea5e9", strokeWidth: 0 }}
                    name="Hemoglobin (g/dL)"
                    animationDuration={2000}
                  >
                    <LabelList
                      dataKey="hemoglobin"
                      position="top"
                      offset={12}
                      content={(props: any) => {
                        const { x, y, value } = props;
                        return (
                          <text
                            x={x}
                            y={y - 12}
                            fill="#0ea5e9"
                            fontSize={10}
                            fontWeight="900"
                            textAnchor="middle"
                            className="drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                          >
                            {value}
                          </text>
                        );
                      }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* New Vital Signs Sidebar Grid */}
          <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            {vitals.map((vital: any) => {
              const VitalIcon =
                (
                  {
                    Activity,
                    Heart,
                    Wind,
                    Thermometer,
                  } as any
                )[vital.icon] || Activity;

              return (
                <motion.div
                  key={vital.id}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="glass-card p-5 flex items-center justify-between group relative overflow-hidden border-l-4 border-l-blue-500/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <VitalIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {vital.label}
                      </p>
                      <p className="text-lg font-black text-white mt-0.5">
                        {vital.value}{" "}
                        <span className="text-[10px] text-slate-400 ml-0.5">
                          {vital.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI Medical Insights (Phase 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col gap-3 group border-t-4 border-t-indigo-500/50"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Lightbulb size={20} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-black p-1.5 rounded-lg ${
                    insight.status === "up"
                      ? "text-rose-400 bg-rose-400/10"
                      : insight.status === "down"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : "text-blue-400 bg-blue-400/10"
                  }`}
                >
                  {insight.status === "up" ? (
                    <TrendingUp size={12} />
                  ) : insight.status === "down" ? (
                    <TrendingDown size={12} />
                  ) : (
                    <Activity size={12} />
                  )}
                  {insight.value}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black text-white/90">
                  {insight.label}
                </h4>
                <p className="text-xs text-slate-500 font-bold mt-1 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Hub (Phase 3) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action: any) => {
            const Icon =
              (
                {
                  FilePlus,
                  Activity,
                  Share2,
                  Edit3,
                } as any
              )[action.icon] || Zap;

            const colors: any = {
              blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-600",
              indigo:
                "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-600",
              emerald:
                "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-600",
              amber:
                "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-600",
            };

            return (
              <motion.button
                key={action.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center justify-center p-6 glass-card border-b-2 gap-3 transition-all group ${colors[action.color].split(" hover:")[0]}`}
                style={{ borderBottomColor: `var(--${action.color}-500)` }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${colors[action.color].split(" border-")[0]}`}
                >
                  <Icon size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Docs & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black flex items-center gap-3 text-white">
                <FileText size={20} className="text-blue-500" />
                {selectedPatientId
                  ? `${patients.find((p) => p.id === selectedPatientId)?.name}'s Records`
                  : "Recent Reports"}
              </h3>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                {selectedPatientId ? "Document History" : "Last 5 Uploads"}
              </span>
            </div>
            <div className="space-y-4">
              {recentDocs.map((doc: any) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors shadow-inner border border-white/5">
                      <FileText size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black truncate max-w-[120px] md:max-w-[180px] text-white">
                        {doc.filename}
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                        {doc.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                        doc.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {doc.status}
                    </span>
                    {doc.confidence > 0 && (
                      <span className="text-[9px] font-black text-slate-500 mr-1">
                        {doc.confidence}% Match
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats / Feedback */}
          <div className="space-y-8">
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="gradient-border p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group h-[200px] flex flex-col justify-center"
            >
              <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 group-hover:scale-120 transition-all duration-700">
                <TrendingUp size={160} />
              </div>
              <h3 className="font-black text-white text-xl mb-3">
                System Efficiency
              </h3>
              <p className="text-blue-200/80 text-sm font-medium mb-6 max-w-[200px]">
                AI successfully optimized <b>{stats.totalProcessed}</b> medical
                records this month.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/10 h-3 rounded-full overflow-hidden backdrop-blur-md">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-400 to-sky-300 h-full shadow-[0_0_15px_rgba(96,165,250,0.5)]"
                  />
                </div>
                <span className="text-sm font-black text-white">85%</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card p-8 border-l-8 border-l-blue-500 flex items-center justify-between"
            >
              <div>
                <h3 className="font-black text-slate-500 uppercase tracking-widest text-xs mb-2">
                  Pending Verification
                </h3>
                <p className="text-4xl font-black text-white tracking-tighter">
                  {stats.pendingReview}
                </p>
                <p className="text-xs text-slate-500 font-bold mt-2 flex items-center gap-1">
                  <Clock size={12} /> Requires Human Review
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform">
                <Bell size={32} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewPage;
