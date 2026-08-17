/**
 * The shape of a user as the admin panel sees it. Kept in one place so the
 * list, the detail route and the update route cannot drift apart — and so the
 * password hash is never in the projection to begin with.
 */
export const ADMIN_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  blockedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  blockedAt: string | Date | null;
  lastLoginAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};
