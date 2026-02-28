import pool from '../../lib/db';
import auth from '../../lib/auth';

export default async function handler(req, res) {
  const user = auth(req, res);
  if (!user) return;
  try {
    if (req.method === 'POST') {
      const { start_date, end_date, reason } = req.body;
      const result = await pool.query(
        'insert into leave_requests(user_id,start_date,end_date,reason,status) values($1,$2,$3,$4,$5) returning id',
        [user.sub, start_date, end_date, reason, 'pending']
      );
      return res.status(201).json({ id: result.rows[0].id });
    } else if (req.method === 'GET') {
      const result = await pool.query('select * from leave_requests where user_id=$1', [user.sub]);
      return res.status(200).json(result.rows);
    }
    res.status(405).end();
  } catch (e) {
    console.error('Requests error:', e.message);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}