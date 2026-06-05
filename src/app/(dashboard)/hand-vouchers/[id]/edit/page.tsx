import React from "react";
import { HandVoucherForm } from "@/components/hand-voucher-form";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface EditVoucherPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVoucherPage({ params }: EditVoucherPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { data: voucher } = await supabase
    .from("hand_vouchers")
    .select("*, hand_voucher_items(*)")
    .eq("id", id)
    .eq("school_id", user.id)
    .single();

  if (!voucher) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Voucher not found or access denied.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HandVoucherForm
        voucherId={voucher.id}
        initialData={voucher}
        isDuplicate={false}
      />
    </div>
  );
}
