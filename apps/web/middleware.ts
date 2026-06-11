import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET ?? "super_secret_dev_key_at_least_32_characters_long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Path constant routes matching configuration
const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
};

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  onboardingComplete: boolean;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.SIGNUP;
  const isLandingPage = pathname === ROUTES.HOME;
  const isOnboardingPage = pathname === ROUTES.ONBOARDING;
  
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  let payload: TokenPayload | null = null;
  let hasValidToken = false;

  // 1. Try to verify the access token
  if (accessToken) {
    try {
      const { payload: verifiedPayload } = await jwtVerify(accessToken, secretKey);
      payload = verifiedPayload as unknown as TokenPayload;
      hasValidToken = true;
    } catch {
      // Access token is expired or forged
      hasValidToken = false;
    }
  }

  // 2. If access token is invalid but refresh token is present, perform a Silent Refresh
  let newCookiesToSet: string[] = [];
  if (!hasValidToken && refreshToken) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout guard

    try {
      const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/v1/auth/refresh`;
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Cookie": `refresh_token=${refreshToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (refreshRes.ok) {
        // Forward set-cookie headers from the backend response
        newCookiesToSet = refreshRes.headers.getSetCookie();
        
        // Extract the new access token to check onboardingComplete state
        // Cookies are set as: access_token=TOKEN; httpOnly; ...
        const newAccessTokenCookie = newCookiesToSet.find(c => c.startsWith("access_token="));
        if (newAccessTokenCookie) {
          const newAccessToken = newAccessTokenCookie.split(";")[0]?.split("=")[1];
          if (newAccessToken) {
            const { payload: verifiedPayload } = await jwtVerify(newAccessToken, secretKey);
            payload = verifiedPayload as unknown as TokenPayload;
            hasValidToken = true;
          }
        }
      }
    } catch {
      clearTimeout(timeoutId);
      // Aborted, network failure, or backend error -> refresh failed
      hasValidToken = false;
    }
  }

  // 3. Routing enforcement matrix
  if (hasValidToken && payload) {
    const { onboardingComplete } = payload;

    // Logged-in users accessing auth/landing pages
    if (isAuthPage || isLandingPage) {
      const targetRoute = onboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING;
      const res = NextResponse.redirect(new URL(targetRoute, req.url));
      applyCookies(res, newCookiesToSet);
      return res;
    }

    // Incomplete onboarding redirect logic (for dashboard and all other protected pages)
    if (!onboardingComplete && !isOnboardingPage) {
      const res = NextResponse.redirect(new URL(ROUTES.ONBOARDING, req.url));
      applyCookies(res, newCookiesToSet);
      return res;
    }

    // Completed onboarding trying to access onboarding page
    if (onboardingComplete && isOnboardingPage) {
      const res = NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
      applyCookies(res, newCookiesToSet);
      return res;
    }

    // Permitted protected access, forward new cookies if session was refreshed
    const res = NextResponse.next();
    applyCookies(res, newCookiesToSet);
    return res;
  } else {
    // Logged-out users accessing protected routes
    if (!isAuthPage && !isLandingPage) {
      const res = NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
      // Loop protection: Wiping invalid or expired cookies on authentication failure
      res.headers.append("Set-Cookie", "access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      res.headers.append("Set-Cookie", "refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      return res;
    }

    // Permit access to public login/signup/landing
    return NextResponse.next();
  }
}

// Utility to apply forwarded backend cookies to NextResponse headers
function applyCookies(res: NextResponse, cookies: string[]) {
  cookies.forEach((cookieStr) => {
    res.headers.append("Set-Cookie", cookieStr);
  });
}

// Performance-optimized route matcher config
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/worlds/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
    "/",
  ],
};
