"use client";

type FretCellProps = {
  note: string;
  isHighlighted: boolean;
  isRoot: boolean;
  onClick: () => void;
};

export default function FretCell({
  note,
  isHighlighted,
  isRoot,
  onClick,
}: FretCellProps) {
  return (
    <button
      className={`w-12 h-12 rounded-md ${isRoot ? "bg-amber-400 text-white" : isHighlighted ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}
      onClick={onClick}
    >
      {note}
    </button>
  );
}
