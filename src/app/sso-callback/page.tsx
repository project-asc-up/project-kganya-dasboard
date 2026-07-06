import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SsoCallbackPage() {
  return (
    <>
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/admin"
        signUpForceRedirectUrl="/admin"
      />
    </>
  );
}
