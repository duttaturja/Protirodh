// app/(site)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact, Moon, LogOut, Trash2, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Emergency Contact State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
      // Ideally fetch current settings here. For MVP assuming blank or handled by context if available.
      // In real app: fetch('/api/profile/me')...
  }, []);

  const handleSaveContact = async () => {
      setSavingContact(true);
      try {
          const res = await fetch("/api/profile/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  emergencyContact: { name: contactName, phone: contactPhone } 
              }),
          });
          if (res.ok) toast.success("Emergency contact saved");
          else toast.error("Failed to save");
      } catch (e) {
          toast.error("Error saving contact");
      } finally {
          setSavingContact(false);
      }
  };

  const handleDeleteAccount = async () => {
      const confirmText = prompt("To verify, type 'delete my account' below:");
      if (confirmText !== "delete my account") {
          return toast.error("Verification failed. Account not deleted.");
      }

      setIsDeleting(true);
      try {
          const res = await fetch("/api/users/delete", { method: "DELETE" });
          const data = await res.json();
          
          if (res.ok) {
              toast.success("Account deleted.");
              signOut({ callbackUrl: "/" });
          } else {
              toast.error(data.message || "Failed to delete account.");
          }
      } catch (error) {
          toast.error("Something went wrong.");
      } finally {
          setIsDeleting(false);
      }
  };
  
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
            
            {/* Emergency Contact Section (Replaces Profile Info) */}
            <div className="p-4 border border-border rounded-xl bg-card">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-500">
                    <Contact className="w-5 h-5" /> Emergency Contact
                </h2>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Contact Name</Label>
                        <Input 
                            value={contactName} 
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g. Parent or Spouse"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone Number</Label>
                        <Input 
                            value={contactPhone} 
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+880..."
                        />
                    </div>
                    <Button onClick={handleSaveContact} disabled={savingContact} className="w-full bg-primary">
                        {savingContact ? "Saving..." : <><Save className="w-4 h-4 mr-2"/> Save Contact</>}
                    </Button>
                </div>
            </div>

            <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50 dark:bg-red-950/10">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                    <LogOut className="w-5 h-5" /> Danger Zone
                </h2>
                <div className="space-y-3">
                    <Button variant="outline" onClick={() => signOut()} className="w-full border-red-200 hover:bg-red-100 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/30">
                        Sign Out
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount} 
                        disabled={isDeleting}
                        className="w-full bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? "Deleting..." : (
                            <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Account</span>
                        )}
                    </Button>
                </div>
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