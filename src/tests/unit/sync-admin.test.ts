import { describe, expect, it } from "vitest";
import {
  syncAdminPassword,
  type AdminRecord,
  type AdminStore,
} from "@/lib/sync-admin";

function memoryStore(seed: AdminRecord[] = []): AdminStore & {
  rows: AdminRecord[];
  hashes: Record<string, string>;
} {
  const rows = seed.map((r) => ({ ...r }));
  const hashes: Record<string, string> = {};
  return {
    rows,
    hashes,
    async findAdmin() {
      return rows.find((r) => r.role === "ADMIN") ?? null;
    },
    async findByEmail(email) {
      return rows.find((r) => r.email === email) ?? null;
    },
    async updatePassword(id, data) {
      const row = rows.find((r) => r.id === id);
      if (!row) throw new Error("missing");
      hashes[id] = data.passwordHash;
      if (data.role) row.role = data.role;
    },
    async createAdmin(data) {
      const row = {
        id: `id_${rows.length + 1}`,
        email: data.email,
        role: "ADMIN",
      };
      rows.push(row);
      hashes[row.id] = data.passwordHash;
    },
  };
}

describe("syncAdminPassword", () => {
  it("creates the admin when the store is empty", async () => {
    const store = memoryStore();
    const result = await syncAdminPassword({
      store,
      hashPassword: async (p) => `hash:${p}`,
      email: "Admin@Danial.cn",
      password: "secret-pass",
      name: "Admin",
    });
    expect(result).toEqual({ email: "admin@danial.cn", action: "created" });
    expect(store.rows).toEqual([
      { id: "id_1", email: "admin@danial.cn", role: "ADMIN" },
    ]);
    expect(store.hashes.id_1).toBe("hash:secret-pass");
  });

  it("updates the existing admin hash instead of inserting a second one", async () => {
    const store = memoryStore([
      { id: "adm", email: "old@danial.cn", role: "ADMIN" },
    ]);
    store.hashes.adm = "hash:stale";
    const result = await syncAdminPassword({
      store,
      hashPassword: async (p) => `hash:${p}`,
      email: "admin@danial.cn",
      password: "new-pass",
      name: "Admin",
    });
    expect(result).toEqual({ email: "old@danial.cn", action: "updated" });
    expect(store.rows).toHaveLength(1);
    expect(store.hashes.adm).toBe("hash:new-pass");
  });

  it("promotes a matching address to admin and sets the password", async () => {
    const store = memoryStore([
      { id: "u1", email: "admin@danial.cn", role: "USER" },
    ]);
    const result = await syncAdminPassword({
      store,
      hashPassword: async (p) => `hash:${p}`,
      email: "admin@danial.cn",
      password: "secret-pass",
      name: "Admin",
    });
    expect(result).toEqual({ email: "admin@danial.cn", action: "updated" });
    expect(store.rows[0].role).toBe("ADMIN");
    expect(store.hashes.u1).toBe("hash:secret-pass");
  });
});
