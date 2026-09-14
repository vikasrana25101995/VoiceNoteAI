'use client';

import React from 'react';
import Link from 'next/link';
import { AuthSidebar, LOGIN_CONSTANTS, useLoginForm } from './CORE/imports';
import { Loader2 } from 'lucide-react';

export function LoginModule() {
  const {
    formData,
    showPassword,
    isLoading,
    isGoogleLoading,
    errorMessage,
    handleInputChange,
    togglePasswordVisibility,
    handleSubmit,
    handleGoogleSignIn,
  } = useLoginForm();

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAF8] text-neutral-900 font-sans selection:bg-[#234B36] selection:text-white">
      {/* Left Sidebar Branding */}
      <div className="hidden lg:block lg:w-1/2 xl:w-5/12 h-screen sticky top-0">
        <AuthSidebar type="login" />
      </div>

      {/* Right Form Area */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Mobile Header Brand */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#234B36] text-white flex items-center justify-center font-bold text-sm">
                VN
              </div>
              <span className="font-semibold text-lg text-neutral-900">VoiceNote AI</span>
            </div>
            <Link
              href="/signup"
              className="text-sm font-medium text-[#234B36] hover:underline"
            >
              Create account
            </Link>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-sans">
              {LOGIN_CONSTANTS.TITLE}
            </h2>
            <p className="mt-2 text-base text-neutral-500 font-normal">
              {LOGIN_CONSTANTS.SUBTITLE}
            </p>
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{LOGIN_CONSTANTS.GOOGLE_BUTTON_TEXT}</span>
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-neutral-200" />
            <span className="absolute bg-[#FAFAF8] px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {LOGIN_CONSTANTS.DIVIDER_TEXT}
            </span>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                {LOGIN_CONSTANTS.EMAIL_LABEL}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={LOGIN_CONSTANTS.EMAIL_PLACEHOLDER}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#234B36] focus:border-transparent transition-all shadow-sm text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                {LOGIN_CONSTANTS.PASSWORD_LABEL}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
                  className="w-full px-4 py-3 pr-16 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#234B36] focus:border-transparent transition-all shadow-sm text-sm"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors px-1 py-0.5"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[#234B36] focus:ring-[#234B36] accent-[#234B36]"
                />
                <span className="text-neutral-600 font-normal">
                  {LOGIN_CONSTANTS.REMEMBER_ME_LABEL}
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm font-semibold text-[#234B36] hover:underline"
              >
                {LOGIN_CONSTANTS.FORGOT_PASSWORD_LINK}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3.5 px-4 bg-[#234B36] hover:bg-[#1A3A2A] text-white font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#234B36] focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer text-base mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{LOGIN_CONSTANTS.SUBMIT_BUTTON_LOADING}</span>
                </>
              ) : (
                <span>{LOGIN_CONSTANTS.SUBMIT_BUTTON_TEXT}</span>
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="text-center pt-2">
            <span className="text-neutral-500 text-sm">
              {LOGIN_CONSTANTS.NEW_HERE_TEXT}{' '}
            </span>
            <Link
              href="/signup"
              className="text-sm font-semibold text-[#234B36] hover:underline"
            >
              {LOGIN_CONSTANTS.CREATE_ACCOUNT_LINK}
            </Link>
          </div>

          {/* Footer Notice */}
          <p className="text-center text-xs text-neutral-400 pt-4 leading-relaxed max-w-xs mx-auto">
            {LOGIN_CONSTANTS.TERMS_NOTICE_PREFIX}{' '}
            <a href="#" className="underline hover:text-neutral-600">
              {LOGIN_CONSTANTS.TERMS_LINK}
            </a>{' '}
            {LOGIN_CONSTANTS.AND_TEXT}{' '}
            <a href="#" className="underline hover:text-neutral-600">
              {LOGIN_CONSTANTS.PRIVACY_LINK}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModule;
