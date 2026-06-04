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
import { Loader2, Building2, User, Mail, KeyRound, ShieldCheck, ClipboardCheck } from "lucide-react";

// Signup validation schema
const signupSchema = z
  .object({
    schoolNameEn: z.string().min(2, "School name must be at least 2 characters"),
    principalName: z.string().min(2, "Principal name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      schoolNameEn: "",
      principalName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            school_name_en: values.schoolNameEn,
            principal_name: values.principalName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Redirecting to login...");
        // Delay redirect slightly so the user sees the toast
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-xl shadow-slate-100 rounded-2xl bg-white relative overflow-hidden my-4">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-700 to-indigo-600"></div>
      
      <CardHeader className="space-y-2 pt-8 pb-6">
        <div className="bg-indigo-50 text-indigo-700 w-11 h-11 rounded-xl flex items-center justify-center mx-auto shadow-inner mb-2 border border-indigo-100">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl md:text-2xl font-black text-center text-slate-900 tracking-tight">
          School Registration
        </CardTitle>
        <CardDescription className="text-center text-slate-500 text-xs font-medium">
          Register a new school on the DC Bill Platform
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          
          {/* School Name */}
          <div className="space-y-1.5">
            <Label htmlFor="schoolNameEn" className="text-xs font-bold text-slate-700">School Name (English)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="h-4 w-4" />
              </div>
              <Input
                id="schoolNameEn"
                type="text"
                placeholder="e.g. MDRS Sulibele"
                className={`pl-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 rounded-lg text-xs h-10 ${errors.schoolNameEn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("schoolNameEn")}
              />
            </div>
            {errors.schoolNameEn && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.schoolNameEn.message}</p>
            )}
          </div>
          
          {/* Principal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="principalName" className="text-xs font-bold text-slate-700">Principal Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="principalName"
                type="text"
                placeholder="Enter principal's full name"
                className={`pl-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 rounded-lg text-xs h-10 ${errors.principalName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("principalName")}
              />
            </div>
            {errors.principalName && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.principalName.message}</p>
            )}
          </div>
          
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
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                className={`pl-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 rounded-lg text-xs h-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>
          
          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">Confirm Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                className={`pl-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 rounded-lg text-xs h-10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
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
                Registering...
              </>
            ) : (
              "Register School"
            )}
          </Button>
          <div className="text-xs text-center text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">
              Log In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
