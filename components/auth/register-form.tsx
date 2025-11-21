"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
        const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.message);
        } else {
        router.push(`/auth/login?verification_needed=true&email=${formData.email}`);
        }
    } catch (err) {
        setError("Something went wrong. Please try again.");
    } finally {
        setIsLoading(false);
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
            placeholder="Enter your Name"
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
            placeholder="Enter your Email"
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
              placeholder="1xxxxxxxx"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-input border-transparent focus:border-primary pr-10"
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
        <Button type="submit" disabled={isLoading} className="w-full rounded-full font-bold h-12 bg-primary text-white hover:bg-primary/90">
          {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button onClick={() => router.push("/auth/login")} className="text-primary hover:underline font-bold">
          Log in
        </button>
      </div>
    </div>
  );
}