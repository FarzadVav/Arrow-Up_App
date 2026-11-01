"use client";

import { cn } from "cn";
import { ReactNode, useMemo, useState } from "react";
import { CheckIcon, Maximize2Icon, SearchIcon, XIcon } from "lucide-react";
import Field from "../Field";

import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export type SelectDialogItem<T = string | number> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

export type BaseSelectDialogProps<T = string | number> = {
  title?: string;
  name?: string;
  open?: boolean;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  description?: string;
  searchable?: boolean;
  placeholder?: string;
  items: SelectDialogItem<T>[];
  onOpenChange?: (open: boolean) => void;
};

export type SingleSelectDialogProps<T = string | number> =
  BaseSelectDialogProps<T> & {
    multiple?: false;
    value?: T | null;
    onChange?: (value: T) => void;
    onValueChange?: (value: T) => void;
    renderValue?: (value: T | null | undefined) => ReactNode;
  };

export type MultiSelectDialogProps<T = string | number> =
  BaseSelectDialogProps<T> & {
    multiple: true;
    value?: T[] | null;
    onChange?: (value: T[]) => void;
    onValueChange?: (value: T[]) => void;
    renderValue?: (value: T[] | null | undefined) => ReactNode;
  };

export type SelectDialogProps<T = string | number> =
  | SingleSelectDialogProps<T>
  | MultiSelectDialogProps<T>;

function checkSelected<T>(
  val: T,
  target: T | T[] | null | undefined,
  multiple?: boolean,
): boolean {
  if (target === null || target === undefined) return false;
  if (multiple) {
    if (!Array.isArray(target)) return false;
    return target.some((v) => String(v) === String(val));
  }
  return String(target) === String(val);
}

export function SelectDialog<T = string | number>(props: SelectDialogProps<T>) {
  const {
    name,
    items,
    title,
    className,
    searchable,
    description,
    placeholder,
    onOpenChange,
    disabled = false,
    multiple = false,
    open: controlledOpen,
  } = props;

  const value = props.value;
  const onChange = props.onChange as ((v: unknown) => void) | undefined;
  const onValueChange = props.onValueChange as
    | ((v: unknown) => void)
    | undefined;
  const renderValue = props.renderValue as
    | ((v: unknown) => ReactNode)
    | undefined;

  const { t } = useLocale();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [stagedValues, setStagedValues] = useState<T[]>(() => {
    if (multiple) {
      return Array.isArray(value)
        ? [...(value as T[])]
        : value != null
          ? [value as T]
          : [];
    }
    return [];
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && multiple) {
      setStagedValues(
        Array.isArray(value)
          ? [...(value as T[])]
          : value != null
            ? [value as T]
            : [],
      );
    }
    if (!nextOpen) {
      setSearchQuery("");
    }
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const notifyChange = (nextValue: unknown) => {
    onChange?.(nextValue);
    onValueChange?.(nextValue);
  };

  const handleSingleSelect = (itemValue: T) => {
    notifyChange(itemValue);
    handleOpenChange(false);
  };

  const handleToggleMultiple = (itemValue: T) => {
    setStagedValues((prev) => {
      const exists = prev.some((v) => String(v) === String(itemValue));
      if (exists) {
        return prev.filter((v) => String(v) !== String(itemValue));
      } else {
        return [...prev, itemValue];
      }
    });
  };

  const handleConfirmMultiple = () => {
    notifyChange(stagedValues);
    handleOpenChange(false);
  };

  // Compute label shown in the trigger
  const displayLabel = useMemo(() => {
    if (renderValue) {
      return renderValue(value);
    }

    if (multiple) {
      const selected = items.filter((item) =>
        checkSelected(item.value, value as T[] | null | undefined, true),
      );
      if (selected.length === 0) {
        return placeholder || t("common.select");
      }
      return selected
        .map((item) =>
          typeof item.label === "string" ? item.label : String(item.value),
        )
        .join(", ");
    }

    const selected = items.find((item) =>
      checkSelected(item.value, value as T | null | undefined, false),
    );
    if (!selected) {
      return placeholder || t("common.select");
    }
    return selected.label;
  }, [items, value, multiple, renderValue, placeholder, t]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const labelText =
        typeof item.label === "string" ? item.label : String(item.value);
      return labelText.toLowerCase().includes(q);
    });
  }, [items, searchQuery]);

  const showSearch = searchable ?? items.length >= 6;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn("justify-between", className)}>
            {displayLabel}
            <Maximize2Icon />
          </Button>
        }>
        <Dialog.Title className="title">
          {title || placeholder || t("common.select")}
        </Dialog.Title>

        <Dialog.Close
          render={
            <Button
              size={"square"}
              type="button"
              variant="ghost"
              aria-label={t("common.close")}>
              <XIcon />
            </Button>
          }
        />

        {description ? (
          <Dialog.Description className="sub-text">
            {description}
          </Dialog.Description>
        ) : null}

        {showSearch && (
          <Field
            type="text"
            value={searchQuery}
            placeholder={t("common.search")}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<SearchIcon />}
            endAdornment={
              searchQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  aria-label={t("common.clear")}
                  className="h-auto w-auto p-0.5 rounded-none opacity-50 hover:opacity-100 hover:bg-transparent">
                  <XIcon />
                </Button>
              ) : null
            }
          />
        )}

        {multiple && items.length > 2 && (
          <div className="flex items-center justify-between text-xs px-1">
            <span>
              {stagedValues.length} / {items.length} {t("common.selected")}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setStagedValues(
                    items.filter((i) => !i.disabled).map((i) => i.value),
                  )
                }
                className="h-auto w-auto p-0 rounded-none underline hover:bg-transparent">
                {t("common.all")}
              </Button>
              <span>·</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStagedValues([])}
                className="h-auto w-auto p-0 rounded-none underline hover:bg-transparent">
                {t("common.clear")}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-xs">
          {filteredItems.length === 0 ? (
            <div className="text-center">{t("common.noResults")}</div>
          ) : (
            filteredItems.map((item) => {
              const isSelectedItem = multiple
                ? checkSelected(item.value, stagedValues, true)
                : checkSelected(
                    item.value,
                    value as T | null | undefined,
                    false,
                  );

              return (
                <Button
                  type="button"
                  key={String(item.value)}
                  disabled={item.disabled}
                  className={"w-full justify-between"}
                  variant={isSelectedItem ? "primary" : "outline"}
                  onClick={() => {
                    if (multiple) {
                      handleToggleMultiple(item.value);
                    } else {
                      handleSingleSelect(item.value);
                    }
                  }}>
                  <span className="truncate">{item.label}</span>
                  {isSelectedItem && <CheckIcon className="shrink-0" />}
                </Button>
              );
            })
          )}
        </div>

        {multiple && (
          <div className="flex items-center gap-sm *:w-1/2">
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="card"
                  onClick={() => handleOpenChange(false)}>
                  {t("common.cancel")}
                </Button>
              }
            />
            <Button type="button" onClick={handleConfirmMultiple}>
              {t("common.confirm")}
            </Button>
          </div>
        )}
      </Dialog>

      {name ? (
        <Field.Root className="hidden" name={name}>
          <Field.Control
            type="hidden"
            name={name}
            value={
              multiple
                ? Array.isArray(value)
                  ? (value as unknown[]).join(",")
                  : ""
                : value != null
                  ? String(value)
                  : ""
            }
          />
        </Field.Root>
      ) : null}
    </>
  );
}

export default SelectDialog;
