import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentAuthorization } from "@/lib/rbac";

export default async function SignInPage() {
  const authz = await getCurrentAuthorization();
  if (authz) {
    redirect("/admin");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-[#0b1521] selection:bg-[#005baa]/20 font-sans antialiased">
      {/* ─── Background Ambient Motion, Video & Glows ──────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Animated Floating UP Blue Radial Mesh Top Center */}
        <div className="absolute -top-40 left-1/2 animate-float-slow h-[700px] w-[1000px] rounded-full bg-gradient-to-b from-[#005baa]/20 via-[#00457f]/10 to-transparent blur-3xl" />
        {/* Animated Secondary Ochre Glow Orb Right */}
        <div className="absolute top-1/3 -right-40 animate-float-reverse h-[600px] w-[600px] rounded-full bg-[#b45309]/15 blur-3xl" />
        {/* Looping Ambient Motion Video Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-20 mix-blend-multiply pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
      </div>

      <main className="relative z-10 min-h-screen px-5 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
          <div className="grid w-full overflow-hidden rounded-[var(--radius-xl)] border border-slate-200 bg-white/95 backdrop-blur-2xl shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left Hero Panel */}
            <section className="hidden bg-[#002855] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between relative overflow-hidden">
              {/* Subtle panel ambient glow */}
              <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#005baa]/40 blur-2xl pointer-events-none" />

              <Link href="/" className="flex items-center gap-3 relative z-10">
                <Image
                  src="/up-logo.png"
                  alt="University of Pretoria"
                  width={48}
                  height={48}
                  priority
                  className="h-12 w-12 rounded-[var(--radius-sm)] bg-white object-contain p-1.5 shadow-md"
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b0d8ff]">
                    University of Pretoria
                  </p>
                  <p className="text-lg font-black text-white">
                    Academic Success Workspace
                  </p>
                </div>
              </Link>

              <div className="space-y-4 relative z-10">
                <div className="h-1 w-20 rounded-full bg-[#b45309]" />
                <h1 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                  Welcome to the UP Support Console
                </h1>
                <p className="text-sm leading-6 text-slate-100 font-medium">
                  Update Academic Success Coaches, Department of Student Affairs (DSA) units, and general UP guidelines. All changes automatically sync to the Leaf AI chatbot.
                </p>
              </div>

              <div className="text-xs font-semibold text-[#b0d8ff] relative z-10">
                Protected by Clerk Enterprise Role-Based Access Control
              </div>
            </section>

            {/* Right Clerk Form Panel */}
            <section className="flex min-h-[36rem] items-center justify-center px-6 py-10 sm:px-10 bg-white">
              <div className="w-full max-w-md">
                <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                  <Image
                    src="/up-logo.png"
                    alt="University of Pretoria"
                    width={44}
                    height={44}
                    priority
                    className="h-11 w-11 rounded-[var(--radius-sm)] bg-white object-contain p-1 shadow-sm border border-slate-100"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#005baa]">
                      University of Pretoria
                    </p>
                    <p className="truncate text-sm font-extrabold text-[#002855]">
                      Academic Success Console
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <SignIn fallbackRedirectUrl="/admin" forceRedirectUrl="/admin" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
