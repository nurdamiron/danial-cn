/**
 * Keep the single admin account in sync with ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * The seed only creates an admin when none exists. Changing the env later
 * leaves the live hash pointing at a password nobody remembers — which is how
 * the panel started answering "wrong password" to the value in Vercel.
 */

export type AdminRecord = {
  id: string;
  email: string;
  role: string;
  /** The stored hash, when the store can read it back. */
  passwordHash?: string;
};

export type AdminStore = {
  findAdmin: () => Promise<AdminRecord | null>;
  findByEmail: (email: string) => Promise<AdminRecord | null>;
  updatePassword: (
    id: string,
    data: { passwordHash: string; role?: "ADMIN" },
  ) => Promise<void>;
  createAdmin: (data: {
    email: string;
    passwordHash: string;
    name: string;
  }) => Promise<void>;
};

export async function syncAdminPassword(input: {
  store: AdminStore;
  hashPassword: (password: string) => Promise<string>;
  /**
   * Checks the env password against the stored hash. When it already
   * matches, nothing is written.
   *
   * This runs on every deploy, and each write also signs the admin out
   * everywhere. So with the password unchanged, every deploy still threw the
   * owner out of an open panel: their next save came back 401 and looked
   * like the panel had stopped saving.
   */
  verifyPassword?: (password: string, hash: string) => Promise<boolean>;
  email: string;
  password: string;
  name: string;
}): Promise<{ email: string; action: "created" | "updated" | "unchanged" }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  if (!email) throw new Error("ADMIN_EMAIL is empty");
  if (!password) throw new Error("ADMIN_PASSWORD is empty");

  const existingAdmin = await input.store.findAdmin();
  if (
    existingAdmin?.passwordHash &&
    input.verifyPassword &&
    (await input.verifyPassword(password, existingAdmin.passwordHash))
  ) {
    return { email: existingAdmin.email, action: "unchanged" };
  }

  const passwordHash = await input.hashPassword(password);
  if (existingAdmin) {
    await input.store.updatePassword(existingAdmin.id, { passwordHash });
    return { email: existingAdmin.email, action: "updated" };
  }

  const byEmail = await input.store.findByEmail(email);
  if (byEmail) {
    await input.store.updatePassword(byEmail.id, {
      passwordHash,
      role: "ADMIN",
    });
    return { email: byEmail.email, action: "updated" };
  }

  await input.store.createAdmin({
    email,
    passwordHash,
    name: input.name.trim() || "Admin",
  });
  return { email, action: "created" };
}
