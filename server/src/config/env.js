import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
dotenv.config({path:fileURLToPath(new URL('../../.env',import.meta.url))});
const bool=(v,def=false)=>v===undefined?def:['1','true','yes','on'].includes(String(v).toLowerCase());
export const env={
  nodeEnv:process.env.NODE_ENV||'development',
  port:Number(process.env.PORT||5000),
  db:{host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),name:process.env.DB_NAME||'shasthocare',user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||''},
  clientUrl:process.env.CLIENT_URL||'http://localhost:5173',
  accessSecret:process.env.JWT_ACCESS_SECRET||'dev_access',
  refreshSecret:process.env.JWT_REFRESH_SECRET||'dev_refresh',
  accessExpires:process.env.JWT_ACCESS_EXPIRES_IN||'15m',
  refreshExpires:process.env.JWT_REFRESH_EXPIRES_IN||'7d',
  uploadDir:process.env.UPLOAD_DIR||'./uploads',

};
