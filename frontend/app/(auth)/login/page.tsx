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


const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        values
      );

      const token: string =
        response.data?.access_token ||
        response.data?.token ||
        response.data;

      // Store token in cookie (7-day expiry, SameSite=Lax)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `${TOKEN_COOKIE}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      toast.success("Signed in successfully!", {
        description: "Welcome back to LitForge.",
        icon: "📖",
      });

      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Login failed."
        );
      } else {
        toast.error("Something went wrong.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 relative">
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

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
              Welcome back
            </h1>

            <p className="text-[#94948E] text-sm">
              Sign in to continue your reading journey.
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
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
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F59E0B] text-[#1a1000] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In →"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#94948E] mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#F59E0B] hover:text-[#ffc174] font-semibold transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-[#0e0e10] border-l border-[#262626] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[#F59E0B]/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-sm w-full">
          <div className="glass-panel rounded-2xl p-7 mb-6 glow-indigo">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#F59E0B]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_stories
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Currently Reading
                </p>

                <p className="text-xs text-[#94948E]">
                  Thinking, Fast and Slow
                </p>
              </div>
            </div>

            <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4">
              <p className="text-xs font-[family-name:var(--font-mono)] text-[#F59E0B] mb-2 uppercase tracking-wide">
                Today&apos;s Insight
              </p>

              <p className="text-sm text-[#F5F5F0] leading-relaxed">
                Your System 1 is triggering the availability heuristic when
                reviewing this week's data. Try the pre-mortem technique.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[#94948E] text-sm leading-relaxed">
              &ldquo;Reading without applying is just collecting.
              LitForge bridges the gap.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}