"use client";

import { cn } from "cn";
import { ReactNode, useMemo, useState } from "react";
import { CheckIcon, Maximize2Icon, SearchIcon, XIcon } from "lucide-react";

import Field from "../Field";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

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
    return target.some(
      (v) => String(v).toLowerCase() === String(val).toLowerCase(),
    );
  }
  return String(target).toLowerCase() === String(val).toLowerCase();
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
      const exists = prev.some(
        (v) => String(v).toLowerCase() === String(itemValue).toLowerCase(),
      );
      if (exists) {
        return prev.filter(
          (v) => String(v).toLowerCase() !== String(itemValue).toLowerCase(),
        );
      } else {
        return [...prev, itemValue];
      }
    });
  };

  const handleConfirmMultiple = () => {
    notifyChange(stagedValues);
    handleOpenChange(false);
  };

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
      if (value != null && String(value) !== "none" && String(value).trim() !== "") {
        return String(value);
      }
      return placeholder || t("common.select");
    }
    return selected.label;
  }, [items, value, multiple, renderValue, placeholder, t]);

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

        {description ? (
          <Dialog.Description className="sub-text">
            {description}
          </Dialog.Description>
        ) : null}

        {showSearch && (
          <Field
            type="text"
            value={searchQuery}
            startAdornment={<SearchIcon />}
            placeholder={t("common.search")}
            onChange={(e) => setSearchQuery(e.target.value)}
            endAdornment={
              searchQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={t("common.clear")}
                  onClick={() => setSearchQuery("")}
                  className="h-full w-auto aspect-square"
                >
                  <XIcon />
                </Button>
              ) : null
            }
          />
        )}

        {multiple && items.length > 2 && (
          <div className="flex items-center justify-between">
            <span>
              {stagedValues.length} / {items.length} {t("common.selected")}
            </span>
            <div className="flex items-center gap-xs">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setStagedValues(
                    items.filter((i) => !i.disabled).map((i) => i.value),
                  )
                }>
                {t("common.all")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStagedValues([])}>
                {t("common.clear")}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-xs">
          {filteredItems.length === 0 ? (
            <p className="text-center sub-text">
              {t("common.noResults")}
            </p>
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
                  size={"full"}
                  key={String(item.value)}
                  disabled={item.disabled}
                  className={"justify-between"}
                  variant={isSelectedItem ? "primary" : "outline"}
                  onClick={() => {
                    if (multiple) {
                      handleToggleMultiple(item.value);
                    } else {
                      handleSingleSelect(item.value);
                    }
                  }}>
                  <span className="truncate">{item.label}</span>
                  {isSelectedItem && <CheckIcon />}
                </Button>
              );
            })
          )}
        </div>

        <div className="actions-footer">
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
          {multiple && (
            <Button type="button" onClick={handleConfirmMultiple}>
              {t("common.confirm")}
            </Button>
          )}
        </div>
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
