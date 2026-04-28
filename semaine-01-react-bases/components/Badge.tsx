type BadgeProps = {
  text: string;
  color?: "blue" | "green" | "red" | "gray";
};

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  gray: "bg-gray-500",
};

export function Badge({ text, color = "gray" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${colorClasses[color]}`}
    >
      {text}
    </span>
  );
}
