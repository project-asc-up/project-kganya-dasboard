export const LOGIN_USERNAME_PATTERN = /^(admin|u\d{8})$/;
export const REGISTER_UNIVERSITY_ID_PATTERN = /^u\d{8}$/;
export const SECURE_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;

export type LoginFieldErrors = {
  username?: string;
  password?: string;
};

export type RegistrationFieldErrors = {
  universityId?: string;
  password?: string;
  confirmPassword?: string;
};

export type LoginActionState = {
  fieldErrors: LoginFieldErrors;
  formError?: string;
};

export type RegistrationActionState = {
  fieldErrors: RegistrationFieldErrors;
  formError?: string;
};

export const initialLoginActionState: LoginActionState = {
  fieldErrors: {},
};

export const initialRegistrationActionState: RegistrationActionState = {
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

export function validateRegistrationFields(input: {
  universityId: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  confirmPassword: FormDataEntryValue | null;
}): RegistrationFieldErrors {
  const fieldErrors: RegistrationFieldErrors = {};
  const universityId = typeof input.universityId === "string" ? input.universityId.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const confirmPassword = typeof input.confirmPassword === "string" ? input.confirmPassword : "";

  if (!universityId) {
    fieldErrors.universityId = "Enter your university ID.";
  } else if (!REGISTER_UNIVERSITY_ID_PATTERN.test(universityId)) {
    fieldErrors.universityId = "Use a lowercase u followed by exactly eight digits, for example u12345678.";
  }

  if (!password) {
    fieldErrors.password = "Create a password.";
  } else if (!SECURE_PASSWORD_PATTERN.test(password)) {
    fieldErrors.password = "Use at least 10 characters with uppercase, lowercase, and a number.";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords must match.";
  }

  return fieldErrors;
}

export function hasRegistrationFieldErrors(fieldErrors: RegistrationFieldErrors) {
  return Boolean(fieldErrors.universityId || fieldErrors.password || fieldErrors.confirmPassword);
}
