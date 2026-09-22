import {ImapFlow} from 'imapflow';
import {simpleParser} from 'mailparser';
import sanitizeHtml from 'sanitize-html';
import {readSettings} from './integrationSettings.js';
export async function mailboxName(mode){const settings=await readSettings('email');return mode==='sent'?(settings?.imap_sent_mailbox||'Sent'):'INBOX'}
async function client(){
 const s=await readSettings('email',1,true);
 if(!s?.imap_enabled||!s.imap_host||!s.username||!s.password)throw Object.assign(new Error('Enable inbox access and configure incoming server in Email Settings'),{status:503});
 return new ImapFlow({host:s.imap_host,port:s.imap_port,secure:true,auth:{user:s.username,pass:s.password},logger:false,connectionTimeout:12000,greetingTimeout:12000,socketTimeout:20000});
}

const cleanHtml=h=>sanitizeHtml(h||'',{allowedTags:['p','br','b','strong','i','em','u','ul','ol','li','blockquote','a','table','thead','tbody','tr','th','td','div','span'],allowedAttributes:{a:['href','title'],td:['colspan','rowspan'],th:['colspan','rowspan']},allowedSchemes:['http','https','mailto']});
export async function verifyImap(){const c=await client();try{await c.connect();return true}finally{await c.logout().catch(()=>{})}}
export async function listMailbox({mailbox='INBOX',page=1,limit=30,search=''}){
  const c=await client();try{await c.connect();const lock=await c.getMailboxLock(mailbox);try{const total=c.mailbox.exists||0;let uids=[];if(search){uids=await c.search({or:[{subject:search},{from:search},{body:search}]},{uid:true})}else{const start=Math.max(1,total-(page*limit)+1),end=Math.max(0,total-((page-1)*limit));if(end>=start)uids=Array.from({length:end-start+1},(_,i)=>start+i)}if(search)uids=uids.slice().sort((a,b)=>b-a).slice((page-1)*limit,page*limit);const out=[];if(uids.length)for await (const m of c.fetch(uids,{uid:true,envelope:true,flags:true,internalDate:true,source:true},{uid:Boolean(search)})) {const parsed=await simpleParser(m.source);out.push({uid:m.uid,subject:m.envelope?.subject||'(no subject)',from:parsed.from?.text||'',fromAddress:parsed.from?.value?.[0]?.address||'',date:m.internalDate,seen:m.flags?.has('\\Seen')||false,preview:String(parsed.text||'').replace(/\s+/g,' ').slice(0,180)});}return {items:out.sort((a,b)=>b.uid-a.uid),total,page,limit};}finally{lock.release()}}finally{await c.logout().catch(()=>{})}}
export async function getMessage(uid,mailbox='INBOX'){
  const c=await client();try{await c.connect();const lock=await c.getMailboxLock(mailbox);try{const m=await c.fetchOne(Number(uid),{uid:true,envelope:true,flags:true,internalDate:true,source:true},{uid:true});if(!m)return null;await c.messageFlagsAdd(Number(uid),['\\Seen'],{uid:true});const p=await simpleParser(m.source);return {uid:m.uid,messageId:p.messageId||'',subject:p.subject||'(no subject)',from:p.from?.text||'',fromAddress:p.from?.value?.[0]?.address||'',to:p.to?.text||'',date:p.date||m.internalDate,text:p.text||'',html:cleanHtml(typeof p.html==='string'?p.html:''),attachments:(p.attachments||[]).map((a,i)=>({index:i,filename:a.filename||`attachment-${i+1}`,contentType:a.contentType,size:a.size}))};}finally{lock.release()}}finally{await c.logout().catch(()=>{})}}
export async function setSeen(uid,seen=true,mailbox='INBOX'){const c=await client();try{await c.connect();const lock=await c.getMailboxLock(mailbox);try{if(seen)await c.messageFlagsAdd(Number(uid),['\\Seen'],{uid:true});else await c.messageFlagsRemove(Number(uid),['\\Seen'],{uid:true});return true}finally{lock.release()}}finally{await c.logout().catch(()=>{})}}
export async function deleteMessage(uid,mailbox='INBOX'){const c=await client();try{await c.connect();const lock=await c.getMailboxLock(mailbox);try{await c.messageDelete(Number(uid),{uid:true});return true}finally{lock.release()}}finally{await c.logout().catch(()=>{})}}

export async function getAttachment(uid,index,mailbox='INBOX'){
  const c=await client();
  try{
    await c.connect();
    const lock=await c.getMailboxLock(mailbox);
    try{
      const m=await c.fetchOne(Number(uid),{source:true},{uid:true});
      if(!m)return null;
      const p=await simpleParser(m.source);
      const a=(p.attachments||[])[Number(index)];
      if(!a)return null;
      return {filename:a.filename||`attachment-${Number(index)+1}`,contentType:a.contentType||'application/octet-stream',content:a.content,size:a.size||a.content?.length||0};
    }finally{lock.release()}
  }finally{await c.logout().catch(()=>{})}
}
