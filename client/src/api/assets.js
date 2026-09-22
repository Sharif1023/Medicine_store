export function resolveAssetUrl(value,apiBase='/api/v1'){
 if(typeof value!=='string'||!value.trim())return '';
 let path=value.trim().replace(/\\/g,'/');
 const base=String(apiBase).replace(/\/+$/,'').replace(/\/api\/v1$/i,'');
 if(path.startsWith('//'))return 'https:'+path;
 if(/^https?:\/\//i.test(path)){
  try{const u=new URL(path);if(['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&/^\/(?:server\/)?uploads\/(?:products|media)\//.test(u.pathname))path=u.pathname;else return path}catch{return ''}
 }
 if(/^[a-z][a-z\d+.-]*:/i.test(path))return '';
 path=path.replace(/^\.?\/?server\/uploads\//i,'/uploads/').replace(/^\.?\/?uploads\//i,'/uploads/');
 if(/^(?:products|media)\//.test(path))path='/uploads/'+path;
 if(path==='/product-placeholder.svg')return path;
 return base+(path.startsWith('/')?'':'/')+path;
}
export function imageFallback(event){const image=event.currentTarget;if(image.dataset.fallbackApplied)return;image.dataset.fallbackApplied='1';image.src='/product-placeholder.svg'}
