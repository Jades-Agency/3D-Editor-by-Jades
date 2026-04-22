"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { generateFormattedCode } from "@/lib/codeGen";
import { Copy, Check } from "lucide-react";

export default function CodeOutput() {
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
          oneDark,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[90%] max-w-4xl h-[80%] bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h2 className="text-white font-medium">Generated Code</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        <div ref={editorRef} className="flex-1 overflow-hidden" />
      </div>
    </div>
  );
}
