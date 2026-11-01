"use client";

import { cn } from "cn";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";

import { RichTextToolbar } from "./RichTextToolbar";
import { toEditorHtml } from "@/features/general/lib/richText";

export type RichTextEditorProps = {
  value: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
  onEditorReady?: (editor: Editor | null) => void;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  autoFocus = true,
  showToolbar = true,
  onEditorReady,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write your content here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: toEditorHtml(value),
    autofocus: autoFocus,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-full select-text cursor-text text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (!onChange) return;
      if (currentEditor.isEmpty) {
        onChange("");
      } else {
        onChange(currentEditor.getHTML());
      }
    },
  });

  // Keep content in sync if value changed from outside
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    const normalizedNew = toEditorHtml(value);
    if (value !== currentHtml && normalizedNew !== currentHtml) {
      editor.commands.setContent(normalizedNew || "");
    }
  }, [value, editor]);

  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  return (
    <div className={cn("flex flex-1 flex-col min-h-0 w-full overflow-hidden", className)}>
      {showToolbar ? <RichTextToolbar editor={editor} /> : null}

      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-md py-4 cursor-text"
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus("end");
          }
        }}
      >
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </div>
  );
}

export default RichTextEditor;
