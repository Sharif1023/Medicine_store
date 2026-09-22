import {query} from '../config/db.js';

export function requirePermission(permission){
  return async(req,res,next)=>{
    try{
      const rows=await query(`SELECT p.code FROM user_roles ur JOIN roles r ON r.id=ur.role_id JOIN role_permissions rp ON rp.role_id=ur.role_id JOIN permissions p ON p.id=rp.permission_id WHERE ur.user_id=? AND r.is_active=1`,[req.user.id]);
      const set=new Set(rows.map(r=>r.code));
      if(set.has('*')||set.has(permission)) return next();
      return res.status(403).json({success:false,message:'Insufficient permission'});
    }catch(e){next(e)}
  };
}

export async function isAdmin(req,res,next){
  try{const rows=await query('SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND r.is_active=1 LIMIT 1',[req.user.id]);if(!rows[0])return res.status(403).json({success:false,message:'Admin access required'});next()}catch(e){next(e)}
}
