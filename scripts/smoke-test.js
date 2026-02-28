const http = require('http');
const path = require('path');
const fs = require('fs');

let PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

function makeRequest(method, pathUrl, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: pathUrl,
      method,
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function findServerPort() {
  const envPort = process.env.PORT ? Number(process.env.PORT) : null;
  if (envPort) {
    try {
      const ok = await new Promise((resolve) => {
        const req = http.request({ hostname: 'localhost', port: envPort, path: '/api/login', method: 'POST', timeout: 2000, headers: { 'Content-Type': 'application/json' } }, (r) => resolve(r.statusCode));
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.write(JSON.stringify({ email: 'x', password: 'x' }));
        req.end();
      });
      if (ok) { PORT = envPort; return envPort; }
    } catch (e) {}
  }

  const candidates = Array.from({ length: 11 }, (_, i) => 3000 + i);
  for (const p of candidates) {
    try {
      PORT = p;
      const res = await new Promise((resolve, reject) => {
        const req = http.request({ hostname: 'localhost', port: p, path: '/api/login', method: 'POST', timeout: 2000, headers: { 'Content-Type': 'application/json' } }, (r) => {
          resolve(r.statusCode);
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.write(JSON.stringify({ email: 'x', password: 'x' }));
        req.end();
      });
      if (res) return p;
    } catch (e) {}
  }
  throw new Error('No dev server found on ports 3000-3010');
}

(async () => {
  try {
    console.log('Smoke test starting...');
    await findServerPort();
    console.log('Using dev server port', PORT);
    const ts = Date.now();
    const employee = `employee+${ts}@example.com`;
    const admin = `admin+${ts}@example.com`;
    const password = 'Test@1234';

    console.log('1) Signing up employee:', employee);
    const s1 = await makeRequest('POST', '/api/signup', { email: employee, password });
    console.log('  ->', s1.status, s1.body);
    if (s1.status !== 201) throw new Error('Signup employee failed');

    console.log('2) Signing up admin (will promote via DB):', admin);
    const s2 = await makeRequest('POST', '/api/signup', { email: admin, password });
    console.log('  ->', s2.status, s2.body);
    if (s2.status !== 201) throw new Error('Signup admin failed');

    console.log('3) Promote admin user in DB');
    // dynamic import of lib/db.js using file URL on Windows
    const { pathToFileURL } = require('url');
    const dbModule = await import(pathToFileURL(path.join(process.cwd(), 'lib', 'db.js')).href);
    const db = dbModule.default;
    const client = await db.connect();
    try {
      await client.query("update users set role='admin' where email=$1", [admin]);
    } finally {
      client.release();
    }
    console.log('  -> promoted');

    console.log('4) Login employee');
    const l1 = await makeRequest('POST', '/api/login', { email: employee, password });
    console.log('  ->', l1.status);
    if (l1.status !== 200 || !l1.body.token) throw new Error('Login employee failed');
    const empToken = l1.body.token;

    console.log('5) Create leave request as employee');
    const create = await makeRequest('POST', '/api/requests', { start_date: '2026-03-01', end_date: '2026-03-03', reason: 'Test leave' }, { Authorization: 'Bearer ' + empToken });
    console.log('  ->', create.status, create.body);
    if (create.status < 200 || create.status >= 300) throw new Error('Create request failed');
    const requestId = create.body.id || (create.body.rows && create.body.rows[0] && create.body.rows[0].id);

    console.log('6) Login admin');
    const l2 = await makeRequest('POST', '/api/login', { email: admin, password });
    if (l2.status !== 200 || !l2.body.token) throw new Error('Login admin failed');
    const adminToken = l2.body.token;
    console.log('  -> admin token received');

    console.log('7) Admin: fetch pending requests');
    const pending = await makeRequest('GET', '/api/admin/requests', null, { Authorization: 'Bearer ' + adminToken });
    console.log('  ->', pending.status, Array.isArray(pending.body) ? `found ${pending.body.length}` : pending.body);

    console.log('8) Admin: approve the created request');
    const approve = await makeRequest('POST', '/api/admin/requests', { id: requestId, action: 'approve' }, { Authorization: 'Bearer ' + adminToken });
    console.log('  ->', approve.status, approve.body);

    console.log('9) Employee: fetch own requests to confirm status');
    const empRequests = await makeRequest('GET', '/api/requests', null, { Authorization: 'Bearer ' + empToken });
    console.log('  ->', empRequests.status, empRequests.body);

    console.log('\nSMOKE TEST SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('SMOKE TEST FAILED:', e.message);
    process.exit(1);
  }
})();
