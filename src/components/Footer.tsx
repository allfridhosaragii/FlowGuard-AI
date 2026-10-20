import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border bg-surface-muted/50 py-10">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">
                FlowGuard <span className="text-accent">AI</span>
              </span>
            </div>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              Autonomous verification platform designed to evaluate code changes against formal business rules, detect concurrency bugs, and produce verifiable execution evidence.
            </p>
            <p className="text-[11px] text-muted">
              Built for <strong>TestSprite Hackathon Season 4</strong>.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>
                <Link href="/lab" className="hover:text-accent transition-colors">
                  Controlled Verification Lab
                </Link>
              </li>
              <li>
                <Link href="/analyze" className="hover:text-accent transition-colors">
                  GitHub PR Analysis
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">
                  Architecture & Invariants
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Transparency & Links</h4>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>
                <a
                  href="https://github.com/allfridhosaragii/FlowGuard-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-accent transition-colors"
                >
                  GitHub Repository <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://testsprite.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-accent transition-colors"
                >
                  TestSprite 3.0 Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-muted/80">Author: Allfridho Saragi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted">
          <span>
            © 2026 FlowGuard AI. Open source under MIT license.
          </span>
          <span className="text-muted/90">
            Rule: Evidence precedes verdicts. External findings classified as POTENTIAL until verified.
          </span>
        </div>
      </div>
    </footer>
  );
};
