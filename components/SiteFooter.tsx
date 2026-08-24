import BrandLogo from "./BrandLogo";

/*
  E-com footer — Dirty Bastard reference: logo + tagline + socials left,
  SHOP / COMPANY / SUPPORT link columns right, legal row at bottom.
  Sits directly below the waitlist section on every page.
*/

const COLUMNS: { heading: string; links: { name: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { name: "3-Pack", href: "/shop/3" },
      { name: "12-Pack", href: "/shop/12" },
      { name: "36-Pack", href: "/shop/36" },
      { name: "100-Pack", href: "/shop/100" },
      { name: "All Products", href: "/shop" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "Our Story", href: "/about" },
      { name: "Bin Locations", href: "/locations" },
      { name: "Order a Bin", href: "/request-bin" },
    ],
  },
  {
    heading: "Support",
    links: [
      { name: "Contact Us", href: "/about#contact" },
      { name: "Account", href: "/account" },
      { name: "Manage Subscription", href: "/account" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="w-full bg-bb-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Brand block */}
          <div className="max-w-xs">
            <BrandLogo size="md" />
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              Recycled pickleballs. Built for players. Designed for the planet.
            </p>
            <div className="mt-5 flex gap-5">
              <a
                href="https://www.instagram.com/bouncebackpickle"
                target="_blank"
                rel="noopener noreferrer"
                className="sport-kicker text-bb-volt transition-opacity hover:opacity-70"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@bouncebackpickle"
                target="_blank"
                rel="noopener noreferrer"
                className="sport-kicker text-bb-volt transition-opacity hover:opacity-70"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="sport-kicker text-bb-volt">{col.heading}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BounceBack Pickle · All rights reserved</p>
          <div className="flex gap-5">
            <a href="/about" className="transition-colors hover:text-white/70">
              Privacy Policy
            </a>
            <a href="/about" className="transition-colors hover:text-white/70">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
