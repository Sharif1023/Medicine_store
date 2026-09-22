import {useEffect,useRef,useState} from 'react';
let listener;const waiting=[];
function ask(kind,message,value=''){return new Promise(resolve=>{waiting.push({kind,message,value,resolve});listener?.()})}
export const adminConfirm=message=>ask('confirm',message);
export const adminPrompt=(message,value='')=>ask('prompt',message,value);
export const adminAlert=message=>ask('alert',message);
export default function AdminDialogs(){const [current,setCurrent]=useState(null),[value,setValue]=useState('');const dialog=useRef(null),previous=useRef(null),active=useRef(null);
 useEffect(()=>{listener=()=>{if(!active.current){const next=waiting.shift()||null;active.current=next;setCurrent(next)}};listener();return()=>{listener=null;waiting.splice(0).forEach(x=>x.resolve(null))}},[]);
 useEffect(()=>{if(current){setValue(current.value);previous.current=document.activeElement;dialog.current?.showModal()}return()=>dialog.current?.close()},[current]);
 const finish=result=>{current.resolve(result);active.current=null;setCurrent(null);previous.current?.focus();setTimeout(()=>listener?.(),0)};
 const options=current?.kind==='prompt'&&current.message.startsWith('Status:')?current.message.slice(7).split(',').map(x=>x.trim()):null;
 return current?<dialog ref={dialog} onCancel={e=>{e.preventDefault();finish(null)}} className="w-[min(92vw,560px)] rounded-2xl p-6 shadow-2xl backdrop:bg-slate-950/50"><form onSubmit={e=>{e.preventDefault();finish(current.kind==='prompt'?value:true)}}><h2 className="text-xl font-black">{current.kind==='confirm'?'Confirm action':current.kind==='alert'?'Message':'Update details'}</h2><p className="mt-3 text-sm text-slate-600">{current.message}</p>{options?<div className="mt-5 flex flex-wrap gap-2">{options.map(o=><button type="button" aria-pressed={value===o} onClick={()=>setValue(o)} key={o} className={value===o?'btn-primary':'btn-secondary'}>{o.replaceAll('_',' ')}</button>)}</div>:current.kind==='prompt'?<input autoFocus className="input mt-5" value={value} onChange={e=>setValue(e.target.value)}/>:null}<div className="mt-6 flex justify-end gap-3">{current.kind!=='alert'&&<button type="button" className="btn-secondary" onClick={()=>finish(null)}>Cancel</button>}<button className="btn-primary">{current.kind==='alert'?'OK':current.kind==='confirm'?'Confirm':'Continue'}</button></div></form></dialog>:null
}
