"use client";

import { cn } from "cn";
import { type } from "arktype";
import { Field as BaseUIField, type Form } from "@base-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ComponentProps,
  forwardRef,
  ReactElement,
  ReactNode,
  useMemo,
  ChangeEventHandler,
  FocusEventHandler,
} from "react";

type ArkTypeErrorProblem = {
  message?: string;
  summary?: string;
};

type ArkTypeSchemaLike = {
  (value: unknown): unknown;
  get?: (key: string) => unknown;
};

/**
 * Creates an ArkType validation function compatible with Base UI Field.Root's `validate` prop.
 * Supports both standalone ArkType types (e.g. `type('string >= 3')`) and object schemas (e.g. `CreateFrameworkSchema`).
 */
export function createArkTypeValidator(schema: unknown, name?: string) {
  if (!schema) return undefined;

  const candidate = schema as ArkTypeSchemaLike;
  let fieldValidator: ((val: unknown) => unknown) | undefined;

  if (name && typeof candidate.get === "function") {
    const propertyValidator = candidate.get(name);
    if (typeof propertyValidator === "function") {
      fieldValidator = propertyValidator as (val: unknown) => unknown;
    }
  }

  if (!fieldValidator && typeof candidate === "function") {
    fieldValidator = candidate;
  }

  if (!fieldValidator) return undefined;

  let isOptional = false;
  try {
    const undefRes = fieldValidator(undefined);
    isOptional = !(undefRes instanceof type.errors);
  } catch {
    isOptional = false;
  }

  return (value: unknown): string[] | null => {
    // Treat empty string / null / undefined as empty value
    if (value === "" || value === null || value === undefined) {
      if (isOptional) {
        return null;
      }
      const emptyRes = fieldValidator(value === "" ? "" : undefined);
      if (emptyRes instanceof type.errors) {
        return Array.from(emptyRes).map(
          (p) =>
            (p as ArkTypeErrorProblem).message ||
            (p as ArkTypeErrorProblem).summary ||
            String(p),
        );
      }
      return null;
    }

    const res = fieldValidator(value);

    // Coerce numeric string if schema expects a number (e.g. for HTML input or hidden id)
    if (
      res instanceof type.errors &&
      typeof value === "string" &&
      value.trim() !== "" &&
      !isNaN(Number(value))
    ) {
      const numRes = fieldValidator(Number(value));
      if (!(numRes instanceof type.errors)) {
        return null;
      }
    }

    if (res instanceof type.errors) {
      return Array.from(res).map(
        (p) =>
          (p as ArkTypeErrorProblem).message ||
          (p as ArkTypeErrorProblem).summary ||
          String(p),
      );
    }

    return null;
  };
}

const fieldInputVariants = cva(
  [
    "w-full border-2 bg-transparent transition-all",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-text cursor-text",
  ],
  {
    variants: {
      multiline: {
        true: "rounded-component p-sm resize-none min-h-[calc(var(--spacing)*20)] focus:rounded-container",
        false:
          "h-10 rounded-component px-sm focus:rounded-[calc(var(--spacing)*10)]",
      },
      hasStartAdornment: {
        true: "ps-lg",
        false: "",
      },
      hasEndAdornment: {
        true: "pe-lg",
        false: "",
      },
    },
    defaultVariants: {
      multiline: false,
      hasStartAdornment: false,
      hasEndAdornment: false,
    },
  },
);

const fieldLabelVariants = cva("block font-bold select-none", {
  variants: {
    size: {
      sm: "text-xs mb-xs",
      md: "text-sm mb-xs",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const fieldErrorVariants = cva(
  "sub-text mt-xs block leading-normal [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-xs",
  {
    variants: {
      variant: {
        default: "",
        destructive: "font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/* -------------------------------------------------------------------------------------------------
 * Field.Root
 * -----------------------------------------------------------------------------------------------*/

export type FieldRootProps = ComponentProps<typeof BaseUIField.Root> & {
  schema?: unknown;
};

const FieldRoot = forwardRef<HTMLDivElement, FieldRootProps>(
  (
    { name, schema, validate, validationMode = "onBlur", className, ...props },
    ref,
  ) => {
    const arkValidator = useMemo(() => {
      return createArkTypeValidator(schema, name);
    }, [schema, name]);

    const handleValidate = useMemo(() => {
      if (!arkValidator && !validate) return undefined;
      return (value: unknown, formValues: Form.Values) => {
        if (arkValidator) {
          const arkErrors = arkValidator(value);
          if (arkErrors && arkErrors.length > 0) {
            return arkErrors;
          }
        }
        if (validate) {
          return validate(value, formValues);
        }
        return null;
      };
    }, [arkValidator, validate]);

    return (
      <BaseUIField.Root
        ref={ref}
        name={name}
        validate={handleValidate}
        validationMode={validationMode}
        className={cn("flex flex-col", className)}
        {...props}
      />
    );
  },
);
FieldRoot.displayName = "Field.Root";

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

export type FieldLabelProps = ComponentProps<typeof BaseUIField.Label> &
  VariantProps<typeof fieldLabelVariants>;

const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ size, className, ...props }, ref) => {
    return (
      <BaseUIField.Label
        ref={ref}
        className={cn(fieldLabelVariants({ size }), className)}
        {...props}
      />
    );
  },
);
FieldLabel.displayName = "Field.Label";

/* -------------------------------------------------------------------------------------------------
 * Field.Control
 * -----------------------------------------------------------------------------------------------*/

export type FieldControlProps = ComponentProps<typeof BaseUIField.Control> & {
  multiline?: boolean;
  rows?: number;
};

const FieldControl = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldControlProps
>(({ multiline = false, rows = 3, className, render, ...props }, ref) => {
  if (multiline) {
    return (
      <BaseUIField.Control
        ref={ref as React.Ref<HTMLInputElement>}
        render={
          render ?? (
            <textarea
              rows={rows}
              className={cn(fieldInputVariants({ multiline: true }), className)}
            />
          )
        }
        {...props}
      />
    );
  }

  return (
    <BaseUIField.Control
      ref={ref as React.Ref<HTMLInputElement>}
      render={render}
      className={cn(fieldInputVariants({ multiline: false }), className)}
      {...props}
    />
  );
});
FieldControl.displayName = "Field.Control";

/* -------------------------------------------------------------------------------------------------
 * Field.Input & Field.Textarea convenience components
 * -----------------------------------------------------------------------------------------------*/

export type FieldInputProps = Omit<FieldControlProps, "multiline">;

const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  (props, ref) => {
    return <FieldControl ref={ref} multiline={false} {...props} />;
  },
);
FieldInput.displayName = "Field.Input";

export type FieldTextareaProps = Omit<FieldControlProps, "multiline">;

const FieldTextarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>(
  (props, ref) => {
    return <FieldControl ref={ref} multiline {...props} />;
  },
);
FieldTextarea.displayName = "Field.Textarea";

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

export type FieldDescriptionProps = ComponentProps<
  typeof BaseUIField.Description
>;

const FieldDescription = forwardRef<HTMLDivElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <BaseUIField.Description
        ref={ref}
        className={cn("sub-text mt-xs", className)}
        {...props}
      />
    );
  },
);
FieldDescription.displayName = "Field.Description";

/* -------------------------------------------------------------------------------------------------
 * Field.Error
 * -----------------------------------------------------------------------------------------------*/

export type FieldErrorProps = ComponentProps<typeof BaseUIField.Error> &
  VariantProps<typeof fieldErrorVariants> & {
    error?: ReactNode;
  };

const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ variant, className, error, children, match, ...props }, ref) => {
    const customContent =
      error != null && error !== ""
        ? error
        : children != null && children !== ""
          ? children
          : undefined;

    if (customContent !== undefined) {
      return (
        <BaseUIField.Error
          ref={ref}
          match={match ?? true}
          className={cn(fieldErrorVariants({ variant }), className)}
          {...props}>
          {customContent}
        </BaseUIField.Error>
      );
    }

    return (
      <BaseUIField.Error
        ref={ref}
        match={match}
        className={cn(fieldErrorVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
FieldError.displayName = "Field.Error";

/* -------------------------------------------------------------------------------------------------
 * Field.FormError (Generic / Server / Unknown Form Errors)
 * -----------------------------------------------------------------------------------------------*/

export type FieldFormErrorProps = ComponentProps<"div"> & {
  message?: string | null;
  errors?: Record<string, string[] | undefined> | null;
  knownFields?: string[];
};

const FieldFormError = forwardRef<HTMLDivElement, FieldFormErrorProps>(
  ({ message, errors, knownFields, className, children, ...props }, ref) => {
    const messages: string[] = [];
    if (message) {
      messages.push(message);
    }
    if (errors) {
      for (const [key, value] of Object.entries(errors)) {
        if (!value) continue;
        if (
          !knownFields ||
          key === "general" ||
          key === "server" ||
          key === "root" ||
          !knownFields.includes(key)
        ) {
          const arr = Array.isArray(value) ? value : [value];
          for (const msg of arr) {
            if (msg && !messages.includes(msg)) {
              messages.push(msg);
            }
          }
        }
      }
    }

    if (messages.length === 0 && !children) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "p-sm rounded-component bg-card border border-card-thick sub-text leading-relaxed space-y-xs",
          className,
        )}
        {...props}>
        {children ??
          (messages.length === 1 ? (
            <p className="sub-text leading-normal">
              {messages[0]}
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-xs sub-text leading-normal">
              {messages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          ))}
      </div>
    );
  },
);
FieldFormError.displayName = "Field.FormError";

/* -------------------------------------------------------------------------------------------------
 * Main LocalField Component
 * -----------------------------------------------------------------------------------------------*/

export type FieldProps = {
  name?: string;
  label?: ReactNode;
  labelSize?: "sm" | "md";
  description?: ReactNode;
  error?: ReactNode;
  errors?: string[];
  schema?: unknown;

  multiline?: boolean;
  rows?: number;
  type?: string;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;

  validate?: FieldRootProps["validate"];
  validationMode?: FieldRootProps["validationMode"];
  validationDebounceTime?: number;
  invalid?: boolean;
  disabled?: boolean;
  dirty?: boolean;
  touched?: boolean;

  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  children?: ReactNode;
  renderControl?: ReactElement;
  id?: string;
} & Omit<
  ComponentProps<"input">,
  "size" | "value" | "defaultValue" | "onChange" | "children"
>;

const LocalField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldProps
>(
  (
    {
      name,
      label,
      labelSize = "md",
      description,
      error,
      errors,
      schema,
      multiline,
      rows = 3,
      type = "text",
      startAdornment,
      endAdornment,
      className,
      labelClassName,
      inputClassName,
      descriptionClassName,
      errorClassName,
      validate,
      validationMode = "onBlur",
      validationDebounceTime,
      invalid,
      disabled,
      dirty,
      touched,
      value,
      defaultValue,
      placeholder,
      required,
      minLength,
      maxLength,
      readOnly,
      autoFocus,
      onChange,
      onBlur,
      children,
      renderControl,
      id,
      ...elementProps
    },
    ref,
  ) => {
    // If hidden input:
    if (type === "hidden") {
      return (
        <BaseUIField.Root className={cn("hidden", className)} name={name}>
          <BaseUIField.Control
            ref={ref as React.Ref<HTMLInputElement>}
            type="hidden"
            name={name}
            value={value}
            defaultValue={defaultValue}
            id={id}
            {...elementProps}
          />
        </BaseUIField.Root>
      );
    }

    // If compound children are provided without label/control:
    if (children) {
      return (
        <FieldRoot
          name={name}
          schema={schema}
          validate={validate}
          validationMode={validationMode}
          validationDebounceTime={validationDebounceTime}
          invalid={invalid}
          disabled={disabled}
          dirty={dirty}
          touched={touched}
          className={className}>
          {children}
        </FieldRoot>
      );
    }

    const isMultiline = multiline || type === "textarea";
    const resolvedError =
      error ?? (errors && errors.length > 0 ? errors.join(", ") : undefined);

    return (
      <FieldRoot
        name={name}
        schema={schema}
        validate={validate}
        validationMode={validationMode}
        validationDebounceTime={validationDebounceTime}
        invalid={invalid}
        disabled={disabled}
        dirty={dirty}
        touched={touched}
        className={cn("w-full", className)}>
        {label ? (
          <FieldLabel size={labelSize} className={labelClassName}>
            {label}
          </FieldLabel>
        ) : null}

        {description ? (
          <FieldDescription className={descriptionClassName}>
            {description}
          </FieldDescription>
        ) : null}

        <div
          className={cn(
            "relative w-full",
            (startAdornment || endAdornment) && "flex items-center",
          )}>
          {startAdornment ? (
            <div className="absolute inset-s-sm top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
              {startAdornment}
            </div>
          ) : null}

          {renderControl ? (
            <BaseUIField.Control render={renderControl} />
          ) : (
            <FieldControl
              ref={ref}
              multiline={isMultiline}
              rows={rows}
              id={id}
              name={name}
              type={isMultiline ? undefined : type}
              value={value}
              defaultValue={defaultValue}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              minLength={minLength}
              maxLength={maxLength}
              readOnly={readOnly}
              autoFocus={autoFocus}
              onChange={onChange}
              onBlur={onBlur}
              className={cn(
                fieldInputVariants({
                  multiline: isMultiline,
                  hasStartAdornment: Boolean(startAdornment),
                  hasEndAdornment: Boolean(endAdornment),
                }),
                inputClassName,
              )}
              {...elementProps}
            />
          )}

          {endAdornment ? (
            <div className="h-[calc(100%-(--spacing(3)))] absolute inset-e-xs top-1/2 -translate-y-1/2 flex items-center z-10 scale-85">
              {endAdornment}
            </div>
          ) : null}
        </div>

        <FieldError className={errorClassName} error={resolvedError} />
      </FieldRoot>
    );
  },
);
LocalField.displayName = "Field";

const Field = Object.assign(LocalField, {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Input: FieldInput,
  Textarea: FieldTextarea,
  Description: FieldDescription,
  Error: FieldError,
  FormError: FieldFormError,
  GeneralError: FieldFormError,
  Validity: BaseUIField.Validity,
});

export default Field;
export {
  Field,
  FieldRoot,
  FieldLabel,
  FieldControl,
  FieldInput,
  FieldTextarea,
  FieldDescription,
  FieldError,
  FieldFormError,
  fieldInputVariants,
  fieldLabelVariants,
  fieldErrorVariants,
};
