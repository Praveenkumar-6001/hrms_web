import pool from '../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const client = await pool.connect();
  try {
    const result = await client.query('select id, password_hash, role from users where email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (e) {
    console.error('Login error:', e.message);
    return res.status(500).json({ error: e.message || 'Server error' });
  } finally {
    client.release();
  }
}