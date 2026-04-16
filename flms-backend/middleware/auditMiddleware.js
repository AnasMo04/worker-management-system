const { AuditTrail } = require('../models');

const auditMiddleware = async (req, res, next) => {
  // Only capture state-changing requests
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Skip audit logs themselves if they ever had a post route (they don't, but for safety)
  if (req.originalUrl.includes('/api/audit')) {
    return next();
  }

  const originalSend = res.send;
  let responseBody;

  res.send = function(body) {
    responseBody = body;
    return originalSend.apply(res, arguments);
  };

  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const actorId = req.user ? req.user.id : null;
        const actionType = req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : 'DELETE';
        const targetRef = req.originalUrl;

        let details = {
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          query: req.query,
          body: req.method === 'DELETE' ? {} : req.body, // In real scenario, we might want to sanitize this
          ip: req.ip,
          userAgent: req.get('User-Agent')
        };

        // Note: Full "Before/After" snapshot logic usually requires fetching data before the action.
        // For a generic middleware, we store what was sent and the context.
        // Specific controllers can provide more granular diffs if needed.

        await AuditTrail.create({
          Actor_ID: actorId,
          Action_Type: actionType,
          Target_Ref: targetRef,
          Timestamp: new Date(),
          Details: JSON.stringify(details)
        });
      } catch (error) {
        console.error('Audit Logging Error:', error);
      }
    }
  });

  next();
};

module.exports = auditMiddleware;
