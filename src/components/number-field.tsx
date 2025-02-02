import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { NumericFormat } from "react-number-format";

interface NumberFieldProps {
  unit?: ReactNode;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  decimalScale?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string | number | null;
}

export function NumberField({
  value,
  unit,
  decimalScale = 0,
  placeholder,
  className,
  ...props
}: NumberFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={className}>
      <div
        className={cn(
          "flex items-center mt-1 border rounded-md border-input bg-transparent px-3 py-2 text-sm shadow-sm border-blue-500",
          props.disabled && "cursor-not-allowed opacity-50 border-revert",
          focused && "outline"
        )}
      >
        <NumericFormat
          value={value}
          decimalScale={decimalScale}
          fixedDecimalScale
          thousandsGroupStyle="thousand"
          thousandSeparator=","
          placeholder={placeholder}
          className="w-full bg-transparent peer focus:outline-none"
          {...props}
          onChange={undefined}
          onValueChange={(values) => {
            props.onChange?.(values.floatValue ?? 0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            props.onBlur?.();
          }}
        />
        {unit && (
          <span className="inline-flex items-center text-muted-foreground text-sm pl-2 shrink-0">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
