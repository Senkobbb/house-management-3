/* eslint-disable */
/**
 * Mock REST backend for the House Management app.
 * Built on json-server (v0.17) with custom handlers for auth login and the
 * "mark bill as paid" action. All resources are mounted under the /api prefix
 * to match `environment.development.apiUrl` (http://localhost:3000/api).
 *
 * Run:  npm run mock        (backend only)
 *       npm run dev         (backend + Angular dev server together)
 */
const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const dbFile = path.join(__dirname, 'db.json');
const router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// --- Auth: POST /api/auth/login -> { token, user } ---
server.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const users = router.db.get('users').value();
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
  }

  const { password: _omit, ...safeUser } = user;
  return res.json({
    token: 'mock-jwt-token.' + Buffer.from(user.id).toString('base64'),
    user: safeUser,
  });
});

// --- Bills: PATCH /api/bills/:id/pay -> mark as paid ---
server.patch('/api/bills/:id/pay', (req, res) => {
  const id = req.params.id;
  const bill = router.db.get('bills').find({ id }).value();

  if (!bill) {
    return res.status(404).json({ message: 'Không tìm thấy hóa đơn.' });
  }

  const updated = router.db
    .get('bills')
    .find({ id })
    .assign({ paymentStatus: 'paid' })
    .write();

  return res.json(updated);
});

// Stamp createdAt on newly created bills
server.post('/api/bills', (req, res, next) => {
  req.body.createdAt = new Date().toISOString();
  next();
});

// Mount all json-server CRUD routes under /api
server.use('/api', router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  Mock API server running on port ${PORT} (path /api)`);
  console.log('  Login: username "admin", password "admin123"\n');
});
