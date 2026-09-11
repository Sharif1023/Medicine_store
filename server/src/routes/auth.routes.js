import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {z} from 'zod';
import {query} from '../config/db.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {accessToken,refreshToken,verifyRefresh,hashToken} from '../utils/tokens.js';
import {env} from '../config/env.js';
import {auth} from '../middleware/auth.js';

const r=Router();

async function hydrateRole(u){
  const [roles,permissions]=await Promise.all([
    query('SELECT r.id,r.name FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND r.is_active=1',[u.id]),
    query('SELECT DISTINCT p.code FROM user_roles ur JOIN roles r ON r.id=ur.role_id JOIN role_permissions rp ON rp.role_id=r.id JOIN permissions p ON p.id=rp.permission_id WHERE ur.user_id=? AND r.is_active=1',[u.id])
  ]);
  return {...u,is_admin:roles.length>0,roles:roles.map(x=>x.name),permissions:permissions.map(x=>x.code)};
}
const publicUser=u=>({id:u.id,firstName:u.first_name,lastName:u.last_name,email:u.email,phone:u.phone,isAdmin:Boolean(u.is_admin),roles:u.roles||[],permissions:u.permissions||[]});
const cookieOptions={httpOnly:true,sameSite:'lax',secure:env.nodeEnv==='production',path:'/api/v1/auth'};

r.post('/register',asyncHandler(async(req,res)=>{
  const d=z.object({firstName:z.string().min(2).max(80),lastName:z.string().min(1).max(80),email:z.string().email(),phone:z.string().min(8).max(30),password:z.string().min(8).max(100)}).parse(req.body);
  if((await query('SELECT id FROM users WHERE email=? OR phone=?',[d.email.toLowerCase(),d.phone]))[0]) return res.status(409).json({success:false,message:'Email or phone already registered'});
  const hash=await bcrypt.hash(d.password,12);
  const x=await query('INSERT INTO users(first_name,last_name,email,phone,password_hash,is_verified,is_active) VALUES(?,?,?,?,?,1,1)',[d.firstName,d.lastName,d.email.toLowerCase(),d.phone,hash]);
  let u=await hydrateRole({id:x.insertId,first_name:d.firstName,last_name:d.lastName,email:d.email.toLowerCase(),phone:d.phone});
  const at=accessToken(u),rt=refreshToken(u);
  await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))',[u.id,hashToken(rt)]);
  res.cookie('refresh_token',rt,cookieOptions).status(201).json({success:true,message:'Registered',data:{user:publicUser(u),accessToken:at}});
}));

r.post('/login',asyncHandler(async(req,res)=>{
  const d=z.object({identifier:z.string().min(1),password:z.string().min(1)}).parse(req.body);
  const rows=await query('SELECT * FROM users WHERE (LOWER(email)=LOWER(?) OR phone=?) AND deleted_at IS NULL',[d.identifier,d.identifier]);
  let u=rows[0];
  if(!u||!u.is_active||!(await bcrypt.compare(d.password,u.password_hash))) return res.status(401).json({success:false,message:'Invalid email/phone or password'});
  u=await hydrateRole(u);
  const at=accessToken(u),rt=refreshToken(u);
  await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))',[u.id,hashToken(rt)]);
  res.cookie('refresh_token',rt,cookieOptions).json({success:true,data:{user:publicUser(u),accessToken:at}});
}));

r.post('/refresh',asyncHandler(async(req,res)=>{
  const old=req.cookies.refresh_token;
  if(!old) return res.status(401).json({success:false,message:'Refresh token required'});
  const p=verifyRefresh(old);
  const rows=await query('SELECT rt.id token_id,u.* FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE rt.user_id=? AND rt.token_hash=? AND rt.revoked_at IS NULL AND rt.expires_at>NOW()',[p.sub,hashToken(old)]);
  let u=rows[0];
  if(!u||!u.is_active) return res.status(401).json({success:false,message:'Refresh token invalid'});
  await query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=?',[u.token_id]);
  u=await hydrateRole(u);
  const rt=refreshToken(u),at=accessToken(u);
  await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))',[u.id,hashToken(rt)]);
  res.cookie('refresh_token',rt,cookieOptions).json({success:true,data:{accessToken:at,user:publicUser(u)}});
}));

r.post('/logout',asyncHandler(async(req,res)=>{
  const t=req.cookies.refresh_token;
  if(t) await query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=?',[hashToken(t)]);
  res.clearCookie('refresh_token',{path:'/api/v1/auth'}).json({success:true,message:'Logged out'});
}));

r.get('/me',auth,asyncHandler(async(req,res)=>{
  const u=await hydrateRole(req.user);
  res.json({success:true,data:{user:publicUser(u)}});
}));

export default r;
