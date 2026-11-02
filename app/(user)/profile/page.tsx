import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { ProfileLifeAreas } from "@/features/life-areas/components";
import { getTranslations } from "@/features/general/lib/i18n/server";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import LogoutBtn from "@/features/auth/components/modules/LogoutBtn/LogoutBtn";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import ProfileStats from "@/features/auth/components/statics/ProfileStats/ProfileStats";
import ThemeSwitcher from "@/features/general/components/modules/ThemeSwitcher/ThemeSwitcher";
import ProfileAccount from "@/features/auth/components/statics/ProfileAccount/ProfileAccount";
import LocaleSwitcher from "@/features/general/components/modules/LocaleSwitcher/LocaleSwitcher";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import InstallAppDialog from "@/features/general/components/modules/InstallAppDialog/InstallAppDialog";

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
          <div className="card items-center justify-between">
            <span className="font-bold">{t("profile.language")}</span>
            <LocaleSwitcher />
          </div>

          <div className="card items-center justify-between">
            <span className="font-bold">{t("profile.colorScheme")}</span>
            <ThemeSwitcher />
          </div>
        </div>
      </PageItemsWrapper>
    </PageWrapper>
  );
}

export default UserProfilePage;
