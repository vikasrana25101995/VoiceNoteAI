'use client';

import React from 'react';
import Link from 'next/link';
import { AuthSidebar, RESET_PASSWORD_CONSTANTS, useResetPasswordForm } from './CORE/imports';
import { Loader2, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ResetPasswordModule() {
  const {
    formData,
    token,
    showPassword,
    isLoading,
    isSuccess,
    errorMessage,
    handleInputChange,
    togglePasswordVisibility,
    handleSubmit,
  } = useResetPasswordForm();

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAF8] text-neutral-900 font-sans selection:bg-[#234B36] selection:text-white">
      {/* Left Sidebar Branding */}
      <div className="hidden lg:block lg:w-1/2 xl:w-5/12 h-screen sticky top-0">
        <AuthSidebar type="login" />
      </div>

      {/* Right Form Area */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto space-y-7">
          {/* Mobile Header Brand */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#234B36] text-white flex items-center justify-center font-bold text-sm">
                VN
              </div>
              <span className="font-semibold text-lg text-neutral-900">VoiceNote AI</span>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-[#234B36] hover:underline"
            >
              Sign in
            </Link>
          </div>

          {!isSuccess ? (
            <>
              {/* Icon Header */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#234B36] border border-emerald-100 shadow-sm">
                <KeyRound className="h-6 w-6 stroke-[2]" />
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-sans">
                  {RESET_PASSWORD_CONSTANTS.TITLE}
                </h2>
                <p className="mt-2 text-base text-neutral-500 font-normal">
                  {RESET_PASSWORD_CONSTANTS.SUBTITLE}
                </p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              {!token && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium leading-relaxed">
                  Warning: No reset token detected in URL query params. Please use the link sent to your email address.
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    {RESET_PASSWORD_CONSTANTS.PASSWORD_LABEL}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder={RESET_PASSWORD_CONSTANTS.PASSWORD_PLACEHOLDER}
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

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    {RESET_PASSWORD_CONSTANTS.CONFIRM_PASSWORD_LABEL}
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={RESET_PASSWORD_CONSTANTS.CONFIRM_PASSWORD_PLACEHOLDER}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#234B36] focus:border-transparent transition-all shadow-sm text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full py-3.5 px-4 bg-[#234B36] hover:bg-[#1A3A2A] text-white font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#234B36] focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer text-base mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{RESET_PASSWORD_CONSTANTS.SUBMIT_BUTTON_LOADING}</span>
                    </>
                  ) : (
                    <span>{RESET_PASSWORD_CONSTANTS.SUBMIT_BUTTON_TEXT}</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success Screen */
            <div className="space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[#234B36]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-neutral-900 font-sans">
                  {RESET_PASSWORD_CONSTANTS.SUCCESS_TITLE}
                </h2>
                <p className="mt-2 text-base text-neutral-600 leading-relaxed">
                  {RESET_PASSWORD_CONSTANTS.SUCCESS_DESCRIPTION}
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 px-4 bg-[#234B36] hover:bg-[#1A3A2A] text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-base"
              >
                <span>{RESET_PASSWORD_CONSTANTS.CONTINUE_TO_LOGIN}</span>
              </Link>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="pt-4 border-t border-neutral-200/80">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModule;
