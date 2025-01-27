import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TextFieldProps {
  unit?: ReactNode;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
}

export function TextField({ value, unit, placeholder, className, ...props }: TextFieldProps) {
  return (
    <div className={className}>
      <div
        className={cn(
          'flex items-center mt-1 border rounded-md border-input bg-transparent px-3 py-2 text-sm shadow-sm',
          props.disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          value={value}
          placeholder={placeholder}
          className="w-full bg-transparent peer"
          {...props}
          onChange={(e) => props.onChange?.(e.target.value)}
        />
        {unit && <span className="inline-flex items-center text-muted-foreground text-sm pl-2 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}
