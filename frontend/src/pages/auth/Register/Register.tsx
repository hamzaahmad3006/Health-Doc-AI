import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useRegister } from "./Register.logic";
import { Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const { formData, updateField, isLoading, error, handleRegister } =
    useRegister();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans py-12">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-sky-500/10 blur-[140px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="z-10 w-full max-w-[500px] px-6 mx-auto"
      >
        <div className="glass-card p-10 relative overflow-hidden border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle Glow Header */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-sky-400 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30"
            >
              <Stethoscope className="text-white w-12 h-12" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-3">
              Health <span className="text-gradient">Docs AI</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-[300px]">
              Start processing medical documents with AI power
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Secure Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Confirm
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl flex items-center gap-3 text-red-400 text-xs font-semibold"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium py-5 mt-4 text-lg shadow-blue-600/20 group uppercase tracking-widest"
            >
              <span className="flex-1 text-center font-black">
                {isLoading ? "Creating Hub..." : "Register Now"}
              </span>
              {!isLoading && (
                <ArrowRight
                  className="group-hover:translate-x-1.5 transition-transform"
                  size={22}
                />
              )}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-slate-800/50">
            <p className="text-slate-500 text-sm font-medium">
              Already a member?{" "}
              <Link
                to="/login"
                className="text-white hover:text-blue-400 transition-colors font-bold ml-1 border-b border-white/20 hover:border-blue-400 pb-0.5"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>

        {/* Trusted Footer */}
        <div className="mt-8 flex justify-center items-center gap-6 text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] uppercase font-black tracking-widest pointer-events-none">
              Secure Medical Processing
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
