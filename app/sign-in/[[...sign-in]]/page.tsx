import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import DemoEntryButtons from "@/components/DemoEntryButtons";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-12 gap-8 text-slate-900 font-sans">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shadow-2xs p-1">
          <Image
            src="/logo.png"
            alt="KUMUSTA Logo"
            width={40}
            height={40}
            className="h-full w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black text-2xl tracking-tight text-purple-950">
            KUMUSTA
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-200">
            PAMPANGA
          </span>
        </div>
      </Link>

      {/* Instant Demo Accounts Selector */}
      <div className="w-full max-w-2xl">
        <DemoEntryButtons />
      </div>

      <div className="flex items-center gap-4 w-full max-w-md my-1">
        <div className="h-px bg-purple-200 flex-1" />
        <span className="text-xs font-mono font-semibold text-purple-600 uppercase">
          Or sign in with credentials
        </span>
        <div className="h-px bg-purple-200 flex-1" />
      </div>

      <SignIn 
        appearance={{ 
          variables: { 
            colorPrimary: "#581c87",
            colorBackground: "#ffffff",
            colorInputBackground: "#faf5ff",
            colorText: "#3b0764",
            colorTextSecondary: "#6b21a8",
            colorInputText: "#3b0764"
          } 
        }} 
      />
    </div>
  );
}

