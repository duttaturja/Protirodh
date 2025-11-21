"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2 } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Force sign-in or redirect to login
        router.push("/auth/login?verified=true");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-500/10 p-4 rounded-full">
            <ShieldCheck className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verify Account</h1>
        <p className="text-muted-foreground mb-6">
          Enter the 6-digit code sent to your phone for <b>{email}</b>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="text-center text-2xl tracking-widest h-14 font-mono"
            maxLength={6}
          />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button 
            type="submit" 
            disabled={loading || otp.length < 6}
            className="w-full h-12 text-lg font-bold rounded-full"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}