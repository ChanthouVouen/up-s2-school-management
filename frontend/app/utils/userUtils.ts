export const ROLE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: "#e0e7ff", color: "#4338ca" },
  STAFF: { bg: "#f1f5f9", color: "#475569" },
};

export function getRoleBadgeStyle(role: string) {
  return ROLE_BADGE_COLORS[role] ?? { bg: "#f1f5f9", color: "#475569" };
}
