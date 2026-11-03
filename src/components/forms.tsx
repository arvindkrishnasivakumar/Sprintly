"use client";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { Result } from "@/lib/actions";
export type Action = (state: Result, form: FormData) => Promise<Result>;
function Submit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" disabled={pending}>
      {pending ? "Saving…" : children}
    </button>
  );
}
export function ActionForm({
  action,
  children,
  submit = "Save",
  className = "",
}: {
  action: Action;
  children: ReactNode;
  submit?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={`form ${className}`}>
      {children}
      {state.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="success">
          {state.success}
        </p>
      )}
      <Submit>{submit}</Submit>
    </form>
  );
}
export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  maxLength,
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
      />
    </label>
  );
}
export function TextArea({
  label,
  name,
  defaultValue = "",
  maxLength = 3000,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  maxLength?: number;
}) {
  return (
    <label>
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        rows={3}
      />
    </label>
  );
}
export function Select({
  label,
  name,
  values,
  defaultValue,
}: {
  label: string;
  name: string;
  values: readonly string[];
  defaultValue?: string;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={defaultValue}>
        {values.map((v) => (
          <option key={v} value={v}>
            {v.toLowerCase().replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
