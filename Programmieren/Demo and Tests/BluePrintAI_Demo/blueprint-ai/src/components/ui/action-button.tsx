'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button } from './button';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function ActionButton({ children, ...props }: ActionButtonProps) {
  return (
    <Button 
      type="button"
      size="sm"
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
}
