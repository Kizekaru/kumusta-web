"use server";

export async function completeOnboarding(role?: string, schoolId?: string | null) {
  return {
    success: true,
    redirectUrl: "/dashboard",
  };
}
