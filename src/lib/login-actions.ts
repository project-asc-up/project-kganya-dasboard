"use server";

import { redirect } from "next/navigation";

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
  const configuredPassword =
    username === "admin"
      ? process.env.ADMIN_PASSWORD
      : process.env.USER_LOGIN_PASSWORD;

  if (configuredPassword && password !== configuredPassword) {
    return {
      fieldErrors: {},
      formError: "The username or password is incorrect.",
    };
  }

  redirect("/admin");
}
