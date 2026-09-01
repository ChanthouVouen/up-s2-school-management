import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { sanitizeUser } from '../utils/sanitizeUser';
import { createUserSchema, updateUserSchema } from '../validations/users.validation';

// GET /users - List users with search, role filter & pagination
export const getUsers: RequestHandler = asyncHandler(async (req, res) => {
  const { search, roleId, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {};

  if (search) {
    const searchStr = (search as string).trim();
    whereClause.OR = [{ name: { contains: searchStr } }, { email: { contains: searchStr } }];
  }

  if (roleId && (roleId as string).trim() !== '') {
    whereClause.roleId = roleId;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: { role: { include: { permissions: true } } },
    }),
  ]);

  res.status(200).json({
    data: users.map(sanitizeUser),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// POST /users - Create a new user account
export const createUser: RequestHandler = asyncHandler(async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, password, roleId } = parsed.data;

  const [existingEmail, role] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.role.findUnique({ where: { id: roleId } }),
  ]);

  if (existingEmail) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  if (!role) {
    res.status(400).json({ message: 'Invalid role selected' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, roleId },
    include: { role: { include: { permissions: true } } },
  });

  await prisma.activityLog.create({
    data: {
      title: 'New User Created',
      description: `User ${user.name} (${user.email}) was created with role ${user.role.name}.`,
      type: 'USER',
    },
  });

  res.status(201).json(sanitizeUser(user));
});

// PUT /users/:id - Update a user account
export const updateUser: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, password, roleId } = parsed.data;

  if (email && email !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }
  }

  let newRole = null;
  if (roleId) {
    newRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!newRole) {
      res.status(400).json({ message: 'Invalid role selected' });
      return;
    }
  }

  // Detect modified fields for the activity log
  const changes: string[] = [];
  if (name && name !== existingUser.name) changes.push(`Name changed from "${existingUser.name}" to "${name}"`);
  if (email && email !== existingUser.email) changes.push(`Email changed from "${existingUser.email}" to "${email}"`);
  if (roleId && roleId !== existingUser.roleId) changes.push(`Role changed to "${newRole!.name}"`);
  if (password) changes.push('Password reset');

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
      roleId: roleId ?? existingUser.roleId,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
    include: { role: { include: { permissions: true } } },
  });

  if (changes.length > 0) {
    await prisma.activityLog.create({
      data: {
        title: 'User Updated',
        description: `Updated account for ${updated.name} (${updated.email}): ${changes.join('; ')}.`,
        type: 'USER',
      },
    });
  }

  res.status(200).json(sanitizeUser(updated));
});

// DELETE /users/:id - Delete a user account
export const deleteUser: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  if (req.user?.id === id) {
    res.status(400).json({ message: 'You cannot delete your own account' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.role.name === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: { name: 'ADMIN' } } });
    if (adminCount <= 1) {
      res.status(400).json({ message: 'Cannot delete the last remaining admin account' });
      return;
    }
  }

  await prisma.user.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      title: 'User Removed',
      description: `Deleted user account ${user.name} (${user.email}).`,
      type: 'USER',
    },
  });

  res.status(200).json({ message: 'User deleted successfully', id });
});
