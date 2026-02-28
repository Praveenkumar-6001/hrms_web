import pool from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  // Validate role - only allow 'admin' or 'employee'
  const validRoles = ['admin', 'employee'];
  const userRole = role && validRoles.includes(role) ? role : 'employee';
  
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash(password, 10);
    const insert = await client.query(
      'insert into users(email, password_hash, role) values($1, $2, $3) returning id, role',
      [email, hash, userRole]
    );
    return res.status(201).json({ id: insert.rows[0].id, role: insert.rows[0].role });
  } catch (e) {
    console.error('Signup error:', e.message);
    return res.status(500).json({ error: e.message || 'Server error' });
  } finally {
    client.release();
  }
}
