"use client";

import { useActionState } from "react";
import { LogOutIcon } from "lucide-react";

import { logoutMutation } from "@/features/auth/mutations";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import {
  Button,
  ButtonProps,
} from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

function LogoutBtn({ children, ...p }: ButtonProps) {
  const { t } = useLocale();
  const [, logoutAction, isLoggingOut] = useActionState(
    logoutMutation,
    undefined,
  );

  return (
    <Dialog
      trigger={
        <Button
          title={t("profile.logout")}
          aria-label={t("profile.logout")}
          {...p}>
          {children || <LogOutIcon className="-scale-x-100" />}
        </Button>
      }>
      <div className="flex flex-col gap-xs">
        <Dialog.Title className="title">
          {t("profile.logoutTitle")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("profile.logoutDescription")}
        </Dialog.Description>
      </div>

      <div className="flex items-center justify-end gap-sm">
        <Dialog.Close
          render={
            <Button
              type="button"
              variant="card"
              className="flex-1"
              disabled={isLoggingOut}>
              {t("common.cancel")}
            </Button>
          }
        />

        <form action={logoutAction} className="flex-1">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoggingOut}>
            {isLoggingOut ? t("common.loading") : t("profile.logout")}
          </Button>
        </form>
      </div>
    </Dialog>
  );
}

export default LogoutBtn;
