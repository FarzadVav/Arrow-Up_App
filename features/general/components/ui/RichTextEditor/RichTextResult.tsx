"use client";

import { cn } from "cn";
import { isRichTextEmpty, toEditorHtml } from "@/features/general/lib/richText";

export type RichTextResultProps = {
  content?: string | null;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
};

export function RichTextResult({
  content,
  placeholder,
  className,
  containerClassName,
}: RichTextResultProps) {
  const hasContent = !isRichTextEmpty(content);

  return (
    <div
      className={cn(
        "rounded-component bg-background p-sm",
        containerClassName,
      )}
    >
      {hasContent ? (
        <div
          className={cn(
            "tiptap-content select-text",
            className,
          )}
          dangerouslySetInnerHTML={{ __html: toEditorHtml(content) }}
        />
      ) : placeholder ? (
        <p className="sub-text">{placeholder}</p>
      ) : null}
    </div>
  );
}

export default RichTextResult;
