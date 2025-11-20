"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming ShadCN Input exists
import { Label } from "@/components/ui/label"; // Assuming ShadCN Label exists

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading,RP] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/feed");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign in to Protirodh</h1>
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
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg bg-transparent border-border focus:ring-primary"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
          Sign In
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button onClick={() => router.push("/auth/register")} className="text-primary hover:underline">
          Sign up
        </button>
      </div>
    </div>
  );
}