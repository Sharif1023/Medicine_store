import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import http,{assetUrl,imageFallback} from '../api/http';
import ProductCard from '../components/ProductCard';
import {useAuthStore} from '../store/auth';
export default function Offers(){
 const campaigns=useQuery({queryKey:['public-offers'],queryFn:()=>http.get('/offers').then(r=>r.data.data)});
 const bundles=useQuery({queryKey:['public-quantity-offers'],queryFn:()=>http.get('/quantity-offers').then(r=>r.data.data),refetchInterval:60000});
 return <main className="container-app py-10"><h1 className="text-3xl font-black">Offers</h1><p className="mt-2 text-slate-500">Explore current campaigns and save with quantity bundles.</p>
 <section className="mt-8"><h2 className="text-2xl font-black">Quantity Offers</h2><p className="mt-2 text-sm text-slate-500">Bundle prices apply automatically in your cart. Prescription requirements still apply.</p>
 {bundles.isLoading?<p className="mt-5">Loading bundles…</p>:bundles.isError?<p role="alert" className="mt-5 text-red-600">Could not load quantity offers. <button onClick={()=>bundles.refetch()} className="underline">Retry</button></p>:<div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{bundles.data?.map(o=><Bundle key={o.id} offer={o}/>)}</div>}
 {bundles.data?.length===0&&<p className="mt-5 text-slate-500">No active quantity bundles right now.</p>}</section>
 <section className="mt-12"><h2 className="text-2xl font-black">Campaign Offers</h2>{campaigns.isLoading?<p className="mt-5">Loading campaigns…</p>:campaigns.isError?<p role="alert" className="mt-5 text-red-600">Could not load campaigns. <button onClick={()=>campaigns.refetch()} className="underline">Retry</button></p>:<div className="mt-6 space-y-10">{campaigns.data?.map(o=><section key={o.id}><h3 className="mb-2 text-xl font-bold">{o.title}</h3>{o.description&&<p className="mb-4 text-slate-500">{o.description}</p>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{o.products?.map(p=><ProductCard key={p.id} p={p}/>)}</div></section>)}{campaigns.data?.length===0&&<p className="text-slate-500">No active campaigns right now.</p>}</div>}</section></main>
}
function Bundle({offer:o}){
 const user=useAuthStore(s=>s.user),nav=useNavigate(),qc=useQueryClient();const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const quantity=Number(o.minimum_quantity),price=Number((o.price_type==='strip'?o.strip_price:o.price_type==='box'?o.box_price:o.unit_price)||o.sale_price),regular=price*quantity,total=Math.min(regular,Number(o.bundle_price));
 const multiplier=o.price_type==='strip'?Math.max(1,Number(o.units_per_strip)):o.price_type==='box'?Math.max(1,Number(o.units_per_box)):1,available=Number(o.stock)>=quantity*multiplier;
 const add=async()=>{if(!user){nav('/login');return}setBusy(true);setMessage('');try{await http.post('/user/cart/items',{productId:o.product_id,priceType:o.price_type,quantity});await qc.invalidateQueries({queryKey:['cart']});setMessage('Bundle added. Your cart applies the best eligible price.')}catch(e){setMessage(e.response?.data?.message||'Could not add this bundle')}finally{setBusy(false)}};
 return <article className="card overflow-hidden p-5"><Link to={'/product/'+o.slug}><img className="h-44 w-full object-contain" src={assetUrl(o.image)||'/product-placeholder.svg'} onError={imageFallback} alt={o.product_name}/><h3 className="mt-4 text-lg font-bold">{o.product_name}</h3></Link><p className="mt-1 font-semibold text-brand-700">{o.name}</p><p className="mt-2">{quantity} {o.price_type}{quantity>1?'s':''} for <b>৳{total.toFixed(2)}</b></p>{regular>total&&<p className="text-sm text-emerald-700">Save ৳{(regular-total).toFixed(2)} <span className="ml-2 text-slate-400 line-through">৳{regular.toFixed(2)}</span></p>}<p className="mt-2 text-xs text-slate-500">Ends {new Date(o.end_date).toLocaleString()}{o.prescription_required?' · Approved prescription required':''}</p><button disabled={busy||!available} className="btn-primary mt-4 w-full disabled:opacity-50" onClick={add}>{busy?'Adding…':available?'Add bundle to cart':'Insufficient stock'}</button>{message&&<p role="status" className="mt-3 text-sm">{message} <Link className="underline" to="/cart">View cart</Link></p>}</article>
}
