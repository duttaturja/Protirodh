"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Ensure you have shadcn tabs
import { User, Lock, Bell, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/50">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          {/* ACCOUNT SETTINGS */}
          <TabsContent value="account" className="space-y-6">
            <div className="p-4 border border-border rounded-xl bg-card">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <User className="w-5 h-5" /> Profile Information
                </h2>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={session?.user?.email || ""} disabled className="bg-secondary" />
                    </div>
                    <div className="grid gap-2">
                        <Label>User ID</Label>
                        <Input value={session?.user?.id || ""} disabled className="bg-secondary font-mono text-xs" />
                    </div>
                </div>
            </div>

            <div className="p-4 border border-border rounded-xl bg-card">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-500">
                    <LogOut className="w-5 h-5" /> Danger Zone
                </h2>
                <Button variant="destructive" onClick={() => signOut()} className="w-full">
                    Sign Out
                </Button>
            </div>
          </TabsContent>

          {/* PRIVACY SETTINGS */}
          <TabsContent value="privacy" className="space-y-6">
             <div className="p-4 border border-border rounded-xl bg-card space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Private Account</Label>
                        <p className="text-xs text-muted-foreground">Only followers can see your posts</p>
                    </div>
                    <Switch />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Location Tracking</Label>
                        <p className="text-xs text-muted-foreground">Allow precise location on reports</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Anonymous by Default</Label>
                        <p className="text-xs text-muted-foreground">Always hide my name on new reports</p>
                    </div>
                    <Switch />
                </div>
             </div>
          </TabsContent>

          {/* DISPLAY SETTINGS */}
          <TabsContent value="display" className="space-y-6">
             <div className="p-4 border border-border rounded-xl bg-card">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Moon className="w-5 h-5" /> Appearance
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <button 
                        onClick={() => setTheme("light")}
                        className={`p-4 rounded-lg border ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-border'} flex flex-col items-center gap-2`}
                    >
                        <div className="w-6 h-6 rounded-full bg-white border border-gray-200"></div>
                        <span className="text-sm font-medium">Light</span>
                    </button>
                    <button 
                        onClick={() => setTheme("dark")}
                        className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border'} flex flex-col items-center gap-2`}
                    >
                        <div className="w-6 h-6 rounded-full bg-black border border-gray-700"></div>
                        <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button 
                        onClick={() => setTheme("system")}
                        className={`p-4 rounded-lg border ${theme === 'system' ? 'border-primary bg-primary/10' : 'border-border'} flex flex-col items-center gap-2`}
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-white to-black border border-gray-400"></div>
                        <span className="text-sm font-medium">System</span>
                    </button>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}