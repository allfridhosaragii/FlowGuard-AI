'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, GitPullRequest, FlaskConical, BookOpen, Github, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  // On a client-side route transition the Navbar persists, and the previously
  // activated navigation link otherwise retains focus. Move keyboard focus to
  // the newly rendered main region; don't steal focus on initial page load.
  const previousPathnameRef = useRef<string | null>(null);
  useEffect(() => {
    if (previousPathnameRef.current !== null && previousPathnameRef.current !== pathname) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    previousPathnameRef.current = pathname;
  }, [pathname]);


  const navLinks = [
    { href: '/lab', label: 'Verification Lab', icon: FlaskConical },
    { href: '/analyze', label: 'PR Analysis', icon: GitPullRequest },
    { href: '/about', label: 'Architecture & Invariants', icon: BookOpen },
  ];

  // Close mobile menu on Escape key press and restore focus to toggle button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-accent focus:text-white focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white transition-all text-xs"
      >
        Skip to main content
      </a>

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group rounded-md p-1 focus-visible:ring-2 focus-visible:ring-accent">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              FlowGuard <span className="text-accent">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
              Behavioral Verification
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent',
                  isActive
                    ? 'bg-surface-muted text-accent font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/60'
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Repo */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/30">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Vercel Production
          </div>

          <a
            href="https://github.com/allfridhosaragii/FlowGuard-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted border border-border transition-colors focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Mobile Hamburger Button with 44px Target Size & ARIA */}
        <button
          ref={toggleButtonRef}
          type="button"
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden min-w-[44px] min-h-[44px] p-2 text-muted hover:text-foreground rounded-md flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown with Accessible Keyboard & Touch Targets */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="region"
          aria-label="Mobile Navigation"
          className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-4 space-y-1 shadow-md"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-3 rounded-md text-sm font-medium min-h-[44px] focus-visible:ring-2 focus-visible:ring-accent',
                  isActive
                    ? 'bg-surface-muted text-accent font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/40'
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-border flex items-center justify-between min-h-[44px]">
            <span className="text-xs text-muted font-medium">Status: Live Vercel</span>
            <a
              href="https://github.com/allfridhosaragii/FlowGuard-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-muted hover:text-foreground rounded-md focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
            >
              <Github className="w-4 h-4" />
              GitHub Repo
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
