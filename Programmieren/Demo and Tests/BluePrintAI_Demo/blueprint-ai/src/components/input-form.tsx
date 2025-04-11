'use client';

import { useState } from 'react';
import { Button } from './ui/button';

export interface InputFormProps {
  onSubmit: (description: string) => Promise<void>;
  isLoading: boolean;
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    await onSubmit(description);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Project Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              className="form-textarea"
              placeholder="Enter your project description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!description.trim() || isLoading}
          className="w-full justify-center"
        >
          Generate Project Artifacts
        </Button>
      </div>
    </form>
  );
}
