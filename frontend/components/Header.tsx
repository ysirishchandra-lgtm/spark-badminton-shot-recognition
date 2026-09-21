'use client';

import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from '@/lib/api';
import { BackendHealthResponse } from '@/types';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkBackendHealth()
      .then((res) => {
        if (mounted) {
          setHealth(res);
          setChecking(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setHealth(null);
          setChecking(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="w-full border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
              {/* Shuttlecock Spark Icon SVG */}
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black tracking-wider text-[var(--text-primary)]">
                  SPARK
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                  PROD v1.0
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block leading-tight">
                Badminton Shot Recognition System
              </p>
            </div>
          </a>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <a
            href="#analyze"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Analyze Video
          </a>
          <a
            href="#classes"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Shot Taxonomy
          </a>
          <a
            href="#architecture"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Architecture
          </a>
          <a
            href="#limitations"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Disclosures
          </a>
        </nav>

        {/* Action Controls: Backend Status Pill, Theme Switcher, GitHub Link */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                checking
                  ? 'bg-amber-400 animate-pulse'
                  : health
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-[var(--text-secondary)] font-semibold hidden xs:inline">
              Backend:
            </span>
            {checking ? (
              <span className="text-amber-500 dark:text-amber-400 font-medium">Connecting...</span>
            ) : health ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Offline</span>
            )}
          </div>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* GitHub Link */}
          <a
            href="https://github.com/ysirishchandra-lgtm/spark-badminton-shot-recognition"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-xl hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)] hidden sm:inline-flex"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--header-bg)] px-4 py-3 space-y-2">
          <a
            href="#analyze"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)]"
          >
            Analyze Video
          </a>
          <a
            href="#classes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)]"
          >
            Shot Taxonomy
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)]"
          >
            Architecture
          </a>
          <a
            href="#limitations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-secondary)]"
          >
            Disclosures
          </a>
        </div>
      )}
    </header>
  );
}
