import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getSelectedFinancialYear } from "@/lib/financial-year";
import { DashboardClient } from "@/components/dashboard-client";

export const revalidate = 0; // Fresh metrics fetches on reload

export default async function DashboardPage() {
  const supabase = await createClient();
  const financialYear = await getSelectedFinancialYear();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // 1. Query all DC Bills for this school in the selected Financial Year
  const { data: bills, error: billsErr } = await supabase
    .from("dc_bills")
    .select("id, dc_bill_number, cheque_number, cheque_date, payee_name, amount, net_payable_amount, status, account_type, created_at")
    .eq("school_id", user.id)
    .ilike("dc_bill_number", `%${financialYear}`)
    .order("created_at", { ascending: false });

  if (billsErr) {
    console.error("Dashboard failed to fetch bills:", billsErr);
  }

  // 2. Query school details for welcoming message
  const { data: school } = await supabase
    .from("schools")
    .select("principal_name")
    .eq("id", user.id)
    .single();

  return (
    <DashboardClient
      bills={bills || []}
      principalName={school?.principal_name || "Principal"}
      financialYear={financialYear}
    />
  );
}
