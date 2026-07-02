export const LOGIN_USERNAME_PATTERN = /^(admin|u\d{8})$/;

export type LoginFieldErrors = {
  username?: string;
  password?: string;
};

export type LoginActionState = {
  fieldErrors: LoginFieldErrors;
  formError?: string;
};

export const initialLoginActionState: LoginActionState = {
  fieldErrors: {},
};

export function validateLoginFields(input: {
  username: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): LoginFieldErrors {
  const fieldErrors: LoginFieldErrors = {};
  const username = typeof input.username === "string" ? input.username : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!username) {
    fieldErrors.username = "Enter your username.";
  } else if (!LOGIN_USERNAME_PATTERN.test(username)) {
    fieldErrors.username =
      "Use admin or a lowercase u followed by exactly eight digits, for example u12345678.";
  }

  if (!password) {
    fieldErrors.password = "Enter your password.";
  }

  return fieldErrors;
}

export function hasLoginFieldErrors(fieldErrors: LoginFieldErrors) {
  return Boolean(fieldErrors.username || fieldErrors.password);
}
