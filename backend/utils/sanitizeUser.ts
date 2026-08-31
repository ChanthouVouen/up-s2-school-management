export function sanitizeUser<
  T extends { password: string; roleId: string; role: { name: string; permissions: { name: string }[] } },
>(user: T) {
  const { password: _password, roleId: _roleId, role, ...rest } = user;
  return { ...rest, role: role.name, permissions: role.permissions.map((permission) => permission.name) };
}
