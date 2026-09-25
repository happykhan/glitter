import { useState } from "react";
import { Check, Clipboard } from "lucide-react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 2400);
  }

  const buttonLabel = copyState === "copied" ? "Copied" : copyState === "failed" ? "Select text" : label;
  return <button className="copy-button" onClick={copy} aria-label={`${label}: ${value}`} aria-live="polite" title={copyState === "failed" ? "Clipboard access failed. Select and copy the adjacent text." : undefined}>
    {copyState === "copied" ? <Check size={14} /> : <Clipboard size={14} />}{buttonLabel}
  </button>;
}

export function CodeExample({ children, label }: { children: string; label: string }) {
  return <div className="code-example"><div><span>{label}</span><CopyButton value={children} /></div><pre><code>{children}</code></pre></div>;
}
