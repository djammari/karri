import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { authSecret } from "@/lib/env";

const COOKIE = "ostodvandi_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  return authSecret();
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function clinicCredentials() {
  return {
    username: process.env.CLINIC_USERNAME || "klinik",
    password: process.env.CLINIC_PASSWORD || "klinik",
  };
}

export function verifyCredentials(username: string, password: string) {
  const expected = clinicCredentials();
  return (
    safeEqual(username, expected.username) &&
    safeEqual(password, expected.password)
  );
}

export function createSessionValue(username: string) {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${username}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(value: string | undefined) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length < 3) return null;
  const sig = parts.pop()!;
  const exp = parts.pop()!;
  const username = parts.join(".");
  const payload = `${username}.${exp}`;
  if (!safeEqual(sign(payload), sig)) return null;
  if (Number(exp) < Date.now()) return null;
  return { username };
}

export async function getSession() {
  const jar = await cookies();
  return readSessionValue(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(username: string) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionValue(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export { COOKIE as SESSION_COOKIE };
