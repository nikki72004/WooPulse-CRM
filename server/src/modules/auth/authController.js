import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../lib/db.js';
import { ENV } from '../../config/env.js';

export const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalized = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email.toLowerCase() === normalized);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('nikki_token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  },

  demoLogin: async (req, res) => {
    const user = db.findOne('users', u => u.role === 'ADMIN') || db.get('users')[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('nikki_token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  },

  logout: (req, res) => {
    res.clearCookie('nikki_token');
    return res.json({ success: true, message: 'Logged out successfully.' });
  },

  me: (req, res) => {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  }
};
