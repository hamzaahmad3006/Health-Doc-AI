import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Pill,
  Stethoscope,
} from "lucide-react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";

const SidebarLink = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group
      ${
        isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-bold"
          : "text-slate-500 hover:bg-white/5 hover:text-white"
      }
    `}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} className="group-hover:scale-110 transition-transform" />
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight
      size={16}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </NavLink>
);

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-900 p-6 flex flex-col fixed h-screen bg-slate-950/50 backdrop-blur-2xl z-20">
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Stethoscope
              className="text-blue-500"
              size={25}
              strokeWidth={2.5}
            />
          </div>
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-1.5">
            <span className="text-white">Health Docs</span>
            <span className="text-blue-500">AI</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink
            to="/dashboard/overview"
            icon={LayoutDashboard}
            label="Overview"
          />
          <SidebarLink
            to="/dashboard/documents"
            icon={FileText}
            label="Documents"
          />
          <SidebarLink
            to="/dashboard/medications"
            icon={Pill}
            label="Medications"
          />
          <SidebarLink
            to="/dashboard/settings"
            icon={Settings}
            label="Settings"
          />
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-900">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group font-bold"
          >
            <LogOut
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen relative">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-600/5 blur-[120px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          {children || <Outlet />}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
