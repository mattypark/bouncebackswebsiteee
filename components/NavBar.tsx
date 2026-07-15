"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CartIcon from "./CartIcon";

const menuLinks = [
  { name: "Home", href: "/" },
  { name: "Buy Balls", href: "/bb-1" },
  { name: "Order a Bin", href: "/request-bin" },
  { name: "Bin Locations", href: "/locations" },
  { name: "Shop All", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Account", href: "/account" },
];

/*
  Shared NavBar with hamburger menu + liquid circle-reveal overlay.
  Props:
    - variant: "light" (white logo/hamburger) | "dark" (dark green logo/hamburger)
    - fixed: whether the nav is fixed or static (default: false)
*/

export default function NavBar({
  variant = "dark",
  fixed = false,
}: {
  variant?: "light" | "dark";
  fixed?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clipOrigin, setClipOrigin] = useState("calc(100% - 48px) 28px");
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const updateClipOrigin = useCallback(() => {
    if (hamburgerRef.current) {
      const rect = hamburgerRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setClipOrigin(`${x}px ${y}px`);
    }
  }, []);

  const logoColor = isMenuOpen ? "#fff" : variant === "light" ? "#fff" : "#084734";
  const barColor = isMenuOpen ? "#CEF17B" : variant === "light" ? "#fff" : "#084734";

  return (
    <>
      <nav
        className={`${fixed ? "fixed" : "relative"} top-0 left-0 z-50 flex w-full items-center justify-between px-10 py-4 md:px-12 md:py-5 lg:px-16 lg:py-6`}
      >
        <a
          href="/"
          className="flex items-baseline text-xl transition-colors duration-300 md:text-2xl"
          style={{ zIndex: 60, color: logoColor }}
        >
          <span className="font-bold tracking-tight">Bounce</span>
          <span className="font-light tracking-tight">Back</span>
        </a>

        {/* Cart + Hamburger */}
        <div className="flex items-center gap-5">
          <CartIcon color={isMenuOpen ? "#CEF17B" : "#084734"} />

          {/* Hamburger / X button */}
          <button
            ref={hamburgerRef}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              updateClipOrigin();
              setIsMenuOpen((prev) => !prev);
            }}
            className="relative z-[60] flex flex-col items-end gap-[5px]"
          >
            <motion.span
              className="block h-[2px] w-7 origin-center"
              animate={
                isMenuOpen
                  ? { rotate: 45, y: 7, backgroundColor: "#CEF17B" }
                  : { rotate: 0, y: 0, backgroundColor: barColor }
              }
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="block h-[2px] w-7 origin-center"
              animate={
                isMenuOpen
                  ? { opacity: 0, backgroundColor: "#CEF17B" }
                  : { opacity: 1, backgroundColor: barColor }
              }
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="block h-[2px] origin-center"
              style={{ width: isMenuOpen ? "1.75rem" : "1.25rem" }}
              animate={
                isMenuOpen
                  ? { rotate: -45, y: -7, backgroundColor: "#CEF17B", width: "1.75rem" }
                  : { rotate: 0, y: 0, backgroundColor: barColor, width: "1.25rem" }
              }
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        </div>
      </nav>

      {/* ─── Circle Reveal Menu Overlay ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[55] flex flex-col bg-bb-deep"
            initial={{ clipPath: `circle(0% at ${clipOrigin})` }}
            animate={{ clipPath: `circle(150% at ${clipOrigin})` }}
            exit={{ clipPath: `circle(0% at ${clipOrigin})` }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            {/* X close button — top right */}
            <div className="flex w-full justify-end px-10 py-4 md:px-12 md:py-5 lg:px-16 lg:py-6">
              <button
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
                className="text-bb-lime/70 transition-colors duration-200 hover:text-bb-lime"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            {/* Menu content — links left, CTA right */}
            <div className="flex flex-1 items-center px-10 md:px-16 lg:px-24">
              <div className="flex flex-1 flex-col justify-center">
                {menuLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      delay: 0.15 + i * 0.08,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="group relative inline-flex items-center gap-3 overflow-visible py-2 text-4xl font-light text-bb-lime/90 transition-colors duration-300 hover:text-bb-lime md:text-5xl md:gap-4 lg:text-6xl lg:gap-5"
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                      <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-bb-lime after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:scale-x-100">
                        {link.name}
                      </span>
                      <span className="inline-block h-[10px] w-[10px] rounded-full bg-bb-lime opacity-0 scale-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100 group-hover:scale-100 md:h-[12px] md:w-[12px] lg:h-[14px] lg:w-[14px]" />
                    </a>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="hidden lg:flex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
              >
                <a
                  href="/request-bin"
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative text-sm font-semibold tracking-[0.15em] text-bb-lime/80 transition-colors duration-300 hover:text-bb-lime"
                >
                  <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-bb-lime after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:scale-x-100">
                    JOIN THE MOVEMENT
                  </span>
                </a>
              </motion.div>
            </div>

            {/* Bottom section */}
            <motion.div
              className="px-10 pb-8 md:px-16 lg:px-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="mb-6 h-[1px] w-full bg-bb-lime/20" />
              <div className="flex items-end justify-between">
                <p className="text-sm text-bb-lime/40">
                  recycled pickleballs. built for players. designed for the planet.
                </p>
                <p className="text-sm text-bb-lime/40">
                  &copy; {new Date().getFullYear()} BounceBack
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
