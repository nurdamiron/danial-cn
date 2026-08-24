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
  email: string;
  password: string;
  name: string;
}): Promise<{ email: string; action: "created" | "updated" }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  if (!email) throw new Error("ADMIN_EMAIL is empty");
  if (!password) throw new Error("ADMIN_PASSWORD is empty");

  const passwordHash = await input.hashPassword(password);
  const existingAdmin = await input.store.findAdmin();
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
