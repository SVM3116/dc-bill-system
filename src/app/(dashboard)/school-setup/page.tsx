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
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, School, Landmark, FileCheck } from "lucide-react";

// Form validation schema
const setupSchema = z.object({
  schoolNameKn: z.string().min(3, "School Name in Kannada must be at least 3 characters"),
  schoolAddressKn: z.string().min(5, "School Address in Kannada must be at least 5 characters"),
  accountTypeKn: z.string().min(2, "Account Type in Kannada must be at least 2 characters"),
  accountNumber: z.string().regex(/^\d{9,18}$/, "Account Number must be between 9 and 18 digits"),
  accountMaintainedByKn: z.string().min(3, "Account Maintained By details in Kannada are required"),
  rightSignatureKn: z.string().min(2, "Right Signature in Kannada must be at least 2 characters"),
  showLeftSignature: z.boolean(),
  leftSignatureKn: z.string().optional(),
}).refine((data) => {
  if (data.showLeftSignature) {
    return !!data.leftSignatureKn && data.leftSignatureKn.trim().length >= 2;
  }
  return true;
}, {
  message: "Left Signature in Kannada must be at least 2 characters if enabled",
  path: ["leftSignatureKn"],
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
      accountTypeKn: "ನಿರ್ವಹಣಾ ಖಾತೆ", // default Kannada account type
      accountNumber: "",
      accountMaintainedByKn: "ಪ್ರಾಂಶುಪಾಲರು ಮತ್ತು ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳು", // default account maintained by
      rightSignatureKn: "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ",
      showLeftSignature: false,
      leftSignatureKn: "ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ",
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
          .select("school_name_kn, school_address_kn, account_type_kn, account_number, account_maintained_by_kn, school_profile_completed, right_signature_kn, show_left_signature, left_signature_kn")
          .eq("id", user.id)
          .single();
          
        if (school) {
          reset({
            schoolNameKn: school.school_name_kn || "",
            schoolAddressKn: school.school_address_kn || "",
            accountTypeKn: school.account_type_kn || "ನಿರ್ವಹಣಾ ಖಾತೆ",
            accountNumber: school.account_number || "",
            accountMaintainedByKn: school.account_maintained_by_kn || "ಪ್ರಾಂಶುಪಾಲರು ಮತ್ತು ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳು",
            rightSignatureKn: school.right_signature_kn || "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ",
            showLeftSignature: school.show_left_signature ?? false,
            leftSignatureKn: school.left_signature_kn || "ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ",
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
    let fieldsToValidate: ("schoolNameKn" | "schoolAddressKn" | "accountTypeKn" | "accountNumber" | "accountMaintainedByKn" | "rightSignatureKn" | "showLeftSignature" | "leftSignatureKn")[] = [];
    if (step === 1) {
      fieldsToValidate = ["schoolNameKn", "schoolAddressKn"];
    } else if (step === 2) {
      fieldsToValidate = ["accountTypeKn", "accountNumber", "accountMaintainedByKn", "rightSignatureKn", "showLeftSignature", "leftSignatureKn"];
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
          account_type_kn: values.accountTypeKn,
          account_number: values.accountNumber,
          account_maintained_by_kn: values.accountMaintainedByKn,
          right_signature_kn: values.rightSignatureKn,
          show_left_signature: values.showLeftSignature,
          left_signature_kn: values.showLeftSignature ? values.leftSignatureKn : null,
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <Card className="w-full max-w-xl border-slate-200 shadow-md bg-white text-slate-800 z-10 overflow-hidden">
        {/* Progress Bar Header */}
        <div className="w-full bg-slate-100 h-2 flex">
          <div className={`h-full bg-blue-700 transition-all duration-500 ${step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"}`} />
        </div>

        <CardHeader className="space-y-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              {step === 1 ? <School className="h-6 w-6" /> : step === 2 ? <Landmark className="h-6 w-6" /> : <FileCheck className="h-6 w-6" />}
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
                Configure Profile: {schoolNameEn}
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-0.5">
                {step === 1 && "Step 1: School Identity Details (Kannada)"}
                {step === 2 && "Step 2: Bank Account Details (Kannada)"}
                {step === 3 && "Step 3: Review Configurations"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 py-4 min-h-[260px] flex flex-col justify-center">
            
            {/* STEP 1: SCHOOL DETAILS */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolNameKn" className="text-slate-700">School Name (Kannada / ಕನ್ನಡ)</Label>
                  <Input
                    id="schoolNameKn"
                    placeholder="e.g. ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಮಾಲೂರು ಟೌನ್"
                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.schoolNameKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("schoolNameKn")}
                  />
                  {errors.schoolNameKn && (
                    <p className="text-xs font-semibold text-red-500">{errors.schoolNameKn.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    This string will print dynamically in the center header of official DC bills.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolAddressKn" className="text-slate-700">School Address (Kannada / ಕನ್ನಡ)</Label>
                  <Input
                    id="schoolAddressKn"
                    placeholder="e.g. ಮಾಲೂರು ತಾಲ್ಲೂಕು, ಕೋಲಾರ ಜಿಲ್ಲೆ - 563130"
                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.schoolAddressKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("schoolAddressKn")}
                  />
                  {errors.schoolAddressKn && (
                    <p className="text-xs font-semibold text-red-500">{errors.schoolAddressKn.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Official school street address, sub-district, and pincode written in Kannada script.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: BANK DETAILS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountTypeKn" className="text-slate-700">Account Type (Kannada / ಕನ್ನಡ)</Label>
                    <Input
                      id="accountTypeKn"
                      placeholder="e.g. ನಿರ್ವಹಣಾ ಖಾತೆ"
                      className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.accountTypeKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("accountTypeKn")}
                    />
                    {errors.accountTypeKn && (
                      <p className="text-xs font-semibold text-red-500">{errors.accountTypeKn.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-slate-700">Account Number (Digits Only)</Label>
                    <Input
                      id="accountNumber"
                      placeholder="e.g. 64076713075"
                      type="text"
                      className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.accountNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("accountNumber")}
                    />
                    {errors.accountNumber && (
                      <p className="text-xs font-semibold text-red-500">{errors.accountNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountMaintainedByKn" className="text-slate-700">Account Maintained By (Kannada / ಕನ್ನಡ)</Label>
                  <Input
                    id="accountMaintainedByKn"
                    placeholder="e.g. ಪ್ರಾಂಶುಪಾಲರು ಮತ್ತು ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳು"
                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.accountMaintainedByKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("accountMaintainedByKn")}
                  />
                  {errors.accountMaintainedByKn && (
                    <p className="text-xs font-semibold text-red-500">{errors.accountMaintainedByKn.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Typically names the official designations (e.g. Principal and District Officer) who sign the bank accounts.
                  </p>
                </div>

                <div className="border-t border-slate-200 my-4 pt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-blue-700">PDF Signature Settings</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rightSignatureKn" className="text-slate-700">Right Signature (Compulsory / Kannada / ಕನ್ನಡ)</Label>
                    <Input
                      id="rightSignatureKn"
                      placeholder="e.g. ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ"
                      className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.rightSignatureKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("rightSignatureKn")}
                    />
                    {errors.rightSignatureKn && (
                      <p className="text-xs font-semibold text-red-500">{errors.rightSignatureKn.message}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      This label always prints on the bottom-right side of the PDF footer.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2.5 py-1">
                    <input
                      type="checkbox"
                      id="showLeftSignature"
                      className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                      {...register("showLeftSignature")}
                    />
                    <Label htmlFor="showLeftSignature" className="text-xs text-slate-600 cursor-pointer select-none">
                      Show secondary signature on the left side of PDF footer
                    </Label>
                  </div>

                  {watch("showLeftSignature") && (
                    <div className="space-y-2 pt-1 animate-fadeIn">
                      <Label htmlFor="leftSignatureKn" className="text-slate-700">Left Signature (Kannada / ಕನ್ನಡ)</Label>
                      <Input
                        id="leftSignatureKn"
                        placeholder="e.g. ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ"
                        className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 ${errors.leftSignatureKn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        {...register("leftSignatureKn")}
                      />
                      {errors.leftSignatureKn && (
                        <p className="text-xs font-semibold text-red-500">{errors.leftSignatureKn.message}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        This label prints on the bottom-left side of the PDF footer when enabled.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center text-center p-3 mb-2 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mb-2 animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-800">Verify Setup Data</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                    Review and confirm these details. They will print dynamically on the official vector layout of your bills.
                  </p>
                </div>

                <div className="text-xs space-y-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">School (EN):</span>
                    <span className="text-slate-800 font-bold text-right truncate max-w-[280px]">{schoolNameEn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">School Name (KN):</span>
                    <span className="text-slate-800 font-bold text-right Kannada-text truncate max-w-[280px]">{formValues.schoolNameKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">Address (KN):</span>
                    <span className="text-slate-800 font-bold text-right Kannada-text truncate max-w-[280px]">{formValues.schoolAddressKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">Account Details (KN):</span>
                    <span className="text-slate-800 font-bold text-right Kannada-text truncate max-w-[280px]">{formValues.accountTypeKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">Account Number:</span>
                    <span className="text-slate-800 font-mono font-bold tracking-wider">{formValues.accountNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">Maintained By (KN):</span>
                    <span className="text-slate-800 font-bold text-right Kannada-text truncate max-w-[280px]">{formValues.accountMaintainedByKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">Right Signature:</span>
                    <span className="text-slate-800 font-bold text-right Kannada-text truncate max-w-[280px]">{formValues.rightSignatureKn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 gap-4">
                    <span className="text-slate-500 font-medium">Show Left Signature:</span>
                    <span className="text-slate-800 font-bold">{formValues.showLeftSignature ? "Yes" : "No"}</span>
                  </div>
                  {formValues.showLeftSignature && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 font-medium">Left Signature:</span>
                      <span className="text-slate-800 font-bold text-right Kannada-text truncate max-w-[280px]">{formValues.leftSignatureKn}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </CardContent>

          <CardFooter className="flex justify-between border-t border-slate-200 pt-5">
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors shadow-sm"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {isCompletedSetup && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-sm cursor-pointer transition-colors"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white font-bold shadow-sm cursor-pointer transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Details...
                  </>
                ) : (
                  isCompletedSetup ? "Update Configurations" : "Complete Setup"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
