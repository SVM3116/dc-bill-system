"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, FileCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { upsertHandVoucher, getNextVoucherNumber } from "@/app/actions/hand-voucher-actions";
import { logActivity } from "@/app/actions/activity-actions";

// Format date helper (e.g. 2026-06-02 -> 02-06-2026)
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "";
  }
}

const KANNADA_MONTHS = [
  "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
  "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"
];

const YEARS = ["2026", "2027", "2028", "2029", "2030"];

// Zod Validation Schema
const handVoucherSchema = z.object({
  voucher_date: z.string().min(1, "Voucher Date is required"),
  payment_mode: z.enum(["cheque", "cash"]),
  cheque_number: z.string().optional().nullable(),
  cheque_date: z.string().optional().nullable(),
  main_content: z.string().min(1, "Main voucher Kannada content is required"),
  certification_content: z.string().min(1, "Certification Kannada content is required"),
  table_layout: z.enum(["teacher", "milling", "labor", "gas"]),
  items: z.array(z.object({
    sl_no: z.coerce.number(),
    description: z.string().min(1, "Description/Particulars is required"),
    subject: z.string().optional().nullable(),
    month: z.string().optional().nullable(),
    days: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    quantity_kg: z.coerce.number().optional().nullable(),
    quantity: z.string().optional().nullable(),
    rate: z.string().optional().nullable(),
    amount: z.coerce.number().min(0, "Amount must be positive"),
    remarks: z.string().optional().nullable(),
  })).min(1, "At least one item is required"),
}).superRefine((data, ctx) => {
  if (data.payment_mode === "cheque") {
    if (!data.cheque_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cheque Number is required when payment mode is Cheque",
        path: ["cheque_number"],
      });
    } else if (!/^\d{6}$/.test(data.cheque_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cheque Number must be exactly 6 digits",
        path: ["cheque_number"],
      });
    }
    if (!data.cheque_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cheque Date is required when payment mode is Cheque",
        path: ["cheque_date"],
      });
    }
  }
});

type HandVoucherFormValues = z.infer<typeof handVoucherSchema>;

interface HandVoucherFormProps {
  voucherId?: string; // Edit mode if provided
  initialData?: any;
  isDuplicate?: boolean;
}

export function HandVoucherForm({ voucherId, initialData, isDuplicate }: HandVoucherFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [schoolDetails, setSchoolDetails] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [autoVoucherNum, setAutoVoucherNum] = useState<string>("Loading...");

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
    getValues,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(handVoucherSchema),
    defaultValues: {
      voucher_date: initialData?.voucher_date || new Date().toISOString().split("T")[0],
      payment_mode: initialData?.payment_mode || "cheque",
      cheque_number: initialData?.cheque_number || "",
      cheque_date: initialData?.cheque_date || "",
      main_content: initialData?.main_content || "",
      certification_content: initialData?.certification_content || "",
      table_layout: initialData?.table_layout || "teacher",
      items: initialData?.hand_voucher_items?.map((item: any) => ({
        sl_no: item.sl_no,
        description: item.description || "",
        subject: item.subject || "",
        month: item.month || "",
        days: item.days || "",
        date: item.date || "",
        quantity_kg: item.quantity_kg !== null && item.quantity_kg !== undefined ? Number(item.quantity_kg) : "",
        quantity: item.quantity || "",
        rate: item.rate || "",
        amount: item.amount !== null && item.amount !== undefined ? Number(item.amount) : 0,
        remarks: item.remarks || "",
      })) || [
        { sl_no: 1, description: "", subject: "", month: "", days: "", date: "", quantity_kg: "", quantity: "", rate: "", amount: 0, remarks: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedDate = watch("voucher_date");
  const watchedMode = watch("payment_mode");
  const watchedChequeNum = watch("cheque_number");
  const watchedChequeDate = watch("cheque_date");
  const watchedMainContent = watch("main_content");
  const watchedCertContent = watch("certification_content");
  const watchedLayout = watch("table_layout");
  const watchedItems = useWatch({
    control,
    name: "items",
  });

  // Fetch school details
  useEffect(() => {
    const fetchSchool = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("schools")
          .select("school_name_kn, school_name_en")
          .eq("id", user.id)
          .single();
        if (data) {
          setSchoolDetails(data);
        }
      }
    };
    fetchSchool();
  }, [supabase]);

  // Fetch / update next voucher number preview
  useEffect(() => {
    const fetchNumber = async () => {
      if (voucherId && !isDuplicate) {
        setAutoVoucherNum(initialData?.voucher_number || "");
        return;
      }
      if (watchedDate) {
        try {
          const num = await getNextVoucherNumber(watchedDate);
          setAutoVoucherNum(num);
        } catch {
          setAutoVoucherNum("Auto-generated on Save");
        }
      }
    };
    fetchNumber();
  }, [watchedDate, voucherId, isDuplicate, initialData]);

  // Compute live academic year
  const academicYear = useMemo(() => {
    if (!watchedDate) return "2026-27";
    const parts = watchedDate.split("-");
    if (parts.length < 2) return "2026-27";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month)) return "2026-27";
    if (month >= 4) {
      return `${year}-${String(year + 1).slice(-2)}`;
    } else {
      return `${year - 1}-${String(year).slice(-2)}`;
    }
  }, [watchedDate]);

  // Calculate total amount
  const calculatedTotal = useMemo(() => {
    return (watchedItems || []).reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  }, [watchedItems]);

  const schoolNameKn = schoolDetails?.school_name_kn || "ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ";

  // Auto-calculated text previews
  const introPreviewText = useMemo(() => {
    const main = watchedMainContent ? watchedMainContent.trim() : "ಅತಿಥಿ ಶಿಕ್ಷಕರಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ";
    const chequeNum = watchedChequeNum ? watchedChequeNum.trim() : "________";
    const chequeDateStr = watchedChequeDate ? formatDate(watchedChequeDate) : "__.__.____";

    if (watchedMode === "cheque") {
      return `${schoolNameKn} ${academicYear} ನೇ ಸಾಲಿನಲ್ಲಿ ${main} ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ಚೆಕ್ ಸಂಖ್ಯೆ :- ${chequeNum} / ${chequeDateStr} ರ ಮೂಲಕ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
    } else {
      return `${schoolNameKn} ${academicYear} ನೇ ಸಾಲಿನಲ್ಲಿ ${main} ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ನಿಲಯಪಾಲಕರಿಂದ ನಗದಾಗಿ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
    }
  }, [watchedMainContent, watchedMode, watchedChequeNum, watchedChequeDate, schoolNameKn, academicYear]);

  const certPreviewText = useMemo(() => {
    const cert = watchedCertContent ? watchedCertContent.trim() : "ಅತಿಥಿ ಶಿಕ್ಷಕರಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿರುತ್ತಾರೆಂದು";
    return `ದೃಢೀಕರಣ\n${schoolNameKn} ${academicYear} ನೇ ಸಾಲಿನಲ್ಲಿ ${cert} ದೃಢೀಕರಿಸಿದೆ.`;
  }, [watchedCertContent, schoolNameKn, academicYear]);

  // Live item amount calculations for Milling and Labor layouts
  const handleItemCalculation = (index: number) => {
    const items = getValues("items") || [];
    const item = items[index];
    if (!item) return;

    if (watchedLayout === "milling") {
      const qty = Number(item.quantity_kg) || 0;
      const rate = parseFloat(item.rate || "") || 0;
      if (qty > 0 && rate > 0) {
        setValue(`items.${index}.amount`, qty * rate, { shouldDirty: true, shouldValidate: true });
      }
    } else if (watchedLayout === "labor") {
      const qty = parseFloat(item.quantity || "") || 0;
      const rate = parseFloat(item.rate || "") || 0;
      if (qty > 0 && rate > 0) {
        setValue(`items.${index}.amount`, qty * rate, { shouldDirty: true, shouldValidate: true });
      }
    }
  };

  const onSubmit = async (values: HandVoucherFormValues) => {
    setLoading(true);
    try {
      const payload = {
        voucher_date: values.voucher_date,
        payment_mode: values.payment_mode,
        cheque_number: values.payment_mode === "cheque" ? (values.cheque_number ?? null) : null,
        cheque_date: values.payment_mode === "cheque" ? (values.cheque_date ?? null) : null,
        main_content: values.main_content,
        certification_content: values.certification_content,
        table_layout: values.table_layout,
        total_amount: calculatedTotal,
      };

      const result = await upsertHandVoucher(
        voucherId && !isDuplicate ? voucherId : undefined,
        payload,
        values.items as any[]
      );

      if (result.success) {
        toast.success(voucherId && !isDuplicate ? "Hand Voucher updated successfully!" : "Hand Voucher created successfully!");
        
        await logActivity(
          voucherId && !isDuplicate ? "edited" : "generated",
          autoVoucherNum,
          values.main_content.substring(0, 40)
        );

        router.push(`/hand-vouchers/${result.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save hand voucher.");
    } finally {
      setLoading(false);
    }
  };

  // Switch table layout behavior
  const handleLayoutChange = (newLayout: "teacher" | "milling" | "labor" | "gas") => {
    setValue("table_layout", newLayout);
    // Reset columns of items
    const currentItems = watch("items") || [];
    const updated = currentItems.map((item: any, index: number) => ({
      sl_no: index + 1,
      description: item.description || "",
      subject: newLayout === "teacher" ? (item.subject || "") : null,
      month: (newLayout === "teacher" || newLayout === "milling" || newLayout === "labor") ? (item.month || "") : null,
      days: newLayout === "teacher" ? (item.days || "") : null,
      date: (newLayout === "milling" || newLayout === "gas") ? (item.date || "") : null,
      quantity_kg: newLayout === "milling" ? (Number(item.quantity_kg) || "") : null,
      quantity: newLayout === "labor" ? (item.quantity || "") : null,
      rate: (newLayout === "milling" || newLayout === "labor") ? (item.rate || "") : null,
      amount: Number(item.amount) || 0,
      remarks: item.remarks || "",
    }));
    setValue("items", updated);
  };

  const renderMonthYearSelects = (index: number) => {
    const monthVal = watch(`items.${index}.month`) || "";
    const parts = monthVal.trim().split(/\s+/);
    const selectedMonth = parts[0] || "";
    const selectedYear = parts[1] || "";

    const yearOptions = [...YEARS];
    if (selectedYear && !yearOptions.includes(selectedYear)) {
      yearOptions.push(selectedYear);
      yearOptions.sort();
    }

    const d = new Date();
    const currentDefaultYear = d.getFullYear() >= 2026 && d.getFullYear() <= 2030 ? String(d.getFullYear()) : "2026";
    const currentDefaultMonth = KANNADA_MONTHS[d.getMonth()] || "ಜನವರಿ";

    return (
      <div className="flex gap-1 min-w-[150px] items-center">
        <select
          value={selectedMonth}
          onChange={(e) => {
            const newMonth = e.target.value;
            if (!newMonth) {
              setValue(`items.${index}.month`, "");
            } else {
              const yr = selectedYear || currentDefaultYear;
              setValue(`items.${index}.month`, `${newMonth} ${yr}`, { shouldDirty: true, shouldValidate: true });
            }
          }}
          className="h-8 text-[11px] px-1 border border-slate-200 rounded bg-white w-1/2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
        >
          <option value="">ತಿಂಗಳು</option>
          {KANNADA_MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => {
            const newYear = e.target.value;
            if (!newYear) {
              setValue(`items.${index}.month`, "");
            } else {
              const mn = selectedMonth || currentDefaultMonth;
              setValue(`items.${index}.month`, `${mn} ${newYear}`, { shouldDirty: true, shouldValidate: true });
            }
          }}
          className="h-8 text-[11px] px-1 border border-slate-200 rounded bg-white w-1/2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
        >
          <option value="">ವರ್ಷ</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <input type="hidden" {...register(`items.${index}.month` as const)} />
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
        <p className="text-xs font-semibold text-slate-500">Loading hand voucher form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Top action header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/hand-vouchers">
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-md border-slate-200">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {voucherId && !isDuplicate ? "Edit Hand Voucher" : "Create Hand Voucher"}
            </h2>
            <p className="text-xs text-slate-500">
              Voucher Number: <span className="font-bold text-blue-700 font-mono">{autoVoucherNum}</span>
            </p>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 h-9 flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Voucher
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: Basic Details */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="py-4 px-5 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Section 1: Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voucher_date" className="text-xs font-semibold text-slate-600">Voucher Date</Label>
                <Input
                  id="voucher_date"
                  type="date"
                  {...register("voucher_date")}
                  className="mt-1.5 h-9 text-xs"
                />
                {errors.voucher_date && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{String(errors.voucher_date.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="payment_mode" className="text-xs font-semibold text-slate-600">Payment Mode</Label>
                <select
                  id="payment_mode"
                  {...register("payment_mode")}
                  className="mt-1.5 w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {watchedMode === "cheque" && (
                <>
                  <div>
                    <Label htmlFor="cheque_number" className="text-xs font-semibold text-slate-600">Cheque Number</Label>
                    <Input
                      id="cheque_number"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 166972"
                      {...register("cheque_number")}
                      className="mt-1.5 h-9 text-xs"
                    />
                    {errors.cheque_number && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">{String(errors.cheque_number.message)}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cheque_date" className="text-xs font-semibold text-slate-600">Cheque Date</Label>
                    <Input
                      id="cheque_date"
                      type="date"
                      {...register("cheque_date")}
                      className="mt-1.5 h-9 text-xs"
                    />
                    {errors.cheque_date && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">{String(errors.cheque_date.message)}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2 & 3: Kannada Content */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="py-4 px-5 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Section 2 & 3: Main & Certification Content (Kannada)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label htmlFor="main_content" className="text-xs font-semibold text-slate-600">
                  Main Voucher Content (Variable Content Only)
                </Label>
                <textarea
                  id="main_content"
                  rows={2}
                  placeholder="ಅತಿಥಿ ಶಿಕ್ಷಕರಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ  OR  ಸಾಂಬಾರ್ ಪುಡಿ ಮತ್ತು ಖಾರದ ಪುಡಿ ಮಿಲ್ಲಿಂಗ್ ಮಾಡಿಸಿದ ಬಿಲ್ ಬಾಬ್ತು ಹಣವನ್ನು"
                  {...register("main_content")}
                  className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nudi"
                />
                {errors.main_content && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{String(errors.main_content.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="certification_content" className="text-xs font-semibold text-slate-600">
                  Certification Content (Variable Content Only)
                </Label>
                <textarea
                  id="certification_content"
                  rows={2}
                  placeholder="ಅತಿಥಿ ಶಿಕ್ಷಕರಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿರುತ್ತಾರೆಂದು  OR  ಸಾಂಬಾರ್ ಪುಡಿ ಮತ್ತು ಖಾರದ ಪುಡಿ ಮಿಲ್ಲಿಂಗ್ ಮಾಡಿರುತ್ತಾರೆಂದು"
                  {...register("certification_content")}
                  className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nudi"
                />
                {errors.certification_content && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{String(errors.certification_content.message)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Preview Section */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white sticky top-20">
            <CardHeader className="py-4 px-5 border-b border-slate-100 bg-slate-900 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-400" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider">
                  Live Kannada Text Preview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs text-slate-700">
              
              {/* Intro Preview */}
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Introductory Paragraph (ಸಂದಾಯ ವಿವರಣೆ)
                </Label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-md leading-relaxed font-nudi text-[13px]">
                  {introPreviewText}
                </div>
              </div>

              {/* Certification Preview */}
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Certification Paragraph (ದೃಢೀಕರಣ)
                </Label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-md leading-relaxed font-nudi text-[13px] whitespace-pre-line">
                  {certPreviewText}
                </div>
              </div>

              {/* Table Total Preview */}
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Total Row Format (ಒಟ್ಟು ವಿವರಣೆ)
                </Label>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-md font-mono text-[11px] font-bold">
                  {watchedLayout === "teacher" && `ಒಟ್ಟು :- ರೂ.${calculatedTotal}/-`}
                  {watchedLayout === "milling" && `ಒಟ್ಟು : ${calculatedTotal.toFixed(2)}`}
                  {watchedLayout === "labor" && `ಒಟ್ಟು :- ರೂ.${calculatedTotal.toFixed(2)}/-`}
                  {watchedLayout === "gas" && `ಒಟ್ಟು :- ರೂ.${calculatedTotal}/-`}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic bg-amber-50/50 p-2.5 rounded border border-amber-100/50">
                This preview displays the paragraphs dynamically compiled from your inputs. The generated PDF will layout these texts using the exact vector mapping of the system font.
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* SECTION 4: Voucher Table Type & Grid */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden mt-6">
        <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Section 4: Voucher Items Grid
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="table_layout" className="text-xs font-semibold text-slate-600 whitespace-nowrap">Layout Type:</Label>
            <select
              id="table_layout"
              value={watchedLayout}
              onChange={(e) => handleLayoutChange(e.target.value as any)}
              className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="teacher">Guest Teacher</option>
              <option value="milling">Milling & Cleaning</option>
              <option value="labor">Labor / Coolie</option>
              <option value="gas">Gas / Transport</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!isMobile ? (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="min-w-[60px] w-[60px] text-center text-xs font-semibold text-slate-600">Sl. No</TableHead>
                    <TableHead className="min-w-[250px] text-xs font-semibold text-slate-600">Description</TableHead>
                    
                    {watchedLayout === "teacher" && (
                      <>
                        <TableHead className="min-w-[150px] text-xs font-semibold text-slate-600">Subject</TableHead>
                        <TableHead className="min-w-[180px] text-xs font-semibold text-slate-600">Month</TableHead>
                        <TableHead className="min-w-[100px] text-xs font-semibold text-slate-600">Days</TableHead>
                      </>
                    )}

                    {watchedLayout === "milling" && (
                      <>
                        <TableHead className="min-w-[180px] text-xs font-semibold text-slate-600">Month</TableHead>
                        <TableHead className="min-w-[130px] text-xs font-semibold text-slate-600">Date</TableHead>
                        <TableHead className="min-w-[100px] text-xs font-semibold text-slate-600">Qty (Kg)</TableHead>
                        <TableHead className="min-w-[100px] text-xs font-semibold text-slate-600">Rate</TableHead>
                      </>
                    )}

                    {watchedLayout === "labor" && (
                      <>
                        <TableHead className="min-w-[180px] text-xs font-semibold text-slate-600">Month</TableHead>
                        <TableHead className="min-w-[120px] text-xs font-semibold text-slate-600">Qty/People</TableHead>
                        <TableHead className="min-w-[100px] text-xs font-semibold text-slate-600">Rate</TableHead>
                      </>
                    )}

                    {watchedLayout === "gas" && (
                      <>
                        <TableHead className="min-w-[130px] text-xs font-semibold text-slate-600">Date</TableHead>
                      </>
                    )}

                    <TableHead className="min-w-[120px] text-right text-xs font-semibold text-slate-600">Amount (₹)</TableHead>
                    
                    {(watchedLayout === "teacher" || watchedLayout === "labor" || watchedLayout === "gas") && (
                      <TableHead className="min-w-[150px] text-xs font-semibold text-slate-600">Remarks</TableHead>
                    )}

                    <TableHead className="min-w-[50px] w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="hover:bg-slate-50">
                      <TableCell className="text-center font-mono text-xs text-slate-700">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.description` as const)}
                          placeholder={
                            watchedLayout === "teacher" ? "ಅತಿಥಿ ಶಿಕ್ಷಕರ ಗೌರವ ಧನ" :
                            watchedLayout === "milling" ? "ರಾಗಿ ಮತ್ತು ಗೋಧಿ ಕ್ಲೀನಿಂಗ್ ಮತ್ತು ಮಿಲ್ಲಿಂಗ್" :
                            watchedLayout === "labor" ? "ನೀರಿನ ಸಂಪ್ ಶುಚಿಗೊಳಿಸಿದ ಕೂಲಿ" : "ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ಸಾಗಣೆ ವೆಚ್ಚ"
                          }
                          className="h-8 text-xs font-nudi"
                        />
                      </TableCell>

                      {/* Layout specific fields */}
                      {watchedLayout === "teacher" && (
                        <>
                          <TableCell>
                            <Input
                              {...register(`items.${index}.subject` as const)}
                              placeholder="ಕನ್ನಡ, ವಿಜ್ಞಾನ"
                              className="h-8 text-xs font-nudi"
                            />
                          </TableCell>
                          <TableCell>
                            {renderMonthYearSelects(index)}
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`items.${index}.days` as const)}
                              placeholder="31 ದಿನಗಳು"
                              className="h-8 text-xs font-nudi"
                            />
                          </TableCell>
                        </>
                      )}

                      {watchedLayout === "milling" && (
                        <>
                          <TableCell>
                            {renderMonthYearSelects(index)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              {...register(`items.${index}.date` as const)}
                              className="h-8 text-xs p-1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="any"
                              {...register(`items.${index}.quantity_kg` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="Kg"
                              className="h-8 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              {...register(`items.${index}.rate` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="Rate"
                              className="h-8 text-xs"
                            />
                          </TableCell>
                        </>
                      )}

                      {watchedLayout === "labor" && (
                        <>
                          <TableCell>
                            {renderMonthYearSelects(index)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              {...register(`items.${index}.quantity` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="5 ಜನ, 1"
                              className="h-8 text-xs font-nudi"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              {...register(`items.${index}.rate` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="500/-"
                              className="h-8 text-xs font-nudi"
                            />
                          </TableCell>
                        </>
                      )}

                      {watchedLayout === "gas" && (
                        <>
                          <TableCell>
                            <Input
                              type="date"
                              {...register(`items.${index}.date` as const)}
                              className="h-8 text-xs p-1"
                            />
                          </TableCell>
                        </>
                      )}

                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          {...register(`items.${index}.amount` as const)}
                          className="h-8 text-xs font-bold text-right"
                        />
                      </TableCell>

                      {(watchedLayout === "teacher" || watchedLayout === "labor" || watchedLayout === "gas") && (
                        <TableCell>
                          <Input
                            {...register(`items.${index}.remarks` as const)}
                            placeholder="ಷರಾ"
                            className="h-8 text-xs font-nudi"
                          />
                        </TableCell>
                      )}

                      <TableCell className="text-center">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Mobile Card List View */
            <div className="p-4 space-y-4 border-b border-slate-100">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3 relative">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-600">Item #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 h-7 px-2 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <Label className="text-[10px] font-semibold text-slate-500">Description / Particulars</Label>
                      <Input
                        {...register(`items.${index}.description` as const)}
                        placeholder={
                          watchedLayout === "teacher" ? "ಅತಿಥಿ ಶಿಕ್ಷಕರ ಗೌರವ ಧನ" :
                          watchedLayout === "milling" ? "ರಾಗಿ ಮತ್ತು ಗೋಧಿ ಕ್ಲೀನಿಂಗ್ ಮತ್ತು ಮಿಲ್ಲಿಂಗ್" :
                          watchedLayout === "labor" ? "ನೀರಿನ ಸಂಪ್ ಶುಚಿಗೊಳಿಸಿದ ಕೂಲಿ" : "ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ಸಾಗಣೆ ವೆಚ್ಚ"
                        }
                        className="h-9 text-xs font-nudi mt-1 bg-white"
                      />
                    </div>

                    {/* Layout specific fields */}
                    {watchedLayout === "teacher" && (
                      <div className="grid grid-cols-1 gap-2.5">
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Subject</Label>
                          <Input
                            {...register(`items.${index}.subject` as const)}
                            placeholder="ಕನ್ನಡ, ವಿಜ್ಞಾನ"
                            className="h-9 text-xs font-nudi mt-1 bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Month</Label>
                          <div className="mt-1">
                            {renderMonthYearSelects(index)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Days</Label>
                          <Input
                            {...register(`items.${index}.days` as const)}
                            placeholder="31 ದಿನಗಳು"
                            className="h-9 text-xs font-nudi mt-1 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {watchedLayout === "milling" && (
                      <div className="grid grid-cols-1 gap-2.5">
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Month</Label>
                          <div className="mt-1">
                            {renderMonthYearSelects(index)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Date</Label>
                          <Input
                            type="date"
                            {...register(`items.${index}.date` as const)}
                            className="h-9 text-xs mt-1 bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-[10px] font-semibold text-slate-500">Qty (Kg)</Label>
                            <Input
                              type="number"
                              step="any"
                              {...register(`items.${index}.quantity_kg` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="Kg"
                              className="h-9 text-xs mt-1 bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-semibold text-slate-500">Rate</Label>
                            <Input
                              type="text"
                              {...register(`items.${index}.rate` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="Rate"
                              className="h-9 text-xs mt-1 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {watchedLayout === "labor" && (
                      <div className="grid grid-cols-1 gap-2.5">
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Month</Label>
                          <div className="mt-1">
                            {renderMonthYearSelects(index)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-[10px] font-semibold text-slate-500">Qty/People</Label>
                            <Input
                              type="text"
                              {...register(`items.${index}.quantity` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="5 ಜನ, 1"
                              className="h-9 text-xs font-nudi mt-1 bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-semibold text-slate-500">Rate</Label>
                            <Input
                              type="text"
                              {...register(`items.${index}.rate` as const, {
                                onChange: () => handleItemCalculation(index)
                              })}
                              placeholder="500/-"
                              className="h-9 text-xs font-nudi mt-1 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {watchedLayout === "gas" && (
                      <div>
                        <Label className="text-[10px] font-semibold text-slate-500">Date</Label>
                        <Input
                          type="date"
                          {...register(`items.${index}.date` as const)}
                          className="h-9 text-xs mt-1 bg-white"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <Label className="text-[10px] font-semibold text-slate-500">Amount (₹)</Label>
                        <Input
                          type="number"
                          step="any"
                          {...register(`items.${index}.amount` as const)}
                          className="h-9 text-xs font-bold mt-1 bg-white"
                        />
                      </div>
                      {(watchedLayout === "teacher" || watchedLayout === "labor" || watchedLayout === "gas") && (
                        <div>
                          <Label className="text-[10px] font-semibold text-slate-500">Remarks</Label>
                          <Input
                            {...register(`items.${index}.remarks` as const)}
                            placeholder="ಷರಾ"
                            className="h-9 text-xs font-nudi mt-1 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid actions & aggregates */}
          <div className="p-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 bg-slate-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ sl_no: fields.length + 1, description: "", subject: "", month: "", days: "", date: "", quantity_kg: "", quantity: "", rate: "", amount: 0, remarks: "" })}
              className="text-xs font-bold border-slate-200 hover:bg-slate-100 text-slate-700 h-8 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
            </Button>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Gross Total Amount:</span>
              <span className="text-sm font-black text-slate-800">
                ₹{calculatedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
