"use client";

import { useState, useEffect, useRef } from "react";
import NavBar from "@/components/NavBar";

const balls = [
  {
    id: "rbin-ball-sm-left",
    base: "left-[12%] top-[18%] h-7 w-7 md:left-[16%] md:top-[22%] md:h-9 md:w-9 lg:left-[22%] lg:top-[25%] lg:h-[44px] lg:w-[44px]",
    drift: { x: 30, y: 40, rotate: 15 },
    duration: 7,
  },
  {
    id: "rbin-ball-md-tr",
    base: "right-[4%] top-[4%] h-12 w-12 md:right-[8%] md:top-[6%] md:h-[72px] md:w-[72px] lg:right-[12%] lg:top-[8%] lg:h-[100px] lg:w-[100px]",
    drift: { x: -36, y: 32, rotate: -10 },
    duration: 9,
  },
  {
    id: "rbin-ball-lg-bl",
    base: "-bottom-[50px] -left-[30px] h-[160px] w-[160px] md:-bottom-[70px] md:-left-[40px] md:h-[240px] md:w-[240px] lg:-bottom-[80px] lg:-left-[50px] lg:h-[300px] lg:w-[300px]",
    drift: { x: 28, y: -24, rotate: 8 },
    duration: 11,
  },
  {
    id: "rbin-ball-md-br",
    base: "bottom-[16%] right-[4%] h-10 w-10 md:bottom-[20%] md:right-[8%] md:h-[64px] md:w-[64px] lg:bottom-[24%] lg:right-[12%] lg:h-[90px] lg:w-[90px]",
    drift: { x: -34, y: -30, rotate: -12 },
    duration: 8,
  },
];

function buildKeyframes() {
  return balls
    .map(
      (b) => `
@keyframes ${b.id} {
  0%, 100% { transform: translate(0px, 0px); }
  25% { transform: translate(${b.drift.x}px, ${b.drift.y * 0.6}px); }
  50% { transform: translate(${b.drift.x * 0.4}px, ${b.drift.y}px); }
  75% { transform: translate(${-b.drift.x * 0.5}px, ${b.drift.y * 0.3}px); }
}`
    )
    .join("\n");
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC",
];

const ADDITIONAL_BIN_OPTIONS: { label: string; addons: number }[] = [
  { label: "No additional bins", addons: 0 },
  { label: "1 additional bin - $50", addons: 50 },
  { label: "2 additional bins - $100", addons: 100 },
  { label: "3 additional bins - $150", addons: 150 },
];

const BASE_MEMBERSHIP_PRICE = 150;

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  facilityName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  additionalBins: string;
  agreedTerms: boolean;
  agreedUpdates: boolean;
};

const TOTAL_STEPS = 5; // 0=welcome, 1=contact, 2=facility, 3=program, 4=payment

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RX = /^\d{5}(-\d{4})?$/;


export default function RequestBinPage() {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    facilityName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    additionalBins: "No additional bins",
    agreedTerms: false,
    agreedUpdates: false,
  });
  const [savedToBackend, setSavedToBackend] = useState(false);
  const [savedRowNumber, setSavedRowNumber] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "redirecting" | "unavailable">("idle");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (styleRef.current) return;
    const style = document.createElement("style");
    style.textContent = buildKeyframes();
    document.head.appendChild(style);
    styleRef.current = style;
    return () => {
      style.remove();
      styleRef.current = null;
    };
  }, []);

  // When Stripe redirects back with ?paid=1&session_id=cs_xxx, verify the
  // session server-side and flip the sheet row to "subscribed". This is the
  // fallback for not having a Stripe webhook configured yet — once the
  // webhook is set up, this becomes redundant but harmless (idempotent).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setCompleted(true);
      return;
    }
    fetch("/api/stripe-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .catch(() => {})
      .finally(() => {
        setCompleted(true);
        // Strip the query string so a refresh doesn't re-verify.
        window.history.replaceState({}, "", "/request-bin");
      });
  }, []);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    update(name as keyof FormData, value as FormData[keyof FormData]);
  }

  function validateStep(s: number): string {
    if (s === 1) {
      if (!formData.firstName.trim()) return "Please enter your first name.";
      if (!formData.lastName.trim()) return "Please enter your last name.";
      if (!formData.phone.trim()) return "Please enter a contact number.";
      if (!formData.email.trim()) return "Please enter your email.";
      if (!EMAIL_RX.test(formData.email.trim())) return "Please enter a valid email address.";
    }
    if (s === 2) {
      if (!formData.facilityName.trim()) return "Please enter your facility name.";
      if (!formData.streetAddress.trim()) return "Please enter a street address.";
      if (!formData.city.trim()) return "Please enter the city.";
      if (!formData.state.trim()) return "Please select your state.";
      if (!US_STATES.includes(formData.state.trim().toUpperCase()))
        return "Please select a valid US state.";
      if (!formData.zipCode.trim()) return "Please enter the zip code.";
      if (!ZIP_RX.test(formData.zipCode.trim()))
        return "Please enter a valid US zip code (e.g. 94028 or 94028-1234).";
    }
    if (s === 3) {
      if (!formData.agreedTerms) return "Please agree to the Membership Terms & Conditions.";
    }
    return "";
  }

  function goNext() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  // Step 2 → append a new row to the Google Sheet (cols A,B,C,D,F,G,H,I,J,N).
  // Returns the rowNumber so step 3 can update K,L,M on the same row.
  async function saveFacility() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sheet-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "facility",
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          facilityName: formData.facilityName,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Save failed.");
      setSavedRowNumber(data.rowNumber);
      setSavedToBackend(true);
      setStep(3);
    } catch {
      setError("Something went wrong saving your info. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 → update K,L,M (additional bins, agreed terms, wants updates) on the
  // row created in step 2, then fire the Resend email + Supabase insert.
  async function saveProgram() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    if (!savedRowNumber) {
      setError("Missing row reference. Please go back to Facility Information and resave.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sheet-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "program",
          rowNumber: savedRowNumber,
          additionalBins: formData.additionalBins,
          agreedTerms: formData.agreedTerms,
          agreedUpdates: formData.agreedUpdates,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Save failed.");

      // Notify Dillon + send confirmation email + insert into Supabase.
      // Fire-and-forget so a slow Resend response doesn't block the UI.
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).catch(() => {});

      setStep(4);
    } catch {
      setError("Something went wrong saving your selections. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 4 → mark sheet "checkout-started" on the saved row, then create a
  // Stripe Checkout Session and redirect. Stripe's webhook will later flip
  // the row to "subscribed", which triggers the checkForNewSubscribers
  // email pipeline.
  async function startPayment() {
    setPaymentStatus("redirecting");
    setError("");
    try {
      if (savedRowNumber) {
        await fetch("/api/sheet-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "checkout-started",
            rowNumber: savedRowNumber,
          }),
        }).catch(() => {});
      }

      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          facilityName: formData.facilityName,
          additionalBins: formData.additionalBins,
          rowNumber: savedRowNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPaymentStatus("unavailable");
        return;
      }
      window.location.href = data.url;
    } catch {
      setPaymentStatus("unavailable");
    }
  }

  function finishWithoutPayment() {
    setCompleted(true);
  }

  const addons =
    ADDITIONAL_BIN_OPTIONS.find((o) => o.label === formData.additionalBins)?.addons ?? 0;
  // Membership renews yearly; bins are one-time.
  const membershipFee = Math.round(BASE_MEMBERSHIP_PRICE * 0.033 * 100) / 100;
  const binsFee = Math.round(addons * 0.033 * 100) / 100;
  const recurringYearly =
    Math.round((BASE_MEMBERSHIP_PRICE + membershipFee) * 100) / 100;
  const total = Math.round((recurringYearly + addons + binsFee) * 100) / 100;

  const inputClass =
    "w-full rounded-xl bg-bb-deep px-6 py-4 text-sm text-white outline-none placeholder:text-white/30 md:py-5 md:text-base";
  const labelClass =
    "absolute -top-3 left-4 z-10 bg-bb-cream px-1.5 text-xs font-medium text-bb-mid";

  return (
    <div className="min-h-screen bg-bb-cream">
      <NavBar variant="dark" />

      <section className="relative w-full overflow-hidden pt-12 pb-40 md:pt-20 md:pb-56 lg:pt-28 lg:pb-80">
        {balls.map((b) => (
          <div
            key={b.id}
            className={`pointer-events-none absolute rounded-full bg-bb-lime ${b.base}`}
            style={{
              animation: `${b.id} ${b.duration}s ease-in-out infinite`,
              willChange: "transform",
            }}
          />
        ))}

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          {completed ? (
            <div className="mx-auto mt-14 max-w-[560px] rounded-2xl bg-bb-deep px-8 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bb-lime">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#084734"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">You&apos;re in.</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Your facility info is saved. We sent a confirmation to{" "}
                <span className="font-semibold text-white">{formData.email}</span>. Dillon
                will reach out shortly with next steps to finalize your membership.
              </p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="mx-auto mb-8 max-w-[560px]">
                <div className="flex items-center justify-between text-xs font-medium text-bb-deep/60">
                  <span>
                    Step {step + 1} of {TOTAL_STEPS}
                  </span>
                  <span>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bb-deep/10">
                  <div
                    className="h-full rounded-full bg-bb-deep transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                  />
                </div>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mx-auto max-w-[560px] space-y-5 text-left"
              >
                {/* ─── Step 0: Welcome ─── */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bb-mid">
                        Step 1 of 5 — Welcome
                      </p>
                      <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl lg:text-[44px] lg:leading-[1.1]">
                        Let&apos;s get your facility set up.
                      </h1>
                      <p className="text-sm leading-relaxed text-black/55 md:text-base">
                        Fill this out and we&apos;ll take care of the rest — bin shipped,
                        certificate sent, and your facility listed in the BounceBack network.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          title: "Branded recycling receptacle",
                          body: "Ships directly to your facility — included in year one.",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                          ),
                        },
                        {
                          title: "Sustainable Facility Accreditation Certificate",
                          body: "Official certification showing your community you care.",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <rect x="3" y="4" width="18" height="13" rx="2" />
                              <path d="M8 21l4-3 4 3" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                          ),
                        },
                        {
                          title: "Market your facility as certified sustainable",
                          body: "Show players your facility is leading the way.",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9 4 0 7 3 7 7a7 7 0 0 1-7 7" />
                              <path d="M11 20c0-3 2-7 9-7" />
                            </svg>
                          ),
                        },
                        {
                          title: "Listed on the BounceBack partner directory",
                          body: "Your facility featured on our website for all to find.",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          ),
                        },
                        {
                          title: "First access to recycled pickleballs at launch",
                          body: "Members get priority when our balls drop.",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                            </svg>
                          ),
                        },
                        {
                          title: "Exclusive pricing on recycled pickleballs",
                          body: "Member discount on the world's first 100% recycled pickleballs.",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                              <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                          ),
                        },
                      ].map((b) => (
                        <div
                          key={b.title}
                          className="flex items-start gap-4 rounded-xl border border-black/5 bg-white px-4 py-3.5 md:px-5 md:py-4"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bb-deep/5 text-bb-deep">
                            {b.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black md:text-[15px]">
                              {b.title}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-black/50 md:text-sm">
                              {b.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-bb-lime/15 px-4 py-3.5 text-sm text-bb-deep md:px-5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 h-5 w-5 shrink-0"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>
                        Join a growing network of facilities making America&apos;s
                        fastest-growing sport sustainable.
                      </span>
                    </div>

                    <p className="text-center text-xs text-black/40 md:text-sm">
                      Takes just a few minutes to complete.
                    </p>
                  </div>
                )}

                {/* ─── Step 1: Contact Info ─── */}
                {step === 1 && (
                  <>
                    <h2 className="text-center text-2xl font-bold text-black md:text-3xl">
                      Facility Contact Information
                    </h2>
                    <p className="text-center text-sm text-black/50">
                      Who&apos;s the main point of contact for your facility?
                    </p>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="relative">
                        <span className={labelClass}>First Name</span>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First"
                          className={inputClass}
                        />
                      </div>
                      <div className="relative">
                        <span className={labelClass}>Last Name</span>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <span className={labelClass}>Contact Number</span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className={inputClass}
                      />
                    </div>

                    <div className="relative">
                      <span className={labelClass}>Email Address</span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {/* ─── Step 2: Facility Info ─── */}
                {step === 2 && (
                  <>
                    <h2 className="text-center text-2xl font-bold text-black md:text-3xl">
                      Facility Information
                    </h2>
                    <p className="text-center text-sm text-black/50">
                      Where should we ship your BounceBack bin?
                    </p>

                    <div className="relative">
                      <span className={labelClass}>Facility Name</span>
                      <input
                        type="text"
                        name="facilityName"
                        required
                        value={formData.facilityName}
                        onChange={handleChange}
                        placeholder="Club, gym, or facility name"
                        className={inputClass}
                      />
                    </div>

                    <div className="relative">
                      <span className={labelClass}>Street Address</span>
                      <input
                        type="text"
                        name="streetAddress"
                        required
                        value={formData.streetAddress}
                        onChange={handleChange}
                        placeholder="123 Main St"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div className="relative md:col-span-2">
                        <span className={labelClass}>City</span>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          className={inputClass}
                        />
                      </div>
                      <div className="relative">
                        <span className={labelClass}>State</span>
                        <select
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className={`${inputClass} appearance-none pr-10`}
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
                          ▾
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className={labelClass}>Zip Code</span>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        inputMode="numeric"
                        pattern="\d{5}(-\d{4})?"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="94028"
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {/* ─── Step 3: Program Overview + Add-ons + Agreements ─── */}
                {step === 3 && (
                  <>
                    <h2 className="text-center text-2xl font-bold text-black md:text-3xl">
                      Program & Agreements
                    </h2>

                    <div className="rounded-2xl border-2 border-bb-deep/10 bg-white p-5 text-sm leading-relaxed text-black/70 md:p-6">
                      <p className="mb-3 text-base font-bold text-bb-deep">
                        The Sustainable Facility Accreditation Membership Includes:
                      </p>
                      <ul className="mt-2 space-y-2">
                        {[
                          "One BounceBack Pickle recycling bin (shipped to your facility)",
                          "Branding materials and clear instructions for setup + ball collection",
                          "Stamped Sustainable Facility Accreditation Certificate for on-site display",
                          "Promotional email template for your facilities members/players",
                          "Listing and promotion on BounceBack Pickle's website & social channels",
                          "Access to purchase 100% recycled pickleballs at a discounted rate for resale or facility use",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#65BE44"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mt-0.5 h-4 w-4 shrink-0"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 font-semibold text-bb-deep">
                        Price: $150/year per facility
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-black/55 md:text-sm">
                        <span className="font-semibold text-bb-deep">Note:</span> Members
                        are responsible for shipping of collected balls (you will receive
                        a personalized BounceBack Shipping Portal for the most affordable
                        and convenient shipping rates).
                      </p>
                    </div>

                    <div className="relative">
                      <span className={labelClass}>Additional Bins</span>
                      <select
                        name="additionalBins"
                        value={formData.additionalBins}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none pr-12`}
                      >
                        {ADDITIONAL_BIN_OPTIONS.map((o) => (
                          <option key={o.label}>{o.label}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/60">
                        ▾
                      </span>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-bb-deep/10 px-4 py-3.5 transition-colors hover:border-bb-deep/30 has-[:checked]:border-bb-lime has-[:checked]:bg-bb-lime/10">
                      <input
                        type="checkbox"
                        checked={formData.agreedTerms}
                        onChange={(e) => update("agreedTerms", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-bb-deep"
                      />
                      <div>
                        <p className="text-sm font-semibold text-bb-deep">
                          I agree to the{" "}
                          <a
                            href="https://docs.google.com/document/d/1apV07AJb46iM0duGfUGw4-U-iMSSfUMg/edit"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-bb-mid underline underline-offset-2 hover:text-bb-deep"
                          >
                            Membership Terms &amp; Conditions
                          </a>{" "}
                          <span className="text-red-500" aria-label="required">
                            *
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-bb-deep/50">
                          Required to join the program.
                        </p>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-bb-deep/10 px-4 py-3.5 transition-colors hover:border-bb-deep/30 has-[:checked]:border-bb-lime has-[:checked]:bg-bb-lime/10">
                      <input
                        type="checkbox"
                        checked={formData.agreedUpdates}
                        onChange={(e) => update("agreedUpdates", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-bb-deep"
                      />
                      <div>
                        <p className="text-sm font-semibold text-bb-deep">
                          Keep me in the loop
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-bb-deep/50">
                          Updates, sustainability news, and program announcements.
                        </p>
                      </div>
                    </label>
                  </>
                )}

                {/* ─── Step 4: Payment ─── */}
                {step === 4 && (
                  <>
                    <h2 className="text-center text-2xl font-bold text-black md:text-3xl">
                      Payment
                    </h2>

                    {savedToBackend && (
                      <div className="flex items-start gap-3 rounded-xl border-2 border-bb-lime bg-bb-lime/15 px-4 py-3.5 text-sm text-bb-deep">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>
                          <span className="font-semibold">Your info is saved.</span> If you
                          can&apos;t complete payment right now, Dillon will follow up with
                          billing details — no need to redo this form.
                        </span>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="rounded-2xl bg-white border-2 border-bb-deep/10 p-5 md:p-6">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-bb-mid">
                        Order summary
                      </p>
                      <div className="space-y-2.5 text-sm text-black/70 md:text-base">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                          Annual membership
                        </p>
                        <div className="flex items-baseline justify-between">
                          <span>Sustainable Facility Accreditation Membership</span>
                          <span className="font-semibold text-bb-deep">
                            ${BASE_MEMBERSHIP_PRICE}/yr
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span>Convenience fee (3.3%)</span>
                          <span className="font-semibold text-bb-deep">
                            +${membershipFee.toFixed(2)}/yr
                          </span>
                        </div>

                        {addons > 0 && (
                          <>
                            <div className="mt-3 border-t border-bb-deep/10 pt-3" />
                            <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                              One-time
                            </p>
                            <div className="flex items-baseline justify-between">
                              <span>{formData.additionalBins}</span>
                              <span className="font-semibold text-bb-deep">
                                +${addons.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                              <span>Convenience fee (3.3%)</span>
                              <span className="font-semibold text-bb-deep">
                                +${binsFee.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}

                        <div className="mt-3 border-t border-bb-deep/10 pt-3" />
                        <div className="flex items-baseline justify-between text-base md:text-lg">
                          <span className="font-bold text-bb-deep">Total today</span>
                          <span className="font-bold text-bb-deep">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-sm text-black/55">
                          <span>Renews each year</span>
                          <span className="font-semibold">
                            ${recurringYearly.toFixed(2)}/yr
                          </span>
                        </div>
                        <p className="pt-1 text-xs leading-relaxed text-black/50">
                          Membership renews automatically each year — cancel anytime. Bins
                          are a one-time charge.
                        </p>
                      </div>
                    </div>

                    {paymentStatus === "unavailable" ? (
                      <div className="rounded-xl bg-bb-deep px-5 py-4 text-sm leading-relaxed text-white/90">
                        Payment isn&apos;t available online yet — but{" "}
                        <span className="font-semibold text-white">your info is saved</span>
                        . Dillon will reach out shortly with payment details. You can close
                        this tab or click below to finish.
                      </div>
                    ) : null}
                  </>
                )}

                {error && (
                  <p className="text-center text-sm text-red-500">{error}</p>
                )}

                {/* ─── Navigation ─── */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  {step > 0 && step < 4 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="rounded-xl border-2 border-bb-deep/20 px-6 py-4 text-sm font-semibold text-bb-deep transition-colors hover:border-bb-deep/40 md:py-5 md:text-base"
                    >
                      ← Back
                    </button>
                  ) : (
                    <span />
                  )}

                  {step === 0 && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 rounded-xl bg-bb-deep px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-bb-deep/90 md:py-5 md:text-base"
                    >
                      Get Started →
                    </button>
                  )}

                  {step === 1 && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 rounded-xl bg-bb-deep px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-bb-deep/90 md:py-5 md:text-base"
                    >
                      Next →
                    </button>
                  )}

                  {step === 2 && (
                    <button
                      type="button"
                      onClick={saveFacility}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-bb-deep px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-bb-deep/90 disabled:cursor-not-allowed disabled:opacity-50 md:py-5 md:text-base"
                    >
                      {loading ? "Saving..." : "Save & Next →"}
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      type="button"
                      onClick={saveProgram}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-bb-deep px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-bb-deep/90 disabled:cursor-not-allowed disabled:opacity-50 md:py-5 md:text-base"
                    >
                      {loading ? "Saving..." : "Save & Next →"}
                    </button>
                  )}

                  {step === 4 && paymentStatus !== "unavailable" && (
                    <button
                      type="button"
                      onClick={startPayment}
                      disabled={paymentStatus === "redirecting"}
                      className="flex-1 rounded-xl bg-bb-lime px-10 py-4 text-sm font-semibold text-bb-deep transition-colors hover:bg-bb-mint disabled:cursor-not-allowed disabled:opacity-50 md:py-5 md:text-base"
                    >
                      {paymentStatus === "redirecting"
                        ? "Redirecting..."
                        : `Pay $${total.toFixed(2)}`}
                    </button>
                  )}

                  {step === 4 && paymentStatus === "unavailable" && (
                    <button
                      type="button"
                      onClick={finishWithoutPayment}
                      className="flex-1 rounded-xl bg-bb-lime px-10 py-4 text-sm font-semibold text-bb-deep transition-colors hover:bg-bb-mint md:py-5 md:text-base"
                    >
                      Done
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-black/10 px-10 py-8 md:px-12 lg:px-16">
        <div className="flex items-end justify-between">
          <p className="text-sm text-black/30">
            recycled pickleballs. built for players. designed for the planet.
          </p>
          <p className="text-sm text-black/30">
            &copy; {new Date().getFullYear()} BounceBack
          </p>
        </div>
      </footer>
    </div>
  );
}
