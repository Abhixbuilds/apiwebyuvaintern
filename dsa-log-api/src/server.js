const fs = require('fs');
const path = require('path');
const config = require('./config');
const { createDb } = require('./db');
const { createApp } = require('./app');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
const db = createDb(config.dbPath);
const server = createApp(db).listen(config.port, () =>
  console.log(`DSA Log API running on http://localhost:${config.port}`));

const shutdown = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
