const { AuditTrail, Worker, Sponsor, User, SmartCard } = require('../models');

const getModelByUrl = (url) => {
  if (url.includes('/api/workers')) return Worker;
  if (url.includes('/api/sponsors')) return Sponsor;
  if (url.includes('/api/users')) return User;
  if (url.includes('/api/smart-cards')) return SmartCard;
  return null;
};

const redactSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitiveKeys = ['password', 'token', 'secret', 'Password', 'Token', 'Secret'];
  const redacted = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (sensitiveKeys.some(k => key.includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redacted[key] = redactSensitiveData(obj[key]);
    } else {
      redacted[key] = obj[key];
    }
  }
  return redacted;
};

const auditMiddleware = async (req, res, next) => {
  const isLogin = req.originalUrl.includes('/api/auth/login') && req.method === 'POST';
  const isStateChanging = ['POST', 'PUT', 'DELETE'].includes(req.method);

  if (!isStateChanging && !isLogin) {
    return next();
  }

  if (req.originalUrl.includes('/api/audit')) {
    return next();
  }

  // Pre-fetch old data for updates and deletes
  let oldData = null;
  if (['PUT', 'DELETE'].includes(req.method)) {
    try {
      const Model = getModelByUrl(req.originalUrl);
      const id = req.params.id || req.originalUrl.split('/').pop();
      if (Model && id && !isNaN(id)) {
        oldData = await Model.findByPk(id);
        if (oldData) {
          oldData = oldData.get({ plain: true });
          oldData = redactSensitiveData(oldData);
        }
      }
    } catch (e) {
      console.error('Audit Pre-fetch Error:', e);
    }
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
        const actorId = req.user ? req.user.id : (isLogin ? JSON.parse(responseBody).user.id : null);
        const actorName = req.user ? req.user.name : (isLogin ? JSON.parse(responseBody).user.name : 'System');
        const actionType = isLogin ? 'LOGIN' : (req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : 'DELETE');
        const targetRef = req.originalUrl;

        let targetName = 'N/A';
        let description = '';

        const body = req.body || {};
        const url = req.originalUrl;

        if (isLogin) {
          description = `قام المستخدم (${actorName}) بتسجيل الدخول للنظام`;
          targetName = actorName;
        } else if (url.includes('/api/workers')) {
          const name = body.Full_Name || (oldData && oldData.Full_Name) || 'عامل';
          targetName = name;
          if (actionType === 'CREATE') description = `إضافة عامل جديد: ${name}`;
          else if (actionType === 'UPDATE') description = `تعديل بيانات العامل: ${name}`;
          else description = `أرشفة سجل العامل: ${name}`;
        } else if (url.includes('/api/sponsors')) {
          const name = body.Sponsor_Name || (oldData && oldData.Sponsor_Name) || 'جهة';
          targetName = name;
          if (actionType === 'CREATE') description = `إضافة جهة مستضيفة جديدة: ${name}`;
          else if (actionType === 'UPDATE') description = `تعديل بيانات الجهة: ${name}`;
          else description = `أرشفة سجل الجهة: ${name}`;
        } else if (url.includes('/api/smart-cards')) {
          targetName = body.nfc_uid || (oldData && oldData.NFC_Chip_ID) || 'بطاقة';
          if (url.includes('/issue')) description = `إصدار بطاقة ذكية جديدة: ${targetName}`;
          else if (url.includes('/link')) description = `ربط بطاقة ذكية بعامل`;
          else if (url.includes('/cancel')) description = `إلغاء بطاقة ذكية`;
        } else if (url.includes('/api/users')) {
          const name = body.Name || (oldData && oldData.Name) || 'مستخدم';
          targetName = name;
          if (actionType === 'CREATE') description = `إنشاء حساب مستخدم جديد: ${name}`;
          else if (actionType === 'UPDATE') description = `تعديل صلاحيات/بيانات المستخدم: ${name}`;
          else description = `حذف حساب المستخدم: ${name}`;
        } else {
          description = `${actionType} on ${targetRef}`;
        }

        let details = {
          method: req.method,
          url: req.originalUrl,
          body: redactSensitiveData(req.method === 'DELETE' ? {} : req.body),
          oldData,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        };

        await AuditTrail.create({
          Actor_ID: actorId,
          Action_Type: actionType,
          Target_Ref: targetRef,
          Target_Name: targetName,
          Description: description,
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
