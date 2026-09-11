import axios from 'axios';
import {useAuthStore} from '../store/auth';
export const API_BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';
export const API_ORIGIN=API_BASE.replace(/\/api\/v1\/?$/,'');
export const assetUrl=url=>!url?'':/^https?:\/\//i.test(url)?url:`${API_ORIGIN}${url.startsWith('/')?'':'/'}${url}`;
const http=axios.create({baseURL:API_BASE,withCredentials:true});
http.interceptors.request.use(c=>{const t=useAuthStore.getState().accessToken;if(t)c.headers.Authorization=`Bearer ${t}`;return c});
http.interceptors.response.use(r=>r,async e=>{const cfg=e.config;if(e.response?.status===401&&!cfg?._retry&&!String(cfg?.url||'').includes('/auth/refresh')&&!String(cfg?.url||'').includes('/auth/login')){cfg._retry=true;try{const {data}=await axios.post(API_BASE+'/auth/refresh',{}, {withCredentials:true});useAuthStore.getState().setSession(data.data);cfg.headers=cfg.headers||{};cfg.headers.Authorization=`Bearer ${data.data.accessToken}`;return http(cfg)}catch{useAuthStore.getState().logoutLocal()}}return Promise.reject(e)});
export default http;
