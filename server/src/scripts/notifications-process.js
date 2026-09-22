import {processOutbox} from '../services/notifications.js';
import {pool} from '../config/db.js';
try{await processOutbox()}finally{await pool.end()}
