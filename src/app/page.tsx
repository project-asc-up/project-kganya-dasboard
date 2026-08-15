import { Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Folder,
  GraduationCap,
  HeartPulse,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070d14] text-white selection:bg-[#005baa]/30 selection:text-white font-sans antialiased">
      {/* ─── Background Ambient Glows & Grid Lines ──────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Ambient UP Blue Radial Glow Top Center */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-[#005baa]/25 via-[#00457f]/15 to-transparent blur-3xl" />
        {/* Subtle Secondary Ochre/Glow Accent Right */}
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-[#b45309]/10 blur-3xl" />
        {/* Background Video overlay (looping ambient mesh) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-15 mix-blend-screen pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
      </div>

      {/* Guide lines (matching reference aesthetic) */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/5 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/5 z-[5]" />

      {/* SVG Noise Filter */}
      <svg className="hidden">
        <filter id="up-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0"
          />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      {/* ─── Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070d14]/80 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-md transition group-hover:scale-105"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3d84c2]">
                  University of Pretoria
                </span>
                <span className="rounded-full bg-[#005baa]/30 px-2 py-0.5 text-[10px] font-semibold text-[#b0d8ff] border border-[#005baa]/50">
                  Kganya OS
                </span>
              </div>
              <p className="text-sm font-semibold tracking-tight text-white group-hover:text-[#b0d8ff] transition-colors">
                Academic Support & Leaf AI Workspace
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#about" className="hover:text-white transition-colors">
              Workspace Overview
            </a>
            <a href="#dsa-units" className="hover:text-white transition-colors">
              DSA Units
            </a>
            <a href="#coaches" className="hover:text-white transition-colors">
              ASC Directory
            </a>
            <a href="#chatbot-sync" className="hover:text-white transition-colors">
              Leaf Chatbot Sync
            </a>
          </nav>

          {/* Auth Action Button */}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="group inline-flex items-center gap-2 rounded-full bg-[#005baa] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#00457f] hover:shadow-lg active:scale-95"
              >
                <span>Sign In</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <UserButton />
                <Link
                  href="/admin"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#005baa] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#00457f] hover:shadow-lg active:scale-95"
                >
                  <LayoutDashboard size={14} />
                  <span>Open Console</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 md:pt-28 pb-20 text-center flex flex-col items-center max-w-5xl mx-auto px-6">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#005baa]/50 bg-[#005baa]/15 px-4 py-1.5 text-xs font-semibold text-[#b0d8ff] backdrop-blur-md mb-8 shadow-inner">
          <Sparkles size={14} className="text-[#3d84c2]" />
          <span>Real-Time Knowledge Engine for University of Pretoria</span>
        </div>

        {/* Shiny Gradient Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white">
          One workspace for UP support.
          <br />
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#005baa] via-[#3d84c2] to-[#b0d8ff]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 0%, #3d84c2 30%, #9fc8f8 60%, #ffffff 100%)",
              filter: "url(#up-noise)",
            }}
          >
            Instant power for Leaf Chatbot.
          </span>
        </h1>

        {/* Hero Paragraph */}
        <p className="mt-8 text-lg text-white/70 max-w-2xl leading-relaxed">
          Update <strong className="text-white font-semibold">Academic Success Coaches</strong> details,{" "}
          <strong className="text-white font-semibold">Department of Student Affairs (DSA)</strong> units, and{" "}
          <strong className="text-white font-semibold">General UP Guidelines</strong> in one central console.
          Every change automatically updates the <strong className="text-[#b0d8ff] font-semibold">Leaf AI chatbot</strong> so UP students get instant, accurate assistance.
        </p>

        {/* CTA Buttons Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#005baa] text-white font-semibold text-sm px-7 py-3.5 shadow-xl transition-all hover:bg-[#00457f] hover:shadow-[#005baa]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Sign In to Admin Workspace</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Show>

          <Show when="signed-in">
            <Link
              href="/admin"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#005baa] text-white font-semibold text-sm px-7 py-3.5 shadow-xl transition-all hover:bg-[#00457f] hover:shadow-[#005baa]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LayoutDashboard size={18} />
              <span>Go to Admin Console</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Show>

          <a
            href="#chatbot-sync"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 text-white/90 font-medium text-sm px-6 py-3.5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30"
          >
            <Bot size={16} className="text-[#3d84c2]" />
            <span>How Leaf AI Sync Works</span>
          </a>
        </div>

        {/* Security badge */}
        <p className="mt-4 text-xs text-white/40 flex items-center gap-1.5 justify-center">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Clerk Enterprise Auth & Role-Based Access Control Protected</span>
        </p>
      </section>

      {/* ─── macOS Style Live Sync Pipeline Showcase ──────────────────── */}
      <section id="chatbot-sync" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-white/15 bg-[#0b1420]/90 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,32,80,0.5)] overflow-hidden">
          {/* macOS Titlebar */}
          <div className="h-10 bg-black/40 border-b border-white/10 px-4 flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[11px] text-white/60">
                Kganya Admin Console ──► Leaf Chatbot Realtime Pipeline
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#3d84c2]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE AUTOMATED DIFY SYNC ACTIVE</span>
            </div>
          </div>

          {/* Showcase Content Split Grid */}
          <div className="grid lg:grid-cols-12 min-h-[460px]">
            {/* Left: Admin Workspace Actions (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3d84c2] flex items-center gap-2">
                  <LayoutDashboard size={14} />
                  Content Management Workspace
                </span>
                <span className="text-xs text-white/40 font-mono">Step 1: Admin Update</span>
              </div>

              <div className="space-y-4">
                {/* Demo Record Item 1: ASC Coach */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 transition hover:border-[#005baa]/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Users size={14} className="text-[#3d84c2]" />
                      ASC Coach Directory Record
                    </span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">
                    Dr. Sarah Khumalo — Senior Academic Coach (Faculty of EMS)
                  </p>
                  <p className="text-xs text-white/60">
                    Office: EMS Building Rm 2-14 · Appointment: up.ac.za/asc-ems-booking
                  </p>
                </div>

                {/* Demo Record Item 2: DSA Unit */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 transition hover:border-[#005baa]/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <HeartPulse size={14} className="text-[#3d84c2]" />
                      DSA Unit: Student Counselling & Disability Unit
                    </span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">
                    2026 Examination Concessions & Extra Time Application Protocol
                  </p>
                  <p className="text-xs text-white/60">
                    Deadline: 30 September · Portal: up.ac.za/disability-unit
                  </p>
                </div>

                {/* Demo Record Item 3: UP General Info */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 transition hover:border-[#005baa]/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Building2 size={14} className="text-[#3d84c2]" />
                      General UP Guidelines
                    </span>
                    <span className="rounded-full bg-[#005baa]/30 text-[#b0d8ff] border border-[#005baa]/50 px-2 py-0.5 text-[10px] font-bold">
                      SYNCED TO DIFY VECTOR STORE
                    </span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">
                    2026 Second Semester Module Discontinuation & Fee Refund Policy
                  </p>
                </div>
              </div>

              {/* Sync Receipt Bar */}
              <div className="rounded-xl border border-[#005baa]/40 bg-[#005baa]/10 p-3 flex items-center justify-between text-xs text-[#b0d8ff]">
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-[#3d84c2]" />
                  <span>Dify Vector Store Sync: <strong>3 Knowledge Records Processed</strong></span>
                </div>
                <span className="font-mono text-[10px] opacity-75">Receipt #req-up-8842</span>
              </div>
            </div>

            {/* Right: Leaf Chatbot Live Output (5 cols) */}
            <div className="lg:col-span-5 bg-black/40 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Bot size={16} />
                    Leaf AI Chatbot (Student View)
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Step 2: Realtime AI Answer</span>
                </div>

                {/* Simulated Student Query */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#005baa] px-4 py-3 text-xs text-white shadow-md">
                    "How do I contact an EMS Academic Coach and what is the Disability Unit extra time deadline?"
                  </div>
                </div>

                {/* Simulated Leaf Response with Instant Synced Data */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] space-y-2 rounded-2xl rounded-tl-xs border border-white/10 bg-white/10 p-4 text-xs text-white/90 backdrop-blur-md">
                    <div className="flex items-center gap-2 font-semibold text-[#b0d8ff]">
                      <Bot size={14} />
                      <span>Leaf AI Assistant</span>
                    </div>
                    <p className="leading-relaxed">
                      Here is the updated official information:
                    </p>
                    <ul className="space-y-1.5 text-white/80 pl-3 list-disc">
                      <li>
                        <strong>EMS Coach:</strong> Dr. Sarah Khumalo is available at EMS Building Rm 2-14. Book via up.ac.za/asc-ems-booking.
                      </li>
                      <li>
                        <strong>Disability Unit Deadline:</strong> Concession applications close 30 September 2026.
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-white/10 text-[10px] text-white/50 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>Verified from UP Kganya Console · Live Sync</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot status footer */}
              <div className="text-center text-xs text-white/40 pt-4 border-t border-white/10">
                Leaf answers via Webchat & WhatsApp automatically reflect all changes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Pillars / Content Scope Section ─────────────────────── */}
      <section id="about" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3d84c2]">
            What You Can Manage
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            The 3 Pillars of UP Support Knowledge
          </h2>
          <p className="text-base text-white/60">
            A single unified interface governing all academic success, departmental, and institutional guidelines across the University of Pretoria.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pillar 1: Academic Success Coaches */}
          <div className="group rounded-3xl border border-white/10 bg-[#0e1724]/60 p-8 transition-all hover:border-[#005baa] hover:bg-[#0e1724]/90 hover:-translate-y-1 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#005baa]/20 text-[#3d84c2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              1. Academic Success Coaches
            </h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Manage complete coach directories, faculty allocations, title roles, office locations, appointment links, and undergrad/postgrad level responsibilities.
            </p>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Per-faculty ASC coach directory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Live appointment link management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Undergraduate & Postgraduate clusters</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Department of Student Affairs (DSA) */}
          <div id="dsa-units" className="group rounded-3xl border border-white/10 bg-[#0e1724]/60 p-8 transition-all hover:border-[#005baa] hover:bg-[#0e1724]/90 hover:-translate-y-1 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#005baa]/20 text-[#3d84c2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <HeartPulse size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              2. Department of Student Affairs
            </h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Maintain official support guides, policies, and contacts across all DSA units so student queries are resolved correctly.
            </p>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Student Counselling & Health Services</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Disability Unit & Concessions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Governance, ISFAP & SNAPP Funding</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: UP General Information */}
          <div className="group rounded-3xl border border-white/10 bg-[#0e1724]/60 p-8 transition-all hover:border-[#005baa] hover:bg-[#0e1724]/90 hover:-translate-y-1 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#005baa]/20 text-[#3d84c2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              3. UP General Information
            </h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Publish and verify general University of Pretoria academic rules, module requirements, admissions criteria, fees, and campus FAQs.
            </p>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Faculties & Programme curriculums</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Verified academic FAQ repository</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#3d84c2]" />
                <span>Document upload & PDF guide indexing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Automated AI Sync Process Section ────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3d84c2]">
            Automated Knowledge Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            How Any Update Reaches Students
          </h2>
          <p className="text-base text-white/60">
            Zero manual retraining required. When administrators edit content in the console, the Leaf AI chatbot updates automatically.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1724]/40 p-6 space-y-3 relative">
            <span className="text-3xl font-extrabold text-[#005baa]">01</span>
            <h4 className="text-base font-bold text-white">Admin Record Edit</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Administrator updates a Coach, DSA Unit, or FAQ entry in the Kganya Console workspace.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1724]/40 p-6 space-y-3 relative">
            <span className="text-3xl font-extrabold text-[#005baa]">02</span>
            <h4 className="text-base font-bold text-white">Validation & Audit</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Idempotent mutation receipts confirm payload hash integrity and verify role permissions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1724]/40 p-6 space-y-3 relative">
            <span className="text-3xl font-extrabold text-[#005baa]">03</span>
            <h4 className="text-base font-bold text-white">Dify Vector Sync</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Knowledge records are automatically chunked and synced into the Dify vector database.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1724]/40 p-6 space-y-3 relative">
            <span className="text-3xl font-extrabold text-[#005baa]">04</span>
            <h4 className="text-base font-bold text-white">Leaf AI Resolution</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Leaf chatbot answers student questions on WhatsApp & Webchat using the newly updated data.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Metrics Bar ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#005baa]/20 via-[#0e1724] to-[#005baa]/20 p-8 backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">9</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3d84c2] mt-1">
                UP Faculties Covered
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#b0d8ff]">6</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3d84c2] mt-1">
                DSA Units Integrated
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3d84c2] mt-1">
                Real-Time Leaf AI Sync
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">50k+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3d84c2] mt-1">
                UP Students Supported
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="rounded-3xl border border-[#005baa]/40 bg-gradient-to-b from-[#005baa]/20 to-[#0e1724] p-10 sm:p-16 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,91,170,0.25),transparent_70%)] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white relative z-10">
            Keep UP support content synchronized.
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-xl mx-auto relative z-10">
            Log in to the console to update coaches, DSA guidelines, or general UP resources and empower the Leaf chatbot.
          </p>

          <div className="mt-8 flex justify-center relative z-10">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#005baa] px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-[#00457f] hover:scale-105"
              >
                <span>Sign In to Access Console</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/admin"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#005baa] px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-[#00457f] hover:scale-105"
              >
                <LayoutDashboard size={18} />
                <span>Open Admin Workspace</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-[#05090f] py-12 text-xs text-white/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md bg-white object-contain p-0.5"
            />
            <span>University of Pretoria · Project Kganya Admin Console</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-white/60">
            <Link href="/admin/faculties" className="hover:text-white transition-colors">
              Faculties
            </Link>
            <Link href="/admin/coaches" className="hover:text-white transition-colors">
              ASC Coaches
            </Link>
            <Link href="/admin/resources" className="hover:text-white transition-colors">
              Resources & DSA
            </Link>
            <Link href="/admin/faqs" className="hover:text-white transition-colors">
              FAQs
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} University of Pretoria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
