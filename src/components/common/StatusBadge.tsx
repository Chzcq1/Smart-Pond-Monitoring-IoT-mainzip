import { cn } from '../../lib/utils';
import type { StatusLevel } from '../../types';
import { useI18n } from '../../i18n/I18nContext';

interface StatusBadgeProps {
  status: StatusLevel;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, className, showLabel = true, size = 'md' }: StatusBadgeProps) {
  const { t } = useI18n();
  const config = {
    online: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
       label: t('common.online')
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
       label: t('common.warning')
    },
    critical: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500 animate-pulse-dot shadow-[0_0_8px_rgba(244,63,94,0.8)]',
       label: t('common.critical')
    },
    offline: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/20',
      dot: 'bg-slate-500',
       label: t('common.offline')
    }
  };

  const current = config[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border font-medium uppercase tracking-wider',
      current.bg,
      current.text,
      current.border,
      sizeClasses[size],
      className
    )}>
      <div className={cn('rounded-full', current.dot, dotSizes[size])} />
      {showLabel && current.label}
    </div>
  );
}
