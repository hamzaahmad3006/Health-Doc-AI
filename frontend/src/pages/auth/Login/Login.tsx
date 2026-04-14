import React from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";
import { useLogin } from "./Login.logic";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  } = useLogin();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
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

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="z-10 w-full max-w-[480px] px-6 mx-auto py-12"
      >
        <div className="glass-card p-10 relative overflow-hidden border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle Glow Header */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="flex flex-col items-center mb-12 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-sky-400 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30"
            >
              <Stethoscope className="text-white w-12 h-12" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-3">
              Health <span className="text-gradient">Docs AI</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-[280px]">
              Access your medical document processing workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Security Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4.5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Secure Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-tight"
                >
                  Reset?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4.5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                  required
                />
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
              className="w-full btn-premium py-5 text-lg shadow-blue-600/20 group"
            >
              <span className="flex-1 text-center">
                {isLoading ? "Validating Session..." : "Secure Sign In"}
              </span>
              {!isLoading && (
                <ArrowRight
                  className="group-hover:translate-x-1.5 transition-transform"
                  size={22}
                />
              )}
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-slate-800/50">
            <p className="text-slate-500 text-sm font-medium">
              New to Health Docs AI?{" "}
              <Link
                to="/register"
                className="text-white hover:text-blue-400 transition-colors font-bold ml-1 border-b border-white/20 hover:border-blue-400 pb-0.5"
              >
                Create Hub Account
              </Link>
            </p>
          </div>
        </div>

        {/* Trusted Footer */}
        <div className="mt-8 flex justify-center items-center gap-6 text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase font-black tracking-widest">
              End-to-End Encryption
            </span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-800" />
          <p className="text-[10px] uppercase font-black tracking-widest">
            v1.2.0 (Stable)
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
