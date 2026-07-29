"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TOKEN_COOKIE } from "@/lib/auth";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function listToString(arr: string[] = []) {
  return arr.join(", ");
}

function stringToList(str: string = "") {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Schema ───────────────────────────────────────────────────────────────────

const LEARNING_STYLES = [
  "visual",
  "auditory",
  "reading_writing",
  "kinesthetic",
  "mixed",
] as const;

const profileSchema = z.object({
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  goals: z.string().optional(),
  current_challenges: z.string().optional(),
  personality_traits: z.string().optional(),
  preferred_learning_style: z
    .enum(LEARNING_STYLES)
    .optional()
    .or(z.literal("" as const)),
  available_time_per_week_hours: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === "" ||
        v === undefined ||
        (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 168),
      { message: "Must be between 0 and 168" }
    ),
  environment_constraints: z.string().optional(),
  existing_habits: z.string().optional(),
  areas_to_improve: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const navItems = [
    { icon: "grid_view", label: "Dashboard", href: "/dashboard", active: false },
    { icon: "person", label: "Profile", href: "/dashboard/profile", active: true },
    { icon: "auto_stories", label: "My Library", href: "/dashboard", active: false },
    { icon: "smart_toy", label: "AI Chat", href: "/dashboard/chat", active: false },

  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0e0e10] border-r border-[#262626] min-h-screen py-6 px-4 flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 px-3 mb-8 group">
        <span
          className="material-symbols-outlined text-[#F59E0B] text-2xl group-hover:rotate-12 transition-transform duration-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_stories
        </span>
        <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F59E0B]">
          LitForge
        </span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${item.active
                ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                : "text-[#94948E] hover:text-[#F5F5F0] hover:bg-[#161618]"
              }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
            {item.active && (
              <span className="ml-auto w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#262626] pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#161618] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F5F5F0] truncate">User</p>
            <p className="text-xs text-[#94948E] truncate">Pro Plan</p>
          </div>
          <span className="material-symbols-outlined text-[#94948E] text-base">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
}

// ── Tag Input helper ──────────────────────────────────────────────────────────

function TagInputField({
  label,
  name,
  control,
  placeholder,
}: {
  label: string;
  name: keyof ProfileFormValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  placeholder: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel
            htmlFor={name}
            className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
          >
            {label}
          </FieldLabel>
          <Input
            {...field}
            value={(field.value as string) ?? ""}
            id={name}
            type="text"
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
          />
          <p className="text-[10px] text-[#94948E] mt-1">
            Separate multiple entries with commas
          </p>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      goals: "",
      current_challenges: "",
      personality_traits: "",
      preferred_learning_style: "",
      available_time_per_week_hours: "",
      environment_constraints: "",
      existing_habits: "",
      areas_to_improve: "",
    },
  });

  const { isSubmitting } = form.formState;

  // ── Load existing profile on mount ────────────────────────────────────────

  useEffect(() => {
    const token = getCookie(TOKEN_COOKIE);
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const d = res.data;
        setHasProfile(true);
        form.reset({
          bio: d.bio ?? "",
          goals: listToString(d.goals),
          current_challenges: listToString(d.current_challenges),
          personality_traits: listToString(d.personality_traits),
          preferred_learning_style: d.preferred_learning_style ?? "",
          available_time_per_week_hours:
            d.available_time_per_week_hours != null
              ? String(d.available_time_per_week_hours)
              : "",
          environment_constraints: listToString(d.environment_constraints),
          existing_habits: listToString(d.existing_habits),
          areas_to_improve: listToString(d.areas_to_improve),
        });
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error("Failed to load profile.");
        }
      })
      .finally(() => setLoading(false));
  }, [form, router]);

  // ── Submit (upsert via PUT) ───────────────────────────────────────────────

  async function onSubmit(values: ProfileFormValues) {
    const token = getCookie(TOKEN_COOKIE);
    if (!token) {
      toast.error("You are not authenticated.");
      router.push("/login");
      return;
    }

    const payload = {
      bio: values.bio || null,
      goals: stringToList(values.goals),
      current_challenges: stringToList(values.current_challenges),
      personality_traits: stringToList(values.personality_traits),
      preferred_learning_style: values.preferred_learning_style || null,
      available_time_per_week_hours: values.available_time_per_week_hours
        ? Number(values.available_time_per_week_hours)
        : null,
      environment_constraints: stringToList(values.environment_constraints),
      existing_habits: stringToList(values.existing_habits),
      areas_to_improve: stringToList(values.areas_to_improve),
    };

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHasProfile(true);
      toast.success("Profile saved!", {
        description: "Your profile has been updated.",
        icon: "✅",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to save profile."
        );
      } else {
        toast.error("Something went wrong.");
      }
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0B0D]">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass-nav px-6 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
              My Profile
            </h1>
            <p className="text-xs text-[#94948E]">
              {hasProfile
                ? "Update your reading profile"
                : "Set up your reading profile"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <span className="material-symbols-outlined text-[#F59E0B] text-4xl animate-spin">
              progress_activity
            </span>
          </div>
        ) : (
          <div className="px-6 md:px-8 py-8 max-w-2xl">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              {/* Bio */}
              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="bio"
                      className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
                    >
                      Bio
                    </FieldLabel>
                    <textarea
                      {...field}
                      id="bio"
                      rows={3}
                      maxLength={500}
                      placeholder="A short bio about yourself and your reading goals..."
                      aria-invalid={fieldState.invalid}
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 resize-none transition-all duration-200"
                    />
                    <p className="text-[10px] text-[#94948E] mt-1 text-right">
                      {(field.value ?? "").length}/500
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Preferred Learning Style */}
              <Controller
                name="preferred_learning_style"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="preferred_learning_style"
                      className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
                    >
                      Preferred Learning Style
                    </FieldLabel>
                    <select
                      {...field}
                      id="preferred_learning_style"
                      aria-invalid={fieldState.invalid}
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">— Select a style —</option>
                      {LEARNING_STYLES.map((s) => (
                        <option key={s} value={s} className="bg-[#161618]">
                          {s
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Available Time */}
              <Controller
                name="available_time_per_week_hours"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="available_time_per_week_hours"
                      className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
                    >
                      Available Time Per Week (hours)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="available_time_per_week_hours"
                      type="number"
                      min={0}
                      max={168}
                      step={0.5}
                      placeholder="e.g. 5"
                      aria-invalid={fieldState.invalid}
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Comma-separated list fields */}
              <FieldGroup>
                <TagInputField
                  label="Goals"
                  name="goals"
                  control={form.control}
                  placeholder="e.g. Read more non-fiction, Improve focus"
                />
                <TagInputField
                  label="Current Challenges"
                  name="current_challenges"
                  control={form.control}
                  placeholder="e.g. Lack of time, Distractions"
                />
                <TagInputField
                  label="Personality Traits"
                  name="personality_traits"
                  control={form.control}
                  placeholder="e.g. Curious, Analytical, Introvert"
                />
                <TagInputField
                  label="Areas to Improve"
                  name="areas_to_improve"
                  control={form.control}
                  placeholder="e.g. Productivity, Communication"
                />
                <TagInputField
                  label="Existing Habits"
                  name="existing_habits"
                  control={form.control}
                  placeholder="e.g. Morning journaling, Evening walk"
                />
                <TagInputField
                  label="Environment Constraints"
                  name="environment_constraints"
                  control={form.control}
                  placeholder="e.g. Noisy home, No private office"
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F59E0B] text-[#1a1000] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : hasProfile
                    ? "Update Profile →"
                    : "Create Profile →"}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
