import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import http from '../api/http';
import {track} from '../services/tracking';
export default function PaymentResult(){const [params]=useSearchParams(),[message,setMessage]=useState('Checking payment…');useEffect(()=>{http.get('/user/orders/'+params.get('order_id')).then(async r=>{const order=r.data.data;if(order.payment_status==='paid'){setMessage('Payment verified. Thank you for your order.');await track('purchase',{order_id:order.id,value:order.total})}else setMessage('Your payment is still awaiting verification. Check My Orders for its status.')}).catch(()=>setMessage('Could not verify the order. Check My Orders.'))},[params]);return <main className="container-app py-16"><div className="card mx-auto max-w-lg space-y-5 p-8"><h1 className="text-2xl font-bold">Payment status</h1><p>{message}</p><Link to="/account/orders" className="btn-primary">My Orders</Link></div></main>}
