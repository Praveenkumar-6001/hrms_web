import jwt from 'jsonwebtoken';

export default function auth(req, res) {
  const header = req.headers.authorization;
  if (!header) { res.status(401).json({ error: 'Missing authorization header' }); return null; }
  const parts = header.split(' ');
  if (parts.length !== 2) { res.status(401).json({ error: 'Malformed authorization header' }); return null; }
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}