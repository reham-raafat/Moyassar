import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  isRouteErrorResponse,
  Link,
  Outlet,
  RouterProvider,
  useRouteError,
} from "react-router-dom";

import { A11yProvider } from "@/lib/a11y";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { SiteFooter } from "@/components/ui/footer";
import { SiteHeader } from "@/components/ui/header";
import { Toaster } from "@/components/ui/sonner";

import { Route as HomeRoute } from "@/routes";
import { Route as SearchRoute } from "@/routes/search";
import { Route as MapRoute } from "@/routes/map";
import { Route as RankingsRoute } from "@/routes/rankings";
import { Route as AccessibilityScoreRoute } from "@/routes/accessibilirt-score";
import { Route as AuthRoute } from "@/routes/auth";
import { Route as DashboardRoute } from "@/routes/dashboard";
import { Route as FavoritesRoute } from "@/routes/favourites";
import { Route as ReportsRoute } from "@/routes/reports-";
import { Route as ReportRoute } from "@/routes/report";
import { Route as SettingsRoute } from "@/routes/settings";
import { Route as PlaceRoute } from "@/routes/places-placed";
import { Route as AdminDashboardRoute } from "@/routes/admin-dashboard";

const queryClient = new QueryClient();

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <A11yProvider>
        <I18nProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main id="main" className="flex-1">
                <Outlet />
              </main>
              <SiteFooter />
            </div>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </I18nProvider>
      </A11yProvider>
    </QueryClientProvider>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="جارِ التحميل"
      />
    </div>
  );
}

function ErrorPage() {
  const error = useRouteError();
  const title =
    isRouteErrorResponse(error) && error.status === 404 ? "404" : "This page didn't load";
  const message =
    isRouteErrorResponse(error) && error.status === 404
      ? "Page not found / الصفحة غير موجودة"
      : "Something went wrong. Try again or go home.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Home / الرئيسية
        </Link>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomeRoute.component />,
        loader: HomeRoute.loader,
        HydrateFallback: RouteLoadingFallback,
      },
      { path: "search", element: <SearchRoute.component /> },
      { path: "map", element: <MapRoute.component /> },
      { path: "rankings", element: <RankingsRoute.component /> },
      { path: "accessibility-score", element: <AccessibilityScoreRoute.component /> },
      { path: "auth", element: <AuthRoute.component /> },
      { path: "dashboard", element: <DashboardRoute.component /> },
      { path: "favorites", element: <FavoritesRoute.component /> },
      { path: "reports", element: <ReportsRoute.component /> },
      { path: "report", element: <ReportRoute.component /> },
      { path: "settings", element: <SettingsRoute.component /> },
      {
        path: "places/:placeId",
        element: <PlaceRoute.component />,
        loader: PlaceRoute.loader,
        HydrateFallback: RouteLoadingFallback,
      },
      { path: "admin/dashboard", element: <AdminDashboardRoute.component /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
