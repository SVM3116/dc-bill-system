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
