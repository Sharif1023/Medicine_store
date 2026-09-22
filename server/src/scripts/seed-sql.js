import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import {fileURLToPath} from 'url';
import {env} from '../config/env.js';

if(env.nodeEnv==='production'&&process.env.ALLOW_DEMO_SEED!=='1'){
  throw new Error('Refusing to load development demo seed data in production.');
}
const here=path.dirname(fileURLToPath(import.meta.url));
const file=path.resolve(here,'../../../database/seed.sql');
const sql=fs.readFileSync(file,'utf8');
const conn=await mysql.createConnection({host:env.db.host,port:env.db.port,user:env.db.user,password:env.db.password,database:env.db.name,multipleStatements:true,charset:'utf8mb4'});
try{await conn.query(sql);console.log('database/seed.sql imported successfully.')}finally{await conn.end()}
