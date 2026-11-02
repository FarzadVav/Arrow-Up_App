"use client";

import { Form } from "@base-ui/react";
import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { loginMutation } from "@/features/auth/api/mutations";
import Field from "@/features/general/components/ui/Field";
import { LoginInputSchema } from "@/features/auth/lib/schemas";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export function LoginForm() {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(loginMutation, undefined);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form
      action={formAction}
      errors={state?.errors}
      className="space-y-sm"
      aria-label={t("login.formLabel")}>
      <Field
        required
        minLength={3}
        name="username"
        disabled={pending}
        schema={LoginInputSchema}
        label={t("login.username")}
        placeholder={t("login.usernamePlaceholder")}
        defaultValue={state?.inputs?.username ?? ""}
      />

      <Field
        required
        minLength={6}
        name="password"
        disabled={pending}
        schema={LoginInputSchema}
        label={t("login.password")}
        type={showPassword ? "text" : "password"}
        placeholder={t("login.passwordPlaceholder")}
        endAdornment={
          <Button
            type="button"
            tabIndex={-1}
            variant="ghost"
            size={"square"}
            className="h-full w-auto aspect-square"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? t("login.hidePassword") : t("login.showPassword")
            }>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        }
      />

      <Field.FormError
        errors={state?.errors}
        message={state?.message}
        knownFields={["username", "password"]}
      />

      <Button type="submit" size={"full"} disabled={pending}>
        {pending ? t("login.pending") : t("login.submit")}
      </Button>
    </Form>
  );
}

export default LoginForm;
