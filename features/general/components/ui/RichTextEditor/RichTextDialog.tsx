"use client";

import { useState, useEffect } from "react";
import { Dialog as BaseUIDialog } from "@base-ui/react";
import { type Editor } from "@tiptap/react";
import { Undo2Icon, Redo2Icon } from "lucide-react";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { RichTextEditor } from "./RichTextEditor";
import { isRichTextEmpty } from "@/features/general/lib/richText";

export type RichTextDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  title?: string;
  placeholder?: string;
};

export function RichTextDialog({
  open,
  onOpenChange,
  value,
  onChange,
  title,
  placeholder,
}: RichTextDialogProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState(value);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Sync draft when opened or when value changes from parent
  useEffect(() => {
    if (open) {
      queueMicrotask(() => setDraft(value));
    }
  }, [open, value]);

  // Sync undo/redo availability on editor transactions
  useEffect(() => {
    if (!editor) {
      queueMicrotask(() => {
        setCanUndo(false);
        setCanRedo(false);
      });
      return;
    }

    const updateHistory = () => {
      setCanUndo(editor.can().undo());
      setCanRedo(editor.can().redo());
    };

    updateHistory();
    editor.on("transaction", updateHistory);
    return () => {
      editor.off("transaction", updateHistory);
    };
  }, [editor]);

  const handleSaveAndClose = () => {
    const finalValue = isRichTextEmpty(draft) ? "" : draft;
    onChange(finalValue);
    onOpenChange(false);
  };

  const handleCancelAndClose = () => {
    // Save current changes on close as well so user doesn't lose their input
    const finalValue = isRichTextEmpty(draft) ? "" : draft;
    onChange(finalValue);
    onOpenChange(false);
  };

  return (
    <BaseUIDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseUIDialog.Portal>
        <BaseUIDialog.Backdrop className="fixed inset-0 z-big-overlay bg-background/80 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <BaseUIDialog.Popup className="fixed inset-0 z-big-overlay h-dvh w-screen bg-background transition-all duration-200 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <div className="mx-auto max-w-3xl flex flex-col h-full overflow-hidden">
            {/* Header with Title and Undo/Redo in a justify-between flex */}
            <header className="flex h-14 shrink-0 items-center justify-between bg-card/40 px-4 sm:px-md backdrop-blur-md">
              <BaseUIDialog.Title className="text-base font-bold">
                {title || t("editor.fullscreen") || t("common.content")}
              </BaseUIDialog.Title>

              <div className="flex items-center gap-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size={"square"}
                  disabled={!canUndo}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor?.chain().focus().undo().run();
                  }}
                  className="size-8 rounded-component p-0 flex items-center justify-center transition-colors hover:bg-card-thick disabled:opacity-30"
                  title={t("editor.undo")}
                  aria-label={t("editor.undo")}>
                  <Undo2Icon />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size={"square"}
                  disabled={!canRedo}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor?.chain().focus().redo().run();
                  }}
                  className="size-8 rounded-component p-0 flex items-center justify-center transition-colors hover:bg-card-thick disabled:opacity-30"
                  title={t("editor.redo")}
                  aria-label={t("editor.redo")}>
                  <Redo2Icon />
                </Button>
              </div>
            </header>

            {/* Full Screen TipTap Rich Text Editor */}
            <RichTextEditor
              autoFocus
              value={draft}
              onChange={setDraft}
              placeholder={placeholder}
              onEditorReady={setEditor}
              className="flex-1 min-h-0"
            />

            {/* Footer with Close and Done actions */}
            <footer className="flex h-14 shrink-0 items-center justify-end gap-sm bg-card/40 px-4 sm:px-md backdrop-blur-md [&>button]:w-1/2">
              <Button
                type="button"
                variant="card"
                onClick={handleCancelAndClose}
                className="h-9 px-4 text-sm font-medium">
                <span>{t("common.close")}</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleSaveAndClose}
                className="h-9 px-5 text-sm font-semibold">
                <span>{t("common.done")}</span>
              </Button>
            </footer>
          </div>
        </BaseUIDialog.Popup>
      </BaseUIDialog.Portal>
    </BaseUIDialog.Root>
  );
}

export default RichTextDialog;
