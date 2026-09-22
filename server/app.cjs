// cPanel / Passenger startup file; application root: server.
import('./src/server.js').catch(()=>{console.error('Application startup failed. Check server configuration.');process.exit(1)});
