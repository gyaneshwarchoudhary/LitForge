"use client";

import React from "react";
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


const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms to continue",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: SignupFormValues) {
    try {
      const { terms: _terms, ...payload } = values;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
        payload
      );

      const token: string =
        response.data?.access_token ||
        response.data?.token ||
        response.data;

      // Store token in cookie (7-day expiry, SameSite=Lax)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `${TOKEN_COOKIE}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      toast.success("Account created!", {
        description: "Welcome to LitForge. Your journey begins now.",
        icon: "🚀",
      });

      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Signup failed."
        );
      } else {
        toast.error("Something went wrong.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      {/* Left Side */}
      <div className="hidden lg:flex flex-1 bg-[#0e0e10] border-r border-[#262626] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-sm w-full flex flex-col gap-6">
          {[
            { icon: "smart_toy", title: "AI Book Companion", desc: "Deep conversations with any book" },
            { icon: "account_tree", title: "Knowledge Map", desc: "Connect ideas across your library" },
            { icon: "science", title: "Experiment Tracker", desc: "Turn insights into daily actions" },
          ].map((feat) => (
            <div key={feat.title} className="glass-panel rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[#F59E0B] text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {feat.icon}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#F5F5F0]">
                  {feat.title}
                </p>

                <p className="text-xs text-[#94948E]">
                  {feat.desc}
                </p>
              </div>

              <span className="material-symbols-outlined text-[#94948E] text-base ml-auto">
                check_circle
              </span>
            </div>
          ))}

          <div className="glass-panel rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
            {[
              { val: "2.4K+", label: "Readers" },
              { val: "18K+", label: "Books" },
              { val: "94%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F59E0B]">
                  {stat.val}
                </p>

                <p className="text-xs text-[#94948E] mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 relative">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#F59E0B]/5 rounded-full blur-[100px] pointer-events-none" />

        <Link
          href="/"
          className="flex items-center gap-2 mb-12 group w-fit"
        >
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

        <div className="max-w-md w-full relative z-10">
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] mb-2">
              Start your journey
            </h1>

            <p className="text-[#94948E] text-sm">
              Create your free account. No credit card required.
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="username"
                      className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
                    >
                      Full Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="username"
                      type="text"
                      placeholder="Alex"
                      aria-invalid={fieldState.invalid}
                      autoComplete="name"
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="email"
                      className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
                    >
                      Email
                    </FieldLabel>

                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="password"
                      className="text-xs font-semibold text-[#94948E] uppercase tracking-wider"
                    >
                      Password
                    </FieldLabel>

                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Controller
              name="terms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      className="mt-0.5 w-4 h-4 rounded border-[#262626] bg-[#161618] accent-[#F59E0B] cursor-pointer"
                    />

                    <label
                      htmlFor="terms"
                      className="text-xs text-[#94948E] leading-relaxed cursor-pointer"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-[#F59E0B] hover:text-[#ffc174] transition-colors">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-[#F59E0B] hover:text-[#ffc174] transition-colors">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F59E0B] text-[#1a1000] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create Free Account →"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#94948E] mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#F59E0B] hover:text-[#ffc174] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
