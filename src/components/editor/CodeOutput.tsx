"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { generateFormattedCode } from "@/lib/codeGen";
import { Copy, Check, X } from "lucide-react";

import { tags } from "@lezer/highlight";

interface CodeOutputProps {
  onClose: () => void;
}

const mutedHighlightStyle = HighlightStyle.define([
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

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
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
  ".cm-scroller": {
    padding: "16px 0",
  },
});

export default function CodeOutput({ onClose }: CodeOutputProps) {
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

      const view = new EditorView({
        doc: code,
        extensions: [
          basicSetup,
          javascript(),
          editorTheme,
          syntaxHighlighting(mutedHighlightStyle),
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
  }, []);

  const handleCopy = async () => {
    if (!viewRef.current) return;
    const code = viewRef.current.state.doc.toString();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[90%] max-w-4xl h-[80%] rounded-2xl overflow-hidden flex flex-col bg-panel-bg border border-panel-border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
          <h2 className="text-sm font-semibold text-foreground">
            Generated Code
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg transition-colors text-text-muted"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors text-text-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={editorRef} className="flex-1 overflow-hidden" />
      </div>
    </div>
  );
}
