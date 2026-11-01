import Field from "@/features/general/components/ui/Field";
import { setLocale } from "@/features/general/actions/locale";
import { Button } from "@/features/general/components/ui/Button/Button";
import { getTranslations } from "@/features/general/lib/i18n/server";

async function LanguagePage() {
  const { locale, t } = await getTranslations();

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-md p-sm">
      <h1 className="title">{t("language.title")}</h1>

      <div className="flex w-full max-w-sm flex-col gap-sm">
        {(
          [
            { value: "en", label: t("language.english") },
            { value: "fa", label: t("language.persian") },
          ] as const
        ).map((option) => (
          <form key={option.value} action={setLocale}>
            <Field type="hidden" name="locale" value={option.value} />
            <Button
              type="submit"
              variant="ghost"
              className={`h-auto w-full justify-start rounded-container bg-card p-sm text-left font-bold hover:bg-card-thick ${
                locale === option.value ? "" : ""
              }`}
            >
              {option.label}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}

export default LanguagePage;
