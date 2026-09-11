const allowedTags=new Set(['p','br','strong','b','em','i','u','s','ul','ol','li','h1','h2','h3','h4','blockquote','a','span','div','font']);

const safeColor=value=>{
  const v=String(value||'').trim();
  return /^(#[0-9a-f]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\)|[a-z]{1,24})$/i.test(v)?v:'';
};

function cleanStyle(style=''){
  const out=[];
  for(const entry of String(style).split(';')){
    const [rawKey,...parts]=entry.split(':');
    const key=String(rawKey||'').trim().toLowerCase();
    const value=parts.join(':').trim();
    if(!key||!value)continue;
    if(key==='color'){const c=safeColor(value);if(c)out.push(`color:${c}`)}
    else if(key==='background-color'){const c=safeColor(value);if(c)out.push(`background-color:${c}`)}
    else if(key==='text-align'&&/^(left|center|right|justify)$/i.test(value))out.push(`text-align:${value.toLowerCase()}`);
    else if(key==='font-weight'&&/^(normal|bold|[1-9]00)$/i.test(value))out.push(`font-weight:${value.toLowerCase()}`);
    else if(key==='font-style'&&/^(normal|italic|oblique)$/i.test(value))out.push(`font-style:${value.toLowerCase()}`);
    else if(key==='text-decoration'&&/^(none|underline|line-through|underline line-through|line-through underline)$/i.test(value))out.push(`text-decoration:${value.toLowerCase()}`);
  }
  return out.join(';');
}

export function sanitizeRichHtml(input=''){
  let html=String(input??'');
  html=html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');
  html=html.replace(/\son\w+\s*=\s*(["']).*?\1/gi,'').replace(/\son\w+\s*=\s*[^\s>]+/gi,'');
  html=html.replace(/javascript\s*:/gi,'');
  html=html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi,(m,tag,attrs)=>{
    const t=tag.toLowerCase(); if(!allowedTags.has(t)) return '';
    const closing=m.startsWith('</');
    if(t==='font'){
      if(closing)return '</span>';
      const color=(attrs.match(/color\s*=\s*(["'])(.*?)\1/i)||[])[2]||(attrs.match(/color\s*=\s*([^\s>]+)/i)||[])[1];
      const c=safeColor(color);return c?`<span style="color:${c}">`:'<span>';
    }
    if(closing) return `</${t}>`;
    let safe='';
    if(t==='a'){
      const href=(attrs.match(/href\s*=\s*(["'])(.*?)\1/i)||[])[2];
      if(href&&/^(https?:\/\/|mailto:|\/|#)/i.test(href)) safe+=` href="${href.replace(/"/g,'&quot;')}" rel="noopener noreferrer"`;
    }
    if(['span','div','p','h1','h2','h3','h4'].includes(t)){
      const style=(attrs.match(/style\s*=\s*(["'])(.*?)\1/i)||[])[2];
      const kept=cleanStyle(style||'');
      if(kept) safe+=` style="${kept.replace(/"/g,'&quot;')}"`;
    }
    return `<${t}${safe}>`;
  });
  return html.trim();
}

export function stripHtml(input=''){
  return String(input??'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}
