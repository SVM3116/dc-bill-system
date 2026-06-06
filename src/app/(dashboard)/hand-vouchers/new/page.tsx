import React from "react";
import { HandVoucherForm } from "@/components/hand-voucher-form";
import { createClient } from "@/lib/supabase-server";
import { getVoucherTemplateById } from "@/app/actions/voucher-template-actions";

interface NewVoucherPageProps {
  searchParams: Promise<{
    duplicateFrom?: string;
    templateId?: string;
  }>;
}

export default async function NewVoucherPage({ searchParams }: NewVoucherPageProps) {
  const resolvedSearchParams = await searchParams;
  const duplicateFrom = resolvedSearchParams.duplicateFrom;
  const templateId = resolvedSearchParams.templateId;

  let initialData = null;
  
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
        initialData = {
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
  } else if (templateId) {
    try {
      const template = await getVoucherTemplateById(templateId);
      if (template) {
        initialData = {
          payment_mode: template.payment_mode,
          main_content: template.main_content,
          certification_content: template.certification_content,
          table_layout: template.table_layout,
          hand_voucher_items: template.items || [],
        };
      }
    } catch (err) {
      console.error("Failed to load voucher template:", err);
    }
  }

  return (
    <div className="space-y-6">
      <HandVoucherForm
        initialData={initialData}
        isDuplicate={!!duplicateFrom}
      />
    </div>
  );
}

