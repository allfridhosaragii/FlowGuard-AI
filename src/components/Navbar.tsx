'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, GitPullRequest, FlaskConical, BookOpen, Github, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/lab', label: 'Verification Lab', icon: FlaskConical },
    { href: '/analyze', label: 'PR Analysis', icon: GitPullRequest },
    { href: '/about', label: 'Architecture & Invariants', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
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
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors',
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted border border-border transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-muted hover:text-foreground rounded-md focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium',
                  isActive
                    ? 'bg-surface-muted text-accent font-semibold'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Status: Live Vercel</span>
            <a
              href="https://github.com/allfridhosaragii/FlowGuard-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Repo
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
