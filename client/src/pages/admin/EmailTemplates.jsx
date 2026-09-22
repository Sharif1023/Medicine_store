import {adminAlert,adminConfirm,adminPrompt} from '../../components/admin/AdminDialogs';
import {useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import http from '../../api/http';

export default function EmailTemplates(){
  const qc=useQueryClient();
  const q=useQuery({queryKey:['email-templates'],queryFn:()=>http.get('/admin/email-templates').then(r=>r.data.data)});
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({subject:'',textBody:'',htmlBody:'',active:true});
  const open=t=>{setEditing(t.template_key);setForm({subject:t.subject||'',textBody:t.text_body||'',htmlBody:t.html_body||'',active:Boolean(t.is_active)})};
  const save=async()=>{try{await http.put('/admin/email-templates/'+encodeURIComponent(editing),form);setEditing(null);qc.invalidateQueries({queryKey:['email-templates']})}catch(e){adminAlert(e.response?.data?.message||'Could not save template')}};
  return <><h1 className="admin-page-title">Email Templates</h1><p className="mt-1 text-sm text-slate-500">Edit the server-side templates used for welcome, password reset and verification emails. Passwords and SMTP secrets are never stored here.</p>
    <div className="mt-6 space-y-3">{(q.data||[]).map(t=><div className="admin-section" key={t.template_key}>{editing===t.template_key?<div className="space-y-4"><div className="text-sm font-bold text-slate-500">{t.template_key}</div><label><span className="label">Subject</span><input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label><span className="label">Text body</span><textarea className="input min-h-40" value={form.textBody} onChange={e=>setForm({...form,textBody:e.target.value})}/></label><label><span className="label">HTML body (optional)</span><textarea className="input min-h-32 font-mono text-xs" value={form.htmlBody} onChange={e=>setForm({...form,htmlBody:e.target.value})}/></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label><div className="flex gap-2"><button className="btn-primary" onClick={save}>Save Template</button><button className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button></div></div>:<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold">{t.template_key}</div><div className="mt-1 text-sm text-slate-600">{t.subject}</div><div className="mt-1 text-xs text-slate-400">{t.is_active?'Active':'Disabled'}</div></div><button className="btn-secondary" onClick={()=>open(t)}>Edit</button></div>}</div>)}</div>
    <div className="admin-section mt-6 text-sm text-slate-600"><b>Available placeholders:</b> <code>{'{{name}}'}</code>, <code>{'{{email}}'}</code>, <code>{'{{otp}}'}</code>. Only use OTP in OTP templates.</div>
  </>;
}
