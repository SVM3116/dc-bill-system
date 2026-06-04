"use server";

import { createClient } from "@/lib/supabase-server";

/**
 * Logs a dashboard action into the recent_activity database table.
 * Fails silently if the table has not been created yet by the user.
 */
export async function logActivity(
  actionType: "generated" | "edited" | "downloaded" | "duplicated",
  billNumber: string,
  payeeName: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userName = user.user_metadata?.full_name || "Admin User";

    const { error } = await supabase.from("recent_activity").insert({
      school_id: user.id,
      action_type: actionType,
      bill_number: billNumber,
      payee_name: payeeName,
      user_name: userName,
    });

    if (error) {
      console.warn("Could not write recent_activity (table may not exist):", error.message);
    }
  } catch (err) {
    // Gracefully handle error if database table does not exist yet
    console.warn("Gracefully ignored recent_activity log error:", err);
  }
}
