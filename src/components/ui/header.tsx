import { Link } from "@/router-compat";
import logoIcon from "@/assets/logo-icon.png";
import {
  Menu,
  MapPin,
  Search,
  User,
  LogOut,
  Heart,
  Settings as Cog,
  FileWarning,
  Shield,
  BarChart3,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AccessibilityQuickBar } from "./accessibility-quick-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === "government_admin";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <a href="#main" className="skip-link">
        {t.skipLink}
      </a>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tap-target"
          aria-label={t.appName}
        >
          <span
          className="grid h-9 w-9 place-items-center rounded-xl overflow-hidden bg-primary/5"
          aria-hidden="true"
        >
          <img src={logoIcon} alt="" className="h-full w-full object-contain" />
        </span>
          <span className="hidden sm:inline">{t.appName}</span>
        </Link>

        <nav className="ms-auto hidden items-center gap-1 md:flex" aria-label="primary">
          <Link
            to="/search"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground tap-target inline-flex items-center gap-1"
          >
            <Search className="size-4" aria-hidden="true" /> {t.nav.search}
          </Link>
          <Link
            to="/map"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground tap-target inline-flex items-center gap-1"
          >
            <MapPin className="size-4" aria-hidden="true" /> {t.nav.map}
          </Link>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-primary/10 tap-target inline-flex items-center gap-1"
            >
              <Shield className="size-4" aria-hidden="true" /> {t.nav.admin}
            </Link>
          )}
        </nav>

        <div className="ms-auto md:ms-2 flex items-center gap-2">
          <AccessibilityQuickBar />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            className="tap-target font-semibold"
          >
            {locale === "ar" ? "EN" : "ع"}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="tap-target gap-1">
                  <User className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.nav.dashboard}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={locale === "ar" ? "start" : "end"}>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <User className="me-2 size-4" />
                    {t.nav.dashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">
                    <Heart className="me-2 size-4" />
                    {t.nav.favorites}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reports">
                    <FileWarning className="me-2 size-4" />
                    {t.nav.myReports}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard">
                      <BarChart3 className="me-2 size-4" />
                      {t.nav.admin}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Cog className="me-2 size-4" />
                    {t.nav.settings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="me-2 size-4" />
                  {t.nav.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="tap-target">
              <Link to="/auth">{t.nav.signIn}</Link>
            </Button>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="tap-target md:hidden"
                aria-label="menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={locale === "ar" ? "start" : "end"}>
              <DropdownMenuItem asChild>
                <Link to="/search">{t.nav.search}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/map">{t.nav.map}</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard">{t.nav.admin}</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
