'use client';

import { ReactNode } from 'react';
import { ActionButton } from './ui/action-button';

export interface MarkdownActionsProps {
  isLocked: boolean;
  onEdit: () => void;
  onToggleLock: () => Promise<void>;
  children: ReactNode;
}

export function MarkdownActions({
  isLocked,
  onEdit,
  onToggleLock,
  children
}: MarkdownActionsProps) {
  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <ActionButton
          onClick={onEdit}
          disabled={isLocked}
          aria-label="Edit"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </ActionButton>
        <ActionButton
          onClick={onToggleLock}
          className={isLocked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-500 hover:text-gray-700'}
          aria-label={isLocked ? 'Unlock' : 'Lock'}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isLocked ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0v4m-4 5v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            )}
          </svg>
        </ActionButton>
      </div>
      {children}
    </div>
  );
}
