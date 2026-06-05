"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  School, 
  Landmark, 
  FileCheck, 
  MapPin, 
  CreditCard 
} from "lucide-react";

// Form validation schema
const setupSchema = z.object({
  schoolNameKn: z.string().min(3, "School Name in Kannada must be at least 3 characters"),
  schoolAddressKn: z.string().min(5, "School Address in Kannada must be at least 5 characters"),
  maintenanceAccountNumber: z.string().regex(/^\d{9,18}$/, "Maintenance Account Number must be between 9 and 18 digits"),
  salaryAccountNumber: z.string().regex(/^\d{9,18}$/, "Salary Account Number must be between 9 and 18 digits"),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function SchoolSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [schoolNameEn, setSchoolNameEn] = useState("");
  const [isCompletedSetup, setIsCompletedSetup] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      schoolNameKn: "",
      schoolAddressKn: "",
      maintenanceAccountNumber: "",
      salaryAccountNumber: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    const fetchSchoolData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSchoolNameEn(user.user_metadata?.school_name_en || "your school");
        
        // Fetch current school config if exists
        const { data: school } = await supabase
          .from("schools")
          .select("school_name_kn, school_address_kn, account_number, maintenance_account_number, salary_account_number, school_profile_completed")
          .eq("id", user.id)
          .single();
          
        if (school) {
          reset({
            schoolNameKn: school.school_name_kn || "",
            schoolAddressKn: school.school_address_kn || "",
            maintenanceAccountNumber: school.maintenance_account_number || school.account_number || "",
            salaryAccountNumber: school.salary_account_number || "",
          });
          
          if (school.school_profile_completed) {
            setStep(3);
            setIsCompletedSetup(true);
          }
        }
      }
    };
    fetchSchoolData();
  }, [supabase, reset]);

  const handleNextStep = async () => {
    let fieldsToValidate: ("schoolNameKn" | "schoolAddressKn" | "maintenanceAccountNumber" | "salaryAccountNumber")[] = [];
    if (step === 1) {
      fieldsToValidate = ["schoolNameKn", "schoolAddressKn"];
    } else if (step === 2) {
      fieldsToValidate = ["maintenanceAccountNumber", "salaryAccountNumber"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please fill all required fields correctly before proceeding.");
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (values: SetupFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User session not found. Please log in again.");
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("schools")
        .update({
          school_name_kn: values.schoolNameKn,
          school_address_kn: values.schoolAddressKn,
          maintenance_account_number: values.maintenanceAccountNumber,
          salary_account_number: values.salaryAccountNumber,
          school_profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to save school setup: " + error.message);
      } else {
        toast.success("School setup completed successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 md:p-8 font-sans">
      <Card className="w-full max-w-xl border border-slate-200/80 shadow-lg bg-white text-slate-800 z-10 overflow-hidden rounded-2xl">
        {/* Top bar indicator */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"}`} />
        </div>

        {/* Step Indicator Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center w-full justify-between max-w-md mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                disabled={loading}
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step >= 1 ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100" : "bg-white border-slate-200 text-slate-400"
                } ${step > 1 ? "cursor-pointer hover:bg-blue-700 hover:border-blue-700" : ""}`}
              >
                1
              </button>
              <span className={`text-xs font-bold hidden sm:inline transition-colors ${step >= 1 ? "text-slate-800" : "text-slate-400"}`}>
                Identity
              </span>
            </div>
            
            {/* Line 1 */}
            <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                disabled={loading}
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step >= 2 ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100" : "bg-white border-slate-200 text-slate-400"
                } ${step > 2 ? "cursor-pointer hover:bg-blue-700 hover:border-blue-700" : ""}`}
              >
                2
              </button>
              <span className={`text-xs font-bold hidden sm:inline transition-colors ${step >= 2 ? "text-slate-800" : "text-slate-400"}`}>
                Accounts
              </span>
            </div>

            {/* Line 2 */}
            <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                step >= 3 ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100" : "bg-white border-slate-200 text-slate-400"
              }`}>
                3
              </div>
              <span className={`text-xs font-bold hidden sm:inline transition-colors ${step >= 3 ? "text-slate-800" : "text-slate-400"}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        <CardHeader className="space-y-1.5 pt-6 px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
              {step === 1 ? <School className="h-5.5 w-5.5" /> : step === 2 ? <Landmark className="h-5.5 w-5.5" /> : <FileCheck className="h-5.5 w-5.5" />}
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                Configure Profile
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-0.5">
                {schoolNameEn}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 py-4 px-6 sm:px-8 min-h-[260px] flex flex-col justify-center">
            
            {/* STEP 1: SCHOOL DETAILS */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolNameKn" className="text-slate-700 text-xs font-bold">School Name (Kannada / ಕನ್ನಡ)</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="schoolNameKn"
                      placeholder="e.g. ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಮಾಲೂರು ಟೌನ್"
                      className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 h-11 text-xs ${errors.schoolNameKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("schoolNameKn")}
                    />
                  </div>
                  {errors.schoolNameKn && (
                    <p className="text-[10px] font-semibold text-red-500">{errors.schoolNameKn.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This string will print dynamically in the center header of official DC bills.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolAddressKn" className="text-slate-700 text-xs font-bold">School Address (Kannada / ಕನ್ನಡ)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="schoolAddressKn"
                      placeholder="e.g. ಮಾಲೂರು ತಾಲ್ಲೂಕು, ಕೋಲಾರ ಜಿಲ್ಲೆ - 563130"
                      className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 h-11 text-xs ${errors.schoolAddressKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("schoolAddressKn")}
                    />
                  </div>
                  {errors.schoolAddressKn && (
                    <p className="text-[10px] font-semibold text-red-500">{errors.schoolAddressKn.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Official school street address, sub-district, and pincode written in Kannada script.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: BANK DETAILS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceAccountNumber" className="text-slate-700 text-xs font-bold">Maintenance Account Number (Digits Only)</Label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="maintenanceAccountNumber"
                      placeholder="e.g. 64076713075"
                      type="text"
                      className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 h-11 text-xs font-mono ${errors.maintenanceAccountNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("maintenanceAccountNumber")}
                    />
                  </div>
                  {errors.maintenanceAccountNumber && (
                    <p className="text-[10px] font-semibold text-red-500">{errors.maintenanceAccountNumber.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This account will be used for all Maintenance (ನಿರ್ವಹಣಾ) expense payments.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryAccountNumber" className="text-slate-700 text-xs font-bold">Salary Account Number (Digits Only)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="salaryAccountNumber"
                      placeholder="e.g. 64076713086"
                      type="text"
                      className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 h-11 text-xs font-mono ${errors.salaryAccountNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("salaryAccountNumber")}
                    />
                  </div>
                  {errors.salaryAccountNumber && (
                    <p className="text-[10px] font-semibold text-red-500">{errors.salaryAccountNumber.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This account will be used for all Salary (ಸಂಬಳ) payments.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center text-center p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <CheckCircle2 className="h-10 w-10 text-blue-600 mb-2 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-800">Verify Setup Data</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-0.5 leading-normal">
                    Review and confirm these details. They will print dynamically on the official vector layout of your bills.
                  </p>
                </div>

                <div className="text-xs space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><School className="h-3.5 w-3.5 text-slate-400" /> School (EN):</span>
                    <span className="text-slate-800 font-bold text-right truncate max-w-[280px]">{schoolNameEn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><School className="h-3.5 w-3.5 text-slate-400" /> School Name (KN):</span>
                    <span className="text-slate-800 font-bold text-right font-nudi truncate max-w-[280px]">{formValues.schoolNameKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Address (KN):</span>
                    <span className="text-slate-800 font-bold text-right font-nudi truncate max-w-[280px]">{formValues.schoolAddressKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5 text-slate-400" /> Maintenance Account:</span>
                    <span className="text-slate-800 font-mono font-bold tracking-wider">{formValues.maintenanceAccountNumber}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-slate-400" /> Salary Account:</span>
                    <span className="text-slate-800 font-mono font-bold tracking-wider">{formValues.salaryAccountNumber}</span>
                  </div>
                </div>
              </div>
            )}

          </CardContent>

          <CardFooter className="flex flex-col-reverse sm:flex-row gap-3 border-t border-slate-200 p-6 bg-slate-50/50 justify-between items-center w-full">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isCompletedSetup && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors text-xs font-bold h-10"
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors shadow-sm text-xs font-bold h-10 flex items-center justify-center gap-1.5"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm cursor-pointer transition-colors text-xs h-10 flex items-center justify-center gap-1.5"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-black shadow-sm cursor-pointer transition-all text-xs h-10 flex items-center justify-center gap-1.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Details...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4" />
                      {isCompletedSetup ? "Update Configurations" : "Complete Setup"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
