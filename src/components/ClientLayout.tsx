"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import ErrorBoundary from "@/components/ErrorBoundary";
import { usePathname } from "next/navigation";

const ClientLayout = ({children}:{children: React.ReactNode}) => {
    const pathname = usePathname();
    if (pathname.startsWith("/auth")){
        return (
        <>
          <main className="min-h-screen flex-1">
            {children}
          </main>
          <Footer />          
        </>
        )
    }
    return (
      <>
        <Navbar />
          <main className="min-h-screen mt-23 flex-1 mb-10">
            {children}
          </main>
        <Footer />
      </>
  )
}

export default ClientLayout