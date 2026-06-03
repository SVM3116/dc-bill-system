"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteBill(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dc_bills")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete bill:", error);
    throw new Error(error.message);
  }

  // Refresh caching paths
  revalidatePath("/bills");
  revalidatePath("/dashboard");
  
  // Return redirect behavior
  redirect("/bills");
}

export async function upsertBill(
  billId: string | undefined,
  billData: {
    dc_bill_number: string;
    cheque_number: string;
    cheque_date: string | null;
    payee_name: string;
    payee_address: string;
    amount: number;
    amount_in_words: string;
    items: any[];
    status: "draft" | "generated";
    gross_amount: number;
    total_deductions: number;
    net_payable_amount: number;
  },
  deductions: {
    deduction_type: string;
    deduction_mode: "percentage" | "fixed";
    deduction_value: number;
    deduction_amount: number;
  }[]
) {
  const supabase = await createClient();

  // Retrieve user session on the server (very secure and robust)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Please log in to perform this action.");
  }

  const dbPayload = {
    ...billData,
    created_by: user.id,
    updated_at: new Date().toISOString(),
  };

  let returnedId = billId;
  let responseError = null;

  if (billId) {
    // Update existing
    const { error } = await supabase
      .from("dc_bills")
      .update(dbPayload)
      .eq("id", billId);
    responseError = error;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("dc_bills")
      .insert([dbPayload])
      .select("id")
      .single();
    
    responseError = error;
    if (data) {
      returnedId = data.id;
    }
  }

  if (responseError) {
    console.error("Database upsert failed:", responseError);
    throw new Error(responseError.message);
  }

  if (!returnedId) {
    throw new Error("Failed to retrieve or generate Bill ID.");
  }

  // Handle deductions saving on the server
  // 1. Delete existing deductions for this bill
  const { error: deleteError } = await supabase
    .from("dc_bill_deductions")
    .delete()
    .eq("bill_id", returnedId);

  if (deleteError) {
    console.error("Failed to delete old deductions:", deleteError);
    throw new Error("Failed to clean up old deductions: " + deleteError.message);
  }

  // 2. Insert new deductions if any
  if (deductions.length > 0) {
    const deductionsToInsert = deductions.map((ded) => ({
      bill_id: returnedId,
      deduction_type: ded.deduction_type,
      deduction_mode: ded.deduction_mode,
      deduction_value: Number(ded.deduction_value) || 0,
      deduction_amount: Number(ded.deduction_amount) || 0,
    }));

    const { error: insertError } = await supabase
      .from("dc_bill_deductions")
      .insert(deductionsToInsert);

    if (insertError) {
      console.error("Failed to insert new deductions:", insertError);
      throw new Error("Failed to save deductions: " + insertError.message);
    }
  }

  // Revalidate lists & details paths
  revalidatePath("/bills");
  revalidatePath(`/bills/${returnedId}`);
  revalidatePath("/dashboard");

  return { success: true, id: returnedId };
}
