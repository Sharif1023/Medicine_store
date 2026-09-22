import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {encrypt,decrypt,redact} from '../src/services/credentials.js';
import {offerTotal} from '../src/services/offers.js';
import {validatePayment} from '../src/services/payments.js';
import {renderTemplate} from '../src/services/notifications.js';
import {schemas} from '../src/services/integrationSettings.js';
process.env.SETTINGS_ENCRYPTION_KEY=randomBytes(32).toString('base64');
process.env.JWT_ACCESS_SECRET='integration-test-access-secret';
process.env.JWT_REFRESH_SECRET='integration-test-refresh-secret';
test('secrets are authenticated, randomized and redacted',()=>{const a=encrypt('private-key'),b=encrypt('private-key');assert.notEqual(a,b);assert.equal(decrypt(a),'private-key');const parts=a.split('.');parts[2]=Buffer.from('tamper').toString('base64');assert.throws(()=>decrypt(parts.join('.')));assert.deepEqual(redact({api_key:a,password:b}),{api_key:'',password:'',api_key_configured:true,password_configured:true})});
test('bundles preserve leftovers, choose lowest total and never increase prices',()=>{const offers=[{minimum_quantity:3,bundle_price:240},{minimum_quantity:4,bundle_price:300}];assert.equal(offerTotal(100,2,offers).total,200);assert.equal(offerTotal(100,3,offers).total,240);assert.equal(offerTotal(100,4,offers).total,300);assert.equal(offerTotal(100,7,offers).total,580);assert.equal(offerTotal(100,6,offers).total,480);assert.equal(offerTotal(50,4,offers).total,200)});
test('money calculations use integer cents',()=>assert.equal(offerTotal(9.99,7,[{minimum_quantity:3,bundle_price:25}]).total,59.99));
test('payment confirmation rejects wrong amount, currency, transaction and risk',()=>{const v={status:'VALID',tran_id:'T123',currency:'BDT',amount:'500.00',risk_level:0},s={transaction_id:'T123'},o={total:500};assert.equal(validatePayment(v,s,o),true);for(const changed of [{amount:499},{currency:'USD'},{tran_id:'T124'},{status:'FAILED'},{risk_level:1}])assert.equal(validatePayment({...v,...changed},s,o),false)});
test('templates safely substitute known variables as plain text',()=>assert.equal(renderTemplate('Hi {{name}}, {{order_id}} {{unknown}}',{name:'<test>',order_id:'ORD-1'}),'Hi <test>, ORD-1 '));
test('settings reject invalid tracking identifiers and SMTP ports',()=>{assert.equal(schemas.email.safeParse({status:1,driver:'smtp',smtp_host:'mail.example.com',smtp_port:70000,encryption:'tls',username:'',sender_name:'Store',sender_email:'a@example.com'}).success,false);assert.equal(schemas.analytics.safeParse({status:1,meta_pixel_status:1,meta_pixel_id:'<script>',google_analytics_status:0,ga_measurement_id:'',gtm_status:0,gtm_container_id:'',custom_header_script:'',custom_footer_script:'',retention_days:90}).success,false)});

test('central notifier honors disabled channels and queues encrypted order messages',async()=>{
 const {notifyOrder}=await import('../src/services/notifications.js');const writes=[];
 const conn={execute:async(sql,params=[])=>{if(sql.startsWith('SELECT * FROM notification_settings'))return [[{email_enabled:1,sms_enabled:1,in_app_enabled:1,admin_email:'owner@example.com',admin_phone:'01700000000'}]];if(sql.startsWith('SELECT status'))return [[{status:1}]];if(sql.startsWith('SELECT * FROM message_templates'))return [[{channel:'email',subject:'Order {{order_id}}',body:'Hello {{name}}, {{amount}}'},{channel:'sms',subject:'',body:'Order {{order_id}} {{status}}'}]];writes.push({sql,params});return [{affectedRows:1}]} };
 await notifyOrder({order_number:'ORD-123',total:240,status:'confirmed'},{id:1,first_name:'Customer',email:'customer@example.com',phone:'01711111111'},'order_created','order:123',conn);
 const deliveries=writes.filter(x=>x.sql.includes('notification_outbox'));assert.equal(deliveries.length,4);assert.equal(decrypt(deliveries[0].params[5]),'Hello Customer, 240');assert.equal(deliveries[2].params[3],'owner@example.com');assert.equal(writes.filter(x=>x.sql.includes('INSERT INTO notifications')).length,1);
 const disabled={execute:async(sql)=>{if(sql.startsWith('SELECT * FROM notification_settings'))return [[{email_enabled:0,sms_enabled:0,in_app_enabled:0}]];if(sql.startsWith('SELECT * FROM message_templates'))return [[{channel:'email',body:'test'}]];throw new Error('Disabled channel attempted a write')}};
 const {notify}=await import('../src/services/notifications.js');await notify('welcome',{id:1,email:'x@example.com'}, {},'test',disabled);
});

test('SMTP service uses TLS and sends through configured credentials without leaking them',async()=>{
 const {pool}=await import('../src/config/db.js');const nodemailer=(await import('nodemailer')).default;const original=pool.execute,create=nodemailer.createTransport;let options,message;
 pool.execute=async(sql)=>sql.includes('notification_settings')?[[{email_enabled:1}]]:[[{status:1,smtp_host:'smtp.example.com',smtp_port:587,encryption:'starttls',username:'user',password:encrypt('secret'),sender_name:'Store',sender_email:'store@example.com'}]];
 nodemailer.createTransport=o=>{options=o;return {sendMail:async m=>{message=m},close(){}}};
 try{const {sendEmail}=await import('../src/services/notifications.js');await sendEmail('customer@example.com','Welcome','Hello');assert.equal(options.requireTLS,true);assert.equal(options.auth.pass,'secret');assert.equal(message.to,'customer@example.com');assert.equal(message.text,'Hello')}finally{pool.execute=original;nodemailer.createTransport=create}
});

test('SMS adapter rejects untrusted hosts and requires positive provider acknowledgement',async()=>{
 const {pool}=await import('../src/config/db.js');const original=pool.execute,fetchOriginal=global.fetch;let payload;
 process.env.SMS_ALLOWED_HOSTS='sms.example.com';pool.execute=async()=>[[{status:1,api_url:'https://sms.example.com/send',api_key:encrypt('secret'),secret_key:'',country_code:'880',sender_id:'Store'}]];
 global.fetch=async(url,opts)=>{payload=JSON.parse(opts.body);return {ok:true,json:async()=>({success:true})}};
 try{const {sendSMS}=await import('../src/services/notifications.js');await sendSMS('01711111111','Test');assert.equal(payload.to,'8801711111111');assert.equal(payload.message,'Test');process.env.SMS_ALLOWED_HOSTS='other.example.com';await assert.rejects(()=>sendSMS('01711111111','Test'),/allowlisted/)}finally{pool.execute=original;global.fetch=fetchOriginal}
});

test('outbox retries delivery failures and stops after five attempts',async()=>{
 const {pool}=await import('../src/config/db.js');const {processOutbox}=await import('../src/services/notifications.js');
 const nodemailer=(await import('nodemailer')).default;const original=pool.execute,create=nodemailer.createTransport;
 let attempts=1;const updates=[];
 pool.execute=async(sql,params=[])=>{
  if(sql.startsWith('SELECT id FROM notification_outbox'))return [[{id:7}]];
  if(sql.startsWith('SELECT * FROM notification_outbox'))return [[{id:7,channel:'email',recipient:'test@example.com',subject:'Order',body:encrypt('Message'),attempts}]];
  if(sql.includes('FROM notification_settings'))return [[{email_enabled:1}]];
  if(sql.includes('FROM email_settings'))return [[{status:1,smtp_host:'smtp.example.com',smtp_port:587,encryption:'starttls',sender_email:'store@example.com'}]];
  if(sql.includes("last_error='Delivery failed"))updates.push(params);
  return [{affectedRows:1}];
 };
 nodemailer.createTransport=()=>({sendMail:async()=>{throw new Error('Sensitive provider diagnostic')},close(){}});
 try{await processOutbox();attempts=5;await processOutbox();assert.deepEqual(updates, [['pending',60,7],['failed',960,7]])}finally{pool.execute=original;nodemailer.createTransport=create}
});

test('HTTP health works and integration routes require authentication',async()=>{
 const app=(await import('../src/app.js')).default;const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{assert.equal((await fetch(base+'/health')).status,200);for(const path of ['/api/v1/admin/payment-settings','/api/v1/admin/email-settings','/api/v1/admin/analytics/traffic'])assert.equal((await fetch(base+path)).status,401)}finally{await new Promise(resolve=>server.close(resolve))}
});

test('corrected project welcome templates retain HTML and escape customer values',async()=>{
 const {notify}=await import('../src/services/notifications.js');const writes=[];
 const conn={execute:async(sql,params=[])=>{
  if(sql.includes('FROM notification_settings'))return [[{email_enabled:1,sms_enabled:0,in_app_enabled:0}]];
  if(sql.includes('FROM message_templates'))return [[{channel:'email',subject:'Fallback',body:'Hello {{name}}'}]];
  if(sql.startsWith('SELECT status'))return [[{status:1}]];
  if(sql.includes('FROM email_templates'))return [[{is_active:1,subject:'Welcome {{name}}',text_body:'Hello {{name}}',html_body:'<b>{{name}}</b>'}]];
  writes.push(params);return [{affectedRows:1}];
 }};
 await notify('welcome',{id:2,first_name:'<Customer>',email:'c@example.com'},{},'welcome:2',conn);
 assert.equal(writes.length,1);const body=JSON.parse(decrypt(writes[0][5]));assert.equal(body.html,'<b>&lt;Customer&gt;</b>');assert.equal(body.text,'Hello <Customer>');
});

test('Email Center and account emails honor the central email disable switch',async()=>{
 const {pool}=await import('../src/config/db.js');const original=pool.execute;
 pool.execute=async sql=>sql.includes('notification_settings')?[[{email_enabled:0}]]:[[{status:1}]];
 try{const {sendMail}=await import('../src/services/mail.js');await assert.rejects(()=>sendMail({to:'c@example.com',subject:'Test',text:'Test'}),/disabled/)}finally{pool.execute=original}
});

test('new settings and preserved mailbox/OTP routes have distinct HTTP contracts',async()=>{
 const {pool}=await import('../src/config/db.js');const original=pool.execute;
 const {accessToken}=await import('../src/utils/tokens.js');const app=(await import('../src/app.js')).default;
 pool.execute=async(sql)=>{
  if(sql.includes('FROM users WHERE id='))return [[{id:1,email:'admin@example.com',is_active:1}]];
  if(sql.startsWith('SELECT 1 FROM user_roles'))return [[{allowed:1}]];
  if(sql.startsWith('SELECT p.code'))return [[{code:'*'}]];
  if(sql.includes('FROM email_settings'))return [[{id:1,status:1,smtp_host:'smtp.example.com',smtp_port:587,sender_name:'Medico',password:encrypt('secret')}]];
  throw new Error('Unexpected query '+sql);
 };
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+server.address().port+'/api/v1';const headers={Authorization:'Bearer '+accessToken(1),'Content-Type':'application/json'};
 try{
  const config=await (await fetch(base+'/admin/email-settings',{headers})).json();assert.equal(config.data.smtp_host,'smtp.example.com');assert.equal(config.data.password,'');assert.equal(config.data.password_configured,true);
  const mailbox=await (await fetch(base+'/admin/mailbox-settings',{headers})).json();assert.equal(mailbox.data.smtpHost,'smtp.example.com');assert.ok('imapHost' in mailbox.data);
  for(const path of ['/auth/forgot-password','/auth/verify-reset-otp','/auth/reset-password']){const r=await fetch(base+path,{method:'POST',headers,body:'{}'});assert.equal(r.status,400)}
 }finally{pool.execute=original;await new Promise(resolve=>server.close(resolve))}
});

test('product files are actually served and public bundles include product data',async()=>{
 const app=(await import('../src/app.js')).default;const {pool}=await import('../src/config/db.js');const original=pool.execute;
 let sqlUsed='';pool.execute=async sql=>{sqlUsed=sql;return [[{id:1,product_id:1,product_name:'Product',slug:'product',minimum_quantity:3,bundle_price:240,price_type:'strip',image:'/uploads/products/01-paracetamol-500-mg-tablet.png'}]]};
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 try{const image=await fetch(base+'/uploads/products/01-paracetamol-500-mg-tablet.png');assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/png/);assert.deepEqual([...new Uint8Array(await image.arrayBuffer()).slice(0,4)],[137,80,78,71]);
 const r=await fetch(base+'/api/v1/quantity-offers');assert.equal(r.status,200);assert.equal((await r.json()).data[0].minimum_quantity,3);assert.match(sqlUsed,/p\.is_active=1 AND p\.deleted_at IS NULL/);assert.match(sqlUsed,/q\.end_date>=NOW\(\)/)
 }finally{pool.execute=original;await new Promise(r=>server.close(r))}
});

test('email settings save one encrypted account for SMTP and optional IMAP',async()=>{
 const {pool}=await import('../src/config/db.js');const {saveSettings}=await import('../src/services/integrationSettings.js');const original=pool.execute;let values,statement;
 const row={id:1,status:0,driver:'smtp',smtp_host:'mail.example.com',smtp_port:465,encryption:'tls',username:'store@example.com',password:'',sender_name:'Medico',sender_email:'store@example.com'};
 pool.execute=async(sql,params)=>{if(sql.startsWith('UPDATE')){statement=sql;values=params;return [{affectedRows:1}]}return [[{...row}]]};
 try{await saveSettings('email',{...row,status:1,password:'mailbox-secret',imap_enabled:true,imap_host:'mail.example.com',imap_port:993,imap_sent_mailbox:'Sent'});assert.ok(values.some(v=>typeof v==='string'&&v.startsWith('v1.')));assert.ok(!values.includes('mailbox-secret'));assert.match(statement,/imap_enabled/);assert.match(statement,/imap_host/)}finally{pool.execute=original}
});

test('IMAP operations open the selected mailbox before changing flags',async()=>{
 const {pool}=await import('../src/config/db.js');const {ImapFlow}=await import('imapflow');const {setSeen}=await import('../src/services/imap.js');
 const original=pool.execute,names=['connect','getMailboxLock','messageFlagsAdd','logout'],saved=Object.fromEntries(names.map(k=>[k,ImapFlow.prototype[k]])),calls=[];
 pool.execute=async()=>[[{imap_enabled:1,imap_host:'mail.example.com',imap_port:993,username:'test@example.com',password:encrypt('secret')}]];
 ImapFlow.prototype.connect=async()=>{};ImapFlow.prototype.getMailboxLock=async mailbox=>{calls.push(mailbox);return {release(){calls.push('released')}}};ImapFlow.prototype.messageFlagsAdd=async(uid,flags)=>{calls.push([uid,flags])};ImapFlow.prototype.logout=async()=>{};
 try{await setSeen(9,true,'Sent');assert.deepEqual(calls,['Sent',[9,['\\Seen']],'released'])}finally{pool.execute=original;for(const k of names)ImapFlow.prototype[k]=saved[k]}
});
