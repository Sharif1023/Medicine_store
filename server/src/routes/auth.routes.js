import {notify} from '../services/notifications.js';
import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {z} from 'zod';
import {query,pool} from '../config/db.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {accessToken,refreshToken,verifyRefresh,hashToken} from '../utils/tokens.js';
import {env} from '../config/env.js';
import {auth} from '../middleware/auth.js';
import {normalizeBdPhone,validEmail,splitFullName,fullName} from '../utils/identity.js';
import {sendResetOtp,sendPasswordChanged} from '../services/mail.js';

const r=Router();
const otpLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false});
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const otp=()=>String(crypto.randomInt(100000,1000000));

async function hydrateRole(u){
  const [roles,permissions]=await Promise.all([
    query('SELECT r.id,r.name FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND r.is_active=1',[u.id]),
    query('SELECT DISTINCT p.code FROM user_roles ur JOIN roles r ON r.id=ur.role_id JOIN role_permissions rp ON rp.role_id=r.id JOIN permissions p ON p.id=rp.permission_id WHERE ur.user_id=? AND r.is_active=1',[u.id])
  ]);
  return {...u,is_admin:roles.length>0,roles:roles.map(x=>x.name),permissions:permissions.map(x=>x.code)};
}
const publicUser=u=>({id:u.id,firstName:u.first_name,lastName:u.last_name==='-'?'':u.last_name,fullName:fullName(u),email:u.email,phone:u.phone,isAdmin:Boolean(u.is_admin),roles:u.roles||[],permissions:u.permissions||[]});
const cookieOptions={httpOnly:true,sameSite:'lax',secure:env.nodeEnv==='production',path:'/api/v1/auth'};

r.post('/register',asyncHandler(async(req,res)=>{
  const raw=z.object({fullName:z.string().min(2).max(160).optional(),firstName:z.string().max(80).optional(),lastName:z.string().max(80).optional(),email:z.string().min(3),phone:z.string().min(8),password:z.string().min(8).max(100)}).parse(req.body);
  const email=validEmail(raw.email);const phone=normalizeBdPhone(raw.phone);if(!email)return res.status(400).json({success:false,message:'Enter a valid email address'});if(!phone)return res.status(400).json({success:false,message:'Enter a valid Bangladesh mobile number'});
  const names=raw.fullName?splitFullName(raw.fullName):{firstName:String(raw.firstName||'').trim(),lastName:String(raw.lastName||'').trim()||'-'};if(!names.firstName)return res.status(400).json({success:false,message:'Full name is required'});
  if((await query('SELECT id FROM users WHERE LOWER(email)=LOWER(?) OR phone=?',[email,phone]))[0])return res.status(409).json({success:false,message:'Email or phone already registered'});
  const hash=await bcrypt.hash(raw.password,12);const conn=await pool.getConnection();try{await conn.beginTransaction();const [x]=await conn.execute('INSERT INTO users(first_name,last_name,email,phone,password_hash,is_verified,is_active) VALUES(?,?,?,?,?,1,1)',[names.firstName,names.lastName,email,phone,hash]);
  let u=await hydrateRole({id:x.insertId,first_name:names.firstName,last_name:names.lastName,email,phone});const at=accessToken(u),rt=refreshToken(u);await conn.execute('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))',[u.id,hashToken(rt)]);
  await notify('welcome',u,{},'welcome:'+u.id,conn);await conn.commit();
  res.cookie('refresh_token',rt,cookieOptions).status(201).json({success:true,message:'Registered',data:{user:publicUser(u),accessToken:at}});
  }catch(e){await conn.rollback();throw e}finally{conn.release()}
}));

r.post('/login',asyncHandler(async(req,res)=>{
  const d=z.object({identifier:z.string().min(1),password:z.string().min(1)}).parse(req.body);const email=validEmail(d.identifier);const phone=normalizeBdPhone(d.identifier);if(!email&&!phone)return res.status(400).json({success:false,message:'Enter a valid email address or Bangladesh mobile number'});
  const rows=email?await query('SELECT * FROM users WHERE LOWER(email)=LOWER(?) AND deleted_at IS NULL',[email]):await query('SELECT * FROM users WHERE phone=? AND deleted_at IS NULL',[phone]);let u=rows[0];if(!u||!u.is_active||!(await bcrypt.compare(d.password,u.password_hash)))return res.status(401).json({success:false,message:'Invalid email/phone or password'});
  u=await hydrateRole(u);const at=accessToken(u),rt=refreshToken(u);await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))',[u.id,hashToken(rt)]);res.cookie('refresh_token',rt,cookieOptions).json({success:true,data:{user:publicUser(u),accessToken:at}});
}));

r.post('/forgot-password',otpLimiter,asyncHandler(async(req,res)=>{
  const email=validEmail(req.body.email);if(!email)return res.status(400).json({success:false,message:'Enter a valid email address'});const u=(await query('SELECT * FROM users WHERE LOWER(email)=LOWER(?) AND deleted_at IS NULL',[email]))[0];
  if(u){const recent=(await query('SELECT created_at FROM password_reset_otps WHERE user_id=? ORDER BY id DESC LIMIT 1',[u.id]))[0];if(recent&&Date.now()-new Date(recent.created_at).getTime()<60000)return res.status(429).json({success:false,message:'Please wait 60 seconds before requesting another OTP'});const code=otp();await query('UPDATE password_reset_otps SET used_at=NOW() WHERE user_id=? AND used_at IS NULL',[u.id]);await query('INSERT INTO password_reset_otps(user_id,otp_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 10 MINUTE))',[u.id,sha(code)]);await sendResetOtp({email:u.email,fullName:fullName(u)},code)}
  res.json({success:true,message:'If that email exists, a password reset OTP has been sent.'});
}));

r.post('/verify-reset-otp',otpLimiter,asyncHandler(async(req,res)=>{const email=validEmail(req.body.email),code=String(req.body.otp||'');if(!email||!/^\d{6}$/.test(code))return res.status(400).json({success:false,message:'Valid email and 6-digit OTP are required'});const u=(await query('SELECT id FROM users WHERE LOWER(email)=LOWER(?)',[email]))[0];if(!u)return res.status(400).json({success:false,message:'Invalid or expired OTP'});const row=(await query('SELECT * FROM password_reset_otps WHERE user_id=? AND used_at IS NULL ORDER BY id DESC LIMIT 1',[u.id]))[0];if(!row||new Date(row.expires_at)<new Date()||row.attempts>=5)return res.status(400).json({success:false,message:'Invalid or expired OTP'});if(row.otp_hash!==sha(code)){await query('UPDATE password_reset_otps SET attempts=attempts+1 WHERE id=?',[row.id]);return res.status(400).json({success:false,message:'Invalid or expired OTP'})}res.json({success:true,message:'OTP verified'})}));

r.post('/reset-password',otpLimiter,asyncHandler(async(req,res)=>{
 const email=validEmail(req.body.email),code=String(req.body.otp||''),password=String(req.body.password||'');
 if(!email||!/^\d{6}$/.test(code)||password.length<8||password.length>100)return res.status(400).json({success:false,message:'Valid email, OTP and a password of 8–100 characters are required'});
 const conn=await pool.getConnection();let user;
 try{await conn.beginTransaction();const [[u]]=await conn.execute('SELECT * FROM users WHERE LOWER(email)=LOWER(?) AND is_active=1 AND deleted_at IS NULL FOR UPDATE',[email]);user=u;
 if(!u){await conn.rollback();return res.status(400).json({success:false,message:'Invalid or expired OTP'})}
 const [[row]]=await conn.execute('SELECT * FROM password_reset_otps WHERE user_id=? AND used_at IS NULL ORDER BY id DESC LIMIT 1 FOR UPDATE',[u.id]);
 if(!row||new Date(row.expires_at)<new Date()||row.attempts>=5){await conn.rollback();return res.status(400).json({success:false,message:'Invalid or expired OTP'})}
 if(row.otp_hash!==sha(code)){await conn.execute('UPDATE password_reset_otps SET attempts=attempts+1 WHERE id=?',[row.id]);await conn.commit();return res.status(400).json({success:false,message:'Invalid or expired OTP'})}
 const hash=await bcrypt.hash(password,12);await conn.execute('UPDATE users SET password_hash=?,updated_at=NOW() WHERE id=?',[hash,u.id]);await conn.execute('UPDATE password_reset_otps SET used_at=NOW() WHERE user_id=? AND used_at IS NULL',[u.id]);await conn.execute('UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=? AND revoked_at IS NULL',[u.id]);await conn.commit();
 }catch(e){await conn.rollback();throw e}finally{conn.release()}
 sendPasswordChanged({email:user.email,fullName:fullName(user)}).catch(()=>{});res.json({success:true,message:'Password changed successfully. Please log in.'})
}));

r.post('/refresh',asyncHandler(async(req,res)=>{const old=req.cookies.refresh_token;if(!old)return res.status(401).json({success:false,message:'Refresh token required'});const p=verifyRefresh(old);const rows=await query('SELECT rt.id token_id,u.* FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE rt.user_id=? AND rt.token_hash=? AND rt.revoked_at IS NULL AND rt.expires_at>NOW()',[p.sub,hashToken(old)]);let u=rows[0];if(!u||!u.is_active)return res.status(401).json({success:false,message:'Refresh token invalid'});await query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=?',[u.token_id]);u=await hydrateRole(u);const rt=refreshToken(u),at=accessToken(u);await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))',[u.id,hashToken(rt)]);res.cookie('refresh_token',rt,cookieOptions).json({success:true,data:{accessToken:at,user:publicUser(u)}})}));
r.post('/logout',asyncHandler(async(req,res)=>{const t=req.cookies.refresh_token;if(t)await query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=?',[hashToken(t)]);res.clearCookie('refresh_token',{path:'/api/v1/auth'}).json({success:true,message:'Logged out'})}));
r.get('/me',auth,asyncHandler(async(req,res)=>{const u=await hydrateRole(req.user);res.json({success:true,data:{user:publicUser(u)}})}));
export default r;
