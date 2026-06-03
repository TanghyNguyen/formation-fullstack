"use client";

type FretCellProps = {
  note: string;
  isHighlighted: boolean;
  isRoot: boolean;
  onCellClick: () => void;
};

export default function FretCell({
  note,
  isHighlighted,
  isRoot,
  onCellClick,
}: FretCellProps) {
  return (
    <button
      style={{
        background: isRoot
          ? "var(--root)"
          : isHighlighted
            ? "var(--scale)"
            : "rgba(20, 16, 12, 0.55)",
        color: isRoot || isHighlighted ? "#0d1a2d" : "var(--muted)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: isRoot ? "0 0 0 2px rgba(255,107,74,0.5)" : undefined,
      }}
      className="w-full min-h-15 flex items-center justify-center shrink-0 rounded text-base font-semibold transition-colors duration-100 hover:brightness-125 cursor-pointer"
      onClick={() => onCellClick()}
    >
      {note}
    </button>
  );
}
