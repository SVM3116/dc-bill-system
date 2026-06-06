"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateSchoolProfile(values: {
  schoolNameKn: string;
  schoolAddressKn: string;
  maintenanceAccountNumber: string;
  salaryAccountNumber: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized: Please log in first.");
  }

  const { error } = await supabase
    .from("schools")
    .update({
      school_name_kn: values.schoolNameKn,
      school_address_kn: values.schoolAddressKn,
      maintenance_account_number: values.maintenanceAccountNumber,
      salary_account_number: values.salaryAccountNumber,
      school_profile_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error("Failed to update school profile: " + error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/school-setup");
  return { success: true };
}
