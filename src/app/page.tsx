import { Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  Folder,
  GraduationCap,
  HeartPulse,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#0b1521] selection:bg-[#005baa]/20 selection:text-[#002855] font-sans antialiased">
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


      {/* ─── Navigation Header ────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 bg-white/95 text-slate-900 backdrop-blur-2xl transition-all shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-md border border-slate-100 transition group-hover:scale-105"
            />
            <div className="min-w-0">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#005baa]">
                University of Pretoria
              </span>
              <p className="text-sm font-extrabold tracking-tight text-[#002855] group-hover:text-[#005baa] transition-colors">
                Academic Support Workspace
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#about" className="hover:text-[#005baa] transition-colors">
              Workspace Overview
            </a>
            <a href="#dsa-units" className="hover:text-[#005baa] transition-colors">
              DSA Units
            </a>
            <a href="#coaches" className="hover:text-[#005baa] transition-colors">
              ASC Directory
            </a>
            <a href="#chatbot-sync" className="hover:text-[#005baa] transition-colors">
              Leaf Chatbot Sync
            </a>
          </nav>

          {/* Auth Action Button */}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="group inline-flex items-center gap-2 rounded-full bg-[#005baa] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#00457f] hover:shadow-lg active:scale-95"
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
                  className="group inline-flex items-center gap-2 rounded-full bg-[#005baa] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#00457f] hover:shadow-lg active:scale-95"
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
      <section className="relative z-10 pt-28 md:pt-36 pb-20 text-center flex flex-col items-center max-w-5xl mx-auto px-6">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#005baa]/30 bg-[#005baa]/10 px-5 py-2 text-xs font-extrabold text-[#003d73] backdrop-blur-md mb-8 shadow-sm">
          <GraduationCap size={16} className="text-[#005baa]" />
          <span>Official Academic & Student Affairs Content Console</span>
        </div>

        {/* Main Headline - Pure Light High Contrast */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-[#002855] drop-shadow-sm">
          One workspace for UP support.
          <br />
          <span className="text-[#005baa] font-black">
            Instant knowledge for Leaf Chatbot.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-8 text-lg sm:text-xl text-slate-700 max-w-2xl leading-relaxed font-semibold">
          Update <strong className="text-[#002855] font-black">Academic Success Coaches</strong> details,{" "}
          <strong className="text-[#002855] font-black">Department of Student Affairs (DSA)</strong> units, and{" "}
          <strong className="text-[#002855] font-black">General UP Guidelines</strong> in one central console.
          Every change automatically updates the <strong className="text-[#005baa] font-black">Leaf chatbot</strong> so UP students get instant, accurate assistance.
        </p>

        {/* CTA Buttons Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#005baa] text-white font-black text-sm px-8 py-4 shadow-xl transition-all hover:bg-[#00457f] hover:scale-105 active:scale-[0.98]"
            >
              <span>Sign In to Admin Workspace</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Show>

          <Show when="signed-in">
            <Link
              href="/admin"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#005baa] text-white font-black text-sm px-8 py-4 shadow-xl transition-all hover:bg-[#00457f] hover:scale-105 active:scale-[0.98]"
            >
              <LayoutDashboard size={18} />
              <span>Go to Admin Console</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Show>

          <a
            href="#chatbot-sync"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white text-slate-800 font-bold text-sm px-7 py-4 backdrop-blur-md transition-all hover:bg-slate-100 shadow-sm"
          >
            <Database size={16} className="text-[#005baa]" />
            <span>How Leaf Chatbot Sync Works</span>
          </a>
        </div>

        {/* Security badge */}
        <p className="mt-5 text-xs font-bold text-slate-600 flex items-center gap-1.5 justify-center">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Clerk Enterprise Auth & Role-Based Access Protected</span>
        </p>
      </section>

      {/* ─── macOS Style Live Sync Pipeline Showcase ──────────────────── */}
      <section id="chatbot-sync" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 backdrop-blur-2xl shadow-xl overflow-hidden">
          {/* macOS Titlebar */}
          <div className="h-10 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[12px] font-bold text-slate-800">
                UP Admin Console ──► Leaf Chatbot Realtime Pipeline
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#005baa]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold">LIVE AUTOMATED SYNC ACTIVE</span>
            </div>
          </div>

          {/* Showcase Content Split Grid */}
          <div className="grid lg:grid-cols-12 min-h-[460px]">
            {/* Left: Admin Workspace Actions (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-6 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#005baa] flex items-center gap-2">
                  <LayoutDashboard size={15} />
                  Content Management Workspace
                </span>
                <span className="text-xs text-slate-600 font-mono font-bold">Step 1: Admin Update</span>
              </div>

              <div className="space-y-4">
                {/* Demo Record Item 1: ASC Coach */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 transition hover:border-[#005baa] shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Users size={15} className="text-[#005baa]" />
                      ASC Coach Directory Record
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-black">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-bold">
                    Dr. Sarah Khumalo — Senior Academic Coach (Faculty of EMS)
                  </p>
                  <p className="text-xs text-slate-600 font-semibold">
                    Office: EMS Building Rm 2-14 · Appointment: up.ac.za/asc-ems-booking
                  </p>
                </div>

                {/* Demo Record Item 2: DSA Unit */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 transition hover:border-[#005baa] shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 flex items-center gap-2">
                      <HeartPulse size={15} className="text-[#005baa]" />
                      DSA Unit: Student Counselling & Disability Unit
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-black">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-bold">
                    2026 Examination Concessions & Extra Time Application Protocol
                  </p>
                  <p className="text-xs text-slate-600 font-semibold">
                    Deadline: 30 September · Portal: up.ac.za/disability-unit
                  </p>
                </div>

                {/* Demo Record Item 3: UP General Info */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 transition hover:border-[#005baa] shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Building2 size={15} className="text-[#005baa]" />
                      General UP Guidelines
                    </span>
                    <span className="rounded-full bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 text-[10px] font-black">
                      SYNCED TO VECTOR STORE
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-bold">
                    2026 Second Semester Module Discontinuation & Fee Refund Policy
                  </p>
                </div>
              </div>

              {/* Sync Receipt Bar */}
              <div className="rounded-xl border border-[#005baa] bg-[#005baa]/10 p-3.5 flex items-center justify-between text-xs text-[#003d73]">
                <div className="flex items-center gap-2 font-bold">
                  <RefreshCw size={15} className="animate-spin text-[#005baa]" />
                  <span>Vector Knowledge Sync: <strong>3 Records Processed</strong></span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-900">Receipt #req-up-8842</span>
              </div>
            </div>

            {/* Right: Leaf Chatbot Live Output (5 cols) */}
            <div className="lg:col-span-5 bg-[#002855] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Leaf Chatbot (Student View)
                  </span>
                  <span className="text-[11px] font-mono text-[#b0d8ff] font-bold">Step 2: Realtime Student Answer</span>
                </div>

                {/* Simulated Student Query */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#005baa] px-4 py-3 text-xs text-white font-bold shadow-md">
                    "How do I contact an EMS Academic Coach and what is the Disability Unit extra time deadline?"
                  </div>
                </div>

                {/* Simulated Leaf Response with Instant Synced Data */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] space-y-2.5 rounded-2xl rounded-tl-xs border border-white/20 bg-white/10 p-4 text-xs text-white backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2 font-black text-[#b0d8ff]">
                      <MessageSquare size={15} />
                      <span>Leaf Assistant</span>
                    </div>
                    <p className="leading-relaxed font-bold">
                      Here is the updated official information:
                    </p>
                    <ul className="space-y-1.5 text-white pl-3 list-disc font-bold">
                      <li>
                        <strong>EMS Coach:</strong> Dr. Sarah Khumalo is available at EMS Building Rm 2-14. Book via up.ac.za/asc-ems-booking.
                      </li>
                      <li>
                        <strong>Disability Unit Deadline:</strong> Concession applications close 30 September 2026.
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-white/20 text-[11px] text-emerald-300 flex items-center gap-1.5 font-extrabold">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Verified from UP Admin Console · Live Sync</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot status footer */}
              <div className="text-center text-xs text-[#b0d8ff] pt-4 border-t border-white/15 font-bold">
                Leaf answers via Webchat & WhatsApp automatically reflect all changes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Pillars / Content Scope Section ─────────────────────── */}
      <section id="about" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#005baa]">
            What You Can Manage
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#002855] drop-shadow-sm">
            The 3 Pillars of UP Support Knowledge
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-bold">
            A single unified interface governing all academic success, departmental, and institutional guidelines across the University of Pretoria.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pillar 1: Academic Success Coaches */}
          <div className="group rounded-3xl border-2 border-slate-200 bg-white text-slate-900 p-8 transition-all hover:border-[#005baa] hover:-translate-y-1 backdrop-blur-2xl shadow-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#005baa] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
              <Users size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#002855] mb-3 tracking-tight drop-shadow-sm">
              1. Academic Success Coaches
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-6 font-semibold">
              Manage complete coach directories, faculty allocations, title roles, office locations, appointment links, and undergrad/postgrad level responsibilities.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-900 font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Per-faculty ASC coach directory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Live appointment link management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Undergraduate & Postgraduate clusters</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Department of Student Affairs (DSA) */}
          <div id="dsa-units" className="group rounded-3xl border-2 border-slate-200 bg-white text-slate-900 p-8 transition-all hover:border-[#005baa] hover:-translate-y-1 backdrop-blur-2xl shadow-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#005baa] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
              <HeartPulse size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#002855] mb-3 tracking-tight drop-shadow-sm">
              2. Department of Student Affairs
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-6 font-semibold">
              Maintain official support guides, policies, and contacts across all DSA units so student queries are resolved correctly.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-900 font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Student Counselling & Health Services</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Disability Unit & Concessions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Governance, ISFAP & SNAPP Funding</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: UP General Information */}
          <div className="group rounded-3xl border-2 border-slate-200 bg-white text-slate-900 p-8 transition-all hover:border-[#005baa] hover:-translate-y-1 backdrop-blur-2xl shadow-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#005baa] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
              <Building2 size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#002855] mb-3 tracking-tight drop-shadow-sm">
              3. UP General Information
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-6 font-semibold">
              Publish and verify general University of Pretoria academic rules, module requirements, admissions criteria, fees, and campus FAQs.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-900 font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Faculties & Programme curriculums</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Verified academic FAQ repository</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#005baa]" />
                <span>Document upload & PDF guide indexing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Automated Sync Process Section ────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#005baa]">
            Automated Knowledge Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#002855] drop-shadow-sm">
            How Any Update Reaches Students
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-bold">
            Zero manual retraining required. When administrators edit content in the console, the Leaf chatbot updates automatically.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 p-6 space-y-3 relative shadow-md">
            <span className="text-3xl font-black text-[#005baa]">01</span>
            <h4 className="text-lg font-black text-[#002855]">Admin Record Edit</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Administrator updates a Coach, DSA Unit, or FAQ entry in the UP Admin Console workspace.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 p-6 space-y-3 relative shadow-md">
            <span className="text-3xl font-black text-[#005baa]">02</span>
            <h4 className="text-lg font-black text-[#002855]">Validation & Audit</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Mutation receipts confirm payload integrity and verify role permissions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 p-6 space-y-3 relative shadow-md">
            <span className="text-3xl font-black text-[#005baa]">03</span>
            <h4 className="text-lg font-black text-[#002855]">Vector Store Sync</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Knowledge records are automatically indexed into the Dify vector store.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 p-6 space-y-3 relative shadow-md">
            <span className="text-3xl font-black text-[#005baa]">04</span>
            <h4 className="text-lg font-black text-[#002855]">Leaf Resolution</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Leaf chatbot answers student questions on WhatsApp & Webchat using the newly updated data.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Metrics Bar ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-[#005baa] text-white p-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-5xl font-black text-white">9</p>
              <p className="text-xs font-black uppercase tracking-wider text-[#b0d8ff] mt-1">
                UP Faculties Covered
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-[#b0d8ff]">6</p>
              <p className="text-xs font-black uppercase tracking-wider text-[#b0d8ff] mt-1">
                DSA Units Integrated
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-emerald-300">100%</p>
              <p className="text-xs font-black uppercase tracking-wider text-[#b0d8ff] mt-1">
                Real-Time Leaf Sync
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-white">50k+</p>
              <p className="text-xs font-black uppercase tracking-wider text-[#b0d8ff] mt-1">
                UP Students Supported
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="rounded-3xl border-2 border-[#005baa]/30 bg-gradient-to-b from-[#005baa]/10 via-[#dcecf8]/40 to-white p-10 sm:p-16 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,91,170,0.15),transparent_70%)] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#002855] drop-shadow-sm relative z-10">
            Keep UP support content synchronized.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-xl mx-auto font-bold relative z-10">
            Log in to the console to update coaches, DSA guidelines, or general UP resources and empower the Leaf chatbot.
          </p>

          <div className="mt-8 flex justify-center relative z-10">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#005baa] px-8 py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-[#00457f] hover:scale-105"
              >
                <span>Sign In to Access Console</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/admin"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#005baa] px-8 py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-[#00457f] hover:scale-105"
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
      <footer className="relative z-10 border-t border-[#003d73] bg-[#002855] text-white py-12 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md bg-white object-contain p-0.5 shadow-sm"
            />
            <span className="font-extrabold text-white">University of Pretoria · Academic Support Console</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#b0d8ff] font-bold">
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

          <div className="font-semibold text-slate-300">
            © {new Date().getFullYear()} University of Pretoria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
