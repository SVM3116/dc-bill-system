"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, FileCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { convertNumberToWords } from "@/lib/number-to-words";
import { logActivity } from "@/app/actions/activity-actions";
import { upsertBill } from "@/app/actions/bill-actions";

// Zod validation schema for full submission
const itemSchema = z.object({
  bill_number: z.string().min(1, "Bill Number is required"),
  bill_date: z.string().min(1, "Bill Date is required"),
  purpose: z.string().min(1, "Payment details are required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
});

const deductionSchema = z.object({
  deduction_type: z.string().min(1, "Deduction type is required"),
  deduction_mode: z.enum(["percentage", "fixed"]),
  deduction_value: z.coerce.number().min(0, "Value cannot be negative"),
  deduction_amount: z.coerce.number().min(0, "Amount cannot be negative").optional(),
});

const billFormSchema = z.object({
  dc_bill_number: z.string().min(1, "D.C. Bill Number is required"),
  cheque_number: z
    .string()
    .min(1, "Cheque Number is required")
    .regex(/^\d{6}$/, "Cheque Number must be exactly 6 digits"),
  cheque_date: z.string().min(1, "Cheque Date is required"),
  payee_name: z.string().min(1, "Payee Name is required"),
  payee_address: z.string().min(1, "Payee Address is required"),
  amount_in_words: z.string().min(1, "Amount in Words is required"),
  items: z.array(itemSchema).min(1, "At least one item must be added"),
  deductions: z.array(deductionSchema).default([]),
}).superRefine((data, ctx) => {
  const grossAmount = (data.items || []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  let totalDeductions = 0;

  (data.deductions || []).forEach((ded, index) => {
    const val = Number(ded.deduction_value) || 0;
    if (ded.deduction_mode === "percentage") {
      if (val < 0 || val > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentage must be between 0 and 100",
          path: ["deductions", index, "deduction_value"],
        });
      }
      totalDeductions += (grossAmount * val) / 100;
    } else {
      if (val < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount cannot be negative",
          path: ["deductions", index, "deduction_value"],
        });
      }
      if (val > grossAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed amount cannot exceed Gross Amount",
          path: ["deductions", index, "deduction_value"],
        });
      }
      totalDeductions += val;
    }
  });

  const netPayable = grossAmount - totalDeductions;
  if (netPayable < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Net payable cannot be negative. Deductions exceed Gross Amount.",
      path: ["amount_in_words"],
    });
  }
});

type BillFormValues = z.infer<typeof billFormSchema>;

interface BillFormProps {
  billId?: string; // If provided, we are in Edit mode
  initialData?: any; // Initial bill values for Edit mode
  isDuplicate?: boolean; // If true, this is duplicated from another bill
  financialYear?: string; // Selected academic/financial year
  accountType?: "maintenance" | "salary";
}

export function BillForm({ billId, initialData, isDuplicate, financialYear = "2026-27", accountType }: BillFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const activeAccount = initialData?.account_type || accountType || "maintenance";

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Setup form
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      dc_bill_number: initialData?.dc_bill_number || "",
      cheque_number: initialData?.cheque_number || "",
      cheque_date: initialData?.cheque_date || "",
      payee_name: initialData?.payee_name || "",
      payee_address: initialData?.payee_address || "",
      amount_in_words: initialData?.amount_in_words || "",
      items: initialData?.items?.map((item: any) => ({
        bill_number: item.bill_number || "",
        bill_date: item.bill_date || "",
        purpose: item.purpose || "",
        amount: item.amount !== undefined && item.amount !== null ? Number(item.amount) : 0,
      })) || [
        { bill_number: "", bill_date: "", purpose: "", amount: 0 },
      ],
      deductions: initialData?.deductions || [],
    },
  });

  // Form watch logger for debugging state updates dynamically (Step 10)
  const formValues = watch();
  useEffect(() => {
    console.log("FORM VALUES UPDATED LIVE:", formValues);
  }, [formValues]);

  // Dynamic uniqueness check for Cheque Number
  const [checkingCheque, setCheckingCheque] = useState(false);
  const watchedChequeNumber = watch("cheque_number");

  useEffect(() => {
    if (!watchedChequeNumber || watchedChequeNumber.length !== 6 || !userId) {
      if (errors.cheque_number?.type === "duplicate") {
        clearErrors("cheque_number");
      }
      return;
    }

    const checkChequeUniqueness = async () => {
      setCheckingCheque(true);
      try {
        let query = supabase
          .from("dc_bills")
          .select("id")
          .eq("cheque_number", watchedChequeNumber)
          .eq("school_id", userId);

        if (billId) {
          query = query.neq("id", billId);
        }

        const { data, error } = await query;
        if (data && data.length > 0) {
          setError("cheque_number", {
            type: "duplicate",
            message: "Cheque number already exists",
          });
        } else {
          if (errors.cheque_number?.type === "duplicate") {
            clearErrors("cheque_number");
          }
        }
      } catch (err) {
        console.error("Error checking cheque number uniqueness:", err);
      } finally {
        setCheckingCheque(false);
      }
    };

    const timer = setTimeout(checkChequeUniqueness, 300);
    return () => clearTimeout(timer);
  }, [watchedChequeNumber, billId, supabase, setError, clearErrors, errors.cheque_number?.type, userId]);

  // Get current user id
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, [supabase]);

  // Get next sequential DC Bill Number specifically for the selected Financial Year and Account Type
  useEffect(() => {
    if (billId || !userId) return; // If editing or user not loaded, don't generate
    
    const fetchNextBillNumber = async () => {
      try {
        const { data, error } = await supabase
          .from("dc_bills")
          .select("dc_bill_number")
          .eq("school_id", userId)
          .eq("account_type", activeAccount)
          .ilike("dc_bill_number", `%${financialYear}`);

        if (error) throw error;
        
        let maxNum = 0;
        if (data && data.length > 0) {
          data.forEach(item => {
            const numStr = item.dc_bill_number || "";
            const parts = numStr.split("/");
            if (parts.length > 0) {
              const num = parseInt(parts[0].trim(), 10);
              if (!isNaN(num) && num > maxNum) {
                maxNum = num;
              }
            }
          });
        }
        const nextNum = maxNum + 1;
        const nextNumStr = String(nextNum).padStart(2, "0") + " / " + financialYear;
        setValue("dc_bill_number", nextNumStr);
      } catch (err) {
        console.error("Error fetching next bill number:", err);
      }
    };
    fetchNextBillNumber();
  }, [billId, supabase, setValue, financialYear, userId, activeAccount]);
  // Setup useFieldArray for items list
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Setup useFieldArray for deductions list
  const { fields: deductionFields, append: appendDeduction, remove: removeDeduction } = useFieldArray({
    control,
    name: "deductions",
  });

  // Watch items and deductions arrays to calculate amounts
  const watchedItems = watch("items") || [];
  const watchedDeductions = watch("deductions") || [];

  const grossAmount = watchedItems.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);

  // Calculate individual deduction amounts and total deductions
  const calculatedDeductions = watchedDeductions.map((ded: any) => {
    const val = Number(ded.deduction_value) || 0;
    const amount = ded.deduction_mode === "percentage"
      ? (grossAmount * val) / 100
      : val;
    return {
      ...ded,
      deduction_amount: Number(amount.toFixed(2)),
    };
  });

  const totalDeductions = calculatedDeductions.reduce((sum: number, ded: any) => sum + ded.deduction_amount, 0);
  const netPayableAmount = Math.max(0, grossAmount - totalDeductions);

  // Auto-calculate and update amount in words on netPayableAmount change
  useEffect(() => {
    if (netPayableAmount > 0) {
      setValue("amount_in_words", convertNumberToWords(netPayableAmount));
    } else {
      setValue("amount_in_words", "");
    }
  }, [netPayableAmount, setValue]);

  // Form actions
  const saveBillToDb = async (values: Partial<BillFormValues>, isGenerated: boolean) => {
    setLoading(true);
    try {
      const billData = {
        dc_bill_number: values.dc_bill_number || "",
        cheque_number: values.cheque_number || "",
        cheque_date: values.cheque_date || null,
        payee_name: values.payee_name || "",
        payee_address: values.payee_address || "",
        amount: netPayableAmount,
        amount_in_words: values.amount_in_words || "",
        items: values.items || [],
        status: (isGenerated ? "generated" : "draft") as "draft" | "generated",
        gross_amount: grossAmount,
        total_deductions: totalDeductions,
        net_payable_amount: netPayableAmount,
        account_type: activeAccount,
      };

      const result = await upsertBill(billId, billData, calculatedDeductions);

      if (result.success) {
        const returnedId = result.id;

        // Log action in audit table
        const auditAction = billId ? "edited" : (isDuplicate ? "duplicated" : "generated");
        await logActivity(
          auditAction,
          values.dc_bill_number || "",
          values.payee_name || ""
        );

        toast.success(isGenerated ? "PDF generated and bill finalized!" : "Draft saved successfully.");
        router.push(isGenerated ? `/bills/${returnedId}` : `/bills?account_type=${activeAccount}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Database save failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  // Handler for Save Draft (bypasses full form Zod validation)
  const handleSaveDraft = async () => {
    // Read the current form values manually to skip zod resolver constraints
    const currentValues = watch();
    
    if (errors.cheque_number?.type === "duplicate") {
      toast.error("Cannot save: Cheque number already exists.");
      return;
    }

    if (!currentValues.dc_bill_number) {
      toast.error("D.C. Bill Number is required even to save a draft.");
      return;
    }
    
    // Set default empty values for missing items elements
    const cleanedItems = (currentValues.items || []).map((item: any) => ({
      bill_number: item.bill_number || "",
      bill_date: item.bill_date || "",
      purpose: item.purpose || "",
      amount: Number(item.amount) || 0,
    }));

    const cleanedDeductions = (currentValues.deductions || []).map((ded: any) => ({
      deduction_type: ded.deduction_type || "",
      deduction_mode: ded.deduction_mode || "percentage",
      deduction_value: Number(ded.deduction_value) || 0,
      deduction_amount: Number(ded.deduction_amount) || 0,
    }));

    const draftValues = {
      ...currentValues,
      items: cleanedItems,
      deductions: cleanedDeductions,
    };

    await saveBillToDb(draftValues, false);
  };

  // Handler for full validation and PDF generation
  const handleGeneratePdf = async (values: any) => {
    await saveBillToDb(values, true);
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
        <div>
          <CardTitle className="text-base md:text-lg font-bold text-slate-800">
            {billId 
              ? `Edit ${activeAccount === "salary" ? "Salary" : "Maintenance"} Account DC Bill Details` 
              : `Create New ${activeAccount === "salary" ? "Salary" : "Maintenance"} Account DC Bill`}
          </CardTitle>
          <p className="text-[11px] text-slate-500">Fill in the fields exactly as printed on the PDF sheet</p>
        </div>
        <Link href={`/bills?account_type=${activeAccount}`} className="w-full sm:w-auto">
          <Button type="button" variant="outline" size="sm" className="border-slate-200 text-slate-600 text-xs flex items-center justify-center gap-1 w-full sm:w-auto h-9">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to List
          </Button>
        </Link>
      </CardHeader>
      
      <form onSubmit={handleSubmit(handleGeneratePdf)}>
        <CardContent className="space-y-6 pt-6">

          {/* General Details & Cheque Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1">
              <Label htmlFor="dc_bill_number" className="text-xs font-bold text-slate-700">D.C. Bill Number (`ಡಿ.ಸಿ. ಬಿಲ್ ಸಂಖ್ಯೆ`)</Label>
              <Input
                id="dc_bill_number"
                placeholder="Auto-generating..."
                readOnly
                className="border-slate-200 bg-slate-50 font-mono font-bold text-slate-700 cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0"
                {...register("dc_bill_number")}
              />
              <p className="text-[10px] text-slate-400">Locked to active financial year context</p>
              {errors.dc_bill_number && (
                <p className="text-[10px] font-semibold text-red-500">{String(errors.dc_bill_number.message)}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="cheque_number" className="text-xs font-bold text-slate-700">Cheque Number (`ಚೆಕ್ ಸಂಖ್ಯೆ`)</Label>
              <Input
                id="cheque_number"
                placeholder="Enter 6-digit Cheque No."
                maxLength={6}
                pattern="[0-9]*"
                className={errors.cheque_number ? "border-red-500 focus-visible:ring-red-500 h-10" : "border-slate-200 h-10"}
                {...register("cheque_number", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  }
                })}
              />
              {errors.cheque_number && (
                <p className="text-[10px] font-semibold text-red-500">{String(errors.cheque_number.message)}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cheque_date" className="text-xs font-bold text-slate-700">Cheque Date (`ದಿನಾಂಕ`)</Label>
              <Input
                id="cheque_date"
                type="date"
                className={errors.cheque_date ? "border-red-500 focus-visible:ring-red-500 cursor-pointer h-10" : "border-slate-200 cursor-pointer h-10"}
                {...register("cheque_date")}
              />
              {errors.cheque_date && (
                <p className="text-[10px] font-semibold text-red-500">{String(errors.cheque_date.message)}</p>
              )}
            </div>
          </div>

          {/* Payee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1">
              <Label htmlFor="payee_name" className="text-xs font-bold text-slate-700">Payee Name (`ಪಾವತಿದಾರರು`)</Label>
              <Input
                id="payee_name"
                placeholder="Enter Payee Name (e.g. Principal / Vendor Name)"
                className={errors.payee_name ? "border-red-500 focus-visible:ring-red-500 h-10" : "border-slate-200 h-10"}
                {...register("payee_name")}
              />
              {errors.payee_name && (
                <p className="text-[10px] font-semibold text-red-500">{String(errors.payee_name.message)}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="payee_address" className="text-xs font-bold text-slate-700">Payee Address (`ವಿಳಾಸ`)</Label>
              <Input
                id="payee_address"
                placeholder="Enter Payee Address details"
                className={errors.payee_address ? "border-red-500 focus-visible:ring-red-500 h-10" : "border-slate-200 h-10"}
                {...register("payee_address")}
              />
              {errors.payee_address && (
                <p className="text-[10px] font-semibold text-red-500">{String(errors.payee_address.message)}</p>
              )}
            </div>
          </div>

          {/* Dynamic Items Section */}
          <div className="space-y-3">
            <div className="flex flex-row justify-between items-center gap-2">
              <Label className="text-xs font-bold text-slate-700">Detailed Items (`ವಿವರಗಳು`)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ bill_number: "", bill_date: "", purpose: "", amount: 0 })}
                className="border-slate-300 text-blue-700 font-bold text-xs flex items-center gap-1.5 h-9 px-3 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
            </div>
            
            {/* Desktop Table View */}
            {(!mounted || !isMobile) && (
              <div className="hidden md:block border border-slate-200 rounded-md overflow-hidden bg-slate-50 p-1">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow className="hover:bg-slate-100 border-b border-slate-200">
                      <TableHead className="w-[60px] font-bold text-xs text-slate-700 text-center">Sl. No.</TableHead>
                      <TableHead className="w-[150px] font-bold text-xs text-slate-700">Sub-bill Number</TableHead>
                      <TableHead className="w-[150px] font-bold text-xs text-slate-700">Sub-bill Date</TableHead>
                      <TableHead className="font-bold text-xs text-slate-700">Payment Details (Particulars)</TableHead>
                      <TableHead className="w-[150px] font-bold text-xs text-slate-700 text-right">Amount (₹)</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="hover:bg-slate-50 border-b border-slate-200">
                        <TableCell className="text-center font-semibold text-xs text-slate-600">{index + 1}</TableCell>
                        <TableCell className="p-2">
                          <Controller
                            control={control}
                            name={`items.${index}.bill_number`}
                            render={({ field: controllerField }) => (
                              <Input
                                {...controllerField}
                                placeholder="e.g. Inv-45"
                                className="h-8 text-xs border-slate-200 bg-white"
                                onChange={(e) => {
                                  console.log(`[DESKTOP TABLE] Sub-bill Number [Row ${index}] Change:`, e.target.value);
                                  controllerField.onChange(e);
                                }}
                              />
                            )}
                          />
                          {(errors.items as any)?.[index]?.bill_number && (
                            <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                          )}
                        </TableCell>
                        <TableCell className="p-2">
                          <Controller
                            control={control}
                            name={`items.${index}.bill_date`}
                            render={({ field: controllerField }) => (
                              <Input
                                {...controllerField}
                                type="date"
                                className="h-8 text-xs border-slate-200 bg-white cursor-pointer"
                                onChange={(e) => {
                                  console.log(`[DESKTOP TABLE] Sub-bill Date [Row ${index}] Change:`, e.target.value);
                                  controllerField.onChange(e);
                                }}
                              />
                            )}
                          />
                          {(errors.items as any)?.[index]?.bill_date && (
                            <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                          )}
                        </TableCell>
                        <TableCell className="p-2">
                          <Controller
                            control={control}
                            name={`items.${index}.purpose`}
                            render={({ field: controllerField }) => (
                              <Input
                                {...controllerField}
                                placeholder="Particulars of expense"
                                className="h-8 text-xs border-slate-200 bg-white"
                                onChange={(e) => {
                                  console.log(`[DESKTOP TABLE] Payment Details [Row ${index}] Change:`, e.target.value);
                                  controllerField.onChange(e);
                                }}
                              />
                            )}
                          />
                          {(errors.items as any)?.[index]?.purpose && (
                            <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                          )}
                        </TableCell>
                        <TableCell className="p-2">
                          <Controller
                            control={control}
                            name={`items.${index}.amount`}
                            render={({ field: controllerField }) => (
                              <Input
                                {...controllerField}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-8 text-xs border-slate-200 bg-white text-right font-semibold"
                                onChange={(e) => {
                                  console.log(`[DESKTOP TABLE] Amount [Row ${index}] Change:`, e.target.value);
                                  controllerField.onChange(e);
                                }}
                              />
                            )}
                          />
                          {(errors.items as any)?.[index]?.amount && (
                            <p className="text-[9px] font-semibold text-red-500 mt-1">Positive number</p>
                          )}
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            className="h-8 w-8 text-slate-400 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals Row */}
                    <TableRow className="bg-slate-100 hover:bg-slate-100 font-bold border-t border-slate-300">
                      <TableCell colSpan={4} className="text-right text-xs font-bold text-slate-700 uppercase pr-4">Gross Amount:</TableCell>
                      <TableCell className="text-right text-sm font-black text-slate-800 pr-4">
                        ₹{grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Mobile Stacked Cards View */}
            {mounted && isMobile && (
              <div className="block md:hidden space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border border-slate-200 bg-white shadow-none">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-2 px-3 flex flex-row items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Item #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="h-8 w-8 text-slate-400 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">Sub-bill Number</Label>
                        <Controller
                          control={control}
                          name={`items.${index}.bill_number`}
                          render={({ field: controllerField }) => (
                            <Input
                              {...controllerField}
                              placeholder="e.g. Inv-45"
                              className="h-10 text-xs border-slate-200"
                              onChange={(e) => {
                                console.log(`[MOBILE CARD] Sub-bill Number [Row ${index}] Change:`, e.target.value);
                                controllerField.onChange(e);
                              }}
                            />
                          )}
                        />
                        {(errors.items as any)?.[index]?.bill_number && (
                          <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">Sub-bill Date</Label>
                        <Controller
                          control={control}
                          name={`items.${index}.bill_date`}
                          render={({ field: controllerField }) => (
                            <Input
                              {...controllerField}
                              type="date"
                              className="h-10 text-xs border-slate-200 cursor-pointer"
                              onChange={(e) => {
                                console.log(`[MOBILE CARD] Sub-bill Date [Row ${index}] Change:`, e.target.value);
                                controllerField.onChange(e);
                              }}
                            />
                          )}
                        />
                        {(errors.items as any)?.[index]?.bill_date && (
                          <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                        )}
                      </div>
 
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">Payment Details (Particulars)</Label>
                        <Controller
                          control={control}
                          name={`items.${index}.purpose`}
                          render={({ field: controllerField }) => (
                            <Input
                              {...controllerField}
                              placeholder="Particulars of expense"
                              className="h-10 text-xs border-slate-200"
                              onChange={(e) => {
                                console.log(`[MOBILE CARD] Payment Details [Row ${index}] Change:`, e.target.value);
                                controllerField.onChange(e);
                              }}
                            />
                          )}
                        />
                        {(errors.items as any)?.[index]?.purpose && (
                          <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                        )}
                      </div>
 
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">Amount (₹)</Label>
                        <Controller
                          control={control}
                          name={`items.${index}.amount`}
                          render={({ field: controllerField }) => (
                            <Input
                              {...controllerField}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="h-10 text-xs border-slate-200 font-semibold"
                              onChange={(e) => {
                                console.log(`[MOBILE CARD] Amount [Row ${index}] Change:`, e.target.value);
                                controllerField.onChange(e);
                              }}
                            />
                          )}
                        />
                        {(errors.items as any)?.[index]?.amount && (
                          <p className="text-[9px] font-semibold text-red-500 mt-1">Positive number</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
 
                {/* Mobile Total Amount Summary */}
                <div className="bg-slate-100 p-3 rounded-md flex justify-between items-center font-bold text-xs">
                  <span className="text-slate-600">Gross Amount:</span>
                  <span className="text-sm font-black text-slate-800">
                    ₹{grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {(errors.items as any)?.root && (
              <p className="text-xs font-semibold text-red-500">{String((errors.items as any).root.message)}</p>
            )}
          </div>

          {/* Deductions Section */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex flex-row justify-between items-center gap-2">
              <div>
                <Label className="text-sm font-black text-slate-800 uppercase tracking-wider">Deductions (ಕಡಿತಗಳು)</Label>
                <p className="text-[10px] text-slate-500">Add custom deductions (TDS, GST, Security Deposit, etc.)</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDeduction({ deduction_type: "", deduction_mode: "percentage", deduction_value: 0 })}
                className="border-slate-300 text-blue-700 font-bold text-xs flex items-center gap-1.5 h-9 px-3 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Deduction
              </Button>
            </div>

            {deductionFields.length > 0 ? (
              <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-200 rounded-xl">
                {deductionFields.map((field, index) => {
                  const dedError = (errors.deductions as any)?.[index];
                  const dedAmount = calculatedDeductions[index]?.deduction_amount || 0;

                  return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">Deduction Type</Label>
                        <Input
                          placeholder="e.g. TDS / GST / Security Deposit"
                          className="h-9 text-xs border-slate-200"
                          {...register(`deductions.${index}.deduction_type`)}
                        />
                        {dedError?.deduction_type && (
                          <p className="text-[9px] font-semibold text-red-500 mt-1">Required</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">Deduction Mode</Label>
                        <Controller
                          control={control}
                          name={`deductions.${index}.deduction_mode`}
                          render={({ field: selectField }) => (
                            <select
                              {...selectField}
                              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                          )}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500">
                          {watch(`deductions.${index}.deduction_mode`) === "percentage" ? "Percentage (%)" : "Fixed Amount (₹)"}
                        </Label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0"
                          className="h-9 text-xs border-slate-200 font-semibold"
                          {...register(`deductions.${index}.deduction_value`)}
                        />
                        {dedError?.deduction_value && (
                          <p className="text-[9px] font-semibold text-red-500 mt-1">{dedError.deduction_value.message}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] font-bold text-slate-500">Deduction Amount</Label>
                          <div className="h-9 text-xs border border-slate-200 bg-slate-50 rounded-md flex items-center px-3 font-black text-slate-800">
                            ₹{dedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDeduction(index)}
                          className="h-9 w-9 text-slate-400 hover:text-red-700 mt-5 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 bg-slate-50/30 rounded-xl text-xs text-slate-400 font-semibold">
                No deductions added yet. Click &quot;Add Deduction&quot; to define custom deduction rows.
              </div>
            )}
          </div>

          {/* Live Calculations Summary Card */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 md:p-6 shadow-md space-y-4">
            <h4 className="text-xs font-black tracking-wider uppercase text-blue-400">Calculation Summary (ಲೆಕ್ಕಾಚಾರದ ವಿವರ)</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Gross Amount (ಒಟ್ಟು ಮೊತ್ತ):</span>
                <span className="font-bold text-white">
                  ₹{grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              {calculatedDeductions.length > 0 && (
                <div className="border-t border-slate-800 pt-2.5 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">Deductions Breakdown:</div>
                  {calculatedDeductions.map((ded: any, idx: number) => {
                    const label = ded.deduction_type || `Deduction #${idx + 1}`;
                    const details = ded.deduction_mode === "percentage" ? ` (${ded.deduction_value}%)` : "";
                    return (
                      <div key={idx} className="flex justify-between items-center text-slate-300 pl-2 border-l border-red-500">
                        <span>{label}{details}:</span>
                        <span className="font-semibold text-red-400">
                          - ₹{ded.deduction_amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center text-slate-300 font-bold border-t border-slate-800 pt-2">
                    <span>Total Deductions (ಒಟ್ಟು ಕಡಿತಗಳು):</span>
                    <span className="text-red-400">
                      - ₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-700 pt-3 flex justify-between items-center text-sm font-black tracking-wide text-white">
                <span className="text-blue-400">Net Payable Amount (ನಿವ್ವಳ ಪಾವತಿ ಮೊತ್ತ):</span>
                <span className="text-base text-emerald-400">
                  ₹{netPayableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="space-y-1">
            <Label htmlFor="amount_in_words" className="text-xs font-bold text-slate-700">Amount in Words (`Amount in Rupees` in words)</Label>
            <Input
              id="amount_in_words"
              placeholder="e.g. Three Thousand Rupees Only (supports Kannada & English)"
              className={errors.amount_in_words ? "border-red-500 focus-visible:ring-red-500 h-10 text-xs" : "border-slate-200 h-10 text-xs"}
              {...register("amount_in_words")}
            />
            {errors.amount_in_words && (
              <p className="text-[10px] font-semibold text-red-500">{String(errors.amount_in_words.message)}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 bg-slate-50 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleSaveDraft}
            className="w-full sm:w-auto border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer h-12 sm:h-10"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-12 sm:h-10"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
            Generate PDF & Save
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
