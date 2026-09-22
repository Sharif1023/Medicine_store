import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
const file=new URL('../../.env',import.meta.url);
let text=fs.existsSync(file)?fs.readFileSync(file,'utf8'):fs.readFileSync(new URL('../../.env.example',import.meta.url),'utf8');
const existing=text.match(/^SETTINGS_ENCRYPTION_KEY=(.*)$/m)?.[1]?.trim();
if(existing&&Buffer.from(existing.replace(/^["']|["']$/g,''),'base64').length!==32)throw new Error('Existing SETTINGS_ENCRYPTION_KEY is invalid. Restore your valid backed-up key; do not overwrite a key used for saved credentials.');
if(existing){console.log('Existing key retained. Back up server/.env.');process.exit(0)}
if(process.env.SETTINGS_ENCRYPTION_KEY){console.log('Hosting environment already provides a key; it was not changed.');process.exit(0)}
const line='SETTINGS_ENCRYPTION_KEY='+randomBytes(32).toString('base64');
text=/^SETTINGS_ENCRYPTION_KEY=.*$/m.test(text)?text.replace(/^SETTINGS_ENCRYPTION_KEY=.*$/m,line):text+'\n'+line+'\n';
fs.writeFileSync(file,text,{mode:0o600});console.log('Encryption key saved in server/.env. Back up this file; do not regenerate the key.');
