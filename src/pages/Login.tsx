import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../services/authContext';

interface LoginProps {
  onSuccessLogin?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccessLogin }) => {
  const { login, employeeLogin, loading, error: authError } = useAuth();
  const [loginMode, setLoginMode] = useState<'admin' | 'employee'>('admin');
  
  // Admin fields
  const [email, setEmail] = useState('admin@swasthsampada.com');
  const [adminPassword, setAdminPassword] = useState('Admin@2026');
  
  // Employee fields
  const [empCode, setEmpCode] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !adminPassword) {
      setFormError('Please enter both email and password.');
      return;
    }

    const success = await login(email.trim(), adminPassword, rememberMe);
    if (success && onSuccessLogin) {
      onSuccessLogin();
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!empCode.trim() || !empPassword.trim()) {
      setFormError('Please enter both employee code and password.');
      return;
    }

    const result = await employeeLogin(empCode.trim(), empPassword.trim(), rememberMe);
    if (result.success && onSuccessLogin) {
      onSuccessLogin();
    }
  };

  const fillAdminCredentials = (type: 'super_admin' | 'manager') => {
    if (type === 'super_admin') {
      setEmail('admin@swasthsampada.com');
      setAdminPassword('Admin@2026');
    } else {
      setEmail('manager@swasthsampada.com');
      setAdminPassword('Manager@2026');
    }
    setFormError(null);
  };

  const fillEmployeeCredentials = () => {
    setEmpCode('EMP001');
    setEmpPassword('EMP001');
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06182c] via-[#09223c] to-[#005B96] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden relative z-10">
        {/* Login Mode Toggle */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setLoginMode('admin');
              setFormError(null);
            }}
            className={`flex-1 py-3 px-4 font-semibold text-xs uppercase tracking-wide transition-all ${
              loginMode === 'admin'
                ? 'bg-[#09223c] text-white border-b-2 border-cyan-400'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 inline mr-1.5" />
            Admin Portal
          </button>
          <button
            onClick={() => {
              setLoginMode('employee');
              setFormError(null);
            }}
            className={`flex-1 py-3 px-4 font-semibold text-xs uppercase tracking-wide transition-all ${
              loginMode === 'employee'
                ? 'bg-[#005B96] text-white border-b-2 border-cyan-400'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1.5" />
            Employee Login
          </button>
        </div>

        {/* Top Header Card Banner */}
        <div className={`p-6 sm:p-8 text-center text-white relative ${
          loginMode === 'admin' ? 'bg-[#09223c]' : 'bg-gradient-to-r from-[#005B96] to-[#004875]'
        }`}>
          <div className="flex justify-center mb-3">
            {loginMode === 'admin' ? (
              <Logo size="lg" theme="dark" variant="full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {loginMode === 'admin' ? 'Admin Control Panel' : 'Employee Portal'}
          </h2>
          <p className="text-xs opacity-90 mt-1">
            {loginMode === 'admin'
              ? 'Centralized ERP & sales management console'
              : 'Field staff portal for order management'}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          {(formError || authError) && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError || authError}</span>
            </div>
          )}

          {loginMode === 'admin' ? (
            <>
              {/* ADMIN LOGIN FORM */}
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@swasthsampada.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden transition-all text-slate-900"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border border-slate-300 text-[#005B96]"
                  />
                  <span>Remember me on this device</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 bg-[#005B96] hover:bg-[#004875] text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center mb-2.5">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillAdminCredentials('super_admin')}
                    className="px-2.5 py-1.5 text-xs font-semibold text-[#005B96] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillAdminCredentials('manager')}
                    className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
                  >
                    Manager
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* EMPLOYEE LOGIN FORM */}
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                {/* Employee Code Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Employee Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                      placeholder="e.g. EMP001"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden transition-all text-slate-900 font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border border-slate-300 text-[#005B96]"
                  />
                  <span>Remember me on this device</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-[#005B96] to-[#004875] hover:from-[#004875] hover:to-[#003556] text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'LOGIN'}
                </button>
              </form>

              {/* Demo Credentials for Employee */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center mb-2.5">📝 Demo Credentials</p>
                <div className="space-y-1 text-xs font-mono text-slate-700 mb-2.5 text-center">
                  <p>Code: <span className="font-bold">EMP001</span></p>
                  <p>Password: <span className="font-bold">EMP001</span></p>
                </div>
                <button
                  type="button"
                  onClick={fillEmployeeCredentials}
                  className="w-full py-1.5 px-3 bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold text-xs rounded-lg transition-colors"
                >
                  Use Demo Credentials
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security Bottom Stamp */}
        <div className="py-3 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Login Portal</span>
        </div>
      </div>
    </div>
  );
};
