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
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between font-sans text-[#111827] antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Top Header Bar for Mobile branding / Quick reference */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] bg-white lg:hidden">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg tracking-tight">
            <span className="text-[#111827]">Trust</span>
            <span className="text-[#2563EB]">Vision</span>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Enterprise Security
        </span>
      </header>

      {/* Main Centered Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: TrustVision Branding & Product Capability (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-8 pr-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-[#111827]">Trust</span>
                <span className="text-[#2563EB]">Vision</span>
              </div>
            </div>

            {/* Tagline & Copy */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight leading-snug">
                Verify what you can trust.
              </h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Secure media verification combining cryptographic integrity checks, metadata analysis, and AI-powered visual forensics.
              </p>
            </div>

            {/* Subtle Feature List */}
            <div className="space-y-3.5 pt-2 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-3 text-xs font-medium text-[#111827]">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Cryptographic verification</span>
              </div>
              
              <div className="flex items-center gap-3 text-xs font-medium text-[#111827]">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Metadata analysis</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium text-[#111827]">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>AI-powered visual forensics</span>
              </div>
            </div>

            {/* System Status Footnote */}
            <div className="pt-4 text-[11px] text-[#64748B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>TrustVision Core Neural Engine • Operational</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Centered Authentication Card */}
          <div className="col-span-1 lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-8 space-y-6 transition-all duration-200">
              
              {/* SCREEN 1: IDENTIFIER (EMAIL / PHONE) */}
              {screen === 'identifier' && (
                <div className="space-y-6">
                  
                  {/* Header */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                      Welcome back
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B]">
                      Sign in to your TrustVision workspace
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleContinueIdentifier} className="space-y-5" noValidate>
                    
                    {/* Identifier Input Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label 
                          htmlFor="identifier-input" 
                          className="block text-xs font-semibold text-[#111827] uppercase tracking-wider"
                        >
                          Email or phone number
                        </label>

                        {/* Real-time Detection Badge */}
                        {detectedType === 'email' && (
                          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            Email detected
                          </span>
                        )}
                        {detectedType === 'phone' && (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Phone detected
                          </span>
                        )}
                      </div>

                      <div className="relative">
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
                          placeholder="Enter your email or phone number"
                          className={`w-full h-12 px-3.5 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                            identifierError 
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-100 text-red-900' 
                              : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-blue-500/20 text-[#111827]'
                          }`}
                        />
                      </div>

                      {/* Accessible Error Message */}
                      {identifierError && (
                        <p id="identifier-error-msg" className="text-xs text-red-600 flex items-center gap-1.5 font-medium mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{identifierError}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingIdentifier || !identifier.trim()}
                      className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmittingIdentifier ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Continue</span>
                      )}
                    </button>

                  </form>

                  {/* Divider OR */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB]"></div>
                    </div>
                    <div className="relative px-3 bg-white text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      OR
                    </div>
                  </div>

                  {/* Google OAuth Option */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setGoogleNotice(!googleNotice)}
                      className="w-full h-11 border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/80 text-[#111827] font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2.5 bg-white cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {googleNotice && (
                      <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Google sign-in is unavailable in development environment. Please use email or phone identifier.</span>
                      </div>
                    )}
                  </div>

                  {/* Account Creation Link */}
                  <div className="pt-2 text-center text-xs text-[#64748B]">
                    <span>Don't have a TrustVision account? </span>
                    <button
                      type="button"
                      onClick={() => setRegisterNotice(!registerNotice)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Create account
                    </button>
                  </div>

                  {registerNotice && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
                      <p className="font-semibold">TrustVision Workspace Enrollment</p>
                      <p>New workspace accounts are provisioned via your organization administrator. You may sign in with your enterprise email or authorized phone number.</p>
                    </div>
                  )}

                  {/* Security Message at Bottom */}
                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-center gap-2 text-xs text-[#64748B]">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your connection is secure</span>
                  </div>

                </div>
              )}

              {/* SCREEN 2A: EMAIL PASSWORD FLOW */}
              {screen === 'email_password' && (
                <div className="space-y-6">
                  
                  {/* Top Back Navigation */}
                  <button
                    type="button"
                    onClick={() => {
                      setScreen('identifier');
                      setEmailError('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  {/* Header */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                      Enter your password
                    </h2>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748B]">
                      <span className="truncate max-w-[220px]">Email: <strong className="text-[#111827] font-medium">{identifier}</strong></span>
                      <button
                        type="button"
                        onClick={() => setScreen('identifier')}
                        className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-5" noValidate>
                    
                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label 
                          htmlFor="password-input" 
                          className="block text-xs font-semibold text-[#111827] uppercase tracking-wider"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotNotice(!forgotNotice)}
                          className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {forgotNotice && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
                          <p className="font-semibold">Password Recovery</p>
                          <p>Contact your TrustVision workspace administrator or security officer to issue a password reset request.</p>
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
                          className={`w-full h-12 pl-3.5 pr-11 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                            emailError 
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-100 text-red-900' 
                              : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-blue-500/20 text-[#111827]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {emailError && (
                        <p id="email-error-msg" className="text-xs text-red-600 flex items-center gap-1.5 font-medium mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{emailError}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingEmail || !password}
                      className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmittingEmail ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign in</span>
                      )}
                    </button>

                  </form>

                  {/* Security Footnote */}
                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-center gap-2 text-xs text-[#64748B]">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your connection is secure</span>
                  </div>

                </div>
              )}

              {/* SCREEN 2B: PHONE OTP FLOW */}
              {screen === 'phone_otp' && (
                <div className="space-y-6">
                  
                  {/* Top Back Navigation */}
                  <button
                    type="button"
                    onClick={() => {
                      setScreen('identifier');
                      setOtpError('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change phone number</span>
                  </button>

                  {/* Header */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                      Verify your phone number
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B]">
                      Enter the 6-digit verification code sent to{' '}
                      <strong className="text-[#111827] font-semibold">{formatPhoneDisplay(identifier)}</strong>
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleOtpSubmit} className="space-y-6" noValidate>
                    
                    {/* OTP 6-Digit Box Group */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider text-center sm:text-left">
                        Verification code
                      </label>

                      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
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
                            className={`w-11 sm:w-12 h-12 text-center text-lg font-bold font-mono bg-white border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                              otpError 
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-100 text-red-900' 
                                : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-blue-500/20 text-[#111827]'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Error & Resend Messages */}
                      {otpError && (
                        <p className="text-xs text-red-600 flex items-center justify-center sm:justify-start gap-1.5 font-medium mt-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{otpError}</span>
                        </p>
                      )}

                      {resendMessage && (
                        <p className="text-xs text-emerald-600 flex items-center justify-center sm:justify-start gap-1.5 font-medium mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{resendMessage}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingOtp || otp.join('').length < 6}
                      className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmittingOtp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify and continue</span>
                      )}
                    </button>

                  </form>

                  {/* Resend Code Countdown */}
                  <div className="pt-2 text-center text-xs text-[#64748B]">
                    {!canResend ? (
                      <span>Resend code in <strong className="font-mono text-[#111827]">{resendTimer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold underline underline-offset-2 cursor-pointer disabled:opacity-50"
                      >
                        {isResending ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>

                  {/* Security Footnote */}
                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-center gap-2 text-xs text-[#64748B]">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your connection is secure</span>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Modern Minimal Footer */}
      <footer className="w-full px-6 py-4 text-center text-xs text-[#64748B] border-t border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} TrustVision Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:underline cursor-pointer">Security Ledger</span>
            <span>&bull;</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
