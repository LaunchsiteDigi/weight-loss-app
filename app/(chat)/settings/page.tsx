"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [phone, setPhone] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [preferredUnit, setPreferredUnit] = useState("lbs");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setPhone(data.profile.phone ?? "");
          setHeight(data.profile.height ?? "");
          setAge(data.profile.age ?? "");
          setActivityLevel(data.profile.activityLevel ?? "moderate");
          setPreferredUnit(data.profile.preferredUnit ?? "lbs");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, height, age, activityLevel, preferredUnit }),
      });

      if (res.ok) {
        toast.success("Profile saved!");
      } else {
        toast.error("Failed to save profile");
      }
    } catch {
      toast.error("Failed to save profile");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh items-start justify-center overflow-y-auto pt-16 pb-8">
      <div className="w-full max-w-md px-4">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Configure your profile and iMessage integration.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium"
            >
              Phone Number (for iMessage)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+14155552671"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              E.164 format (e.g., +14155552671). Used for daily check-in messages.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="height"
                className="mb-1.5 block text-sm font-medium"
              >
                Height
              </label>
              <input
                id="height"
                type="text"
                placeholder={"5'10\" or 178cm"}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="age"
                className="mb-1.5 block text-sm font-medium"
              >
                Age
              </label>
              <input
                id="age"
                type="text"
                placeholder="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="activityLevel"
              className="mb-1.5 block text-sm font-medium"
            >
              Activity Level
            </label>
            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="preferredUnit"
              className="mb-1.5 block text-sm font-medium"
            >
              Preferred Weight Unit
            </label>
            <select
              id="preferredUnit"
              value={preferredUnit}
              onChange={(e) => setPreferredUnit(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="lbs">Pounds (lbs)</option>
              <option value="kg">Kilograms (kg)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
