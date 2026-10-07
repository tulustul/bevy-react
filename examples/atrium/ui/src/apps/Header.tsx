import { Colors } from "../theme";

/** An app's small caps label over its big title. */
export function Header({ label, title }: { label: string; title: string }) {
  return (
    <node style={{ flexDirection: "column", gap: 4 }}>
      <text
        style={{
          fontSize: 12,
          fontWeight: "semibold",
          letterSpacing: 1.6,
          color: Colors.faint,
        }}
      >
        {label.toUpperCase()}
      </text>
      <text
        style={{ fontSize: 28, fontWeight: "semibold", color: Colors.text }}
      >
        {title}
      </text>
    </node>
  );
}
