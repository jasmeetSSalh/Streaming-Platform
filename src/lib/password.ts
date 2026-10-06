import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, storedKey] = storedHash.split(":");
  if (!salt || !storedKey) return false;
  const actualKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const expectedKey = Buffer.from(storedKey, "hex");
  return expectedKey.length === actualKey.length && timingSafeEqual(expectedKey, actualKey);
}

export function validateRegistration(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const rules = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
  const passwordIsStrong = password.length >= 12 && rules.filter((rule) => rule.test(password)).length >= 3;
  return { email: normalizedEmail, emailIsValid, passwordIsStrong };
}
