import {decrypt} from '../services/credentials.js';
import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {query} from '../config/db.js';
import {auth} from '../middleware/auth.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {getSettingsMap} from '../services/settings.js';
import {startPayment,handleSslCallback} from '../services/payments.js';
import {env} from '../config/env.js';
const r=Router();
r.get('/payment-methods',asyncHandler(async(req,res)=>{const s=await getSettingsMap();const online=await query("SELECT gateway_type,gateway_name FROM payment_settings WHERE status=1 AND gateway_type='sslcommerz'");const methods=['cod','bkash','nagad','rocket'].filter(k=>s['payment.'+k]!=='0').map(k=>({key:k,name:k==='cod'?'Cash on Delivery':k,online:false}));methods.push(...online.map(x=>({key:x.gateway_type,name:x.gateway_name,online:true})));res.json({success:true,data:methods})}));
r.post('/user/orders/:id/pay',auth,rateLimit({windowMs:60000,limit:5}),asyncHandler(async(req,res)=>res.json({success:true,data:await startPayment(req.params.id,req.user.id)})));
function returnUrl(url,fallback){try{const u=new URL(url);if(u.origin===new URL(env.clientUrl).origin)return u.toString()}catch{}return env.clientUrl+fallback}
for(const action of ['success','fail','cancel','ipn'])r.post('/payments/sslcommerz/'+action,asyncHandler(async(req,res)=>{if(action==='fail'||action==='cancel'){const [session]=await query('SELECT gateway_snapshot FROM payment_sessions WHERE transaction_id=?',[String(req.body.tran_id||'').slice(0,40)]);const settings=session?JSON.parse(decrypt(session.gateway_snapshot)):{};return res.redirect(303,returnUrl(settings[action==='fail'?'fail_url':'cancel_url'],'/account/orders?payment='+action))}const result=await handleSslCallback(req.body);if(action==='ipn')return res.json({success:true});res.redirect(303,returnUrl(result.settings.success_url,'/payment-result?order_id='+result.orderId))}));
export default r;
