"use client";

import type { ChordDegree, DegreeStyles } from "@/lib/music-types";

type FretCellProps = {
  note: string;
  isHighlighted: boolean;
  isRoot: boolean;
  onCellClick: () => void;
  showDegrees: boolean;
  degree: ChordDegree | null;
  degreeStyles: DegreeStyles;
};

export default function FretCell({
  note,
  isHighlighted,
  isRoot,
  onCellClick,
  showDegrees,
  degree,
  degreeStyles,
}: FretCellProps) {
  return (
    <button
      style={{
        background:
          showDegrees && degree
            ? degreeStyles[degree].color
            : isRoot
              ? "var(--root)"
              : isHighlighted
                ? "var(--scale)"
                : "rgba(20, 16, 12, 0.55)",
        color: isRoot || isHighlighted ? "#0d1a2d" : "var(--muted)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          degree === "1" || (!showDegrees && isRoot)
            ? "0 0 0 2px rgba(255,107,74,0.5)"
            : undefined,
      }}
      className="w-full min-h-15 flex items-center justify-center shrink-0 rounded-md text-base font-semibold transition-colors duration-100 hover:brightness-125 cursor-pointer"
      onClick={() => onCellClick()}
    >
      {note}
    </button>
  );
}
