"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function getPayees() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: Please log in.", payees: [] };
  }

  const { data, error } = await supabase
    .from("payees")
    .select("*")
    .eq("school_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch payees:", error);
    return { success: false, error: error.message, payees: [] };
  }

  return { success: true, payees: data || [] };
}

export async function savePayeeIfNew(name: string, address: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: Please log in." };
  }

  const trimmedName = name.trim();
  const trimmedAddress = address.trim();

  if (!trimmedName || !trimmedAddress) {
    return { success: false, error: "Name and address cannot be empty." };
  }

  // Check if payee name already exists for this school (case-insensitive check)
  const { data: existing, error: findError } = await supabase
    .from("payees")
    .select("id")
    .eq("school_id", user.id)
    .ilike("name", trimmedName)
    .limit(1);

  if (findError) {
    console.error("Failed to search payee:", findError);
    return { success: false, error: findError.message };
  }

  if (existing && existing.length > 0) {
    // Already exists, do nothing
    return { success: true, message: "Payee already exists." };
  }

  // Insert new payee
  const { error: insertError } = await supabase
    .from("payees")
    .insert([
      {
        school_id: user.id,
        name: trimmedName,
        address: trimmedAddress,
      }
    ]);

  if (insertError) {
    console.error("Failed to insert payee:", insertError);
    return { success: false, error: insertError.message };
  }

  revalidatePath("/bills");
  revalidatePath("/hand-vouchers");

  return { success: true, message: "New payee saved successfully." };
}
