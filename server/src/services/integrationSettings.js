import {z} from 'zod';
import {query} from '../config/db.js';
import {encrypt,decrypt,redact,secretFields} from './credentials.js';
const text=z.string().max(500),bool=z.union([z.boolean(),z.literal(0),z.literal(1)]).transform(Number),secret=z.string().max(4000),url=z.union([z.literal(''),z.string().url().max(500)]);
export const schemas={
 payment:z.object({gateway_name:z.string().min(1).max(100),gateway_type:z.enum(['sslcommerz','stripe','paypal','bkash','nagad']),status:bool,api_url:url,merchant_id:z.string().max(190),api_key:secret.optional(),secret_key:secret.optional(),success_url:url,fail_url:url,cancel_url:url,mode:z.enum(['sandbox','live'])}),
 email:z.object({status:bool,driver:z.literal('smtp').default('smtp'),smtp_host:z.string().max(190),smtp_port:z.coerce.number().int().min(1).max(65535),encryption:z.enum(['tls','starttls']),username:z.string().max(190),password:secret.optional(),sender_name:z.string().max(190),sender_email:z.union([z.literal(''),z.string().email().max(190)]),imap_enabled:bool.default(0),imap_host:z.string().max(190).default(''),imap_port:z.coerce.number().int().min(1).max(65535).default(993),imap_sent_mailbox:z.string().min(1).max(190).default('Sent')}),
 sms:z.object({status:bool,provider_name:z.literal('generic_json'),api_url:url,api_key:secret.optional(),secret_key:secret.optional(),sender_id:z.string().max(100),country_code:z.string().regex(/^\d{1,4}$/)}),
 notification:z.object({email_enabled:bool,sms_enabled:bool,in_app_enabled:bool,admin_email:z.union([z.literal(''),z.string().email().max(190)]),admin_phone:z.string().max(30)}),
 analytics:z.object({status:bool,meta_pixel_status:bool,meta_pixel_id:z.string().regex(/^\d{5,30}$|^$/),google_analytics_status:bool,ga_measurement_id:z.string().regex(/^G-[A-Z0-9]+$|^$/),gtm_status:bool,gtm_container_id:z.string().regex(/^GTM-[A-Z0-9]+$|^$/),custom_header_script:z.string().max(20000).nullable(),custom_footer_script:z.string().max(20000).nullable(),retention_days:z.coerce.number().int().min(1).max(365)})
};
export const tables={payment:'payment_settings',email:'email_settings',sms:'sms_settings',notification:'notification_settings',analytics:'analytics_settings'};
export async function readSettings(kind,id=1,plain=false){const row=(await query(`SELECT * FROM ${tables[kind]} WHERE id=?`,[id]))[0];if(!row)return null;if(plain){for(const k of secretFields)if(k in row)row[k]=decrypt(row[k]);return row}return redact(row)}
export async function saveSettings(kind,input,id=1){const d=schemas[kind].parse(input);const old=await readSettings(kind,id,true);if(!old)throw Object.assign(new Error('Settings not found'),{status:404});
 if(kind==='payment'&&d.status&&d.gateway_type!=='sslcommerz')throw Object.assign(new Error('This gateway needs a provider adapter before activation'),{status:400});
 if(kind==='payment'&&d.gateway_type!==old.gateway_type)throw Object.assign(new Error('Gateway type cannot be changed'),{status:400});
 if(kind==='payment'&&d.status&&(!d.merchant_id||!(d.secret_key||old.secret_key)))throw Object.assign(new Error('Store ID and secret are required'),{status:400});
 if(kind==='payment'){const base=d.mode==='live'?'https://securepay.sslcommerz.com':'https://sandbox.sslcommerz.com';if(d.gateway_type==='sslcommerz'&&d.api_url&&d.api_url!==base+'/gwprocess/v4/api.php')throw Object.assign(new Error('Use the official SSLCOMMERZ session URL for this mode, or leave it blank'),{status:400});for(const field of ['success_url','fail_url','cancel_url'])if(d[field]&&new URL(d[field]).origin!==new URL(process.env.CLIENT_URL||'http://localhost:5173').origin)throw Object.assign(new Error('Return URLs must belong to CLIENT_URL'),{status:400})}
 if(kind==='email'){for(const field of ['smtp_host','imap_host'])if(d[field]&&(!/^[a-z0-9.-]+$/i.test(d[field])||d[field].includes('..')))throw Object.assign(new Error('Mail hostname must not contain https://, a path or spaces'),{status:400});}
 if(kind==='email'&&d.status&&(!d.smtp_host||!d.sender_email))throw Object.assign(new Error('SMTP host and sender email required'),{status:400});
 if(kind==='email'&&d.imap_enabled&&!d.imap_host)throw Object.assign(new Error('Incoming mail host is required when inbox is enabled'),{status:400});
 if(kind==='email'&&(d.status||d.imap_enabled)&&(!d.username||!(d.password||old.password)))throw Object.assign(new Error('Full mailbox username and password are required'),{status:400});
 if(kind==='sms'&&d.status&&(!d.api_url||!(d.api_key||old.api_key)))throw Object.assign(new Error('SMS URL and API key required'),{status:400});
 if((d.status||d.imap_enabled)&&['email','sms','payment'].includes(kind))encrypt('configuration-check');
 for(const k of secretFields)if(k in d){if(!d[k])delete d[k];else d[k]=encrypt(d[k])}
 const keys=Object.keys(d);await query(`UPDATE ${tables[kind]} SET ${keys.map(k=>'`'+k+'`=?').join(',')} WHERE id=?`,[...keys.map(k=>d[k]),id]);return readSettings(kind,id)
}
