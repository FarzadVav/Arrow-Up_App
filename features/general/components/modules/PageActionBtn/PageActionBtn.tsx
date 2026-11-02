"use client";

import { cn } from "cn";
import Link from "next/link";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useMounted } from "@mantine/hooks";
import { createPortal, useFormStatus } from "react-dom";
import { CheckIcon, LoaderIcon, PlusIcon } from "lucide-react";

import { Button, ButtonProps } from "../../ui/Button/Button";
import { useLocale } from "../LocaleProvider/LocaleProvider";

type PageActionBtnProps = ButtonProps & {
  href?: string;
  submit?: boolean;
  icon?: ReactNode;
  form?: string;
};

function PageActionBtn({
  href,
  submit,
  icon,
  children,
  disabled,
  className,
  variant = "primary",
  form: formProp,
  onClick,
  ...p
}: PageActionBtnProps) {
  const isMounted = useMounted();
  const { pending } = useFormStatus();
  const { t } = useLocale();
  const markerRef = useRef<HTMLSpanElement>(null);
  const [autoFormId, setAutoFormId] = useState<string | undefined>(undefined);

  const isDisabled = disabled || pending;
  const activeFormId = formProp || autoFormId;

  // Resolve associated form element
  const getTargetForm = useCallback((): HTMLFormElement | null => {
    if (activeFormId) {
      const el = document.getElementById(activeFormId);
      if (el instanceof HTMLFormElement) return el;
    }
    const formFromMarker = markerRef.current?.closest("form");
    if (formFromMarker instanceof HTMLFormElement) {
      return formFromMarker;
    }
    return document.querySelector("form");
  }, [activeFormId]);

  // Discover and associate with parent form if not explicitly provided
  useEffect(() => {
    if (formProp || !submit) return;

    const form = markerRef.current?.closest("form") || document.querySelector("form");
    if (form instanceof HTMLFormElement) {
      if (!form.id) {
        form.id = `form-${Math.random().toString(36).slice(2, 9)}`;
      }
      setAutoFormId((prev) => (prev !== form.id ? form.id : prev));
    }
  }, [formProp, submit]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    (onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (submit) {
      event.preventDefault();
      const targetForm = getTargetForm();
      if (targetForm) {
        try {
          targetForm.requestSubmit();
        } catch {
          targetForm.submit();
        }
      }
    }
  };

  const computedChildren = children || (submit ? t("common.submit") : null);

  if (!isMounted) {
    return (
      <>
        <span ref={markerRef} style={{ display: "none" }} aria-hidden="true" />
        <Button id="page-action-btn" className="hidden" />
      </>
    );
  }

  const leftIcon = icon !== undefined ? icon : !submit ? <PlusIcon /> : null;

  return (
    <>
      <span
        ref={markerRef}
        style={{ display: "none" }}
        aria-hidden="true"
        data-page-action-marker=""
      />
      {createPortal(
        <Button
          id="page-action-btn"
          variant={variant}
          nativeButton={!href}
          disabled={isDisabled}
          type={submit ? "submit" : "button"}
          form={activeFormId}
          render={href ? <Link href={href} /> : undefined}
          className={cn("fixed bottom-21 left-1/2 -translate-x-1/2", className)}
          onClick={handleClick}
          {...p}
        >
          {leftIcon}
          {computedChildren && <span>{computedChildren}</span>}
          {submit ? <CheckIcon /> : null}

          {pending && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground text-background">
              <LoaderIcon className="animate-spin" />
            </span>
          )}
        </Button>,
        document.body,
      )}
    </>
  );
}

export default PageActionBtn;
export type { PageActionBtnProps };
