import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Lock,
  Edit2,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { authService, UserProfile } from '../services/authService';

interface TargetBoardLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  isMandatory?: boolean;
}

export const TargetBoardLoginModal: React.FC<TargetBoardLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isMandatory = false,
}) => {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp' | 'register' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Registration step fields for new students
  const [fullName, setFullName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('696398aceefd2beed5d5191b'); // Class 12 default
  const [selectedBoardId, setSelectedBoardId] = useState('6963925feefd2beed5d50f7b'); // Bihar Board
  const [selectedMediumId, setSelectedMediumId] = useState('696398c0eefd2beed5d51922'); // Hindi medium

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!consent) {
      setError('Please agree to communication terms to continue');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.sendOtp(cleanPhone);
      setStep('otp');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP from TargetBoard server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal ? cleanVal.slice(-1) : '';
    setOtp(newOtp);

    // Auto-advance
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP code sent to your phone');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      const res = await authService.verifyOtp(cleanPhone, code);

      if (res.token && res.user) {
        // Existing TargetBoard user logged in successfully
        const user = authService.saveSession(res.token, {
          ...res.user,
          mobile: cleanPhone,
          className: res.user.className || 'Class 12th Board 2026-27',
          stateBoard: res.user.stateBoard || 'Bihar School Examination Board (BSEB)',
        });
        setStep('success');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 1200);
      } else if (res.tempToken) {
        // New student on TargetBoard -> prompt name & class registration
        setTempToken(res.tempToken);
        setStep('register');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP code. Please enter the valid code sent to your phone.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) {
      setStep('phone');
      return;
    }
    if (fullName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 letters)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.registerStep1(fullName.trim(), tempToken);
      const res = await authService.registerStep2({
        classId: selectedClassId,
        stateBoardId: selectedBoardId,
        mediumId: selectedMediumId,
        tempToken,
      });

      const user = authService.saveSession(res.token, {
        ...res.user,
        fullName: fullName.trim(),
        mobile: phone.trim().replace(/\D/g, ''),
        className: selectedClassId === '696398aceefd2beed5d5191b' ? 'Class 12 (Board 2026-27)' : 'Class 10 (Board 2026-27)',
      });

      setStep('success');
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'TargetBoard registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col my-auto transition-all">
        
        {/* Close Button: Hidden if login is mandatory */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* TargetBoard Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <img 
              src="https://targetboard.co.in/favicon.webp" 
              alt="TargetBoard" 
              className="w-10 h-10 rounded-xl object-contain shadow-md bg-amber-500/10 p-0.5 border border-amber-500/30"
              onError={(e) => {
                // Fallback to stylized TB badge if cdn is unreachable
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Target<span className="text-amber-500">Board</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-2">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>TargetBoard Official Student Login</span>
          </div>

          {step === 'phone' && (
            <>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Join <span className="text-amber-500">TargetBoard</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your phone number to get started
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Verify OTP
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                We've sent a 6-digit code to your TargetBoard mobile number
              </p>
            </>
          )}

          {step === 'register' && (
            <>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Student Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Complete your TargetBoard registration details
              </p>
            </>
          )}

          {step === 'success' && (
            <>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                TargetBoard Verified!
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Account authenticated. Opening your dashboard...
              </p>
            </>
          )}
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 text-xs text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* STEP 1: Phone Number Input (Exact TargetBoard Login Feature) */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter your mobile number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* TargetBoard Consent Checkbox */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed select-none">
                I agree to receive all communication from TargetBoard via SMS, WhatsApp, Email and other channels.
              </span>
            </label>

            {/* TargetBoard Continue Button */}
            <button
              type="submit"
              disabled={phone.length < 10 || !consent || loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Terms Notice */}
            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-2">
              By continuing, you agree to our{' '}
              <a href="https://targetboard.co.in" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://targetboard.co.in" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
                Privacy Policy
              </a>
            </p>
          </form>
        )}

        {/* STEP 2: Verify OTP (Exact TargetBoard 6-Digit Verification) */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            {/* Phone edit banner */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                +91 {phone}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp(['', '', '', '', '', '']);
                  setError(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 font-semibold cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* 6 Digit OTP Inputs */}
            <div>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpInputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                ))}
              </div>
            </div>

            {/* Verify & Login Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying with TargetBoard...</span>
                </>
              ) : (
                <>
                  <span>Verify & Login</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Timer / Action */}
            <div className="text-center pt-1">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  OTP Already Sent. Try After{' '}
                  <span className="font-bold text-amber-500">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  disabled={loading}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Complete TargetBoard Profile (for new students) */}
        {step === 'register' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                autoFocus
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Enter your real full name"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Board Class
              </label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="696398aceefd2beed5d5191b">Class - 12 (Bihar / UP Board)</option>
                <option value="69639890eefd2beed5d5190d">Class - 10 (Bihar / UP Board)</option>
                <option value="6963989deefd2beed5d51914">Class - 11 (Bihar / UP Board)</option>
                <option value="691dc39227195243f5235256">Class - 9 (Bihar / UP Board)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || fullName.trim().length < 2}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Complete & Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              TargetBoard Verified!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Welcome to TargetBoard GyanSarthi. Your classes are ready.
            </p>
          </div>
        )}

        {/* Bottom Trust Badge */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>targetboard.co.in · Official Student Authentication</span>
        </div>

      </div>
    </div>
  );
};
