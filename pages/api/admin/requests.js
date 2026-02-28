import pool from '../../../lib/db';
import auth from '../../../lib/auth';

export default async function handler(req, res) {
  const user = auth(req, res);
  if (!user) return;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        'select lr.*, u.email from leave_requests lr join users u on lr.user_id = u.id where lr.status = $1',
        ['pending']
      );
      return res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      const { id, action } = req.body;
      const status = action === 'approve' ? 'approved' : 'rejected';
      await pool.query('update leave_requests set status=$1 where id=$2', [status, id]);
      return res.status(200).json({ status });
    }
    res.status(405).end();
  } catch (e) {
    console.error('Admin requests error:', e.message);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}