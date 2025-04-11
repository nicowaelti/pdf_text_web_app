'use client';

interface LoadingSpinnerProps {
  className?: string;
  style?: React.CSSProperties;
}

export function LoadingSpinner({ className = '', style }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner ${className}`} style={style} />
  );
}