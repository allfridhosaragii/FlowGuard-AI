import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, XCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type StatusType =
  | 'POTENTIAL'
  | 'VERIFIED_PASS'
  | 'VERIFIED_FAIL'
  | 'INCONCLUSIVE'
  | 'ERROR'
  | 'NO_RISK_FOUND';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'VERIFIED_PASS':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-success bg-success/10 border border-success/30 rounded-full',
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            className
          )}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          Verified Pass
        </span>
      );

    case 'VERIFIED_FAIL':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-danger bg-danger/10 border border-danger/30 rounded-full',
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            className
          )}
        >
          <XCircle className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          Verified Fail
        </span>
      );

    case 'POTENTIAL':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-warning bg-warning/10 border border-warning/30 rounded-full',
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            className
          )}
        >
          <ShieldAlert className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          Potential Risk
        </span>
      );

    case 'NO_RISK_FOUND':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-success bg-success/10 border border-success/30 rounded-full',
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            className
          )}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          No Risk Detected
        </span>
      );

    case 'INCONCLUSIVE':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-muted bg-surface-muted border border-border rounded-full',
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            className
          )}
        >
          <HelpCircle className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          Inconclusive
        </span>
      );

    case 'ERROR':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-danger bg-danger/10 border border-danger/30 rounded-full',
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            className
          )}
        >
          <AlertCircle className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          Error / Failed
        </span>
      );
  }
};
