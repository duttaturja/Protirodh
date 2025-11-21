"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // Import icons

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/feed");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-primary">Sign in</h1>
        <p className="text-muted-foreground">Welcome back to Protirodh</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg bg-transparent border-border focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg bg-transparent border-border focus:ring-primary pr-10"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
          {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button onClick={() => router.push("/auth/register")} className="text-primary hover:underline font-bold">
          Sign up
        </button>
      </div>
    </div>
  );
}