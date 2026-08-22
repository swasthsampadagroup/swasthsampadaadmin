import React, { useState } from 'react';
import { Eye, EyeOff, Lock, MapPin, AlertCircle, LogIn } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../services/authContext';

interface EmployeeLoginProps {
  onSuccessLogin?: () => void;
}

export const EmployeeLogin: React.FC<EmployeeLoginProps> = ({ onSuccessLogin }) => {
  const { employeeLogin, loading, error: authError } = useAuth();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !password.trim()) {
      setFormError('Please enter both employee code and password.');
      return;
    }

    const result = await employeeLogin(code.trim(), password.trim(), rememberMe);
    if (result.success && onSuccessLogin) {
      onSuccessLogin();
    }
  };

  const fillDemoCredentials = () => {
    setCode('EMP001');
    setPassword('EMP001');
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06182c] via-[#09223c] to-[#005B96] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden relative z-10">
        {/* Top Header Card Banner */}
        <div className="bg-gradient-to-r from-[#005B96] to-[#004875] p-6 sm:p-8 text-center text-white relative">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Login</h1>
          <p className="text-sm text-blue-100 mt-1">
            Enter your employee code and password to access the portal
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  id="employee-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
                  id="employee-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005B96]/30 focus:border-[#005B96] focus:outline-hidden transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border border-slate-300 text-[#005B96] cursor-pointer"
              />
              <label htmlFor="remember-me-checkbox" className="text-xs text-slate-600 font-medium cursor-pointer">
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-[#005B96] to-[#004875] hover:from-[#004875] hover:to-[#003556] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          {/* Demo Credentials Help */}
          <div className="mt-6 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
            <p className="text-blue-900 font-semibold mb-2">📝 Demo Credentials:</p>
            <div className="space-y-1 text-blue-800 font-mono">
              <p>Code: <span className="font-bold">EMP001</span></p>
              <p>Password: <span className="font-bold">EMP001</span></p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-2.5 w-full py-1.5 px-3 bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold text-xs rounded-lg transition-colors"
            >
              Use Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
