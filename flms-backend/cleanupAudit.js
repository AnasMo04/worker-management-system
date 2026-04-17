const { AuditTrail } = require('./models');

async function cleanup() {
  try {
    const logs = await AuditTrail.findAll();
    let count = 0;

    const redact = (obj) => {
      let changed = false;
      for (let key in obj) {
        if (['password', 'token', 'secret', 'Password', 'Token', 'Secret'].some(k => key.includes(k))) {
          obj[key] = '[REDACTED]';
          changed = true;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (redact(obj[key])) changed = true;
        }
      }
      return changed;
    };

    for (const log of logs) {
      let details;
      try {
        details = JSON.parse(log.Details);
      } catch (e) { continue; }

      if (redact(details)) {
        log.Details = JSON.stringify(details);
        await log.save();
        count++;
      }
    }
    console.log(`Cleaned up ${count} audit records.`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// We don't run it here because of DB connection issues in sandbox,
// but we leave it as a reference for the user or manual trigger if needed.
// cleanup();
