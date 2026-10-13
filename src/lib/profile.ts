import { validateRegistration } from "@/lib/password";

export const NAME_MAX_LENGTH = 80;

export function validateProfile(input: { name: string; email: string; newPassword: string; confirmPassword: string }) {
  const name = input.name.trim();
  const { email, emailIsValid, passwordIsStrong } = validateRegistration(input.email, input.newPassword);
  if (!name || name.length > NAME_MAX_LENGTH) return { error: `Name must be 1–${NAME_MAX_LENGTH} characters.` } as const;
  if (!emailIsValid) return { error: "Enter a valid email address." } as const;
  if (input.newPassword) {
    if (!passwordIsStrong) return { error: "Use 12+ characters and at least three character types." } as const;
    if (input.newPassword !== input.confirmPassword) return { error: "New passwords do not match." } as const;
  }
  return { data: { name, email, newPassword: input.newPassword || null } } as const;
}
