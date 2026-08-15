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
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-[#334155] font-sans antialiased selection:bg-[#002B49] selection:text-white">
      {/* ─── Background Subtle UP Navy Vector Pattern ───────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.04]">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
        >
          <pattern
            id="up-grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#002B49"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#up-grid-pattern)" />
        </svg>
      </div>

      {/* ─── 1. Sticky Navigation Header ───────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#002B49] rounded-lg p-1 transition-colors"
          >
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-lg bg-white object-contain p-1 border border-slate-200"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#002B49]">
                University of Pretoria
              </span>
              <p className="text-sm font-bold tracking-tight text-[#002B49]">
                Academic Support Workspace
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a
              href="#about"
              className="hover:text-[#002B49] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#002B49] rounded px-2 py-1"
            >
              Workspace Overview
            </a>
            <a
              href="#dsa-units"
              className="hover:text-[#002B49] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#002B49] rounded px-2 py-1"
            >
              DSA Units
            </a>
            <a
              href="#coaches"
              className="hover:text-[#002B49] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#002B49] rounded px-2 py-1"
            >
              ASC Directory
            </a>
            <a
              href="#chatbot-sync"
              className="hover:text-[#002B49] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#002B49] rounded px-2 py-1"
            >
              Leaf Chatbot Sync
            </a>
          </nav>

          {/* Auth Action Button */}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-lg bg-[#002B49] px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#001F35] focus-visible:outline-2 focus-visible:outline-[#002B49]"
              >
                <span>Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <UserButton />
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#002B49] px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#001F35] focus-visible:outline-2 focus-visible:outline-[#002B49]"
                >
                  <LayoutDashboard size={14} />
                  <span>Open Console</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* ─── 2. Hero Section ───────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#F8FAFC] border-b border-slate-200/80 pt-16 md:pt-24 pb-20 text-center flex flex-col items-center">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#002B49] mb-6 shadow-xs">
            <GraduationCap size={15} className="text-[#BA1C21]" />
            <span>Official UP Content Management & AI Knowledge Workspace</span>
          </div>

          {/* Headline in Solid UP Navy */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#002B49] leading-[1.12]">
            One workspace for UP support.
            <br />
            Instant knowledge for Leaf Chatbot.
          </h1>

          {/* Hero Subtitle in Slate */}
          <p className="mt-6 text-base sm:text-lg text-[#334155] max-w-2xl leading-relaxed">
            Manage Academic Success Coaches information, Department of Student
            Affairs (DSA) units, and general UP guidelines in one central
            workspace. Any information updated on the platform automatically
            updates the Leaf chatbot in real time.
          </p>

          {/* CTA Buttons Row - Strictly Flat Styling */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002B49] text-white font-semibold text-sm px-6 py-3 transition-colors duration-150 hover:bg-[#001F35] focus-visible:outline-2 focus-visible:outline-[#002B49]"
              >
                <span>Sign In to Admin Workspace</span>
                <ArrowRight size={16} />
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002B49] text-white font-semibold text-sm px-6 py-3 transition-colors duration-150 hover:bg-[#001F35] focus-visible:outline-2 focus-visible:outline-[#002B49]"
              >
                <LayoutDashboard size={16} />
                <span>Go to Admin Console</span>
                <ArrowRight size={16} />
              </Link>
            </Show>

            <a
              href="#chatbot-sync"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-[#002B49] font-semibold text-sm px-6 py-3 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#002B49]"
            >
              <Database size={16} className="text-[#002B49]" />
              <span>How Leaf Sync Works</span>
            </a>
          </div>

          {/* Security Indicator */}
          <p className="mt-6 text-xs text-slate-500 flex items-center gap-1.5 justify-center">
            <ShieldCheck size={14} className="text-[#10B981]" />
            <span>Clerk Enterprise Authentication & RBAC Enforced</span>
          </p>
        </div>
      </section>

      {/* ─── 4. Interactive Preview / Dashboard Mockup ──────────────────── */}
      <section id="chatbot-sync" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-xl border border-slate-800 bg-[#0B192C] text-white shadow-xl overflow-hidden">
          {/* Terminal Window Header */}
          <div className="h-10 bg-[#06101E] border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="ml-3 font-mono text-xs font-semibold text-slate-200">
                UP Admin Workspace ──► Leaf Chatbot Automated Pipeline
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>DIFY VECTOR SYNC ACTIVE</span>
            </div>
          </div>

          {/* Showcase Split Grid */}
          <div className="grid lg:grid-cols-12 min-h-[440px]">
            {/* Left: Admin Actions (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-5 bg-[#0D1E36]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <LayoutDashboard size={14} className="text-[#60A5FA]" />
                  Admin Content Console
                </span>
                <span className="text-xs text-slate-400 font-mono">Step 1: Admin Mutation</span>
              </div>

              <div className="space-y-3">
                {/* Record 1: ASC Coach */}
                <div className="rounded-lg border border-slate-700 bg-[#0B192C] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <Users size={14} className="text-[#60A5FA]" />
                      ASC Coach Directory Record
                    </span>
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-[11px] font-mono font-semibold">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Dr. Sarah Khumalo — Senior Academic Coach (Faculty of EMS)
                  </p>
                  <p className="text-xs text-slate-300 font-mono">
                    Office: EMS Building Rm 2-14 · Appointment: up.ac.za/asc-ems-booking
                  </p>
                </div>

                {/* Record 2: DSA Unit */}
                <div className="rounded-lg border border-slate-700 bg-[#0B192C] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <HeartPulse size={14} className="text-[#60A5FA]" />
                      DSA Unit: Student Counselling & Disability Unit
                    </span>
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-[11px] font-mono font-semibold">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    2026 Examination Concessions & Extra Time Application Protocol
                  </p>
                  <p className="text-xs text-slate-300 font-mono">
                    Deadline: 30 September · Portal: up.ac.za/disability-unit
                  </p>
                </div>

                {/* Record 3: UP General Info */}
                <div className="rounded-lg border border-slate-700 bg-[#0B192C] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <Building2 size={14} className="text-[#60A5FA]" />
                      General UP Guidelines
                    </span>
                    <span className="rounded bg-blue-950 text-blue-300 border border-blue-700/60 px-2 py-0.5 text-[11px] font-mono font-semibold">
                      VECTOR SYNCED
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    2026 Second Semester Module Discontinuation & Fee Refund Policy
                  </p>
                </div>
              </div>

              {/* Receipt Bar */}
              <div className="rounded-lg border border-slate-700 bg-[#06101E] p-3 flex items-center justify-between text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-[#60A5FA]" />
                  <span>Dify Vector Ingestion: 3 Records Synced</span>
                </div>
                <span className="text-slate-400">#req-up-8842</span>
              </div>
            </div>

            {/* Right: Leaf AI Chatbot Output (5 cols) */}
            <div className="lg:col-span-5 bg-[#06101E] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <MessageSquare size={15} />
                    Leaf Chatbot Output
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Step 2: Student Resolution</span>
                </div>

                {/* Student Question */}
                <div className="flex justify-end">
                  <div className="max-w-[90%] rounded-lg bg-[#002B49] border border-blue-800 px-4 py-2.5 text-xs text-white">
                    "How do I contact an EMS Academic Coach and what is the Disability Unit extra time deadline?"
                  </div>
                </div>

                {/* Leaf AI Synced Answer */}
                <div className="flex justify-start">
                  <div className="max-w-[95%] space-y-2 rounded-lg border border-slate-700 bg-[#0D1E36] p-4 text-xs text-slate-200">
                    <div className="flex items-center gap-2 font-bold text-[#60A5FA]">
                      <MessageSquare size={14} />
                      <span>Leaf AI Assistant</span>
                    </div>
                    <p className="leading-relaxed">
                      Official verified information from the UP Admin Console:
                    </p>
                    <ul className="space-y-1.5 pl-3 list-disc text-white">
                      <li>
                        <strong>EMS Coach:</strong> Dr. Sarah Khumalo is available at EMS Building Rm 2-14. Book via up.ac.za/asc-ems-booking.
                      </li>
                      <li>
                        <strong>Disability Unit Deadline:</strong> Concession applications close 30 September 2026.
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-slate-700 text-[11px] text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Verified UP Database Source</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 border-t border-slate-800 pt-3">
                Webchat & WhatsApp student queries reflect console updates immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. "3 Pillars of UP Support Knowledge" ─────────────────────── */}
      <section id="about" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#002B49]">
            Supported Domains
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#002B49]">
            The 3 Pillars of UP Support Knowledge
          </h2>
          <p className="text-sm sm:text-base text-[#334155]">
            A single institutional workspace governing all academic success, departmental, and general university guidelines across the University of Pretoria.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between">
            <div>
              <div className="bg-slate-100 text-[#002B49] p-3 rounded-lg w-fit mb-4">
                <Users size={22} />
              </div>
              <h3 className="text-[#002B49] text-xl font-bold mb-2">
                1. Academic Success Coaches
              </h3>
              <p className="text-[#334155] text-sm leading-relaxed mb-6">
                Manage complete coach directories, faculty allocations, title roles, office locations, appointment booking URLs, and student level clusters.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-[#334155] font-medium border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Per-faculty ASC coach directory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Live appointment link management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Undergrad & Postgrad level clusters</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div id="dsa-units" className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between">
            <div>
              <div className="bg-slate-100 text-[#002B49] p-3 rounded-lg w-fit mb-4">
                <HeartPulse size={22} />
              </div>
              <h3 className="text-[#002B49] text-xl font-bold mb-2">
                2. Department of Student Affairs
              </h3>
              <p className="text-[#334155] text-sm leading-relaxed mb-6">
                Maintain official support guides, unit contacts, and procedures across Student Counselling, Health, Disability Unit, Governance, ISFAP, and SNAPP.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-[#334155] font-medium border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Student Counselling & Health Services</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Disability Unit & Concessions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Governance, ISFAP & SNAPP Funding</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between">
            <div>
              <div className="bg-slate-100 text-[#002B49] p-3 rounded-lg w-fit mb-4">
                <Building2 size={22} />
              </div>
              <h3 className="text-[#002B49] text-xl font-bold mb-2">
                3. UP General Information
              </h3>
              <p className="text-[#334155] text-sm leading-relaxed mb-6">
                Publish and verify general University of Pretoria academic rules, module requirements, admissions guidelines, fees, and institutional FAQs.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-[#334155] font-medium border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Faculties & Programme curriculums</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Verified academic FAQ repository</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#002B49]" />
                <span>Document upload & PDF indexing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── 4. Pipeline Section: "How Any Update Reaches Students" ────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#002B49]">
            Automated Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#002B49]">
            How Any Update Reaches Students
          </h2>
          <p className="text-sm sm:text-base text-[#334155]">
            Zero manual retraining required. When administrators edit content in the workspace, the Leaf chatbot updates automatically.
          </p>
        </div>

        {/* 4-Step Modular Horizontal Process Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 01 */}
          <div className="border-t-4 border-[#002B49] bg-white border-x border-b border-slate-200 p-6 rounded-xl shadow-xs space-y-3">
            <span className="text-2xl font-bold text-[#002B49]">01</span>
            <h4 className="text-base font-bold text-[#002B49]">Admin Record Edit</h4>
            <p className="text-xs text-[#334155] leading-relaxed">
              Administrator updates a Coach, DSA Unit, or FAQ entry in the console workspace.
            </p>
          </div>

          {/* Step 02 */}
          <div className="border-t-4 border-[#002B49] bg-white border-x border-b border-slate-200 p-6 rounded-xl shadow-xs space-y-3">
            <span className="text-2xl font-bold text-[#002B49]">02</span>
            <h4 className="text-base font-bold text-[#002B49]">Validation & Audit</h4>
            <p className="text-xs text-[#334155] leading-relaxed">
              Mutation receipts confirm payload hash integrity and verify role permissions.
            </p>
          </div>

          {/* Step 03 */}
          <div className="border-t-4 border-[#002B49] bg-white border-x border-b border-slate-200 p-6 rounded-xl shadow-xs space-y-3">
            <span className="text-2xl font-bold text-[#002B49]">03</span>
            <h4 className="text-base font-bold text-[#002B49]">Vector Store Sync</h4>
            <p className="text-xs text-[#334155] leading-relaxed">
              Knowledge records are automatically indexed into the Dify vector database.
            </p>
          </div>

          {/* Step 04 */}
          <div className="border-t-4 border-[#002B49] bg-white border-x border-b border-slate-200 p-6 rounded-xl shadow-xs space-y-3">
            <span className="text-2xl font-bold text-[#002B49]">04</span>
            <h4 className="text-base font-bold text-[#002B49]">Leaf Resolution</h4>
            <p className="text-xs text-[#334155] leading-relaxed">
              Leaf chatbot answers student questions on WhatsApp & Webchat using the updated data.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. Metrics Bar ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="bg-[#002B49] text-white rounded-xl shadow-sm p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-extrabold text-white">9</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">
                UP Faculties Covered
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">6</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">
                DSA Units Integrated
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#10B981]">100%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">
                Real-Time Leaf Sync
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">50k+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">
                UP Students Supported
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-10 sm:p-14 shadow-sm">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#002B49]">
            Keep UP support content synchronized.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#334155] max-w-xl mx-auto">
            Log in to the workspace to update Academic Success Coaches, DSA guidelines, or general UP resources and empower the Leaf chatbot.
          </p>

          <div className="mt-8 flex justify-center">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#002B49] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#001F35] focus-visible:outline-2 focus-visible:outline-[#002B49]"
              >
                <span>Sign In to Access Console</span>
                <ArrowRight size={16} />
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#002B49] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#001F35] focus-visible:outline-2 focus-visible:outline-[#002B49]"
              >
                <LayoutDashboard size={18} />
                <span>Open Admin Workspace</span>
                <ArrowRight size={16} />
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* ─── 4. Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-[#001D33] text-slate-300 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={28}
              height={28}
              className="h-7 w-7 rounded bg-white object-contain p-0.5"
            />
            <span className="font-semibold text-slate-200">
              University of Pretoria · Academic Support Console
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
            <Link
              href="/admin/faculties"
              className="hover:text-white transition-colors duration-150"
            >
              Faculties
            </Link>
            <Link
              href="/admin/coaches"
              className="hover:text-white transition-colors duration-150"
            >
              ASC Coaches
            </Link>
            <Link
              href="/admin/resources"
              className="hover:text-white transition-colors duration-150"
            >
              Resources & DSA
            </Link>
            <Link
              href="/admin/faqs"
              className="hover:text-white transition-colors duration-150"
            >
              FAQs
            </Link>
          </div>

          <div className="text-slate-400">
            © {new Date().getFullYear()} University of Pretoria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
