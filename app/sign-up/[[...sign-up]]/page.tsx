import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <SignUp 
        appearance={{ 
          variables: { 
            colorPrimary: "#14b8a6", // Teal accent matching KUMUSTA theme
            colorBackground: "#ffffff",
            colorInputBackground: "#f8fafc",
            colorText: "#0f172a",
            colorTextSecondary: "#64748b",
            colorInputText: "#0f172a"
          } 
        }} 
      />
    </div>
  );
}
