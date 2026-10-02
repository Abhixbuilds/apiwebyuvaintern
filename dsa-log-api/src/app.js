const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');
const { requireAuth } = require('./middleware/auth');

function createApp(db, { rateLimiting = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  if (rateLimiting) {
    app.use('/api/auth', rateLimit({
      windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
      message: { error: { message: 'Too many attempts, try again later' } },
    }));
  }
  app.use('/api/auth', require('./routes/auth')(db));

  const auth = requireAuth(db);
  const problems = require('./routes/problems')(db);
  app.use('/api/topics/:topicId/problems', auth, problems.nested);
  app.use('/api/topics', auth, require('./routes/topics')(db));
  app.use('/api/problems', auth, problems.flat);
  app.use('/api/stats', auth, require('./routes/stats')(db));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
