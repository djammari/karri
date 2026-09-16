"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  setSessionCookie,
  verifyCredentials,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/yfirlit");
  if (!verifyCredentials(username, password)) {
    redirect(
      `/innskraning?error=1&next=${encodeURIComponent(next.startsWith("/") ? next : "/yfirlit")}`,
    );
  }
  await setSessionCookie(username);
  redirect(next.startsWith("/") ? next : "/yfirlit");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/innskraning");
}
