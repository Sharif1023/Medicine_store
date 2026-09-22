import {query} from '../config/db.js';

export async function getSettingsMap(){
  const rows=await query('SELECT setting_key,setting_value FROM store_settings');
  return Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value]));
}

export async function getSetting(key,fallback=''){
  const row=(await query('SELECT setting_value FROM store_settings WHERE setting_key=?',[key]))[0];
  return row?.setting_value ?? fallback;
}

export async function setSetting(key,value){
  await query('INSERT INTO store_settings(setting_key,setting_value) VALUES(?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',[key,String(value??'')]);
}

export async function setSettings(values={}){
  const entries=Object.entries(values);
  for(const [key,value] of entries) await setSetting(key,typeof value==='string'?value:JSON.stringify(value));
}

export function parseJsonSetting(value,fallback){
  if(value==null||value==='') return fallback;
  try{return JSON.parse(value)}catch{return fallback}
}
