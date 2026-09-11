import {query} from '../config/db.js';
export async function audit(req,action,entityType,entityId,oldValues=null,newValues=null){
  try{
    await query('INSERT INTO audit_logs(admin_id,action,entity_type,entity_id,old_values,new_values,ip,user_agent) VALUES(?,?,?,?,?,?,?,?)',[
      req.user?.id||null,action,entityType,entityId||null,oldValues?JSON.stringify(oldValues):null,newValues?JSON.stringify(newValues):null,req.ip||'',String(req.headers['user-agent']||'').slice(0,255)
    ]);
  }catch(e){console.error('Audit log failed:',e.message)}
}
