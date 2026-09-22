import nodemailer from 'nodemailer';
import {readSettings} from './integrationSettings.js';
import {query} from '../config/db.js';

function deliveryError(e){if(e.status)return e;const messages={EAUTH:'Mailbox login failed. Check full email address and mailbox password in Email Settings.',ESOCKET:'Mail connection failed. Check hostname, TLS certificate and port.',ETIMEDOUT:'Mail connection timed out. Ask your host whether outgoing SMTP connections are allowed.',ECONNECTION:'Could not connect to the mail server. Check the cPanel outgoing hostname and port.',EENVELOPE:'Mail server rejected sender or recipient. Check the sender email and admin email address.'};return Object.assign(new Error(messages[e.code]||'Mail server did not accept the request. Check Email Settings and hosting mail logs.'),{status:502})}
async function transporter(){
  const [settings,flags]=await Promise.all([readSettings('email',1,true),readSettings('notification')]);
  if(!settings?.status||!flags?.email_enabled)throw Object.assign(new Error('Email is disabled in Admin Settings'),{status:503});
  const tx=nodemailer.createTransport({host:settings.smtp_host,port:settings.smtp_port,secure:settings.encryption==='tls',requireTLS:settings.encryption==='starttls',auth:settings.username?{user:settings.username,pass:settings.password}:undefined,connectionTimeout:12000,greetingTimeout:12000,socketTimeout:20000});
  return {tx,from:{name:settings.sender_name,address:settings.sender_email}};
}

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vars=(s,v)=>String(s??'').replace(/\{\{(name|email|otp)\}\}/g,(_,k)=>String(v[k]??''));
async function template(key,fallbackSubject,fallbackText,v={}){
  const row=(await query('SELECT subject,text_body,html_body,is_active FROM email_templates WHERE template_key=?',[key]))[0];
  if(row&&!row.is_active)throw Object.assign(new Error('Email template is disabled'),{status:503});
  if(row)return {subject:vars(row.subject,v),text:vars(row.text_body||fallbackText,v),html:row.html_body?vars(row.html_body,Object.fromEntries(Object.entries(v).map(([key,value])=>[key,esc(value)]))):undefined};
  return {subject:vars(fallbackSubject,v),text:vars(fallbackText,v)};
}
export async function sendMail({to,subject,text,html,replyTo,inReplyTo,references}){
  const {tx,from}=await transporter();
  try{return await tx.sendMail({from,to,subject,text,html,replyTo,headers:{...(inReplyTo?{'In-Reply-To':inReplyTo}:{}),...(references?{References:references}:{})}})}catch(e){throw deliveryError(e)}finally{tx.close()}
}
export async function verifySmtp(){const {tx}=await transporter();try{return await tx.verify()}catch(e){throw deliveryError(e)}finally{tx.close()}}
export async function sendWelcome(user){const v={name:user.fullName,email:user.email};const t=await template('welcome','Welcome to Medico – Your Account Has Been Created','Hello {{name}},\n\nWelcome to Medico. Your account has been created successfully with {{email}}.\n\nFor your security, never share your password or OTP with anyone.',v);return sendMail({to:user.email,...t,html:t.html||`<p>Hello ${esc(user.fullName)},</p><p>Welcome to <strong>Medico</strong>. Your account has been created for <strong>${esc(user.email)}</strong>.</p><p>For your security, Medico will never email your password.</p>`})}
export async function sendResetOtp(user,otp){const t=await template('password_reset_otp','Medico Password Reset OTP','Hello {{name}},\n\nYour Medico password reset OTP is {{otp}}. It expires in 10 minutes. Do not share this OTP with anyone.',{name:user.fullName,email:user.email,otp});return sendMail({to:user.email,...t})}
export async function sendPasswordChanged(user){const t=await template('password_changed','Your Medico Password Has Been Changed','Hello {{name}},\n\nYour Medico account password has been changed successfully. If you did not make this change, contact Medico support immediately.',{name:user.fullName,email:user.email});return sendMail({to:user.email,...t})}
export async function sendEmailChangeOtp(email,otp,name='Customer'){const t=await template('email_change_otp','Medico Email Verification OTP','Hello {{name}},\n\nYour OTP to verify this new email address is {{otp}}. It expires in 10 minutes.',{name,email,otp});return sendMail({to:email,...t})}
