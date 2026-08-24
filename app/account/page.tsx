"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import SiteFooter from "@/components/SiteFooter";

type Tab = "login" | "register";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const [tab, setTab] = useState<Tab>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Register state
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSubscribe, setRegSubscribe] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const searchParams = useSearchParams();

  // Check for existing session on mount
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      // Email confirmed — show login tab with success message
      setTab("login");
      setLoginError("");
    }

    const error = searchParams.get("error");
    if (error) {
      setTab("login");
      setLoginError("Email confirmation failed. Please try again.");
    }

    setLoading(false);
  }, [searchParams]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        subscribe: regSubscribe,
      }),
    });

    let data: { error?: string; success?: boolean } = {};
    try { data = await res.json(); } catch { /* empty body on 500 */ }
    setRegLoading(false);

    if (!res.ok) {
      setRegError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    setRegSuccess(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    let data: { error?: string; user?: User } = {};
    try { data = await res.json(); } catch { /* empty body on 500 */ }
    setLoginLoading(false);

    if (!res.ok) {
      setLoginError(data.error ?? "Sign in failed. Please check your credentials.");
      return;
    }

    setUser(data.user ?? null);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoginEmail("");
    setLoginPassword("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bb-paper flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-bb-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-paper text-bb-ink">
      <NavBar variant="dark" />

      {user ? (
        /* ─── Dashboard ─── */
        <div className="mx-auto max-w-2xl px-6 pt-24 pb-20 md:pt-32">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <Image src="/bb-icon.png" alt="BounceBack" width={80} height={80} className="h-16 w-16 md:h-20 md:w-20" />
            <h1 className="sport-display mt-3 text-2xl text-bb-ink md:text-3xl">
              BOUNCEBACK ACCOUNT
            </h1>
          </div>

          {/* Welcome card */}
          <div className="border border-bb-ink/15 p-6 mb-8">
            <p className="text-xs font-semibold tracking-[0.12em] text-bb-ink/40 mb-1">WELCOME BACK</p>
            <h2 className="sport-display text-3xl text-bb-ink">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-bb-ink/50 mt-1">{user.email}</p>
          </div>

          {/* Account sections */}
          <div className="space-y-4">
            {dashboardSections.map((section) => (
              <div key={section.label} className="border border-bb-ink/10 p-5 flex items-center justify-between group cursor-pointer hover:border-bb-ink/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center border border-bb-ink/15 text-bb-ink/50 group-hover:border-bb-ink/30 transition-colors">
                    {section.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.05em] text-bb-ink">{section.label}</p>
                    <p className="text-xs text-bb-ink/40 mt-0.5">{section.description}</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bb-ink/30 group-hover:text-bb-ink/60 transition-colors">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>

          {/* Log out */}
          <div className="mt-10 pt-8 border-t border-bb-ink/10">
            <button
              onClick={handleLogout}
              className="text-sm text-bb-ink/40 hover:text-bb-ink transition-colors tracking-[0.05em]"
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        /* ─── Auth Forms ─── */
        <>
          {/* Header */}
          <div className="flex flex-col items-center pt-24 pb-8 md:pt-32 md:pb-10">
            <Image src="/bb-icon.png" alt="BounceBack" width={80} height={80} className="h-16 w-16 md:h-20 md:w-20" />
            <h1 className="sport-display mt-3 text-2xl text-bb-ink md:text-3xl">
              BOUNCEBACK ACCOUNT
            </h1>
          </div>

          <div className="mx-auto max-w-md px-6">
            {/* Tabs */}
            <div className="flex border-b border-bb-ink/15">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 pb-3 text-center text-sm font-semibold tracking-[0.1em] transition-colors ${
                  tab === "login"
                    ? "border-b-2 border-bb-ink text-bb-ink"
                    : "text-bb-ink/40 hover:text-bb-ink/60"
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => setTab("register")}
                className={`flex-1 pb-3 text-center text-sm font-semibold tracking-[0.1em] transition-colors ${
                  tab === "register"
                    ? "border-b-2 border-bb-ink text-bb-ink"
                    : "text-bb-ink/40 hover:text-bb-ink/60"
                }`}
              >
                REGISTER
              </button>
            </div>

            {/* ─── Email confirmed banner ─── */}
            {searchParams.get("confirmed") === "true" && (
              <div className="mt-6 border border-bb-mid/40 bg-bb-mint/30 px-4 py-3 text-sm text-bb-ink">
                Email confirmed! You can now sign in.
              </div>
            )}

            {/* ─── LOG IN Form ─── */}
            {tab === "login" && (
              <form className="mt-10 space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-bb-ink">
                    E-mail<span className="text-bb-red">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-1.5 w-full border border-bb-ink/20 bg-transparent px-4 py-3 text-sm text-bb-ink outline-none placeholder:text-bb-ink/30 transition-colors focus:border-bb-ink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bb-ink">
                    Password<span className="text-bb-red">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="mt-1.5 w-full border border-bb-ink/20 bg-transparent px-4 py-3 text-sm text-bb-ink outline-none placeholder:text-bb-ink/30 transition-colors focus:border-bb-ink"
                  />
                  <button type="button" className="mt-2 text-xs text-bb-ink/50 transition-colors hover:text-bb-ink">
                    Forgot your password?
                  </button>
                </div>

                {loginError && (
                  <p className="text-sm text-bb-red">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 bg-bb-ink py-4 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors hover:bg-bb-volt hover:text-bb-ink disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-bb-cream border-t-transparent rounded-full animate-spin" />
                      SIGNING IN…
                    </>
                  ) : "SIGN IN"}
                </button>
              </form>
            )}

            {/* ─── REGISTER Form ─── */}
            {tab === "register" && (
              <>
                {regSuccess ? (
                  /* Success state */
                  <div className="mt-10 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-bb-mid/40 bg-bb-mint/40">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bb-ink">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold tracking-[0.05em] text-bb-ink">CHECK YOUR EMAIL</h3>
                    <p className="text-sm leading-relaxed text-bb-ink/60">
                      We sent a confirmation link to <span className="font-semibold text-bb-ink">{regEmail}</span>.
                      Click the link to verify your account, then come back to sign in.
                    </p>
                    <button
                      onClick={() => setTab("login")}
                      className="mt-4 text-sm font-semibold tracking-[0.08em] text-bb-ink underline underline-offset-4 hover:text-bb-ink/70 transition-colors"
                    >
                      Go to Sign In
                    </button>
                  </div>
                ) : (
                  <form className="mt-10 space-y-5" onSubmit={handleRegister}>
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-bb-ink">
                          First name<span className="text-bb-red">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="First name"
                          required
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          className="mt-1.5 w-full border border-bb-ink/20 bg-transparent px-4 py-3 text-sm text-bb-ink outline-none placeholder:text-bb-ink/30 transition-colors focus:border-bb-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bb-ink">
                          Last name<span className="text-bb-red">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Last name"
                          required
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          className="mt-1.5 w-full border border-bb-ink/20 bg-transparent px-4 py-3 text-sm text-bb-ink outline-none placeholder:text-bb-ink/30 transition-colors focus:border-bb-ink"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-bb-ink">
                        E-mail<span className="text-bb-red">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="mt-1.5 w-full border border-bb-ink/20 bg-transparent px-4 py-3 text-sm text-bb-ink outline-none placeholder:text-bb-ink/30 transition-colors focus:border-bb-ink"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-bb-ink">
                        Password<span className="text-bb-red">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="mt-1.5 w-full border border-bb-ink/20 bg-transparent px-4 py-3 text-sm text-bb-ink outline-none placeholder:text-bb-ink/30 transition-colors focus:border-bb-ink"
                      />
                    </div>

                    {/* Subscribe checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regSubscribe}
                        onChange={(e) => setRegSubscribe(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 border border-bb-ink/30 accent-bb-ink"
                      />
                      <span className="text-xs leading-relaxed text-bb-ink/60">
                        Subscribe to receive email updates about BounceBack product launches,
                        promotions and exclusive discounts.
                      </span>
                    </label>

                    {/* Terms */}
                    <p className="text-xs leading-relaxed text-bb-ink/50">
                      By submitting this form, you accept the{" "}
                      <a href="/terms" className="underline transition-colors hover:text-bb-ink">
                        Terms &amp; Conditions
                      </a>.
                    </p>

                    {regError && (
                      <p className="text-sm text-bb-red">{regError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="flex w-full items-center justify-center gap-2 bg-bb-ink py-4 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors hover:bg-bb-volt hover:text-bb-ink disabled:opacity-60"
                    >
                      {regLoading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-bb-cream border-t-transparent rounded-full animate-spin" />
                          CREATING ACCOUNT…
                        </>
                      ) : "REGISTER"}
                    </button>

                    {/* ─── Benefits Section ─── */}
                    <div className="mt-10 pt-10 border-t border-bb-ink/10">
                      <h3 className="text-lg font-bold tracking-[0.03em] text-bb-ink leading-tight md:text-xl">
                        CREATING AN ACCOUNT
                        <br />
                        ENABLES YOU TO:
                      </h3>

                      <ul className="mt-6 space-y-5">
                        {benefits.map((b) => (
                          <li key={b.label} className="flex items-start gap-4">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-bb-ink/15 text-bb-ink/60">
                              {b.icon}
                            </span>
                            <span className="text-sm leading-relaxed text-bb-ink/70">
                              {b.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </form>
                )}
              </>
            )}

            <div className="h-20" />
          </div>
        </>
      )}

      <SiteFooter />
    </div>
  );
}

/* ── Dashboard sections ── */
const dashboardSections = [
  {
    label: "My Orders",
    description: "View order history and tracking",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Wishlist",
    description: "Saved items for later",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Manage Profile",
    description: "Update your personal information",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Preferences",
    description: "Notifications and communication settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a3 3 0 013 3v1a7 7 0 014 6.5v2.5l2 2H3l2-2V12.5A7 7 0 019 6V5a3 3 0 013-3z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19a3 3 0 006 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ── Benefits data ── */
const benefits = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Enrol in BounceBack rewards system",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 7l-10 7L2 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Receive the BounceBack newsletter and obtain access to the latest news, release information and unique discount codes before anyone else.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Be able to view your full order history and order tracking details.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Save your payment details, to make checking out quicker and easier.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Add products to your wishlist for viewing or purchasing at a later date.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="18" x2="12" y2="18.01" strokeLinecap="round" />
      </svg>
    ),
    label: "Access your BounceBack account on our Mobile App",
  },
];
