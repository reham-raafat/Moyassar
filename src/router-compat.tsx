import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  Link as RouterLink,
  useLoaderData as useReactRouterLoaderData,
  useNavigate as useReactRouterNavigate,
  useSearchParams,
  type LoaderFunctionArgs,
} from "react-router-dom";

type SearchValue = string | number | boolean | null | undefined;
type SearchObject = Record<string, SearchValue>;
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  params?: Record<string, string | number>;
  search?: SearchObject;
  children?: ReactNode;
};
type NavigateTarget =
  | string
  | {
      to?: string;
      params?: Record<string, string | number>;
      search?: SearchObject | ((prev: SearchObject) => SearchObject);
    };

function interpolatePath(path: string, params?: Record<string, string | number>) {
  if (!params) return path;
  return Object.entries(params).reduce(
    (next, [key, value]) => next.replace(`$${key}`, encodeURIComponent(String(value))),
    path,
  );
}

function coerceSearchValue(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function readSearchParams(params: URLSearchParams): SearchObject {
  const result: SearchObject = {};
  params.forEach((value, key) => {
    result[key] = coerceSearchValue(value);
  });
  return result;
}

function stringifySearch(search?: SearchObject) {
  const params = new URLSearchParams();
  Object.entries(search ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false || value === "") return;
    params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

function buildUrl(to: string, params?: Record<string, string | number>, search?: SearchObject) {
  return `${interpolatePath(to, params)}${stringifySearch(search)}`;
}

export function Link({ to, params, search, ...props }: LinkProps) {
  return <RouterLink to={buildUrl(to, params, search)} {...props} />;
}

export function useNavigate() {
  const navigate = useReactRouterNavigate();
  const [searchParams] = useSearchParams();

  return (target: NavigateTarget) => {
    if (typeof target === "string") {
      void navigate(target);
      return;
    }

    const nextSearch =
      typeof target.search === "function"
        ? target.search(readSearchParams(searchParams))
        : target.search;

    void navigate(buildUrl(target.to ?? location.pathname, target.params, nextSearch));
  };
}

type RouteConfig<TLoader = unknown, TSearch = SearchObject> = {
  component: React.ComponentType;
  loader?: (args: LoaderFunctionArgs) => Promise<TLoader> | TLoader;
  validateSearch?: { parse: (value: SearchObject) => TSearch };
  [key: string]: unknown;
};

export function createFileRoute(_path: string) {
  return <TLoader, TSearch = SearchObject>(config: RouteConfig<TLoader, TSearch>) => ({
    ...config,
    useLoaderData: () => useReactRouterLoaderData() as TLoader,
    useSearch: (): TSearch => {
      const [params] = useSearchParams();
      const raw = readSearchParams(params);
      return config.validateSearch ? config.validateSearch.parse(raw) : (raw as unknown as TSearch);
    },
    useNavigate,
  });
}
