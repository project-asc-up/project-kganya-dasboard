"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_TTL_MS,
  createAuthSessionToken,
  getAuthSessionSecret,
} from "@/lib/auth-session";
import { hashPassword } from "@/lib/password-hashing";
import { getPrismaClient } from "@/lib/prisma";
import {
  hasRegistrationFieldErrors,
  type RegistrationActionState,
  validateRegistrationFields,
} from "@/lib/login-validation";

async function setAuthCookie(username: string) {
  const sessionSecret = getAuthSessionSecret();

  if (!sessionSecret) {
    throw new Error("Authentication session secret is not configured.");
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
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function registerAction(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const fieldErrors = validateRegistrationFields({
    universityId: formData.get("universityId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (hasRegistrationFieldErrors(fieldErrors)) {
    return { fieldErrors };
  }

  const universityId = String(formData.get("universityId")).trim();
  const password = String(formData.get("password"));
  const sessionSecret = getAuthSessionSecret();

  if (!sessionSecret) {
    return {
      fieldErrors: {},
      formError: "Account creation is temporarily unavailable. Authentication is not configured.",
    };
  }

  try {
    const prisma = getPrismaClient();
    const passwordHash = await hashPassword(password);

    await prisma.authUser.create({
      data: {
        universityId,
        passwordHash,
        lastLoginAt: new Date(),
      },
    });

    await setAuthCookie(universityId);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        fieldErrors: {
          universityId: "An account already exists for this university ID.",
        },
      };
    }

    return {
      fieldErrors: {},
      formError: "We could not create your account right now. Please try again.",
    };
  }

  redirect("/admin");
}
