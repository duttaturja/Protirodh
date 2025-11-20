// components/auth/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.message);
    } else {
      // Redirect to login with a flag to show OTP modal or banner
      router.push(`/auth/login?verification_needed=true&email=${formData.email}`);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-primary">Join Protirodh</h1>
        <p className="text-muted-foreground">Verify & Report for your community</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-input border-transparent focus:border-primary"
            placeholder="Turja Dutta"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="bg-input border-transparent focus:border-primary"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              +880
            </span>
            <Input 
              id="phone" 
              type="tel"
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="rounded-l-none bg-input border-transparent focus:border-primary flex-1"
              placeholder="1712345678"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password"
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="bg-input border-transparent focus:border-primary"
          />
        </div>
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full rounded-full font-bold h-12 bg-primary text-white hover:bg-primary/90">
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}