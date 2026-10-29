"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import {MenuIcon, User, X} from "lucide-react";
import { usePathname } from "next/navigation";
// import {createClient} from "@/lib/supabase/server";


export default function NavbarClient() {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [userProfileActive, setUserProfileActive] = useState(false);
  const pathname = usePathname();

  const navlinks = [
    {label: "Home", href: "/"},
    {label: "Poll Feed", href: "/poll-feed"},
    {label: "Create Poll", href: "/dashboard?new=true"},
    {label: "Login", href: "/auth/login"},
    {label: "Signup", href: "/auth/register"},
  ]

  // const signout = async () => {
  //   try {
  //     const res = await fetch("/api/auth/logout", { method: "POST" });
  //     if (!res.ok) {
  //       setUserState(null);
  //       throw new Error("Failed to sign out");
  //     }
  //     window.location.reload();
  //   } catch (err) {
  //     console.error("Signout error:", err);
  //   }
  // };
  // Close the menu when the route changes
  useEffect(() => {
    setMobileMenuActive(false);
    setUserProfileActive(false);
  }, [pathname])

  // Disable scroll when mobile menu is active
  useEffect(() => {
    document.body.style.overflow = mobileMenuActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    }
  }, [mobileMenuActive])

  useEffect(() => {
    if(!mobileMenuActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuActive(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [mobileMenuActive])


  return(
        <nav className="fixed top-0 z-90 bg-white w-full text-[15px]">
          <div className="shadow-md h-24 md:px-5 lg:px-6 flex justify-between items-center relative py-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              <Image
              src="/logo-white.png"
              alt=""
              height="120" 
              width="120" 
              priority
              loading="eager"
              />
            </Link>
            <div className="flex items-center gap-4 pr-1 md:pr-3">
              <Link href="/" className="hidden lg:block hover:text-blue-500">Home</Link>
              <Link href="/poll-feed" className="hidden lg:block hover:text-blue-500">Poll Feed</Link>
              <Link href="/dashboard?new=true" className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 py-2 px-4 text-white rounded-lg">Create Poll</Link>
              <button className="" onClick={() => setUserProfileActive((prev) => !prev) }>
                <User className="hidden lg:block h-7 w-7 hover:scale-105"/>
                { userProfileActive &&
                  <div className="absolute bg-black/10 rounded-lg top-24 w-50 right-0 z-50 py-6 px-4 space-y-2">
                    <Link href="/auth/register"
                      className="block cursor-pointer hover:bg-white/90 font-bold w-full bg-white py-2 pl-4 rounded-md text-[15px] text-purple-900 text-left"
                    >Register</Link>
                    <Link
                      href="/auth/login"
                      className="block cursor-pointer hover:bg-white/90 font-bold w-full bg-white py-2 pl-4 rounded-md text-[15px] text-purple-900 text-left"
                    >Login</Link>
                  </div>
                }
              </button>
              
              {/* Mobile Menu */}
              <div className="lg:hidden">
                {/* Backdrop */}
                <div 
                  aria-hidden="true"
                  onClick={() => setMobileMenuActive(false)}
                  className={`fixed inset-0 top-24 z-40 bg-black/30 transition-opacity duration-300 ${mobileMenuActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                >

                </div>
                <div>
                  <button 
                    type="button"
                    aria-label={mobileMenuActive ? "Close menu" : "Open menu"}
                    aria-expanded={mobileMenuActive}
                    aria-controls="mobile-navigation"
                    onClick={() => setMobileMenuActive(!mobileMenuActive)}
                    className="inline-flex h-10 w-10 items-center justify-center mr-3 rounded-lg text-gray-600 transition-colors focus-visible:outline-none"  
                  >
                    {
                      mobileMenuActive ?
                       <X className="h-8 w-8"
                       />
                      :
                       <MenuIcon className="h-8 w-8"
                       />
                    }
                  </button>
                </div>
                {/* Backdrop */}
                <nav 
                 id="mobile-navigation"
                 aria-label="Mobile navigation"
                 aria-hidden={!mobileMenuActive}
                 inert={!mobileMenuActive}
                 className={`absolute left-0 right-0 top-full bg-white z-50 origin-top border-t border-gray-200 bg-white p-4 shadow-xl transition-[opacity,transform,visibility] duration-500 ease-out
                  ${mobileMenuActive ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                  <div className="mx-auto max-w-7xl space-y-6 px-5 py-6">
                    {
                      navlinks.map((link, idx) => {
                        const isActive = pathname === link.href;
                
                        return (
                          <Link
                            key={link.href + idx}
                            href={link.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`block rounded-xl text-sm
                              font-medium transition-colors ${
                                isActive
                                  ? "text-violet-700"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-violet-700"
                              }`}
                            >
                            {link.label}
                          </Link>
                        )
                      })
                    }
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </nav>
    )
}