import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import { ROLES, TICKET_STATUS } from '../config/constants.js';

export const getAllUsers = async (query = {}) => {
  const { role, department, isActive, search, page = 1, limit = 20 } = query;
  const filter = {};

  if (role) filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getActiveAgents = async () => {
  const agents = await User.find({ role: ROLES.AGENT, isActive: true }).select(
    'name email department phone avatar createdAt'
  );

  // Calculate active workload for each agent
  const agentWorkloads = await Promise.all(
    agents.map(async (agent) => {
      const activeTicketCount = await Ticket.countDocuments({
        assignedTo: agent._id,
        status: {
          $in: [
            TICKET_STATUS.ASSIGNED,
            TICKET_STATUS.IN_PROGRESS,
            TICKET_STATUS.PENDING,
          ],
        },
      });

      return {
        ...agent.toObject(),
        activeTicketCount,
      };
    })
  );

  return agentWorkloads;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const createUser = async ({ name, email, password, role, department, phone }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('A user with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || ROLES.EMPLOYEE,
    department: department || 'General',
    phone: phone || '',
    isActive: true,
  });

  return user.toSafeObject();
};

export const updateUser = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.name) user.name = updates.name.trim();
  if (updates.role && Object.values(ROLES).includes(updates.role)) {
    user.role = updates.role;
  }
  if (updates.department) user.department = updates.department.trim();
  if (updates.phone !== undefined) user.phone = updates.phone.trim();
  if (updates.isActive !== undefined) user.isActive = Boolean(updates.isActive);

  // If updating password
  if (updates.password) {
    user.password = updates.password;
  }

  await user.save();
  return user.toSafeObject();
};

export const toggleUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = isActive;
  await user.save();
  return user.toSafeObject();
};
