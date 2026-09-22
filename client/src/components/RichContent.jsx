export default function RichContent({html='',className=''}){return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{__html:html||''}}/>}
