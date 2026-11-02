import { getTranslations } from "@/features/general/lib/i18n/server";
import LoginForm from "@/features/auth/components/modules/LoginForm/LoginForm";
import ThemeSwitcher from "@/features/general/components/modules/ThemeSwitcher/ThemeSwitcher";
import LocaleSwitcher from "@/features/general/components/modules/LocaleSwitcher/LocaleSwitcher";

export default async function LoginPage() {
  const { t } = await getTranslations();

  return (
    <div className="h-dvh px-sm py-md gap-md items-center justify-center flex-col flex">
      <div className="card card-lg flex-col">
        <p className="sub-text">{t("login.quote")}</p>

        <div className="space-y-xs">
          <h1 className="title">{t("login.title")}</h1>
          <p className="sub-text">{t("login.subtitle")}</p>
        </div>

        <LoginForm />
      </div>

      <div className="actions-footer">
        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  );
}
