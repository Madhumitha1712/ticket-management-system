import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_ticket_system_2026_enterprise_production';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    secret,
    {
      expiresIn,
    }
  );
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_ticket_system_2026_enterprise_production';
  return jwt.verify(token, secret);
};
