"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAlertStatus(id: string, status: "OPEN" | "RESOLVED" | string) {
  const updated = await prisma.alert.update({
    where: { id },
    data: { status: status.toUpperCase() },
    include: { school: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/school/alerts");
  return updated;
}

export async function acknowledgeAlert(id: string, status: string = "RESOLVED") {
  return updateAlertStatus(id, status);
}
