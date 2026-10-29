import Link from "next/link";
import {
  ArrowRight,
  Github,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

const CONTACT_EMAIL = "buchidevv@gmail.com";

const footerLinks = {
  Product: [
    { label: "Explore Polls", href: "/poll-feed" },
    { label: "Create a Poll", href: "/polls?new=true" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "mailto:" + CONTACT_EMAIL },
    { label: "FAQs", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-8 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div >
              {/* <Image
                src="/logo-white.png"
                alt="Votrex logo"
                width={400}
                height={480}
                className="h-11 w-11 object-contain"
              /> */}

              <span className="text-2xl font-bold tracking-tight">
                <span className="text-2xl">
                  V
                </span>
                otrex
              </span>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/85">
              Turn opinions into insights. Create polls, gather votes,
              and discover what people really think.
            </p>

            <Link
              href="/auth/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg
                bg-white px-5 py-3 text-sm font-semibold text-purple-700
                shadow-sm transition hover:bg-white/90"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>

            {/* Social links */}
            <div className="mt-7 flex items-center gap-4">
              <Link
                href="https://github.com/MobuchiElly"
                aria-label="GitHub"
                className="rounded-full border border-white/20 p-2
                  transition hover:bg-white/15"
              >
                <Github size={18} />
              </Link>

              <Link
                href="https://x.com"
                aria-label="X"
                className="rounded-full border border-white/20 p-2
                  transition hover:bg-white/15"
              >
                <Twitter size={18} />
              </Link>

              <Link
                href="https://www.linkedin.com/in/eleazer-ugwu-662211200"
                aria-label="LinkedIn"
                className="rounded-full border border-white/20 p-2
                  transition hover:bg-white/15"
              >
                <Linkedin size={18} />
              </Link>

              <Link
                href="https://instagram.com"
                aria-label="Instagram"
                className="rounded-full border border-white/20 p-2
                  transition hover:bg-white/15"
              >
                <Instagram size={18} />
              </Link>
            </div>
          </div>

          {/* Navigation columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-[15px] font-semibold tracking-wide">
                {heading}
              </h3>

              <ul className="mt-5 space-y-4">
                {links.map((link, idx) => (
                  <li key={link.href + idx}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/90 transition
                        hover:text-white hover:underline
                        hover:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-4 border-t
          border-white/20 pt-6 text-sm text-white/80
          sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {new Date().getFullYear()} Votrex. All rights reserved.
          </p>

          <p>
            Built for better conversations and smarter decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}