"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// Helper: timezone-independent parsing of YYYY-MM-DD
function parseDateParts(dateStr: string) {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12
  const day = parseInt(parts[2], 10);
  return { year, month, day };
}

// Helper: Calculate Indian Financial Year (starts Apr 1st)
function getFinancialYearForDate(dateStr: string): string {
  const { year, month } = parseDateParts(dateStr);
  if (month >= 4) {
    const nextYearShort = String(year + 1).slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    const prevYear = year - 1;
    const currentYearShort = String(year).slice(-2);
    return `${prevYear}-${currentYearShort}`;
  }
}

// Helper: Get 3-letter Month Abbreviation (e.g. "JAN")
function getMonthAbbr(dateStr: string): string {
  const { month } = parseDateParts(dateStr);
  const MONTH_ABBRS = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  return MONTH_ABBRS[month - 1];
}

// Internal generation logic to avoid duplication
async function generateNextVoucherNumberInternal(supabase: any, schoolId: string, dateStr: string): Promise<string> {
  const finYear = getFinancialYearForDate(dateStr);
  const monthAbbr = getMonthAbbr(dateStr);
  const prefix = `${finYear}/HV/${monthAbbr}-`;

  const { data, error } = await supabase
    .from("hand_vouchers")
    .select("voucher_number")
    .eq("school_id", schoolId)
    .like("voucher_number", `${prefix}%`);

  if (error) {
    console.error("Error generating voucher number:", error);
    throw new Error("Could not determine next voucher number");
  }

  let maxSeq = 0;
  if (data && data.length > 0) {
    for (const row of data) {
      const parts = row.voucher_number.split("-");
      const lastPart = parts[parts.length - 1];
      const seq = parseInt(lastPart, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(2, "0")}`;
}

export async function getNextVoucherNumber(dateStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return await generateNextVoucherNumberInternal(supabase, user.id, dateStr);
}

export async function deleteHandVoucher(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("hand_vouchers")
    .delete()
    .eq("id", id)
    .eq("school_id", user.id);

  if (error) {
    console.error("Failed to delete hand voucher:", error);
    throw new Error(error.message);
  }

  revalidatePath("/hand-vouchers");
  revalidatePath("/dashboard");
}

export async function duplicateHandVoucher(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch source voucher
  const { data: voucher, error: vError } = await supabase
    .from("hand_vouchers")
    .select("*, hand_voucher_items(*)")
    .eq("id", id)
    .eq("school_id", user.id)
    .single();

  if (vError || !voucher) {
    throw new Error("Voucher not found or access denied");
  }

  // 2. Generate new voucher number for today
  const todayStr = new Date().toISOString().split("T")[0];
  const newVoucherNumber = await generateNextVoucherNumberInternal(supabase, user.id, todayStr);

  // 3. Insert new voucher
  const { data: newVoucher, error: insError } = await supabase
    .from("hand_vouchers")
    .insert([{
      school_id: user.id,
      voucher_number: newVoucherNumber,
      voucher_date: todayStr,
      payment_mode: voucher.payment_mode,
      cheque_number: voucher.cheque_number,
      cheque_date: voucher.cheque_date,
      main_content: voucher.main_content,
      certification_content: voucher.certification_content,
      table_layout: voucher.table_layout,
      total_amount: voucher.total_amount
    }])
    .select("id")
    .single();

  if (insError || !newVoucher) {
    console.error("Duplication failed:", insError);
    throw new Error("Failed to insert duplicated voucher: " + insError?.message);
  }

  // 4. Copy items
  const sourceItems = voucher.hand_voucher_items || [];
  if (sourceItems.length > 0) {
    const itemsToInsert = sourceItems.map((item: any) => ({
      voucher_id: newVoucher.id,
      sl_no: item.sl_no,
      description: item.description,
      subject: item.subject,
      month: item.month,
      days: item.days,
      date: item.date,
      quantity_kg: item.quantity_kg,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      remarks: item.remarks
    }));

    const { error: itemsError } = await supabase
      .from("hand_voucher_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Duplication items insert failed:", itemsError);
      throw new Error("Failed to copy items for duplicated voucher");
    }
  }

  revalidatePath("/hand-vouchers");
  revalidatePath("/dashboard");
  return { success: true, id: newVoucher.id };
}

export async function upsertHandVoucher(
  voucherId: string | undefined,
  voucherData: {
    voucher_date: string;
    payment_mode: "cheque" | "cash";
    cheque_number: string | null;
    cheque_date: string | null;
    main_content: string;
    certification_content: string;
    table_layout: "teacher" | "milling" | "labor" | "gas";
    total_amount: number;
  },
  items: {
    sl_no: number;
    description: string;
    subject?: string | null;
    month?: string | null;
    days?: string | null;
    date?: string | null;
    quantity_kg?: number | null;
    quantity?: string | null;
    rate?: string | null;
    amount: number;
    remarks?: string | null;
  }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  let finalVoucherNumber = "";

  if (!voucherId) {
    // Generate new number
    finalVoucherNumber = await generateNextVoucherNumberInternal(supabase, user.id, voucherData.voucher_date);
  } else {
    // Check if month/year changed to regenerate number
    const { data: existing, error: fetchErr } = await supabase
      .from("hand_vouchers")
      .select("voucher_date, voucher_number")
      .eq("id", voucherId)
      .eq("school_id", user.id)
      .single();

    if (fetchErr || !existing) {
      throw new Error("Voucher not found or access denied");
    }

    const oldFinYear = getFinancialYearForDate(existing.voucher_date);
    const oldMonth = getMonthAbbr(existing.voucher_date);
    const newFinYear = getFinancialYearForDate(voucherData.voucher_date);
    const newMonth = getMonthAbbr(voucherData.voucher_date);

    if (oldFinYear !== newFinYear || oldMonth !== newMonth) {
      finalVoucherNumber = await generateNextVoucherNumberInternal(supabase, user.id, voucherData.voucher_date);
    } else {
      finalVoucherNumber = existing.voucher_number;
    }
  }

  const dbPayload = {
    school_id: user.id,
    voucher_number: finalVoucherNumber,
    voucher_date: voucherData.voucher_date,
    payment_mode: voucherData.payment_mode,
    cheque_number: voucherData.payment_mode === "cheque" ? voucherData.cheque_number : null,
    cheque_date: voucherData.payment_mode === "cheque" ? voucherData.cheque_date : null,
    main_content: voucherData.main_content,
    certification_content: voucherData.certification_content,
    table_layout: voucherData.table_layout,
    total_amount: voucherData.total_amount,
    updated_at: new Date().toISOString()
  };

  let returnedId = voucherId;

  if (voucherId) {
    const { error: updError } = await supabase
      .from("hand_vouchers")
      .update(dbPayload)
      .eq("id", voucherId)
      .eq("school_id", user.id);

    if (updError) {
      console.error("Failed to update voucher:", updError);
      throw new Error(updError.message);
    }
  } else {
    const { data, error: insError } = await supabase
      .from("hand_vouchers")
      .insert([dbPayload])
      .select("id")
      .single();

    if (insError) {
      console.error("Failed to insert voucher:", insError);
      throw new Error(insError.message);
    }
    if (data) {
      returnedId = data.id;
    }
  }

  if (!returnedId) {
    throw new Error("Voucher ID could not be generated");
  }

  // Delete old items
  const { error: delError } = await supabase
    .from("hand_voucher_items")
    .delete()
    .eq("voucher_id", returnedId);

  if (delError) {
    console.error("Failed to clear old voucher items:", delError);
    throw new Error("Failed to sync items: " + delError.message);
  }

  // Insert new items
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      voucher_id: returnedId,
      sl_no: item.sl_no,
      description: item.description,
      subject: item.subject || null,
      month: item.month || null,
      days: item.days || null,
      date: item.date || null,
      quantity_kg: item.quantity_kg !== undefined ? item.quantity_kg : null,
      quantity: item.quantity || null,
      rate: item.rate || null,
      amount: item.amount,
      remarks: item.remarks || null
    }));

    const { error: insItemsError } = await supabase
      .from("hand_voucher_items")
      .insert(itemsToInsert);

    if (insItemsError) {
      console.error("Failed to insert voucher items:", insItemsError);
      throw new Error("Failed to save voucher items: " + insItemsError.message);
    }
  }

  revalidatePath("/hand-vouchers");
  revalidatePath(`/hand-vouchers/${returnedId}`);
  revalidatePath("/dashboard");

  return { success: true, id: returnedId };
}
