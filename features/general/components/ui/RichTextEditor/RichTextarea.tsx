"use client";

import { cn } from "cn";
import { useState } from "react";
import { Maximize2Icon, TextIcon } from "lucide-react";

import Field from "../Field";
import { RichTextDialog } from "./RichTextDialog";
import { RichTextResult } from "./RichTextResult";
import { isRichTextEmpty, stripHtml } from "@/features/general/lib/utils";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export type RichTextareaProps = {
  value: string;
  title?: string;
  name?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
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
          "card flex-col group relative min-h-30",
          isEmpty ? "justify-center items-center" : "",
          className,
        )}
        aria-label={title || resolvedPlaceholder}
      >
        {isEmpty ? (
          <>
            <p className="sub-text">{resolvedPlaceholder}</p>
            <span className="inline-flex items-center gap-sm">
              <span>{t("editor.fullscreen")}</span>
              <TextIcon />
            </span>
          </>
        ) : (
          <>
            <RichTextResult
              content={value}
              containerClassName="min-h-full"
              className="line-clamp-6 overflow-hidden"
            />

            <p className="inline-flex items-center gap-sm mx-auto">
              <span className="sub-text">Tap to edit</span>
              <Maximize2Icon />
            </p>
          </>
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
