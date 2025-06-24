// import { applicationRoutes } from "@/config/applicationRoutes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAbsoluteUrl(route?: string): string {
  // // Causing Reload
  // const routeMatch = applicationRoutes.find((r) => route?.startsWith(`/${r}`));
  // if (routeMatch) {
  //   const targetUrl = `${protocol}://${routeMatch}.${rootDomain}${
  //     route?.replace(`/${routeMatch}`, "") || "/"
  //   }`;
  //   if (targetUrl) {
  //     return targetUrl;
  //   }
  // }
  return `${process.env.NEXT_PUBLIC_BASE_URL}${route ?? ""}`;
}
