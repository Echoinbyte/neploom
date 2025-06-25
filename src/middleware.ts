import { NextRequest, NextResponse } from "next/server";
import { rootDomain } from "@/lib/utils";
import {
  applicationRoutes,
  specialGalaxySubdomains,
  specialUserSubdomains,
} from "@/config/applicationRoutes";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+(?:\.[^.]+)*)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      const parts = hostname.split(".localhost")[0];
      return parts;
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection - handle nested subdomains
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Block access to admin page from subdomains
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if we're on a subdomain
  if (subdomain) {
    // Check if subdomain matches any application route
    if (applicationRoutes.includes(subdomain)) {
      // Rewrite to the corresponding route path
      return NextResponse.rewrite(
        new URL(`/${subdomain}${pathname}`, request.url)
      );
    }

    // Nepler specific Subdomain
    if (subdomain.startsWith("nepler-")) {
      return NextResponse.rewrite(
        new URL(
          `/nepler/${subdomain.replace("nepler-", "")}${pathname}`,
          request.url
        )
      );
    }

    // Handle nepler user sub-subdomains (e.g., looms.nepler-username)
    const subdomainParts = subdomain.split(".");
    if (subdomainParts.length > 1) {
      const subSection = subdomainParts[0];
      const mainSubdomain = subdomainParts.slice(1).join(".");

      // Nepler user subsection routing
      if (
        mainSubdomain.startsWith("nepler-") &&
        specialUserSubdomains.includes(subSection)
      ) {
        const neplerUsername = mainSubdomain.replace("nepler-", "");
        return NextResponse.rewrite(
          new URL(
            `/nepler/${neplerUsername}/${subSection}${pathname}`,
            request.url
          )
        );
      }

      // Galaxy subsection routing
      if (specialGalaxySubdomains.includes(subSection)) {
        return NextResponse.rewrite(
          new URL(
            `/galaxy/${mainSubdomain}/${subSection}${pathname}`,
            request.url
          )
        );
      }
    }

    // Handle regular galaxy subdomains with dynamic path mapping
    return handleGalaxyRouting(subdomain, pathname, request);
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

function handleGalaxyRouting(
  galaxyName: string,
  pathname: string,
  request: NextRequest
) {
  // Remove leading slash for easier processing
  const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const pathParts = cleanPath.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    // Route to galaxy home page
    return NextResponse.rewrite(new URL(`/galaxy/${galaxyName}`, request.url));
  }

  if (pathParts.length === 1) {
    // Route to user profile within galaxy
    return NextResponse.rewrite(
      new URL(`/galaxy/${galaxyName}/${pathParts[0]}`, request.url)
    );
  }

  if (pathParts.length === 2) {
    const [loomerName, contentType] = pathParts;

    // Route to user's content section within galaxy
    return NextResponse.rewrite(
      new URL(`/galaxy/${galaxyName}/${loomerName}/${contentType}`, request.url)
    );
  }

  if (pathParts.length === 3) {
    const [loomerName, contentType, slug] = pathParts;

    // Route to specific content item within user's section
    return NextResponse.rewrite(
      new URL(
        `/galaxy/${galaxyName}/${loomerName}/${contentType}/${slug}`,
        request.url
      )
    );
  }

  // For longer paths, preserve the structure within galaxy
  return NextResponse.rewrite(
    new URL(`/galaxy/${galaxyName}/${cleanPath}`, request.url)
  );
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
