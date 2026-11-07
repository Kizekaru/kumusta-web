"use server";

import { revalidatePath } from "next/cache";

export async function updateRequestStatus(id: string, status: string, notes: string) {
  revalidatePath("/dashboard");
  return { success: true };
}
