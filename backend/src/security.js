const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.auth = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired access token' }); }
}

function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.auth?.role) ? next() : res.status(403).json({ error: 'Forbidden' });
}

async function audit(actorId, action, entity, entityId, changes) {
  await db.auditLog.create({ data: { actorId, action, entity, entityId, changes } });
}
module.exports = { db, requireAuth, allowRoles, audit };
