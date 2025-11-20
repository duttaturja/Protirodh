"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";
import Image from "next/image";
import Link from "next/link";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", bio: "", image: "" });
  const [loading, setLoading] = useState(false);

  // Pre-fill data
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        bio: "", // Ideally fetch fresh profile data here if bio isn't in session
        image: session.user.image || "",
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        await update(); // Trigger NextAuth session update
        router.back();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90">
          Save
        </Button>
      </div>

      <div className="p-4">
        {/* Header Image Placeholder */}
        <div className="h-32 bg-secondary relative mb-12">
          <div className="absolute -bottom-10 left-4">
             <div className="relative w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden group">
                {formData.image ? (
                  <Image src={formData.image} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
                
                {/* Overlay for upload */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    {/* This is a hacky way to reuse ImageUpload for avatar. 
                        Ideally create a specific AvatarUpload component. */}
                    <div className="opacity-0 hover:opacity-100 absolute inset-0 cursor-pointer z-10">
                        <ImageUpload onUploadComplete={(url) => setFormData(p => ({...p, image: url}))} />
                    </div>
                    <Camera className="text-white w-6 h-6 pointer-events-none" />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-transparent border border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea 
              value={formData.bio} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="bg-transparent border border-border focus:border-primary resize-none"
              placeholder="Add your bio..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}