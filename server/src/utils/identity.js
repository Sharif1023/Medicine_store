export function normalizeBdPhone(value=''){
  let s=String(value).trim().replace(/[\s()-]/g,'');
  if(s.startsWith('+880')) s='0'+s.slice(4);
  else if(s.startsWith('880')) s='0'+s.slice(3);
  if(!/^01[3-9]\d{8}$/.test(s)) return null;
  return s;
}
export function validEmail(value=''){
  const s=String(value).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(s)?s:null;
}
export function splitFullName(value=''){
  const parts=String(value).trim().replace(/\s+/g,' ').split(' ').filter(Boolean);
  if(!parts.length) return {firstName:'',lastName:''};
  return {firstName:parts[0],lastName:parts.slice(1).join(' ')||'-'};
}
export function fullName(row){return [row.first_name,row.last_name==='-'?'':row.last_name].filter(Boolean).join(' ').trim()}
