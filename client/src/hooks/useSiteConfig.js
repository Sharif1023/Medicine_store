import {useEffect} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import http,{assetUrl} from '../api/http';
export function useSiteConfig(){
  const qc=useQueryClient();
  const q=useQuery({queryKey:['site-config'],queryFn:()=>http.get('/site-config',{headers:{'Cache-Control':'no-cache'}}).then(r=>r.data.data),staleTime:0,refetchOnWindowFocus:true});
  const theme=q.data?.settings?.['theme.active']||'clinical-teal';
  useEffect(()=>{document.documentElement.dataset.theme=theme;const brand=q.data?.settings?.['brand.name'];if(brand&&!document.title.includes('Admin'))document.title=brand;const fav=q.data?.settings?.['brand.favicon'];if(fav){let link=document.querySelector('link[rel="icon"]');if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link)}link.href=assetUrl(fav)}},[theme,q.data]);
  useEffect(()=>{const refresh=()=>{qc.invalidateQueries({queryKey:['site-config']});qc.invalidateQueries({queryKey:['home']})};const storage=e=>{if(e.key==='sc-site-refresh')refresh()};window.addEventListener('storage',storage);window.addEventListener('sc-site-refresh',refresh);return()=>{window.removeEventListener('storage',storage);window.removeEventListener('sc-site-refresh',refresh)}},[qc]);
  return q;
}
export const setting=(config,key,fallback='')=>config?.settings?.[key]??fallback;
