import {useEffect,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {Save,UserRound} from 'lucide-react';
import http from '../../api/http';

export default function Profile(){
  const qc=useQueryClient();const q=useQuery({queryKey:['user-profile'],queryFn:()=>http.get('/user/profile').then(r=>r.data.data)});const [form,setForm]=useState({firstName:'',lastName:'',phone:''});const [busy,setBusy]=useState(false);
  useEffect(()=>{if(q.data)setForm({firstName:q.data.first_name||'',lastName:q.data.last_name||'',phone:q.data.phone||''})},[q.data]);
  const save=async e=>{e.preventDefault();setBusy(true);try{await http.patch('/user/profile',form);await qc.invalidateQueries({queryKey:['user-profile']});alert('Profile updated successfully.')}catch(e){alert(e.response?.data?.message||'Could not update profile')}finally{setBusy(false)}};
  return <div className="card p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><UserRound/></div><div><h1 className="text-2xl font-black">My Profile</h1><p className="text-sm text-slate-500">Update your customer information.</p></div></div><form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="label">First name</span><input className="input" value={form.firstName} onChange={e=>setForm(x=>({...x,firstName:e.target.value}))} required/></label><label><span className="label">Last name</span><input className="input" value={form.lastName} onChange={e=>setForm(x=>({...x,lastName:e.target.value}))} required/></label><label><span className="label">Phone</span><input className="input" value={form.phone} onChange={e=>setForm(x=>({...x,phone:e.target.value}))} required/></label><label><span className="label">Email</span><input className="input bg-slate-50" value={q.data?.email||''} readOnly/><span className="mt-1 block text-xs text-slate-400">Email is kept read-only for account safety.</span></label><div className="sm:col-span-2"><button disabled={busy} className="btn-primary"><Save size={17}/>{busy?'Saving...':'Save Profile'}</button></div></form></div>
}
