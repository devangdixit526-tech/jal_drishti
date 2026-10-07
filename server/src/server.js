import { createApp } from './app.js';
import { config } from './config/env.js';

/**
 * Process entry point: start the HTTP server and shut it down cleanly.
 */
const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`\n  JalDrishti API running`);
  console.log(`  -> http://localhost:${config.port}${config.apiPrefix}`);
  console.log(`  env: ${config.nodeEnv}`);
  console.log(`  cors: ${config.corsOrigins.join(', ')}\n`);
});

/**
 * Graceful shutdown: stop accepting new connections, let in-flight requests
 * finish, then exit. Without this, Ctrl+C or a container restart kills
 * requests mid-response.
 */
function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Don't hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// A crash should be loud and fatal, not silently swallowed.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});
