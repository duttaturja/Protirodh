"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Ensure shadcn badge
import { Ban, CheckCircle, Search, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  const handleBan = async (userId: string, action: 'ban' | 'unban') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
        const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, action })
        });
        
        if (res.ok) {
            setUsers(users.map(u => u._id === userId ? { ...u, isBanned: action === 'ban' } : u));
        }
    } catch (e) {
        console.error(e);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-red-500" /> Admin Dashboard
            </h1>
            <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search users..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Joined</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                    ) : filteredUsers.map(user => (
                        <tr key={user._id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="p-4">
                                <div className="font-bold">{user.name}</div>
                                <div className="text-muted-foreground text-xs">{user.email}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                    user.role === 'verified' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {user.role.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4">
                                {user.isBanned ? (
                                    <span className="text-red-500 font-bold flex items-center gap-1"><Ban className="w-3 h-3" /> Banned</span>
                                ) : (
                                    <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
                                )}
                            </td>
                            <td className="p-4 text-muted-foreground">
                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </td>
                            <td className="p-4 text-right">
                                {user.role !== 'admin' && (
                                    user.isBanned ? (
                                        <Button size="sm" variant="outline" onClick={() => handleBan(user._id, 'unban')}>Unban</Button>
                                    ) : (
                                        <Button size="sm" variant="destructive" onClick={() => handleBan(user._id, 'ban')}>Ban</Button>
                                    )
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}