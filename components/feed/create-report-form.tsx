"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this or use standard textarea
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Ensure shadcn switch is installed
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Ensure shadcn select
import { Loader2, Wand2, MapPin, Calendar } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";

// Hardcoded for MVP, can be moved to utils/districts.ts
const DIVISIONS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];

export function CreateReportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    division: "",
    district: "", // In a full app, this would be a dynamic list based on division
    crimeTime: "",
    isAnonymous: false,
    images: [] as string[],
  });

  // 1. Handle Image Upload Success
  const handleImageUploaded = (url: string) => {
    if (url) {
      setFormData((prev) => ({ ...prev, images: [url] })); // Single image for MVP, array for future
    } else {
      setFormData((prev) => ({ ...prev, images: [] }));
    }
  };

  // 2. AI Auto-Description
  const handleGenerateDescription = async () => {
    if (formData.images.length === 0) {
      alert("Please upload an image first to generate a description.");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vision", imageUrl: formData.images[0] }),
      });
      const data = await res.json();
      if (data.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
      }
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setAiLoading(false);
    }
  };

  // 3. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      router.push("/feed"); // Redirect to feed
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to post report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-20">
      
      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Evidence (Required)</Label>
        <ImageUpload onUploadComplete={handleImageUploaded} />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="What happened?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="text-lg font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Description with AI Button */}
      <div className="space-y-2 relative">
        <div className="flex justify-between items-center">
          <Label htmlFor="desc">Description</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateDescription}
            disabled={aiLoading || formData.images.length === 0}
            className="text-primary h-8 px-2 text-xs hover:bg-primary/10"
          >
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
            Auto-Generate
          </Button>
        </div>
        <Textarea
          id="desc"
          placeholder="Describe the incident details..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="min-h-[120px] resize-none bg-secondary/30 border-transparent focus:border-primary"
        />
      </div>

      {/* Location & Time Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Division</Label>
          <Select 
            onValueChange={(val) => setFormData({...formData, division: val})}
            required
          >
            <SelectTrigger className="bg-secondary/30 border-transparent">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border shadow-md z-50">
              {DIVISIONS.map((div) => (
                <SelectItem key={div} value={div} className="cursor-pointer">{div}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>District</Label>
          <Input 
            placeholder="e.g. Gulshan"
            value={formData.district}
            onChange={(e) => setFormData({...formData, district: e.target.value})}
            required
            className="bg-secondary/30 border-transparent"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Time of Incident</Label>
          <Input
            type="datetime-local"
            required
            onChange={(e) => setFormData({...formData, crimeTime: e.target.value})}
            className="bg-secondary/30 border-transparent"
          />
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="space-y-0.5">
          <Label className="text-base">Post Anonymously</Label>
          <p className="text-xs text-muted-foreground">Your name will be hidden from the public.</p>
        </div>
        <Switch 
          checked={formData.isAnonymous}
          onCheckedChange={(checked: boolean) => setFormData({...formData, isAnonymous: checked})}
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full rounded-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : "Post Report"}
      </Button>
    </form>
  );
}