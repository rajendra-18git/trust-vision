import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { loginWithEmail, requestPhoneOTP, loginWithPhone } from '../services/api';

/**
 * Utility to identify whether input string resembles email, phone, or incomplete string.
 */
function detectIdentifierType(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  
  // Contains @ or ends with domain pattern -> Email
  if (trimmed.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'email';
  }
  
  // Contains digits, optional leading +, spaces, dashes or parens -> Phone
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length >= 7 && (trimmed.startsWith('+') || /^[0-9\s\-\(\)\+]+$/.test(trimmed))) {
    return 'phone';
  }

  // Ambiguous partial typing
  if (digitsOnly.length > 0 && !trimmed.includes('@')) {
    return digitsOnly.length >= 5 ? 'phone_candidate' : 'ambiguous';
  }
  
  return 'ambiguous';
}

/**
 * Helper to format phone display nicely
 */
function formatPhoneDisplay(phoneStr) {
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phoneStr.startsWith('+') ? phoneStr : `+${phoneStr}`;
}

export default function LoginPage({ onLoginSuccess }) {
  // Navigation screen states: 'identifier', 'email_password', 'phone_otp'
  const [screen, setScreen] = useState('identifier');
  
  // Identifier state
  const [identifier, setIdentifier] = useState('');
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [isSubmittingIdentifier, setIsSubmittingIdentifier] = useState(false);
  
  // Email Password state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  // Phone OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  // Auxiliary UI notices
  const [googleNotice, setGoogleNotice] = useState(false);
  const [registerNotice, setRegisterNotice] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);

  const otpInputsRef = useRef([]);

  // Auto-detection badge indicator
  const detectedType = detectIdentifierType(identifier);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (screen === 'phone_otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, resendTimer]);

  // Focus first OTP field on entering OTP screen
  useEffect(() => {
    if (screen === 'phone_otp' && otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  }, [screen]);

  // Handle identifier validation
  const validateIdentifier = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setIdentifierError('Enter your email or phone number.');
      return false;
    }

    if (detectedType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setIdentifierError('Enter a valid email address.');
        return false;
      }
    } else if (detectedType === 'phone' || detectedType === 'phone_candidate') {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        setIdentifierError('Enter a valid phone number.');
        return false;
      }
    } else {
      setIdentifierError('Enter a valid email address or phone number.');
      return false;
    }

    setIdentifierError('');
    return true;
  };

  // Continue button handler on Screen 1
  const handleContinueIdentifier = async (e) => {
    if (e) e.preventDefault();
    setIdentifierTouched(true);
    setGoogleNotice(false);

    if (!validateIdentifier()) return;

    setIsSubmittingIdentifier(true);

    if (detectedType === 'email') {
      setIsSubmittingIdentifier(false);
      setEmailError('');
      setPassword('');
      setScreen('email_password');
    } else {
      // Phone flow -> Request OTP first
      const res = await requestPhoneOTP(identifier.trim());
      setIsSubmittingIdentifier(false);

      if (res.success) {
        setScreen('phone_otp');
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setResendTimer(30);
        setCanResend(false);
      } else {
        setIdentifierError(res.error || 'Unable to connect to the authentication service. Please try again.');
      }
    }
  };

  // Submit Password handler on Screen 2A
  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!password) {
      setEmailError('Enter your password.');
      return;
    }

    setEmailError('');
    setIsSubmittingEmail(true);

    const res = await loginWithEmail(identifier.trim(), password);
    setIsSubmittingEmail(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.user);
    } else {
      setEmailError(res.error || 'The email or password is incorrect.');
    }
  };

  // Submit OTP handler on Screen 2B
  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    setOtpError('');
    setIsSubmittingOtp(true);

    const res = await loginWithPhone(identifier.trim(), fullOtp);
    setIsSubmittingOtp(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.user);
    } else {
      setOtpError(res.error || 'The verification code is incorrect. Please try again.');
    }
  };

  // Handle OTP digit input changes & navigation
  const handleOtpDigitChange = (index, value) => {
    // Only numeric input allowed
    const lastChar = value.slice(-1);
    if (value && !/^\d+$/.test(lastChar)) return;

    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next box if typed
    if (lastChar && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && otpInputsRef.current[index - 1]) {
        // Focus previous on backspace if current field is empty
        otpInputsRef.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  // Paste support for 6-digit code
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (i < pasteData.length) {
        newOtp[i] = pasteData[i];
      }
    }
    setOtp(newOtp);
    setOtpError('');

    // Focus last or next empty slot
    const nextIndex = Math.min(pasteData.length, 5);
    if (otpInputsRef.current[nextIndex]) {
      otpInputsRef.current[nextIndex].focus();
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setResendMessage('');
    setOtpError('');

    const res = await requestPhoneOTP(identifier.trim());
    setIsResending(false);

    if (res.success) {
      setResendTimer(30);
      setCanResend(false);
      setResendMessage('A new verification code has been sent.');
      setTimeout(() => setResendMessage(''), 4000);
    } else {
      setOtpError(res.error || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] font-sans text-[#14181F] antialiased selection:bg-[#35D0C4]/30">
      
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] min-h-screen">

        {/* LEFT — Brand panel */}
        <div className="relative hidden lg:flex flex-col justify-between p-14 bg-gradient-to-br from-[#0B1C2C] to-[#122A41] text-white overflow-hidden select-none">
          
          {/* Brand Top Header */}
          <div className="flex items-center gap-2.5 tv-font-space font-semibold text-[19px] tracking-[0.01em] z-10">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#35D0C4" strokeWidth="1.4"/>
              <circle cx="11" cy="11" r="4.5" stroke="#35D0C4" strokeWidth="1.4"/>
              <circle cx="11" cy="11" r="1.4" fill="#35D0C4"/>
            </svg>
            <span>TrustVision</span>
          </div>

          {/* Brand Mid Content */}
          <div className="z-10 max-w-[420px] my-auto">
            <h1 className="tv-font-space font-medium text-[34px] leading-[1.28] text-[#F4FBFA] mb-4">
              Every sign-in, verified in real time.
            </h1>
            <p className="text-[15px] leading-[1.65] text-[#9FB4C4] m-0">
              TrustVision watches for anomalies the moment a session starts, so your workspace stays yours — no matter where your team signs in from.
            </p>

            <div className="flex gap-10 mt-9">
              <div>
                <p className="tv-font-space text-[22px] font-semibold text-[#35D0C4] m-0 mb-[2px]">99.98%</p>
                <p className="text-[12.5px] text-[#7E93A5] m-0">detection accuracy</p>
              </div>
              <div>
                <p className="tv-font-space text-[22px] font-semibold text-[#35D0C4] m-0 mb-[2px]">&lt;80ms</p>
                <p className="text-[12.5px] text-[#7E93A5] m-0">verification time</p>
              </div>
              <div>
                <p className="tv-font-space text-[22px] font-semibold text-[#35D0C4] m-0 mb-[2px]">24/7</p>
                <p className="text-[12.5px] text-[#7E93A5] m-0">active monitoring</p>
              </div>
            </div>
          </div>

          {/* Brand Footer */}
          <div className="text-[12.5px] text-[#6B8091] z-10 flex items-center justify-between">
            <span>© 2026 TrustVision, Inc.</span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#7E93A5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35D0C4] animate-pulse"></span>
              Neural Core Operational
            </span>
          </div>

          {/* Soft ambient backdrop shapes */}
          <svg className="absolute -right-[140px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] z-0 pointer-events-none" viewBox="0 0 520 520">
            <defs>
              <linearGradient id="fade1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#35D0C4" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#35D0C4" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path className="fill-none stroke-[#1D3C52] stroke-[1]" d="M 60 340 C 150 220, 330 220, 460 320"/>
            <path className="fill-none stroke-[#1D3C52] stroke-[1]" d="M 90 420 C 190 300, 370 300, 470 400"/>
            <path className="fill-none stroke-[#35D0C4] stroke-[1] opacity-[0.35]" d="M 40 260 C 140 140, 340 140, 480 250"/>
            <circle className="fill-[#35D0C4] opacity-[0.7]" cx="460" cy="320" r="3"/>
            <circle className="fill-[#35D0C4] opacity-[0.4]" cx="140" cy="220" r="2.5"/>
            <circle className="fill-[#35D0C4] opacity-[0.5]" cx="480" cy="250" r="2.5"/>
          </svg>
        </div>

        {/* RIGHT — Form panel */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-[#FBFAF7] relative min-h-screen lg:min-h-0">
          
          {/* Mobile Top Header */}
          <div className="w-full max-w-[380px] mb-8 lg:hidden flex items-center justify-between">
            <div className="flex items-center gap-2 tv-font-space font-semibold text-[18px] text-[#0B1C2C]">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#1A6E68" strokeWidth="1.5"/>
                <circle cx="11" cy="11" r="4.5" stroke="#1A6E68" strokeWidth="1.5"/>
                <circle cx="11" cy="11" r="1.4" fill="#1A6E68"/>
              </svg>
              <span>TrustVision</span>
            </div>
            <span className="text-[11px] font-medium text-[#1A6E68] bg-[#35D0C4]/10 border border-[#35D0C4]/30 px-2.5 py-0.5 rounded-full">
              Enterprise Shield
            </span>
          </div>

          <div className="w-full max-w-[380px] my-auto">

            {/* SCREEN 1: IDENTIFIER (EMAIL / PHONE) */}
            {screen === 'identifier' && (
              <div>
                <h2 className="tv-font-space font-semibold text-[27px] m-0 mb-2 text-[#14181F] tracking-tight">
                  Welcome back
                </h2>
                <p className="text-[14.5px] text-[#5B6B7D] m-0 mb-[34px]">
                  Sign in to your TrustVision workspace
                </p>

                <form onSubmit={handleContinueIdentifier} noValidate>
                  <div className="mb-[18px]">
                    <div className="flex items-center justify-between mb-[7px]">
                      <label htmlFor="identifier-input" className="block text-[13px] font-medium text-[#14181F] m-0">
                        Email or phone number
                      </label>

                      {/* Real-time Detection Badge */}
                      {detectedType === 'email' && (
                        <span className="text-[11px] font-medium text-[#1A6E68] bg-[#35D0C4]/10 border border-[#35D0C4]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1A6E68]"></span>
                          Email detected
                        </span>
                      )}
                      {detectedType === 'phone' && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Phone detected
                        </span>
                      )}
                    </div>

                    <input
                      id="identifier-input"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (identifierError) setIdentifierError('');
                      }}
                      onBlur={() => {
                        setIdentifierTouched(true);
                        if (identifier.trim()) validateIdentifier();
                      }}
                      aria-invalid={Boolean(identifierError)}
                      aria-describedby={identifierError ? "identifier-error-msg" : undefined}
                      placeholder="name@company.com"
                      className={`w-full h-[46px] px-[14px] tv-input text-[14.5px] rounded-[10px] ${
                        identifierError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' : ''
                      }`}
                    />

                    {identifierError && (
                      <p id="identifier-error-msg" className="text-[12px] text-red-600 flex items-center gap-1.5 font-medium mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{identifierError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingIdentifier || !identifier.trim()}
                    className="w-full h-[48px] border-none rounded-[10px] tv-btn-primary text-white text-[14.5px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingIdentifier ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#35D0C4]" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Continue</span>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-[14px] my-[26px]">
                  <div className="flex-1 h-[1px] bg-[#E4E1D8]"></div>
                  <span className="text-[12px] text-[#8E9BAB]">or</span>
                  <div className="flex-1 h-[1px] bg-[#E4E1D8]"></div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setGoogleNotice(!googleNotice)}
                    className="w-full h-[48px] rounded-[10px] tv-btn-google flex items-center justify-center gap-[10px] text-[14.5px] font-medium text-[#14181F] cursor-pointer"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"/>
                      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"/>
                      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {googleNotice && (
                    <div className="mt-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[12px] text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Google SSO is restricted in dev sandbox. Please enter an email or phone number directly.</span>
                    </div>
                  )}
                </div>

                <p className="text-center text-[13.5px] text-[#5B6B7D] mt-[26px]">
                  Don't have a TrustVision account?{' '}
                  <button
                    type="button"
                    onClick={() => setRegisterNotice(!registerNotice)}
                    className="color-[#14181F] font-semibold border-b border-[#14181F] bg-transparent p-0 cursor-pointer text-[#14181F]"
                  >
                    Create account
                  </button>
                </p>

                {registerNotice && (
                  <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-[12px] text-blue-900 space-y-1">
                    <p className="font-semibold">TrustVision Workspace Access</p>
                    <p>Accounts are automatically provisioned by your IT security administrator upon organization setup.</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-[6px] mt-[30px] pt-[22px] border-t border-[#E4E1D8] text-[12px] text-[#8E9BAB]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M3 6V4.5a3.5 3.5 0 0 1 7 0V6M2.5 6h8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="#8E9BAB" strokeWidth="1.1"/>
                  </svg>
                  <span>Your connection is secure</span>
                </div>

              </div>
            )}

            {/* SCREEN 2A: EMAIL PASSWORD FLOW */}
            {screen === 'email_password' && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setScreen('identifier');
                    setEmailError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5B6B7D] hover:text-[#14181F] mb-5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to identifier</span>
                </button>

                <h2 className="tv-font-space font-semibold text-[27px] m-0 mb-1.5 text-[#14181F] tracking-tight">
                  Enter your password
                </h2>
                <div className="flex items-center justify-between text-[13.5px] text-[#5B6B7D] mb-[28px]">
                  <span className="truncate max-w-[220px]">Email: <strong className="text-[#14181F] font-semibold">{identifier}</strong></span>
                  <button
                    type="button"
                    onClick={() => setScreen('identifier')}
                    className="text-[#1A6E68] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <form onSubmit={handleEmailSubmit} noValidate>
                  <div className="mb-[18px]">
                    <div className="flex items-center justify-between mb-[7px]">
                      <label htmlFor="password-input" className="block text-[13px] font-medium text-[#14181F] m-0">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotNotice(!forgotNotice)}
                        className="text-[13px] text-[#1A6E68] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {forgotNotice && (
                      <div className="mb-2.5 p-3 bg-slate-100 border border-slate-200 rounded-lg text-[12px] text-slate-700 space-y-1">
                        <p className="font-semibold">Reset Instructions</p>
                        <p>Contact your enterprise administrator or security manager to reset your workspace password.</p>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="Enter your password"
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailError ? "email-error-msg" : undefined}
                        className={`w-full h-[46px] pl-[14px] pr-[42px] tv-input text-[14.5px] rounded-[10px] ${
                          emailError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E9BAB] hover:text-[#5B6B7D] transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {emailError && (
                      <p id="email-error-msg" className="text-[12px] text-red-600 flex items-center gap-1.5 font-medium mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEmail || !password}
                    className="w-full h-[48px] border-none rounded-[10px] tv-btn-primary text-white text-[14.5px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {isSubmittingEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#35D0C4]" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign in</span>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-[6px] mt-[30px] pt-[22px] border-t border-[#E4E1D8] text-[12px] text-[#8E9BAB]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M3 6V4.5a3.5 3.5 0 0 1 7 0V6M2.5 6h8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="#8E9BAB" strokeWidth="1.1"/>
                  </svg>
                  <span>Your connection is secure</span>
                </div>

              </div>
            )}

            {/* SCREEN 2B: PHONE OTP FLOW */}
            {screen === 'phone_otp' && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setScreen('identifier');
                    setOtpError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5B6B7D] hover:text-[#14181F] mb-5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change phone number</span>
                </button>

                <h2 className="tv-font-space font-semibold text-[27px] m-0 mb-1.5 text-[#14181F] tracking-tight">
                  Verify phone
                </h2>
                <p className="text-[14px] text-[#5B6B7D] m-0 mb-[28px]">
                  Enter the 6-digit security code sent to{' '}
                  <strong className="text-[#14181F] font-semibold">{formatPhoneDisplay(identifier)}</strong>
                </p>

                <form onSubmit={handleOtpSubmit} noValidate>
                  <div className="mb-[22px]">
                    <label className="block text-[13px] font-medium text-[#14181F] mb-2.5">
                      Verification code
                    </label>

                    <div className="flex items-center justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          aria-label={`Verification digit ${index + 1} of 6`}
                          className={`w-11 sm:w-[50px] h-[50px] text-center text-[18px] font-bold tv-font-space tv-input rounded-[10px] ${
                            otpError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' : ''
                          }`}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-[12px] text-red-600 flex items-center gap-1.5 font-medium mt-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{otpError}</span>
                      </p>
                    )}

                    {resendMessage && (
                      <p className="text-[12px] text-emerald-600 flex items-center gap-1.5 font-medium mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{resendMessage}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOtp || otp.join('').length < 6}
                    className="w-full h-[48px] border-none rounded-[10px] tv-btn-primary text-white text-[14.5px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingOtp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#35D0C4]" />
                        <span>Verifying code...</span>
                      </>
                    ) : (
                      <span>Verify and continue</span>
                    )}
                  </button>
                </form>

                <div className="pt-3 text-center text-[13px] text-[#5B6B7D]">
                  {!canResend ? (
                    <span>Resend code in <strong className="font-mono text-[#14181F] font-semibold">{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-[#1A6E68] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
                    >
                      {isResending ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-[6px] mt-[30px] pt-[22px] border-t border-[#E4E1D8] text-[12px] text-[#8E9BAB]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M3 6V4.5a3.5 3.5 0 0 1 7 0V6M2.5 6h8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="#8E9BAB" strokeWidth="1.1"/>
                  </svg>
                  <span>Your connection is secure</span>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

