import {resolveAssetUrl} from './assets';
export {imageFallback} from './assets';
import axios from 'axios';
import {useAuthStore} from '../store/auth';
export const API_BASE=(import.meta.env.VITE_API_URL||'/api/v1').replace(/\/+$/,'');
export const API_ORIGIN=API_BASE.replace(/\/api\/v1\/?$/,'');
export const assetUrl=url=>resolveAssetUrl(url,API_BASE);
const http=axios.create({baseURL:API_BASE,withCredentials:true});
http.interceptors.request.use(c=>{const t=useAuthStore.getState().accessToken;if(t)c.headers.Authorization=`Bearer ${t}`;return c});
http.interceptors.response.use(r=>r,async e=>{const cfg=e.config;if(e.response?.status===401&&!cfg?._retry&&!String(cfg?.url||'').includes('/auth/refresh')&&!String(cfg?.url||'').includes('/auth/login')){cfg._retry=true;try{const {data}=await axios.post(API_BASE+'/auth/refresh',{}, {withCredentials:true});useAuthStore.getState().setSession(data.data);cfg.headers=cfg.headers||{};cfg.headers.Authorization=`Bearer ${data.data.accessToken}`;return http(cfg)}catch{useAuthStore.getState().logoutLocal()}}return Promise.reject(e)});

// Observe successful shopping actions only; no credential or customer payload is sent.
http.interceptors.response.use(response=>{const c=response.config,u=c.url||'',method=c.method;let d={};try{d=typeof c.data==='string'?JSON.parse(c.data):c.data||{}}catch{}
 const emit=(name,data={})=>window.dispatchEvent(new CustomEvent('sc-activity',{detail:{name,data}}));
 if(method==='post'&&u==='/user/cart/items')emit('add_to_cart',{product_id:Number(d.productId)});
 if(method==='post'&&/^\/user\/wishlist\/\d+$/.test(u))emit('add_to_wishlist',{product_id:Number(u.split('/').pop())});
 if(method==='get'&&/^\/products\/[^/?]+$/.test(u)&&response.data?.data?.id)emit('view_item',{product_id:Number(response.data.data.id)});
 return response;
});
export default http;
