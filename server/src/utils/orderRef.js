import crypto from 'node:crypto';
export async function generateOrderNumber(fullName,queryFn){
  const letters=String(fullName||'').normalize('NFKD').replace(/[^A-Za-z]/g,'').toUpperCase();
  const prefix=(letters.slice(0,3)||'USR').padEnd(3,'R');
  for(let i=0;i<30;i++){
    const n=crypto.randomInt(1000000,10000000);
    const ref=`${prefix}${n}`;
    const rows=await queryFn('SELECT id FROM orders WHERE order_number=? LIMIT 1',[ref]);
    if(!rows[0]) return ref;
  }
  throw Object.assign(new Error('Could not generate unique order reference'),{status:500});
}
