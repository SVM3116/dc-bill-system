"use server";

import { createClient } from "@/lib/supabase-server";

interface DocumentItem {
  id: string;
  number: string;
  type: "dc_bill" | "hand_voucher";
}

export async function getBulkDownloadDocumentIds(
  fromDate: string,
  toDate: string,
  accountType: "maintenance" | "salary" | "all",
  downloadType: "dc_bills" | "hand_vouchers" | "combined"
): Promise<{ success: boolean; documents: DocumentItem[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, documents: [], error: "Unauthorized: Please log in." };
    }

    const documents: DocumentItem[] = [];

    // 1. Fetch DC Bills
    if (downloadType === "dc_bills" || downloadType === "combined") {
      let query = supabase
        .from("dc_bills")
        .select("id, dc_bill_number")
        .eq("school_id", user.id)
        .eq("status", "generated");

      if (accountType === "maintenance") {
        query = query.eq("account_type", "maintenance");
      } else if (accountType === "salary") {
        query = query.eq("account_type", "salary");
      }

      if (fromDate) {
        query = query.gte("cheque_date", fromDate);
      }
      if (toDate) {
        query = query.lte("cheque_date", toDate);
      }

      const { data: bills, error: billsErr } = await query;
      if (billsErr) {
        console.error("Error querying DC Bills for bulk download:", billsErr);
        return { success: false, documents: [], error: "Failed to query DC Bills: " + billsErr.message };
      }

      if (bills) {
        bills.forEach((b) => {
          documents.push({
            id: b.id,
            number: b.dc_bill_number,
            type: "dc_bill",
          });
        });
      }
    }

    // 2. Fetch Hand Vouchers
    if (downloadType === "hand_vouchers" || downloadType === "combined") {
      let query = supabase
        .from("hand_vouchers")
        .select("id, voucher_number, table_layout")
        .eq("school_id", user.id);

      if (fromDate) {
        query = query.gte("voucher_date", fromDate);
      }
      if (toDate) {
        query = query.lte("voucher_date", toDate);
      }

      // Filter Hand Vouchers based on Account Type using logical heuristic:
      // - 'salary': only table_layout = 'teacher' (teacher salary)
      // - 'maintenance': table_layout != 'teacher' (general maintenance/office expenses)
      // - 'all': no table_layout filter
      if (accountType === "salary") {
        query = query.eq("table_layout", "teacher");
      } else if (accountType === "maintenance") {
        query = query.neq("table_layout", "teacher");
      }

      const { data: vouchers, error: vouchersErr } = await query;
      if (vouchersErr) {
        console.error("Error querying Hand Vouchers for bulk download:", vouchersErr);
        return { success: false, documents: [], error: "Failed to query Hand Vouchers: " + vouchersErr.message };
      }

      if (vouchers) {
        vouchers.forEach((v) => {
          documents.push({
            id: v.id,
            number: v.voucher_number,
            type: "hand_voucher",
          });
        });
      }
    }

    return { success: true, documents };
  } catch (err: any) {
    console.error("Bulk download server error:", err);
    return { success: false, documents: [], error: err.message || "An unexpected error occurred." };
  }
}
