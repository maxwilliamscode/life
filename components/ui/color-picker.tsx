
import React from 'react';
import { Input } from './input';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Input 
      type="color" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className={`w-12 h-8 p-0 overflow-hidden border-none ${className || ''}`}
    />
  );
}
