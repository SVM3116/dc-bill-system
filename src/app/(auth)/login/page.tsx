"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LockKeyhole, Mail, KeyRound } from "lucide-react";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("school_profile_completed")
            .eq("id", user.id)
            .single();

          if (schoolError || !school) {
            toast.success("Welcome! Setting up your school profile...");
            router.push("/school-setup");
          } else if (!school.school_profile_completed) {
            toast.success("Please complete your school configuration.");
            router.push("/school-setup");
          } else {
            toast.success("Welcome back! Login successful.");
            router.push("/dashboard");
          }
          router.refresh();
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Please contact the system administrator to reset your password.");
  };

  return (
    <Card className="border-slate-200/80 shadow-xl shadow-slate-100 rounded-2xl bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-700 to-indigo-600"></div>
      
      <CardHeader className="space-y-2 pt-8 pb-6">
        <div className="bg-indigo-50 text-indigo-700 w-11 h-11 rounded-xl flex items-center justify-center mx-auto shadow-inner mb-2 border border-indigo-100">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl md:text-2xl font-black text-center text-slate-900 tracking-tight">
          Office Staff Login
        </CardTitle>
        <CardDescription className="text-center text-slate-500 text-xs font-medium">
          Enter your credentials to access the DC Bill system
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          
          {/* Email field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@school.com"
                className={`pl-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 rounded-lg text-xs h-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          
          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`pl-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 rounded-lg text-xs h-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>
          
          {/* Remember me toggle */}
          <div className="flex items-center gap-2.5 py-1">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4.5 w-4.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 cursor-pointer accent-blue-600"
              {...register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-xs text-slate-600 font-semibold cursor-pointer select-none">
              Remember my session
            </Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 pb-8">
          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer py-2.5 h-10 rounded-lg shadow-sm shadow-blue-700/10 hover:shadow-md"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <div className="text-xs text-center text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">
              Create an Account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
