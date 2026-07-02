"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_TTL_MS,
  createAuthSessionToken,
  getAuthSessionSecret,
} from "@/lib/auth-session";
import { verifyPassword } from "@/lib/password-hashing";
import { getPrismaClient } from "@/lib/prisma";
import {
  hasLoginFieldErrors,
  type LoginActionState,
  validateLoginFields,
} from "@/lib/login-validation";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const fieldErrors = validateLoginFields({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (hasLoginFieldErrors(fieldErrors)) {
    return { fieldErrors };
  }

  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const sessionSecret = getAuthSessionSecret();

  if (!sessionSecret) {
    return {
      fieldErrors: {},
      formError: "Sign in is temporarily unavailable. Authentication is not configured.",
    };
  }

  if (username === "admin") {
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return {
        fieldErrors: {},
        formError: "The username or password is incorrect.",
      };
    }
  } else {
    try {
      const prisma = getPrismaClient();
      const account = await prisma.authUser.findUnique({
        where: { universityId: username },
        select: { id: true, passwordHash: true },
      });

      if (!account || !(await verifyPassword(password, account.passwordHash))) {
        return {
          fieldErrors: {},
          formError: "The username or password is incorrect.",
        };
      }

      await prisma.authUser.update({
        where: { id: account.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      return {
        fieldErrors: {},
        formError: "Sign in is temporarily unavailable. Please try again.",
      };
    }
  }

  const cookieStore = await cookies();
  const token = await createAuthSessionToken({
    username,
    secret: sessionSecret,
  });

  cookieStore.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(AUTH_SESSION_TTL_MS / 1000),
  });

  redirect("/admin");
}
