"use client";

import { cn } from "cn";
import { type Editor } from "@tiptap/react";
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  PilcrowIcon,
  BoldIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

type RichTextToolbarProps = {
  editor: Editor | null;
  className?: string;
};

export function RichTextToolbar({ editor, className }: RichTextToolbarProps) {
  const { t } = useLocale();

  if (!editor) {
    return null;
  }

  const isH1Active = editor.isActive("heading", { level: 1 });
  const isH2Active = editor.isActive("heading", { level: 2 });
  const isH3Active = editor.isActive("heading", { level: 3 });
  const isParagraphActive = editor.isActive("paragraph");
  const isBoldActive = editor.isActive("bold");
  const isBulletListActive = editor.isActive("bulletList");
  const isOrderedListActive = editor.isActive("orderedList");

  const chipClasses = (active: boolean) =>
    cn(
      "size-8 rounded-component p-0 flex items-center justify-center transition-colors",
      active
        ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
        : "bg-card-thick/80 hover:bg-card-thick ",
    );

  return (
    <div
      className={cn(
        "sticky top-0 z-20 shrink-0 flex flex-wrap items-center gap-xs bg-card/90 px-sm py-xs backdrop-blur-md",
        className,
      )}
      role="toolbar"
      aria-label={t("editor.toolbar")}>
      {/* H1 */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={chipClasses(isH1Active)}
        title={t("editor.h1")}
        aria-label={t("editor.h1")}
        aria-pressed={isH1Active}>
        <Heading1Icon />
      </Button>

      {/* H2 */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={chipClasses(isH2Active)}
        title={t("editor.h2")}
        aria-label={t("editor.h2")}
        aria-pressed={isH2Active}>
        <Heading2Icon />
      </Button>

      {/* H3 */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={chipClasses(isH3Active)}
        title={t("editor.h3")}
        aria-label={t("editor.h3")}
        aria-pressed={isH3Active}>
        <Heading3Icon />
      </Button>

      {/* Paragraph */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
        }}
        className={chipClasses(isParagraphActive)}
        title={t("editor.paragraph")}
        aria-label={t("editor.paragraph")}
        aria-pressed={isParagraphActive}>
        <PilcrowIcon />
      </Button>

      {/* Bold */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={chipClasses(isBoldActive)}
        title={t("editor.bold")}
        aria-label={t("editor.bold")}
        aria-pressed={isBoldActive}>
        <BoldIcon />
      </Button>

      {/* Bullet List */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={chipClasses(isBulletListActive)}
        title={t("editor.bulletList")}
        aria-label={t("editor.bulletList")}
        aria-pressed={isBulletListActive}>
        <ListIcon />
      </Button>

      {/* Number List */}
      <Button
        type="button"
        variant="ghost"
        size={"square"}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={chipClasses(isOrderedListActive)}
        title={t("editor.numberList")}
        aria-label={t("editor.numberList")}
        aria-pressed={isOrderedListActive}>
        <ListOrderedIcon />
      </Button>
    </div>
  );
}

export default RichTextToolbar;
