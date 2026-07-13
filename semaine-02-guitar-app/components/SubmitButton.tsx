"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function SubmitButton({
  children,
  className,
  style,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{
        ...style,
        opacity: pending ? 0.6 : 1,
        cursor: pending ? "wait" : undefined,
      }}
    >
      {pending ? "Enregistrement…" : children}
    </button>
  );
}
