import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
function key(){const k=Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY||'','base64');if(k.length!==32)throw Object.assign(new Error('Configure SETTINGS_ENCRYPTION_KEY (32 random bytes, base64)'),{status:503});return k}
export function encrypt(value){if(!value)return '';const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key(),iv),data=Buffer.concat([c.update(String(value),'utf8'),c.final()]);return ['v1',iv.toString('base64'),data.toString('base64'),c.getAuthTag().toString('base64')].join('.')}
export function decrypt(value){if(!value)return '';try{const [v,iv,data,tag]=value.split('.');if(v!=='v1')throw new Error('Invalid encrypted credential');const d=createDecipheriv('aes-256-gcm',key(),Buffer.from(iv,'base64'));d.setAuthTag(Buffer.from(tag,'base64'));return Buffer.concat([d.update(Buffer.from(data,'base64')),d.final()]).toString('utf8')}catch(e){if(e.status)throw e;throw Object.assign(new Error('Saved credentials could not be decrypted. Restore the original SETTINGS_ENCRYPTION_KEY and restart the app.'),{status:503})}}

export const secretFields=['api_key','secret_key','password'];
export function redact(row){const out={...row};for(const k of secretFields)if(k in out){out[k+'_configured']=Boolean(out[k]);out[k]=''}return out}
