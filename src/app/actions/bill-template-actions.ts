"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function saveAsBillTemplate(billId: string, templateName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized: Please log in to save templates.");
  }

  // Fetch the bill and its deductions
  const { data: bill, error: fetchError } = await supabase
    .from("dc_bills")
    .select("*, dc_bill_deductions(*)")
    .eq("id", billId)
    .eq("school_id", user.id)
    .single();

  if (fetchError || !bill) {
    throw new Error("Failed to fetch bill: " + (fetchError?.message || "Not found"));
  }

  // Map items to exclude bill_date
  const items = (bill.items || []).map((item: any) => {
    const { bill_date, ...rest } = item;
    return {
      ...rest,
      bill_date: "", // exclude/empty bill date
    };
  });

  // Map deductions
  const deductions = (bill.dc_bill_deductions || []).map((ded: any) => ({
    deduction_type: ded.deduction_type,
    deduction_mode: ded.deduction_mode,
    deduction_value: Number(ded.deduction_value) || 0,
    deduction_amount: Number(ded.deduction_amount) || 0,
  }));

  // Insert template
  const { error: insertError } = await supabase
    .from("bill_templates")
    .insert([
      {
        school_id: user.id,
        name: templateName,
        payee_name: bill.payee_name,
        payee_address: bill.payee_address || "",
        account_type: bill.account_type,
        items,
        deductions,
      },
    ]);

  if (insertError) {
    throw new Error("Failed to save template: " + insertError.message);
  }

  revalidatePath("/bills/templates");
  return { success: true };
}

export async function getBillTemplates() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data: templates, error } = await supabase
    .from("bill_templates")
    .select("*")
    .eq("school_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch bill templates:", error);
    return [];
  }

  return templates || [];
}

export async function getBillTemplateById(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: template, error } = await supabase
    .from("bill_templates")
    .select("*")
    .eq("id", templateId)
    .eq("school_id", user.id)
    .single();

  if (error || !template) {
    throw new Error("Template not found: " + (error?.message || ""));
  }

  return template;
}

export async function deleteBillTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("bill_templates")
    .delete()
    .eq("id", templateId)
    .eq("school_id", user.id);

  if (error) {
    throw new Error("Failed to delete template: " + error.message);
  }

  revalidatePath("/bills/templates");
  return { success: true };
}
