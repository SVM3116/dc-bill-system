"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function saveAsVoucherTemplate(voucherId: string, templateName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized: Please log in to save templates.");
  }

  // Fetch the hand voucher and its items
  const { data: voucher, error: fetchError } = await supabase
    .from("hand_vouchers")
    .select("*, hand_voucher_items(*)")
    .eq("id", voucherId)
    .eq("school_id", user.id)
    .single();

  if (fetchError || !voucher) {
    throw new Error("Failed to fetch voucher: " + (fetchError?.message || "Not found"));
  }

  // Map items to preserve layout details but strip database identifiers
  const items = (voucher.hand_voucher_items || []).map((item: any) => ({
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
    remarks: item.remarks || null,
  }));

  // Insert template
  const { error: insertError } = await supabase
    .from("voucher_templates")
    .insert([
      {
        school_id: user.id,
        name: templateName,
        table_layout: voucher.table_layout,
        payment_mode: voucher.payment_mode,
        main_content: voucher.main_content,
        certification_content: voucher.certification_content,
        items,
      },
    ]);

  if (insertError) {
    throw new Error("Failed to save voucher template: " + insertError.message);
  }

  revalidatePath("/hand-vouchers/templates");
  return { success: true };
}

export async function getVoucherTemplates(layoutFilter?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  let query = supabase
    .from("voucher_templates")
    .select("*")
    .eq("school_id", user.id);

  if (layoutFilter) {
    query = query.eq("table_layout", layoutFilter);
  }

  const { data: templates, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch voucher templates:", error);
    return [];
  }

  return templates || [];
}

export async function getVoucherTemplateById(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: template, error } = await supabase
    .from("voucher_templates")
    .select("*")
    .eq("id", templateId)
    .eq("school_id", user.id)
    .single();

  if (error || !template) {
    throw new Error("Template not found: " + (error?.message || ""));
  }

  return template;
}

export async function deleteVoucherTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("voucher_templates")
    .delete()
    .eq("id", templateId)
    .eq("school_id", user.id);

  if (error) {
    throw new Error("Failed to delete template: " + error.message);
  }

  revalidatePath("/hand-vouchers/templates");
  return { success: true };
}
