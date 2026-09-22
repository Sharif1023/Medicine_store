import {sendMail} from './mail.js';
import {query} from '../config/db.js';
import {readSettings} from './integrationSettings.js';
import {encrypt,decrypt} from './credentials.js';
export const renderTemplate=(body,vars)=>String(body||'').replace(/{{\s*([a-z_]+)\s*}}/g,(_,key)=>String(vars[key]??''));
export async function notify(event,user,vars={},eventKey,conn=null){
 const q=conn?async(s,p=[])=>{const [rows]=await conn.execute(s,p);return rows}:query;
 const cfg=(await q('SELECT * FROM notification_settings WHERE id=1'))[0];if(!cfg)return;
 const data={name:[user.first_name,user.last_name].filter(x=>x&&x!=='-').join(' '),email:user.email,...vars};
 const templates=await q('SELECT * FROM message_templates WHERE event_name=? AND status=1',[event]);
 for(const t of templates){if(!cfg[t.channel+'_enabled'])continue;const channelSettings=(await q('SELECT status FROM '+(t.channel==='email'?'email_settings':'sms_settings')+' WHERE id=1'))[0];if(!channelSettings?.status)continue;const dest=t.channel==='email'?user.email:user.phone;if(!dest)continue;
 let body=renderTemplate(t.body,data),subject=renderTemplate(t.subject,data);
 if(event==='welcome'&&t.channel==='email'){
  const legacy=(await q("SELECT * FROM email_templates WHERE template_key='welcome'"))[0];
  if(legacy){if(!legacy.is_active)continue;subject=renderTemplate(legacy.subject,data);const escaped=Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))]));body=JSON.stringify({format:'email-v1',text:renderTemplate(legacy.text_body||t.body,data),html:legacy.html_body?renderTemplate(legacy.html_body,escaped):undefined})}
 }
 // Encrypt queued message content too: reset links and OTPs must not be stored in plaintext.
 await q('INSERT IGNORE INTO notification_outbox(user_id,event_key,channel,recipient,subject,body) VALUES(?,?,?,?,?,?)',[user.id||null,eventKey,t.channel,dest,subject,encrypt(body)]);
 }
 if(cfg.in_app_enabled&&user.id&&['welcome','order_created','order_status'].includes(event))await q('INSERT INTO notifications(user_id,type,title,message) VALUES(?,?,?,?)',[user.id,event,event==='welcome'?'Welcome':'Order update',event==='welcome'?'Your account is ready.':`Order ${data.order_id}: ${data.status}`]);
}
export async function notifyOrder(order,user,event,key,conn=null){await notify(event,user,{order_id:order.order_number,amount:order.total,status:order.status},key,conn);if(event==='order_created'){const q=conn?async(s,p=[])=>{const [r]=await conn.execute(s,p);return r}:query;const cfg=(await q('SELECT * FROM notification_settings WHERE id=1'))[0];await notify('admin_order',{email:cfg.admin_email,phone:cfg.admin_phone,first_name:user.first_name},{order_id:order.order_number,amount:order.total,status:order.status},key+':admin',conn)}}
export async function sendEmail(recipient,subject,text,html){return sendMail({to:recipient,subject,text,html})}
export async function sendSMS(recipient,message){const s=await readSettings('sms',1,true);if(!s?.status)throw new Error('SMS is disabled');const u=new URL(s.api_url);const allowed=(process.env.SMS_ALLOWED_HOSTS||'').split(',').map(x=>x.trim()).filter(Boolean);if(u.protocol!=='https:'||u.username||u.password||!allowed.includes(u.hostname))throw new Error('SMS host not allowlisted');let phone=String(recipient).replace(/\D/g,'');if(phone.startsWith('0'))phone=s.country_code+phone.slice(1);const r=await fetch(u,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.api_key},body:JSON.stringify({to:phone,message,sender_id:s.sender_id,secret_key:s.secret_key}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('SMS provider rejected request');const result=await r.json();if(result.success!==true)throw new Error('SMS provider did not confirm acceptance')}
let running=false;
export async function processOutbox(){if(running)return;running=true;try{
 await query("UPDATE notification_outbox SET status='pending',locked_at=NULL WHERE status='sending' AND locked_at<DATE_SUB(NOW(),INTERVAL 5 MINUTE)");
 const jobs=await query("SELECT id FROM notification_outbox WHERE status='pending' AND available_at<=NOW() ORDER BY id LIMIT 20");
 for(const job of jobs){const claim=await query("UPDATE notification_outbox SET status='sending',locked_at=NOW(),attempts=attempts+1 WHERE id=? AND status='pending'",[job.id]);if(!claim.affectedRows)continue;const [j]=await query('SELECT * FROM notification_outbox WHERE id=?',[job.id]);try{const cfg=await readSettings('notification');const channel=await readSettings(j.channel);if(!cfg[j.channel+'_enabled']||!channel?.status){await query("UPDATE notification_outbox SET status='skipped',body='',last_error='Channel disabled' WHERE id=?",[j.id]);continue}const body=decrypt(j.body);if(j.channel==='email'){let message;try{message=JSON.parse(body)}catch{}if(message?.format==='email-v1')await sendEmail(j.recipient,j.subject,message.text,message.html);else await sendEmail(j.recipient,j.subject,body)}else await sendSMS(j.recipient,body);await query("UPDATE notification_outbox SET status='sent',body='',last_error=NULL WHERE id=?",[j.id])}catch{await query("UPDATE notification_outbox SET status=?,last_error='Delivery failed; check provider configuration',available_at=DATE_ADD(NOW(),INTERVAL ? SECOND) WHERE id=?",[j.attempts>=5?'failed':'pending',Math.min(3600,30*2**j.attempts),j.id])}}
 }finally{running=false}}
export function startNotificationWorker(){const timer=setInterval(()=>processOutbox().catch(()=>console.error('Notification worker failed')),5000);timer.unref();return timer}
