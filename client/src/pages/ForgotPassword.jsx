import {useState} from 'react';
import {Link} from 'react-router-dom';
import http from '../api/http';
import {AuthShell} from './Login';
export default function ForgotPassword(){
  const [step,setStep]=useState(1),[email,setEmail]=useState(''),[otp,setOtp]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[msg,setMsg]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const run=async(fn)=>{setBusy(true);setErr('');setMsg('');try{await fn()}catch(e){setErr(e.response?.data?.message||'Request failed')}finally{setBusy(false)}};
  const send=e=>{e.preventDefault();run(async()=>{const r=await http.post('/auth/forgot-password',{email});setMsg(r.data.message);setStep(2)})};
  const verify=e=>{e.preventDefault();run(async()=>{await http.post('/auth/verify-reset-otp',{email,otp});setStep(3);setMsg('OTP verified. Set your new password.')})};
  const reset=e=>{e.preventDefault();if(password!==confirm)return setErr('Passwords do not match');run(async()=>{const r=await http.post('/auth/reset-password',{email,otp,password});setMsg(r.data.message);setStep(4)})};
  return <AuthShell title="Reset password"><div className="space-y-4">{msg&&<div className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{msg}</div>}{err&&<div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</div>}
    {step===1&&<form onSubmit={send} className="space-y-4"><input className="input" type="email" placeholder="Registered email" value={email} onChange={e=>setEmail(e.target.value)} required/><button disabled={busy} className="btn-primary w-full">Send OTP</button></form>}
    {step===2&&<form onSubmit={verify} className="space-y-4"><input className="input" inputMode="numeric" maxLength={6} placeholder="6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required/><button disabled={busy} className="btn-primary w-full">Verify OTP</button><button type="button" className="btn-secondary w-full" onClick={()=>send({preventDefault(){}})}>Resend OTP</button></form>}
    {step===3&&<form onSubmit={reset} className="space-y-4"><input className="input" type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required/><input className="input" type="password" placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)} required/><button disabled={busy} className="btn-primary w-full">Change Password</button></form>}
    {step===4&&<Link className="btn-primary w-full" to="/login">Back to Login</Link>}
  </div></AuthShell>
}
