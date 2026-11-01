import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { ProfileLifeAreas } from "@/features/life-areas/components";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import ProfileStats from "@/features/auth/components/static/ProfileStats/ProfileStats";
import ThemeSwitcher from "@/features/general/components/module/ThemeSwitcher/ThemeSwitcher";
import ProfileAccount from "@/features/auth/components/static/ProfileAccount/ProfileAccount";
import LocaleSwitcher from "@/features/general/components/module/LocaleSwitcher/LocaleSwitcher";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import { getTranslations } from "@/features/general/lib/i18n/server";
import LogoutBtn from "@/features/auth/components/LogoutBtn/LogoutBtn";
import InstallAppDialog from "@/features/general/components/module/InstallAppDialog/InstallAppDialog";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";

async function UserProfilePage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Group position="left">
          <TopBar.Btn render={
            <LogoutBtn variant={"ghost"} />
          } />
        </TopBar.Group>

        <TopBar.Title asTitle>{t("profile.title")}</TopBar.Title>

        <TopBar.Group position="right">
          <TopBar.Btn render={
            <InstallAppDialog variant={"ghost"} />
          } />
          
          <TopBar.Btn
            nativeButton={false}
            title={t("search.title")}
            aria-label={t("search.title")}
            render={
              <Link href="/search">
                <SearchIcon />
              </Link>
            }
          />
          
          <TopBar.Btn render={
            <HelpDialog variant={"ghost"} />
          } />
        </TopBar.Group>
      </TopBar>

      <PageItemsWrapper>
        <ProfileAccount />

        <ProfileLifeAreas />

        <ProfileStats />

        <div className="w-full space-y-sm">
          <div className="flex items-center justify-between gap-sm p-sm rounded-container bg-card">
            <span className="font-bold">{t("profile.language")}</span>
            <LocaleSwitcher />
          </div>

          <div className="flex items-center justify-between gap-sm p-sm rounded-container bg-card">
            <span className="font-bold">{t("profile.colorScheme")}</span>
            <ThemeSwitcher />
          </div>
        </div>
      </PageItemsWrapper>
    </PageWrapper>
  );
}

export default UserProfilePage;
