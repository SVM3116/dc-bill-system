import React from "react";
import { HandVoucherForm } from "@/components/hand-voucher-form";
import { createClient } from "@/lib/supabase-server";

interface NewVoucherPageProps {
  searchParams: Promise<{
    duplicateFrom?: string;
  }>;
}

export default async function NewVoucherPage({ searchParams }: NewVoucherPageProps) {
  const resolvedSearchParams = await searchParams;
  const duplicateFrom = resolvedSearchParams.duplicateFrom;

  let duplicateData = null;
  if (duplicateFrom) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("hand_vouchers")
        .select("*, hand_voucher_items(*)")
        .eq("id", duplicateFrom)
        .eq("school_id", user.id)
        .single();

      if (data) {
        duplicateData = {
          payment_mode: data.payment_mode,
          cheque_number: data.cheque_number,
          cheque_date: data.cheque_date,
          main_content: data.main_content,
          certification_content: data.certification_content,
          table_layout: data.table_layout,
          hand_voucher_items: data.hand_voucher_items || [],
        };
      }
    }
  }

  return (
    <div className="space-y-6">
      <HandVoucherForm
        initialData={duplicateData}
        isDuplicate={!!duplicateFrom}
      />
    </div>
  );
}
