import {Router} from 'express';
import {z} from 'zod';
import {query} from '../../config/db.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {requirePermission} from '../../middleware/admin.js';
import {readSettings,saveSettings,schemas} from '../../services/integrationSettings.js';
import {redact} from '../../services/credentials.js';
import {audit} from '../../utils/audit.js';
import {sendEmail,sendSMS} from '../../services/notifications.js';
const r=Router();
r.get('/integration-health',requirePermission('settings.manage'),(req,res)=>res.json({success:true,data:{encryption_ready:Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY||'','base64').length===32}}));
for(const kind of Object.keys(schemas)){
 const path='/'+kind+'-settings';
 r.get(path,requirePermission('settings.manage'),asyncHandler(async(req,res)=>res.json({success:true,data:kind==='payment'?(await query('SELECT * FROM payment_settings ORDER BY id')).map(redact):await readSettings(kind)})));
 const save=asyncHandler(async(req,res)=>{const id=kind==='payment'?z.coerce.number().int().positive().parse(req.params.id||req.body.id):1;const result=await saveSettings(kind,req.body,id);await audit(req,'update',kind+'_settings',id,null,{fields:Object.keys(req.body).filter(k=>!['api_key','password','secret_key'].includes(k))});res.json({success:true,data:result})});
 r.post(path,requirePermission('settings.manage'),save);r.put(path+(kind==='payment'?'/:id':''),requirePermission('settings.manage'),save);
}
r.get('/message-templates',requirePermission('settings.manage'),asyncHandler(async(req,res)=>res.json({success:true,data:await query("SELECT * FROM message_templates WHERE NOT (event_name='welcome' AND channel='email') ORDER BY event_name,channel")})));
r.patch('/message-templates/:id',requirePermission('settings.manage'),asyncHandler(async(req,res)=>{const d=z.object({subject:z.string().max(250),body:z.string().min(1).max(10000),status:z.union([z.boolean(),z.number()])}).parse(req.body);await query('UPDATE message_templates SET subject=?,body=?,status=? WHERE id=?',[d.subject,d.body,Number(Boolean(d.status)),req.params.id]);res.json({success:true})}));
r.get('/notification-deliveries',requirePermission('settings.manage'),asyncHandler(async(req,res)=>res.json({success:true,data:await query('SELECT id,event_key,channel,status,attempts,last_error,created_at FROM notification_outbox ORDER BY id DESC LIMIT 100')})));
r.post('/notification-test',requirePermission('settings.manage'),asyncHandler(async(req,res)=>{const d=z.object({channel:z.enum(['email','sms'])}).parse(req.body);if(d.channel==='email')await sendEmail(req.user.email,'Configuration test','Your email integration is working.');else await sendSMS(req.user.phone,'Your SMS integration is working.');res.json({success:true,message:'Provider accepted the test message'})}));
const offerSchema=z.object({name:z.string().min(1).max(190),product_id:z.coerce.number().int().positive(),price_type:z.enum(['unit','strip','box']),minimum_quantity:z.coerce.number().int().min(2).max(10000),bundle_price:z.coerce.number().positive().max(10000000),start_date:z.string().min(10),end_date:z.string().min(10),is_active:z.union([z.boolean(),z.number()])});
r.get('/quantity-offers',requirePermission('marketing.view'),asyncHandler(async(req,res)=>res.json({success:true,data:await query('SELECT q.*,p.name product_name FROM quantity_offers q JOIN products p ON p.id=q.product_id ORDER BY q.id DESC')})));
const saveOffer=asyncHandler(async(req,res)=>{const d=offerSchema.parse(req.body);if(!Number.isFinite(Date.parse(d.start_date))||!Number.isFinite(Date.parse(d.end_date))||Date.parse(d.end_date)<=Date.parse(d.start_date))return res.status(400).json({success:false,message:'End date must follow start date'});d.start_date=new Date(/[zZ]|[+-]\d\d:\d\d$/.test(d.start_date)?d.start_date:d.start_date+'Z').toISOString().slice(0,19).replace('T',' ');d.end_date=new Date(/[zZ]|[+-]\d\d:\d\d$/.test(d.end_date)?d.end_date:d.end_date+'Z').toISOString().slice(0,19).replace('T',' ');d.is_active=Number(Boolean(d.is_active));const keys=Object.keys(d);if(req.params.id)await query(`UPDATE quantity_offers SET ${keys.map(k=>k+'=?').join(',')} WHERE id=?`,[...Object.values(d),req.params.id]);else await query(`INSERT INTO quantity_offers(${keys.join(',')}) VALUES(${keys.map(()=>'?')})`,Object.values(d));res.json({success:true})});
r.post('/quantity-offers',requirePermission('marketing.manage'),saveOffer);r.patch('/quantity-offers/:id',requirePermission('marketing.manage'),saveOffer);
r.delete('/quantity-offers/:id',requirePermission('marketing.manage'),asyncHandler(async(req,res)=>{await query('UPDATE quantity_offers SET is_active=0 WHERE id=?',[req.params.id]);res.json({success:true})}));
export default r;
