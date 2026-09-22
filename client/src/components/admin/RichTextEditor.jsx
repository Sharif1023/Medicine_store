import {adminConfirm,adminPrompt,adminAlert} from './AdminDialogs';
import {useEffect,useRef,useState} from 'react';
import {Bold,Italic,Underline,List,ListOrdered,Link2,RemoveFormatting,AlignLeft,AlignCenter,AlignRight} from 'lucide-react';

export default function RichTextEditor({value='',onChange,placeholder='Write content...',minHeight=150}){
  const ref=useRef(null);const [focused,setFocused]=useState(false);
  useEffect(()=>{if(ref.current&&!focused&&ref.current.innerHTML!==(value||''))ref.current.innerHTML=value||''},[value,focused]);
  const command=(cmd,val=null)=>{ref.current?.focus();if(['foreColor','hiliteColor'].includes(cmd))document.execCommand('styleWithCSS',false,true);document.execCommand(cmd,false,val);onChange?.(ref.current?.innerHTML||'')};
  const link=async()=>{const selection=window.getSelection();const range=selection?.rangeCount?selection.getRangeAt(0).cloneRange():null;const url=await adminPrompt('Enter link URL (https://..., /page, mailto:...)');if(url&&/^(https?:\/\/|\/(?!\/)|mailto:)/i.test(url)){if(range){selection.removeAllRanges();selection.addRange(range)}command('createLink',url)}};
  const tools=[
    [Bold,'bold','Bold'],[Italic,'italic','Italic'],[Underline,'underline','Underline'],[List,'insertUnorderedList','Bullets'],[ListOrdered,'insertOrderedList','Numbered list'],[AlignLeft,'justifyLeft','Align left'],[AlignCenter,'justifyCenter','Align center'],[AlignRight,'justifyRight','Align right']
  ];
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
    <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2">
      <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs" onChange={e=>{if(e.target.value)command('formatBlock',e.target.value)}} defaultValue=""><option value="">Format</option><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="blockquote">Quote</option></select>
      {tools.map(([I,c,t])=><button type="button" key={c} title={t} onMouseDown={e=>e.preventDefault()} onClick={()=>command(c)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white hover:shadow-sm"><I size={16}/></button>)}
      <button type="button" title="Add link" onMouseDown={e=>e.preventDefault()} onClick={link} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white"><Link2 size={16}/></button>
      <label title="Text color" className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold hover:bg-white">A<input type="color" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" onChange={e=>command('foreColor',e.target.value)}/></label><label title="Highlight color" className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold hover:bg-white">▰<input type="color" defaultValue="#fff59d" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" onChange={e=>command('hiliteColor',e.target.value)}/></label>
      <button type="button" title="Clear formatting" onMouseDown={e=>e.preventDefault()} onClick={()=>command('removeFormat')} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white"><RemoveFormatting size={16}/></button>
    </div>
    <div ref={ref} contentEditable suppressContentEditableWarning data-placeholder={placeholder} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onInput={e=>onChange?.(e.currentTarget.innerHTML)} className="rich-editor px-4 py-3 text-sm leading-7" style={{minHeight}} />
    <style>{`.rich-editor:empty:before{content:attr(data-placeholder);color:#94a3b8}.rich-editor h2{font-size:1.35rem;font-weight:800;margin:.5rem 0}.rich-editor h3{font-size:1.1rem;font-weight:700;margin:.5rem 0}.rich-editor ul{list-style:disc;padding-left:1.5rem}.rich-editor ol{list-style:decimal;padding-left:1.5rem}.rich-editor blockquote{border-left:3px solid rgb(var(--brand-500));padding-left:12px;color:#64748b}`}</style>
  </div>
}
