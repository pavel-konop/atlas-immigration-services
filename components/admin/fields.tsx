import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const inputBase =
  "w-full rounded-md border border-atlas-line bg-white px-3 py-2 text-sm text-atlas-ink outline-none transition placeholder:text-slate-400 focus:border-atlas-gold";

function FieldShell({
  id,
  label,
  hint,
  children
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      />
    </FieldShell>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputBase}
      />
    </FieldShell>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  hint,
  rows = 3,
  className
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, "resize-y font-mono leading-6", className)}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  hint
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputBase}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function ToggleField({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-atlas-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-atlas-line text-atlas-navy focus:ring-atlas-gold"
      />
      {label}
    </label>
  );
}
