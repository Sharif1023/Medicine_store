import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import http from '../api/http';
import {configureTracking,installTracking,track,eligiblePath} from '../services/tracking';
export default function Tracking(){const location=useLocation(),[config,setConfig]=useState(null),[choice,setChoice]=useState(()=>localStorage.getItem('sc-tracking-consent'));
 useEffect(()=>{http.get('/tracking-config').then(r=>{setConfig(r.data.data);configureTracking(r.data.data)}).catch(()=>{})},[]);
 useEffect(()=>{if(!config||choice!=='accepted'||!eligiblePath())return;installTracking(config);track('page_view');if(location.pathname==='/checkout')track('begin_checkout');const q=new URLSearchParams(location.search).get('q');if(q)track('search',{search_term:q.slice(0,120)});const timer=setInterval(()=>{if(document.visibilityState==='visible')track('heartbeat')},45000);return()=>clearInterval(timer)},[config,choice,location.pathname,location.search]);
 useEffect(()=>{const receive=e=>track(e.detail.name,e.detail.data);window.addEventListener('sc-activity',receive);return()=>window.removeEventListener('sc-activity',receive)},[]);
 const choose=value=>{localStorage.setItem('sc-tracking-consent',value);setChoice(value);if(value==='rejected'){localStorage.removeItem('sc-visitor');sessionStorage.removeItem('sc-session');if(window.__scTrackingInstalled)window.location.reload()}};
 if(!config?.status||!eligiblePath())return null;
 return !choice?<section aria-label="Cookie choices" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-2xl rounded-2xl border bg-white p-5 shadow-2xl"><h2 className="font-bold">Your privacy choices</h2><p className="mt-2 text-sm text-slate-600">Allow optional analytics and advertising cookies to help us understand visits and improve shopping? Shopping works without them.</p><div className="mt-4 flex gap-3"><button className="btn-secondary flex-1" onClick={()=>choose('rejected')}>Reject optional</button><button className="btn-primary flex-1" onClick={()=>choose('accepted')}>Accept optional</button></div></section>:<button className="fixed bottom-2 left-2 z-40 rounded-lg border bg-white px-3 py-1 text-xs shadow" onClick={()=>{localStorage.removeItem('sc-tracking-consent');setChoice(null);if(window.__scTrackingInstalled)window.location.reload()}}>Cookie preferences</button>
}
