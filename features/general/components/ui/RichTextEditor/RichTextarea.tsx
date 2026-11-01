"use client";

import { useState } from "react";
import Field from "../Field";
import { Maximize2Icon, PenLineIcon } from "lucide-react";
import { cn } from "cn";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { RichTextDialog } from "./RichTextDialog";
import { RichTextResult } from "./RichTextResult";
import { isRichTextEmpty, stripHtml } from "@/features/general/lib/richText";

export type RichTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  name?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  minHeight?: string;
};

export function RichTextarea({
  value,
  onChange,
  placeholder,
  title,
  name,
  required,
  minLength,
  className,
  minHeight = "min-h-[140px]",
}: RichTextareaProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const isEmpty = isRichTextEmpty(value);
  const resolvedPlaceholder = placeholder || t("editor.clickToWrite");

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "group relative w-full rounded-component border p-3.5 text-sm cursor-pointer",
          "bg-card hover:border-foreground/40 transition-all select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
          minHeight,
          className,
        )}
        aria-label={title || resolvedPlaceholder}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-md text-center">
            <p className="sub-text text-sm">{resolvedPlaceholder}</p>
            <span className="mt-sm inline-flex items-center gap-xs rounded-container bg-card-thick px-sm py-1 text-xs font-medium text-foreground/80 transition-colors group-hover:bg-foreground group-hover:text-background">
              <PenLineIcon className="size-3.5" />
              <span>{t("editor.fullscreen")}</span>
            </span>
          </div>
        ) : (
          <div>
            <RichTextResult
              content={value}
              containerClassName="bg-transparent p-0 rounded-none"
              className="line-clamp-6 overflow-hidden"
            />

            <span className="absolute top-2.5 end-2.5 inline-flex items-center gap-1 rounded-component bg-card-thick px-2 py-0.5 text-xs font-medium text-foreground/70 opacity-70 transition-opacity group-hover:opacity-100">
              <Maximize2Icon className="size-3" />
              <span>{t("common.edit")}</span>
            </span>
          </div>
        )}

        {/* Hidden control for HTML5 / Base UI form validation */}
        <Field.Control
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none"
          name={name}
          value={stripHtml(value).trim()}
          required={required}
          minLength={minLength}
          onChange={() => { }}
        />
      </div>

      <RichTextDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
        title={title}
        placeholder={resolvedPlaceholder}
      />
    </>
  );
}

export default RichTextarea;
