"use client";

import { cn } from "cn";
import { toEditorHtml } from "@/features/general/lib/utils";

type RichTextViewerProps = {
  content: string | null | undefined;
  className?: string;
};

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  if (!content) {
    return null;
  }

  const html = toEditorHtml(content);

  return (
    <div
      className={cn("tiptap-content text-sm leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default RichTextViewer;
