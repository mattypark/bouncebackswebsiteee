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

  // Save current info to backend, then advance one step
  async function saveAndContinue() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Save failed.");
      setSavedToBackend(true);
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    } catch {
      setError("Something went wrong saving your info. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 4 → create Stripe Checkout session (or fall back gracefully)
  async function startPayment() {
    setPaymentStatus("redirecting");
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          facilityName: formData.facilityName,
          additionalBins: formData.additionalBins,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else if (res.status === 503) {
        setPaymentStatus("unavailable");
      } else {
        throw new Error(data.error || "Checkout failed.");
      }
    } catch {
      setPaymentStatus("unavailable");
    }
  }

  function finishWithoutPayment() {
    setCompleted(true);
  }

  const addons =
    ADDITIONAL_BIN_OPTIONS.find((o) => o.label === formData.additionalBins)?.addons ?? 0;
  const total = BASE_MEMBERSHIP_PRICE + addons;

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
                  <div className="space-y-5 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl lg:text-5xl">
                      Welcome!
                    </h1>
                    <div className="space-y-4 text-left text-sm leading-relaxed text-black/70 md:text-base">
                      <p>
                        We&apos;re excited to invite your facility to become a member of the{" "}
                        <span className="font-semibold text-bb-deep">
                          BounceBack Pickle Recycling Program
                        </span>
                        , a simple, impactful way to reduce waste, support sustainability,
                        and show your pickleball community that you care.
                      </p>
                      <p>
                        As a member, you will receive an exclusive branded{" "}
                        <span className="font-semibold">Recycling Receptacle</span> for your
                        facility, along with BounceBack&apos;s{" "}
                        <span className="font-semibold">
                          Sustainable Facility Accreditation Certificate
                        </span>
                        , and will join an elite group in helping transform worn-out
                        pickleballs into new ones. Your participation will assist in
                        preventing hundreds of thousands of pounds of plastic reaching
                        landfill sites and closing the recycling loop by giving pickleballs
                        a second life.
                      </p>
                      <p>
                        Additionally, your facility will be included in BounceBack&apos;s
                        marketing platforms across our social media channels with a large
                        and ever-growing audience of pickleball enthusiasts. To-date a
                        number of videos have gone viral with millions of views.
                      </p>
                      <p>
                        Finally, as we progress BounceBack&apos;s manufacturing business,
                        members will be entitled to promotional pricing on the world&apos;s
                        first 100% recycled pickleballs.
                      </p>
                      <p className="text-bb-deep">
                        This form takes just a few minutes to complete.
                      </p>
                    </div>
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
                        Sustainable Facility Accreditation Membership — $150/year
                      </p>
                      <p>Your membership includes:</p>
                      <ul className="mt-2 space-y-1.5 pl-5 [list-style:disc] marker:text-bb-mid">
                        <li>One branded BounceBack Recycling Receptacle</li>
                        <li>Sustainable Facility Accreditation Certificate</li>
                        <li>Inclusion in BounceBack&apos;s marketing & social channels</li>
                        <li>Promotional pricing on future recycled pickleballs</li>
                      </ul>
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
                          I agree to the Membership Terms &amp; Conditions{" "}
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
                        <div className="flex items-baseline justify-between">
                          <span>Sustainable Facility Accreditation Membership</span>
                          <span className="font-semibold text-bb-deep">
                            ${BASE_MEMBERSHIP_PRICE}/yr
                          </span>
                        </div>
                        {addons > 0 && (
                          <div className="flex items-baseline justify-between">
                            <span>{formData.additionalBins}</span>
                            <span className="font-semibold text-bb-deep">+${addons}</span>
                          </div>
                        )}
                        <div className="mt-3 border-t border-bb-deep/10 pt-3" />
                        <div className="flex items-baseline justify-between text-base md:text-lg">
                          <span className="font-bold text-bb-deep">Total today</span>
                          <span className="font-bold text-bb-deep">${total}</span>
                        </div>
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
                      onClick={saveAndContinue}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-bb-deep px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-bb-deep/90 disabled:cursor-not-allowed disabled:opacity-50 md:py-5 md:text-base"
                    >
                      {loading ? "Saving..." : "Save & Next →"}
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 rounded-xl bg-bb-deep px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-bb-deep/90 md:py-5 md:text-base"
                    >
                      Next →
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
                        : `Pay $${total}`}
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
