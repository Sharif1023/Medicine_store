import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Menu,
  Heart,
  ChevronDown,
  X,
} from 'lucide-react';

import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  useEffect,
  useState,
} from 'react';

import {useQuery} from '@tanstack/react-query';

import {useAuthStore} from '../store/auth';
import {useSiteConfig,setting} from '../hooks/useSiteConfig';
import http,{assetUrl} from '../api/http';


/* =========================================================
   HELPERS
   ========================================================= */

const isExternal=(url)=>
  /^https?:\/\//i.test(url||'');


function SmartLink({
  item,
  className='',
  children,
  onClick,
}){

  if(isExternal(item.url)){

    return(
      <a
        href={item.url}
        target={
          item.open_new_tab
            ? '_blank'
            : undefined
        }
        rel={
          item.open_new_tab
            ? 'noreferrer'
            : undefined
        }
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );

  }


  return(
    <Link
      to={item.url||'/'}
      target={
        item.open_new_tab
          ? '_blank'
          : undefined
      }
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );

}


/* =========================================================
   HEADER
   ========================================================= */

export default function Header(){

  const [q,setQ]=useState('');

  const [mobile,setMobile]=useState(false);

  const nav=useNavigate();

  const location=useLocation();

  const user=useAuthStore(
    s=>s.user
  );

  const {data:cfg}=useSiteConfig();


  /* =======================================================
     BRAND
     ======================================================= */

  const brand=setting(
    cfg,
    'brand.name',
    'ShasthoCare'
  );


  const logo=setting(
    cfg,
    'brand.logo',
    ''
  );


  const announcement=setting(
    cfg,
    'announcement.text',
    ''
  );


  /* =======================================================
     SEARCH SUGGESTIONS
     ======================================================= */

  const suggestions=useQuery({

    queryKey:[
      'suggest',
      q
    ],

    enabled:
      q.trim().length>=2,

    queryFn:()=>
      http
        .get(
          '/search/suggestions',
          {
            params:{
              q,
            },
          }
        )
        .then(
          r=>r.data.data
        ),

  });


  /* =======================================================
     CLOSE MOBILE
     ======================================================= */

  const closeMobile=()=>{

    setMobile(false);

  };


  /* =======================================================
     BODY SCROLL LOCK + ESCAPE CLOSE
     ======================================================= */

  useEffect(()=>{

    if(!mobile){
      return;
    }


    const oldBodyOverflow=
      document.body.style.overflow;

    const oldHtmlOverflow=
      document.documentElement.style.overflow;


    document.body.style.overflow=
      'hidden';

    document.documentElement.style.overflow=
      'hidden';


    const handleKeyDown=(event)=>{

      if(event.key==='Escape'){

        setMobile(false);

      }

    };


    window.addEventListener(
      'keydown',
      handleKeyDown
    );


    return()=>{

      document.body.style.overflow=
        oldBodyOverflow;

      document.documentElement.style.overflow=
        oldHtmlOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

    };

  },[mobile]);


  /* =======================================================
     CLOSE DRAWER AFTER ROUTE CHANGE
     ======================================================= */

  useEffect(()=>{

    setMobile(false);

  },[
    location.pathname,
    location.search
  ]);


  /* =======================================================
     SEARCH SUBMIT
     ======================================================= */

  const go=(e)=>{

    e.preventDefault();

    const value=
      q.trim();


    setMobile(false);


    nav(
      '/products?q='+
      encodeURIComponent(
        value
      )
    );

  };


  /* =======================================================
     NAVIGATION DATA
     ======================================================= */

  const configured=(
    cfg?.navigation||
    []
  ).filter(
    x=>
      x.location===
      'header'
  );


  const top=
    configured.filter(
      x=>!x.parent_id
    );


  const children=(id)=>
    configured.filter(
      x=>
        Number(
          x.parent_id
        )===
        Number(id)
    );


  const fallback=[

    {
      id:'home',
      label:'Home',
      url:'/',
    },

    ...(cfg?.categories||[])
      .slice(0,6)
      .map(x=>({

        id:'c'+x.id,

        label:x.name,

        url:
          '/products?category='+
          x.slug,

      })),

    {
      id:'offers',
      label:'Offers',
      url:
        '/products?sort=price_asc',
    },

  ];


  const menu=
    top.length>0
      ? top
      : fallback;


  /* =======================================================
     ACTIVE MENU
     ======================================================= */

  const isActive=(item)=>{

    if(
      !item?.url||
      isExternal(item.url)
    ){
      return false;
    }


    const current=
      location.pathname+
      location.search;


    if(item.url==='/'){

      return(
        location.pathname===
        '/'
      );

    }


    return(
      current===item.url||
      location.pathname===
        item.url
    );

  };


  /* =======================================================
     RENDER
     ======================================================= */

  return(
    <>


      {/* =================================================
          ANNOUNCEMENT
          ================================================= */}

      {setting(
        cfg,
        'announcement.enabled',
        '0'
      )!=='0'&&
        announcement&&(

        <div className="relative z-[70] bg-brand-700 px-4 py-2 text-center text-xs font-semibold text-white">

          {announcement}

        </div>

      )}


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="sticky top-0 z-[70] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">


        {/* ===============================================
            TOP ROW
            =============================================== */}

        <div className="container-app flex h-20 items-center gap-3 sm:gap-4">


          {/* =============================================
              LOGO + BRAND NAME
              ============================================= */}

          <Link
            to="/"
            onClick={
              closeMobile
            }
            className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          >

            {logo?(

              <img
                src={
                  assetUrl(
                    logo
                  )
                }
                alt={brand}
                className="
                  h-9
                  w-auto
                  max-w-[52px]
                  shrink-0
                  object-contain
                  min-[380px]:max-w-[65px]
                  sm:h-11
                  sm:max-w-[90px]
                  lg:max-w-[110px]
                "
              />

            ):(

              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-lg font-black text-white sm:h-10 sm:w-10 sm:text-xl">
                +
              </span>

            )}


            {/* BRAND NAME ALWAYS VISIBLE */}

            <span
              className="
                max-w-[85px]
                truncate
                text-base
                font-black
                leading-tight
                text-slate-900
                min-[380px]:max-w-[115px]
                min-[380px]:text-lg
                sm:max-w-[160px]
                sm:text-xl
                lg:max-w-[200px]
                lg:text-2xl
              "
              title={brand}
            >
              {brand}
            </span>

          </Link>


          {/* =============================================
              DESKTOP SEARCH
              ============================================= */}

          <div className="relative hidden min-w-0 flex-1 md:block">

            <form
              onSubmit={go}
              className="flex max-w-2xl items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-brand-400 focus-within:bg-white"
            >

              <Search
                size={18}
                className="mr-3 shrink-0 text-slate-400"
              />


              <input
                value={q}

                onChange={e=>
                  setQ(
                    e.target.value
                  )
                }

                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"

                placeholder={
                  setting(
                    cfg,
                    'header.search_placeholder',
                    'Search medicines, healthcare products...'
                  )
                }
              />


              <button
                type="submit"
                aria-label="Search"
                className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700"
              >

                <Search size={17}/>

              </button>

            </form>


            {/* DESKTOP SEARCH SUGGESTIONS */}

            {q.trim().length>=2&&
              (
                suggestions.data||
                []
              ).length>0&&(

              <div className="absolute left-0 top-[56px] z-[120] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                {(
                  suggestions.data||
                  []
                ).map(s=>(

                  <Link
                    key={s.slug}

                    to={
                      '/product/'+
                      s.slug
                    }

                    onClick={()=>{
                      setQ('');
                    }}

                    className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-brand-50"
                  >

                    <div className="text-sm font-bold text-slate-900">
                      {s.name}
                    </div>


                    {s.generic_name&&(

                      <div className="mt-0.5 text-xs text-slate-500">
                        {s.generic_name}
                      </div>

                    )}

                  </Link>

                ))}

              </div>

            )}

          </div>


          {/* =============================================
              HEADER ACTIONS
              ============================================= */}

          <nav className="ml-auto flex shrink-0 items-center gap-2 text-xs font-semibold sm:gap-4">


            {/* TRACK ORDER */}

            <Link
              to="/track"
              className="hidden flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700 lg:flex"
            >

              <MapPin size={20}/>

              <span>
                Track Order
              </span>

            </Link>


            {/* ACCOUNT */}

            <Link
              to={
                user
                  ? '/account'
                  : '/login'
              }
              className="flex flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700"
            >

              <User size={20}/>

              <span className="hidden min-[360px]:block">

                {user
                  ? 'Account'
                  : 'Sign In'
                }

              </span>

            </Link>


            {/* WISHLIST */}

            <Link
              to="/account/wishlist"
              className="hidden flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700 sm:flex"
            >

              <Heart size={20}/>

              <span>
                Wishlist
              </span>

            </Link>


            {/* CART */}

            <Link
              to="/cart"
              className="flex flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700"
            >

              <ShoppingCart
                size={20}
              />

              <span className="hidden min-[360px]:block">
                Cart
              </span>

            </Link>


            {/* =========================================
                MOBILE MENU BUTTON
                ========================================= */}

            <button
              type="button"

              aria-label={
                mobile
                  ? 'Close menu'
                  : 'Open menu'
              }

              aria-controls="mobile-navigation"

              aria-expanded={
                mobile
              }

              onClick={()=>
                setMobile(
                  prev=>!prev
                )
              }

              className={`grid h-10 w-10 place-items-center rounded-xl transition md:hidden ${
                mobile
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >

              {mobile?(

                <X size={22}/>

              ):(

                <Menu size={22}/>

              )}

            </button>

          </nav>

        </div>


        {/* ===============================================
            MOBILE SEARCH
            =============================================== */}

        <div className="border-t border-slate-100 md:hidden">

          <div className="container-app relative py-3">

            <form
              onSubmit={go}
              className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-brand-400 focus-within:bg-white"
            >

              <Search
                size={17}
                className="mr-2 shrink-0 text-slate-400"
              />


              <input
                value={q}

                onChange={e=>{

                  setQ(
                    e.target.value
                  );

                  if(mobile){

                    setMobile(
                      false
                    );

                  }

                }}

                className="min-w-0 flex-1 bg-transparent text-sm outline-none"

                placeholder={
                  setting(
                    cfg,
                    'header.search_placeholder',
                    'Search medicines...'
                  )
                }
              />


              {q&&(

                <button
                  type="button"
                  aria-label="Clear search"

                  onClick={()=>
                    setQ('')
                  }

                  className="mr-1 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >

                  <X size={15}/>

                </button>

              )}


              <button
                type="submit"
                aria-label="Search"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-white"
              >

                <Search size={16}/>

              </button>

            </form>


            {/* MOBILE SEARCH SUGGESTIONS */}

            {!mobile&&
              q.trim().length>=2&&
              (
                suggestions.data||
                []
              ).length>0&&(

              <div className="absolute left-4 right-4 top-[60px] z-[120] max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">

                {(
                  suggestions.data||
                  []
                ).map(s=>(

                  <Link
                    key={s.slug}

                    to={
                      '/product/'+
                      s.slug
                    }

                    onClick={()=>{

                      setQ('');

                      setMobile(
                        false
                      );

                    }}

                    className="block border-b border-slate-100 px-4 py-3 last:border-b-0 active:bg-brand-50"
                  >

                    <div className="text-sm font-bold text-slate-900">

                      {s.name}

                    </div>


                    {s.generic_name&&(

                      <div className="mt-1 text-xs text-slate-500">

                        {s.generic_name}

                      </div>

                    )}

                  </Link>

                ))}

              </div>

            )}

          </div>

        </div>


        {/* ===============================================
            DESKTOP NAVIGATION
            =============================================== */}

        <div className="hidden border-t border-slate-100 md:block">

          <div className="container-app flex h-12 items-center gap-2 overflow-visible text-sm font-semibold">

            {menu.map(
              item=>{

                const kids=
                  children(
                    item.id
                  );


                const active=
                  isActive(
                    item
                  );


                return(

                  <div
                    key={item.id}
                    className="group relative shrink-0"
                  >

                    <SmartLink
                      item={item}

                      className={`flex items-center gap-1 rounded-full px-4 py-2 transition ${
                        active
                          ? 'bg-brand-600 text-white'
                          : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >

                      {item.label}


                      {kids.length>0&&(

                        <ChevronDown
                          size={14}
                        />

                      )}

                    </SmartLink>


                    {kids.length>0&&(

                      <div className="invisible absolute left-0 top-full z-[120] min-w-60 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                        {kids.map(k=>(

                          <SmartLink
                            item={k}
                            key={k.id}

                            className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                          >

                            {k.label}

                          </SmartLink>

                        ))}

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </div>

      </header>


      {/* =================================================
          MOBILE OFF-CANVAS MENU
          RIGHT SIDE DRAWER
          ================================================= */}

      <div
        className={`fixed inset-0 z-[100] md:hidden ${
          mobile
            ? 'pointer-events-auto'
            : 'pointer-events-none'
        }`}
        aria-hidden={
          !mobile
        }
      >


        {/* ===============================================
            BACKDROP
            =============================================== */}

        <button
          type="button"
          aria-label="Close menu"
          tabIndex={
            mobile
              ? 0
              : -1
          }
          onClick={
            closeMobile
          }
          className={`absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[1px] transition-opacity duration-300 ${
            mobile
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        />


        {/* ===============================================
            RIGHT DRAWER
            =============================================== */}

        <aside
          id="mobile-navigation"

          role="dialog"

          aria-modal={
            mobile
              ? 'true'
              : undefined
          }

          aria-label="Mobile navigation"

          className={`absolute right-0 top-0 flex h-[100dvh] w-[88%] max-w-sm flex-col bg-white shadow-[-12px_0_40px_rgba(15,23,42,0.20)] transition-transform duration-300 ease-out ${
            mobile
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >


          {/* =============================================
              DRAWER HEADER
              ============================================= */}

          <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">


            {/* ===========================================
                MOBILE DRAWER LOGO + NAME
                =========================================== */}

            <Link
              to="/"
              onClick={
                closeMobile
              }
              className="flex min-w-0 flex-1 items-center gap-2.5 pr-3"
            >

              {logo?(

                <img
                  src={
                    assetUrl(
                      logo
                    )
                  }
                  alt={brand}
                  className="
                    h-10
                    w-auto
                    max-w-[70px]
                    shrink-0
                    object-contain
                  "
                />

              ):(

                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-lg font-black text-white">
                  +
                </span>

              )}


              {/* BRAND NAME ALWAYS VISIBLE */}

              <span
                className="
                  min-w-0
                  flex-1
                  truncate
                  text-lg
                  font-black
                  leading-tight
                  text-slate-900
                "
                title={brand}
              >

                {brand}

              </span>

            </Link>


            {/* CLOSE */}

            <button
              type="button"
              aria-label="Close menu"

              onClick={
                closeMobile
              }

              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
            >

              <X size={21}/>

            </button>

          </div>


          {/* =============================================
              MENU SCROLL AREA
              ============================================= */}

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">


            {/* ===========================================
                MAIN NAVIGATION
                =========================================== */}

            <nav className="space-y-1">

              {menu.map(item=>{

                const kids=
                  children(
                    item.id
                  );


                const active=
                  isActive(
                    item
                  );


                return(

                  <div
                    key={
                      item.id
                    }
                  >

                    <SmartLink
                      item={item}

                      onClick={
                        closeMobile
                      }

                      className={`flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-[15px] font-bold transition ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-800 hover:bg-slate-50 active:bg-brand-50'
                      }`}
                    >

                      <span>
                        {item.label}
                      </span>


                      {kids.length>0&&(

                        <ChevronDown
                          size={16}
                          className="text-slate-400"
                        />

                      )}

                    </SmartLink>


                    {/* CHILDREN */}

                    {kids.length>0&&(

                      <div className="ml-5 border-l-2 border-slate-100 py-1 pl-2">

                        {kids.map(k=>(

                          <SmartLink
                            key={k.id}

                            item={k}

                            onClick={
                              closeMobile
                            }

                            className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                              isActive(k)
                                ? 'bg-brand-50 text-brand-700'
                                : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                            }`}
                          >

                            {k.label}

                          </SmartLink>

                        ))}

                      </div>

                    )}

                  </div>

                );

              })}

            </nav>


            {/* ===========================================
                EXTRA LINKS
                =========================================== */}

            <div className="mt-4 border-t border-slate-100 pt-4">


              {/* TRACK ORDER */}

              <Link
                to="/track"

                onClick={
                  closeMobile
                }

                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              >

                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">

                  <MapPin
                    size={18}
                  />

                </span>

                Track Order

              </Link>


              {/* WISHLIST */}

              <Link
                to="/account/wishlist"

                onClick={
                  closeMobile
                }

                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              >

                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">

                  <Heart
                    size={18}
                  />

                </span>

                Wishlist

              </Link>


              {/* ACCOUNT */}

              <Link
                to={
                  user
                    ? '/account'
                    : '/login'
                }

                onClick={
                  closeMobile
                }

                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              >

                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">

                  <User
                    size={18}
                  />

                </span>


                {user
                  ? 'My Account'
                  : 'Sign In'
                }

              </Link>


              {/* CART */}

              <Link
                to="/cart"

                onClick={
                  closeMobile
                }

                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              >

                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">

                  <ShoppingCart
                    size={18}
                  />

                </span>

                Cart

              </Link>

            </div>

          </div>


          {/* =============================================
              DRAWER FOOTER
              ============================================= */}

          <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4">

            <p className="text-center text-xs text-slate-500">

              {brand}

            </p>

          </div>

        </aside>

      </div>

    </>
  );
}