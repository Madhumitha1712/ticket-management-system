import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES } from '../config/constants.js';

export const register = async ({ name, email, password, department, phone, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Public registrations default to EMPLOYEE
  const assignedRole = role && Object.values(ROLES).includes(role) ? role : ROLES.EMPLOYEE;

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    department: department || 'General',
    phone: phone || '',
    role: assignedRole,
    isActive: true,
  });

  const token = generateToken(user._id, user.role);

  return {
    user: user.toSafeObject(),
    token,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

  return {
    user: user.toSafeObject(),
    token,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
};

export const updateProfile = async (userId, { name, department, phone, avatar }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (name) user.name = name.trim();
  if (department) user.department = department.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  return user.toSafeObject();
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};
