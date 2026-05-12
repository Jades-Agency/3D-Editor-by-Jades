"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { generateFormattedCode } from "@/lib/codeGen";
import { useStore } from "@/lib/store";
import { Copy, Check, X } from "lucide-react";
import { tags } from "@lezer/highlight";

interface CodeOutputProps {
  onClose: () => void;
}

/** Syntax colors for dark panel (Palenight-style, readable on dark gray). */
const darkSyntaxHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c792ea", fontWeight: "500" },
  { tag: tags.operator, color: "#89ddff" },
  { tag: tags.special(tags.variableName), color: "#82aaff" },
  { tag: tags.typeName, color: "#ffcb6b" },
  { tag: tags.atom, color: "#f78c6c" },
  { tag: tags.number, color: "#f78c6c" },
  { tag: tags.definition(tags.variableName), color: "#82aaff" },
  { tag: tags.string, color: "#c3e88d" },
  { tag: tags.special(tags.string), color: "#c3e88d" },
  { tag: tags.comment, color: "#676e95", fontStyle: "italic" },
  { tag: tags.variableName, color: "#89ddff" },
  { tag: tags.function(tags.variableName), color: "#82aaff" },
  { tag: tags.meta, color: "#89ddff" },
]);

/** Deeper tones for light backgrounds (panel ~ white / off-white). */
const lightSyntaxHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#6d28d9", fontWeight: "600" },
  { tag: tags.operator, color: "#0369a1" },
  { tag: tags.special(tags.variableName), color: "#1d4ed8" },
  { tag: tags.typeName, color: "#a16207" },
  { tag: tags.atom, color: "#c2410c" },
  { tag: tags.number, color: "#c2410c" },
  { tag: tags.definition(tags.variableName), color: "#1d4ed8" },
  { tag: tags.string, color: "#15803d" },
  { tag: tags.special(tags.string), color: "#15803d" },
  { tag: tags.comment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.variableName, color: "#0e7490" },
  { tag: tags.function(tags.variableName), color: "#1e40af" },
  { tag: tags.meta, color: "#0f766e" },
]);

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "12px",
    background: "var(--panel-bg)",
    color: "var(--foreground)",
  },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
  },
  ".cm-gutters": {
    background: "var(--panel-bg)",
    color: "var(--text-muted)",
    border: "none",
  },
  ".cm-activeLineGutter": {
    background: "var(--input-bg)",
  },
  ".cm-activeLine": {
    background: "var(--input-bg)",
  },
  ".cm-selectionBackground": {
    background: "var(--primary) !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    background: "var(--primary) !important",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--primary)",
  },
  ".cm-line": {
    padding: "0 4px",
  },
});

export default function CodeOutput({ onClose }: CodeOutputProps) {
  const theme = useStore((s) => s.theme);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const init = async () => {
      const code = await generateFormattedCode();

      if (viewRef.current) {
        viewRef.current.destroy();
      }

      const syntaxStyle =
        theme === "dark" ? darkSyntaxHighlightStyle : lightSyntaxHighlightStyle;

      const view = new EditorView({
        doc: code,
        extensions: [
          basicSetup,
          javascript(),
          editorTheme,
          syntaxHighlighting(syntaxStyle),
          EditorView.editable.of(false),
          EditorView.theme({
            "&": { height: "100%", fontSize: "13px" },
            ".cm-scroller": { overflow: "auto" },
          }),
        ],
        parent: editorRef.current!,
      });

      viewRef.current = view;
    };

    init();

    return () => {
      viewRef.current?.destroy();
    };
  }, [theme]);

  const handleCopy = async () => {
    if (!viewRef.current) return;
    const code = viewRef.current.state.doc.toString();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg rounded-lg border border-panel-border">
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Generated Code
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-sm transition-colors text-text-muted hover:bg-black/5 dark:hover:bg-white/10"
            title="Export code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm transition-colors text-text-muted hover:bg-black/5 dark:hover:bg-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
