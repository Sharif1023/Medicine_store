import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  useParams,
  useNavigate,
  Link
} from 'react-router-dom';

import {
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldAlert,
  ShoppingCart,
  Star,
  Upload,
  X
} from 'lucide-react';

import http,{assetUrl} from '../api/http';
import {useAuthStore} from '../store/auth';
import {useSiteConfig,setting} from '../hooks/useSiteConfig';
import RichContent from '../components/RichContent';


export default function ProductDetail(){

  const {slug}=useParams();

  const nav=useNavigate();

  const qc=useQueryClient();

  const user=useAuthStore(
    s=>s.user
  );

  const {data:cfg}=useSiteConfig();


  /* =====================================================
     PRODUCT STATE
     ===================================================== */

  const [qty,setQty]=useState(1);

  const [image,setImage]=useState('');

  const [priceType,setPriceType]=useState('unit');


  /* =====================================================
     ADDED TO CART NOTIFICATION
     ===================================================== */

  const [cartNotice,setCartNotice]=useState(null);

  const [noticeVisible,setNoticeVisible]=useState(false);

  const noticeHideTimer=useRef(null);

  const noticeRemoveTimer=useRef(null);


  const hideCartNotice=()=>{

    setNoticeVisible(false);


    if(noticeRemoveTimer.current){

      clearTimeout(
        noticeRemoveTimer.current
      );

    }


    noticeRemoveTimer.current=
      setTimeout(()=>{

        setCartNotice(null);

      },300);

  };


  const showCartNotice=(data)=>{

    /*
     * Previous timer clear করা হচ্ছে,
     * তাই দ্রুত আবার Add to Cart করলে
     * নতুন করে 3 seconds থাকবে।
     */

    if(noticeHideTimer.current){

      clearTimeout(
        noticeHideTimer.current
      );

    }


    if(noticeRemoveTimer.current){

      clearTimeout(
        noticeRemoveTimer.current
      );

    }


    setCartNotice(data);


    /*
     * First render hidden position.
     * Next frame -> slide in.
     */

    setNoticeVisible(false);


    requestAnimationFrame(()=>{

      requestAnimationFrame(()=>{

        setNoticeVisible(true);

      });

    });


    noticeHideTimer.current=
      setTimeout(()=>{

        setNoticeVisible(false);


        noticeRemoveTimer.current=
          setTimeout(()=>{

            setCartNotice(null);

          },300);

      },3000);

  };


  /* =====================================================
     TIMER CLEANUP
     ===================================================== */

  useEffect(()=>{

    return()=>{

      if(noticeHideTimer.current){

        clearTimeout(
          noticeHideTimer.current
        );

      }


      if(noticeRemoveTimer.current){

        clearTimeout(
          noticeRemoveTimer.current
        );

      }

    };

  },[]);


  /* =====================================================
     PRODUCT
     ===================================================== */

  const {
    data:p,
    isLoading
  }=useQuery({

    queryKey:[
      'product',
      slug
    ],

    queryFn:()=>
      http
        .get(
          '/products/'+slug
        )
        .then(
          r=>r.data.data
        )

  });


  /* =====================================================
     WISHLIST
     ===================================================== */

  const {
    data:wishlist=[]
  }=useQuery({

    queryKey:[
      'wishlist'
    ],

    enabled:
      Boolean(user),

    queryFn:()=>
      http
        .get(
          '/user/wishlist'
        )
        .then(
          r=>r.data.data
        ),

    staleTime:15000

  });


  /* =====================================================
     IMAGES
     ===================================================== */

  const imgs=useMemo(
    ()=>p?.images||[],
    [p]
  );


  const main=
    image||
    imgs[0]?.image_url||
    '';


  /* =====================================================
     CURRENCY
     ===================================================== */

  const money=n=>
    setting(
      cfg,
      'currency.symbol',
      '৳'
    )+
    Number(n||0)
      .toLocaleString(
        undefined,
        {
          minimumFractionDigits:0,
          maximumFractionDigits:2
        }
      );


  /* =====================================================
     LOADING
     ===================================================== */

  if(isLoading){

    return(
      <div className="container-app py-20">
        Loading product...
      </div>
    );

  }


  if(!p){

    return(
      <div className="container-app py-20">
        Product not found.
      </div>
    );

  }


  /* =====================================================
     WISHLIST STATUS
     ===================================================== */

  const wished=
    wishlist.some(
      x=>
        Number(x.id)===
        Number(p.id)
    );


  /* =====================================================
     AUTH
     ===================================================== */

  const auth=()=>{

    if(!user){

      nav('/login');

      return false;

    }

    return true;

  };


  /* =====================================================
     DISCOUNT
     ===================================================== */

  const pct=
    Math.max(
      0,
      Math.min(
        99.99,
        Number(
          p.discount_percent||
          0
        )
      )
    );


  /* =====================================================
     PRICE OPTIONS
     ===================================================== */

  const options=[

    {
      key:'unit',

      label:
        p.unit_label||
        'Unit',

      price:
        Number(
          p.unit_price||
          p.sale_price||
          0
        ),

      regularPrice:
        Number(
          p.regular_price||
          p.mrp_price||
          p.mrp||
          0
        ),

      mult:1
    },


    {
      key:'strip',

      label:
        `Strip (${p.units_per_strip||1} units)`,

      price:
        Number(
          p.strip_price||
          p.sale_price||
          0
        ),

      regularPrice:
        Number(
          p.strip_regular_price||
          p.strip_mrp||
          0
        ),

      mult:
        Number(
          p.units_per_strip||
          1
        )
    },


    {
      key:'box',

      label:
        `Box (${p.units_per_box||1} units)`,

      price:
        Number(
          p.box_price||
          p.sale_price||
          0
        ),

      regularPrice:
        Number(
          p.box_regular_price||
          p.box_mrp||
          0
        ),

      mult:
        Number(
          p.units_per_box||
          1
        )
    }

  ].filter(
    x=>x.price>0
  );


  /* =====================================================
     SELECTED PRICE
     ===================================================== */

  const selected=
    options.find(
      x=>x.key===priceType
    )||
    options[0];


  const selectedPrice=
    Number(
      selected?.price||
      p.sale_price||
      0
    );


  const selectedMrp=
    Number(
      selected?.regularPrice||
      0
    )>0

      ? Number(
          selected.regularPrice
        )

      : pct>0

        ? selectedPrice/
          (1-pct/100)

        : selectedPrice;


  const showMrp=
    selectedMrp>
    selectedPrice;


  /* =====================================================
     STOCK
     ===================================================== */

  const maxQty=
    Math.max(
      1,
      Math.floor(
        Number(
          p.stock||
          0
        )/
        Math.max(
          1,
          selected?.mult||
          1
        )
      )
    );


  /* =====================================================
     ADD TO CART
     ===================================================== */

  const add=async()=>{

    if(!auth()){
      return;
    }


    /*
     * User যে quantity add করছে,
     * reset করার আগে সেটা save করে রাখছি।
     */

    const addedQty=qty;

    const addedPriceType=
      selected?.key||
      'unit';

    const addedLabel=
      selected?.label||
      'Unit';

    const addedPrice=
      selectedPrice;


    try{

      await http.post(
        '/user/cart/items',
        {
          productId:p.id,
          quantity:addedQty,
          priceType:addedPriceType
        }
      );


      /*
       * Cart refresh
       */

      await qc.invalidateQueries({
        queryKey:['cart']
      });


      /*
       * IMPORTANT:
       * Successful add-এর পর quantity আবার 1.
       */

      setQty(1);


      /*
       * Browser alert নেই।
       * Instead custom left notification.
       */

      showCartNotice({

        id:p.id,

        name:p.name,

        image:
          main
            ? assetUrl(main)
            : '/product-placeholder.svg',

        quantity:addedQty,

        type:
          addedLabel,

        price:
          addedPrice,

        total:
          addedPrice*
          addedQty

      });


    }catch(e){

      /*
       * Error alert আপাতত রাখা হয়েছে,
       * কারণ user-কে failure জানানো দরকার।
       */

      alert(
        e.response?.data?.message||
        'Could not add to cart'
      );

    }

  };


  /* =====================================================
     WISHLIST
     ===================================================== */

  const wish=async()=>{

    if(!auth()){
      return;
    }


    try{

      if(wished){

        await http.delete(
          '/user/wishlist/'+
          p.id
        );

      }else{

        await http.post(
          '/user/wishlist/'+
          p.id
        );

      }


      await qc.invalidateQueries({
        queryKey:['wishlist']
      });


    }catch(e){

      alert(
        e.response?.data?.message||
        'Could not update wishlist'
      );

    }

  };


  /* =====================================================
     PAGE
     ===================================================== */

  return(
    <>


      {/* =================================================
          ADDED TO CART LEFT NOTIFICATION
          ================================================= */}

      {cartNotice&&(

        <div
          className={`fixed left-3 top-24 z-[160] w-[calc(100%-24px)] max-w-sm transition-all duration-300 ease-out sm:left-5 ${
            noticeVisible
              ? 'translate-x-0 opacity-100'
              : '-translate-x-[120%] opacity-0'
          }`}
        >

          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">


            {/* TOP SUCCESS BAR */}

            <div className="flex items-center justify-between bg-emerald-50 px-4 py-3">

              <div className="flex items-center gap-2 text-sm font-black text-emerald-700">

                <CheckCircle2
                  size={18}
                />

                Added to cart

              </div>


              <button
                type="button"

                aria-label="Close"

                onClick={
                  hideCartNotice
                }

                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
              >

                <X size={16}/>

              </button>

            </div>


            {/* PRODUCT */}

            <div className="flex gap-3 p-4">


              {/* IMAGE */}

              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">

                <img
                  src={
                    cartNotice.image
                  }

                  alt={
                    cartNotice.name
                  }

                  className="h-full w-full object-contain p-1"
                />

              </div>


              {/* INFO */}

              <div className="min-w-0 flex-1">

                <div className="line-clamp-2 text-sm font-black leading-5 text-slate-900">

                  {
                    cartNotice.name
                  }

                </div>


                <div className="mt-1 text-xs text-slate-500">

                  {
                    cartNotice.type
                  }

                  {' · '}

                  Qty:{' '}

                  <span className="font-bold text-slate-700">

                    {
                      cartNotice.quantity
                    }

                  </span>

                </div>


                <div className="mt-2 flex items-end justify-between gap-2">

                  <div>

                    <div className="text-xs text-slate-400">
                      Price
                    </div>

                    <div className="font-black text-slate-900">

                      {money(
                        cartNotice.price
                      )}

                    </div>

                  </div>


                  {cartNotice.quantity>1&&(

                    <div className="text-right">

                      <div className="text-xs text-slate-400">
                        Total
                      </div>

                      <div className="font-black text-brand-700">

                        {money(
                          cartNotice.total
                        )}

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* TIMER LINE */}

            <div className="h-1 overflow-hidden bg-slate-100">

              {noticeVisible&&(

                <div
                  className="h-full w-full origin-left bg-emerald-500"
                  style={{
                    animation:
                      'cartNoticeTimer 3s linear forwards'
                  }}
                />

              )}

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          MAIN PAGE
          ================================================= */}

      <main className="container-app py-10">


        {/* ===============================================
            BREADCRUMB
            =============================================== */}

        <div className="text-sm text-slate-500">

          <Link to="/">
            Home
          </Link>

          {' / '}

          <Link
            to={
              '/products?category='+
              encodeURIComponent(
                p.category_slug||
                ''
              )
            }
          >

            {p.category||'Products'}

          </Link>

          {' / '}

          {p.name}

        </div>


        {/* ===============================================
            MAIN PRODUCT
            =============================================== */}

        <div className="mt-6 grid gap-10 lg:grid-cols-2">


          {/* =============================================
              IMAGE
              ============================================= */}

          <div>

            <div className="card aspect-square p-7">

              <img
                className="h-full w-full object-contain"

                src={
                  main
                    ? assetUrl(main)
                    : '/product-placeholder.svg'
                }

                alt={
                  p.name
                }
              />

            </div>


            {imgs.length>1&&(

              <div className="mt-3 grid grid-cols-5 gap-2">

                {imgs.map(x=>(

                  <button
                    type="button"

                    key={
                      x.id
                    }

                    onClick={()=>
                      setImage(
                        x.image_url
                      )
                    }

                    className={
                      `card aspect-square p-2 ${
                        main===x.image_url
                          ? 'ring-2 ring-brand-500'
                          : ''
                      }`
                    }
                  >

                    <img
                      src={
                        assetUrl(
                          x.image_url
                        )
                      }

                      alt={
                        x.alt_text||
                        p.name
                      }

                      className="h-full w-full object-contain"
                    />

                  </button>

                ))}

              </div>

            )}

          </div>


          {/* =============================================
              PRODUCT DETAILS
              ============================================= */}

          <div>


            {/* BRAND / DISCOUNT */}

            <div className="flex flex-wrap items-center gap-2">

              <span className="badge bg-brand-50 text-brand-700">

                {p.brand||'Trusted Brand'}

              </span>


              {pct>0&&(

                <span className="badge bg-emerald-50 text-emerald-700">

                  {pct}% OFF

                </span>

              )}

            </div>


            {/* NAME */}

            <h1 className="mt-4 text-4xl font-black">

              {p.name}

            </h1>


            {/* RATING */}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">

              <span className="flex items-center gap-1">

                <Star
                  className="text-amber-500"
                  fill="currentColor"
                  size={17}
                />

                {Number(
                  p.rating_avg||
                  0
                ).toFixed(1)}

                {' '}

                ({p.review_count||0} reviews)

              </span>


              <span className="text-slate-400">

                SKU: {p.sku}

              </span>

            </div>


            {/* SHORT DESCRIPTION */}

            <RichContent
              html={
                p.short_description
              }

              className="rich-content mt-5 text-slate-600"
            />


            {/* ===========================================
                UNIT / STRIP / BOX
                =========================================== */}

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              {options.map(o=>{

                const optionMrp=
                  Number(
                    o.regularPrice||
                    0
                  )>0

                    ? Number(
                        o.regularPrice
                      )

                    : pct>0

                      ? Number(
                          o.price
                        )/
                        (1-pct/100)

                      : Number(
                          o.price
                        );


                return(

                  <button
                    type="button"

                    key={
                      o.key
                    }

                    onClick={()=>{

                      setPriceType(
                        o.key
                      );

                      setQty(1);

                    }}

                    className={
                      `rounded-2xl border p-4 text-left transition ${
                        selected?.key===o.key
                          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                          : 'border-slate-200 hover:border-brand-200'
                      }`
                    }
                  >

                    <div className="text-xs font-bold uppercase text-slate-500">

                      {o.label}

                    </div>


                    {/* SELLING PRICE */}

                    <div className="mt-1 text-xl font-black text-slate-900">

                      {money(
                        o.price
                      )}

                    </div>


                    {/* MRP */}

                    {optionMrp>Number(o.price)&&(

                      <div className="mt-1 text-xs text-slate-400">

                        MRP{' '}

                        <span className="line-through">

                          {money(
                            optionMrp
                          )}

                        </span>

                      </div>

                    )}

                  </button>

                );

              })}

            </div>


            {/* ===========================================
                MAIN PRICE + MRP
                =========================================== */}

            <div className="mt-5">

              <div className="flex flex-wrap items-end gap-x-3 gap-y-2">


                <span className="text-3xl font-black text-slate-900 sm:text-4xl">

                  {money(
                    selectedPrice
                  )}

                </span>


                {showMrp&&(

                  <span className="pb-1 text-base text-slate-400">

                    MRP{' '}

                    <span className="line-through">

                      {money(
                        selectedMrp
                      )}

                    </span>

                  </span>

                )}

              </div>


              {showMrp&&(

                <div className="mt-2 text-sm font-bold text-emerald-600">

                  You save{' '}

                  {money(
                    selectedMrp-
                    selectedPrice
                  )}

                  {pct>0
                    ? ` (${pct}% OFF)`
                    : ''
                  }

                </div>

              )}

            </div>


            {/* ===========================================
                STOCK
                =========================================== */}

            <div
              className={
                `mt-4 text-sm font-bold ${
                  Number(p.stock)>0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`
              }
            >

              {Number(p.stock)>0
                ? `${p.stock} physical units in stock · max ${maxQty} ${selected?.key}(s)`
                : 'Out of stock'
              }

            </div>


            {/* ===========================================
                PRESCRIPTION
                =========================================== */}

            {p.prescription_required?(

              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">

                <ShieldAlert/>


                <div>

                  <div className="font-black">

                    Prescription Required

                  </div>


                  <div className="text-sm">

                    An approved prescription is required before checkout.

                  </div>


                  <Link
                    to="/account/prescriptions"

                    className="mt-2 inline-flex items-center gap-1 text-sm font-bold underline"
                  >

                    <Upload size={15}/>

                    Upload prescription

                  </Link>

                </div>

              </div>

            ):null}


            {/* ===========================================
                CART
                =========================================== */}

            <div className="mt-7 flex flex-wrap gap-3">


              {/* QUANTITY */}

              <div className="flex items-center rounded-xl border">

                <button
                  type="button"

                  className="p-3"

                  onClick={()=>
                    setQty(
                      Math.max(
                        1,
                        qty-1
                      )
                    )
                  }
                >

                  <Minus size={16}/>

                </button>


                <span className="min-w-10 text-center font-bold">

                  {qty}

                </span>


                <button
                  type="button"

                  className="p-3"

                  onClick={()=>
                    setQty(
                      Math.min(
                        maxQty,
                        qty+1
                      )
                    )
                  }
                >

                  <Plus size={16}/>

                </button>

              </div>


              {/* ADD CART */}

              <button
                type="button"

                disabled={
                  !Number(
                    p.stock
                  )
                }

                onClick={add}

                className="btn-primary flex-1"
              >

                <ShoppingCart size={18}/>

                Add {selected?.key||'unit'} to Cart

              </button>


              {/* WISHLIST */}

              <button
                type="button"

                onClick={wish}

                className={
                  `btn-secondary ${
                    wished
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'text-slate-600'
                  }`
                }
              >

                <Heart
                  size={18}

                  fill={
                    wished
                      ? 'currentColor'
                      : 'none'
                  }
                />

              </button>

            </div>


            {/* ===========================================
                PRODUCT INFORMATION
                =========================================== */}

            <div className="mt-8 border-t pt-6">

              <h3 className="font-black">

                Product information

              </h3>


              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

                <Info
                  a="Generic"
                  b={p.generic_name}
                />

                <Info
                  a="Strength"
                  b={p.strength}
                />

                <Info
                  a="Dosage form"
                  b={p.dosage_form}
                />

                <Info
                  a="Pack size"
                  b={p.pack_size}
                />

                <Info
                  a="Product type"
                  b={p.product_type}
                />

                <Info
                  a="Manufacturer"
                  b={p.manufacturer}
                />


                <Info
                  a="MRP"

                  b={
                    Number(
                      p.regular_price||
                      0
                    )>0

                      ? money(
                          p.regular_price
                        )

                      : '—'
                  }
                />


                <Info
                  a="Selling price"

                  b={
                    money(
                      p.sale_price||
                      selectedPrice
                    )
                  }
                />

              </div>

            </div>

          </div>

        </div>


        {/* ===============================================
            PRODUCT TABS
            =============================================== */}

        <ProductTabs
          p={p}
        />


        {/* ===============================================
            DISCLAIMER
            =============================================== */}

        <div className="mt-10 rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">

          <b>
            Medical disclaimer:
          </b>

          {' '}

          Product information is for catalog purposes and does not replace professional medical advice, diagnosis, treatment, or the official product label.

        </div>

      </main>


      {/* =================================================
          TIMER ANIMATION
          ================================================= */}

      <style>{`
        @keyframes cartNoticeTimer {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }
      `}</style>

    </>
  );

}


/* =======================================================
   PRODUCT TABS
   ======================================================= */

function ProductTabs({p}){

  const sections=[

    [
      'Description',
      p.description
    ],

    [
      'Ingredients',
      p.ingredients
    ],

    [
      'Usage information',
      p.usage_info
    ],

    [
      'Warnings',
      p.warnings
    ],

    [
      'Storage',
      p.storage_info
    ]

  ];


  return(

    <section className="mt-12 grid gap-5 lg:grid-cols-[220px_1fr]">


      <div className="card h-fit p-4">

        <div className="font-black">

          Product details

        </div>


        {sections.map(
          ([name,html])=>
            html?(

              <a
                key={name}

                href={
                  '#'+
                  name
                    .toLowerCase()
                    .replaceAll(
                      ' ',
                      '-'
                    )
                }

                className="mt-2 block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-brand-50"
              >

                {name}

              </a>

            ):null
        )}

      </div>


      <div className="space-y-5">

        {sections.map(
          ([name,html])=>
            html?(

              <div
                id={
                  name
                    .toLowerCase()
                    .replaceAll(
                      ' ',
                      '-'
                    )
                }

                key={name}

                className="card p-6"
              >

                <h2 className="text-xl font-black">

                  {name}

                </h2>


                <RichContent
                  html={html}

                  className="rich-content mt-3 text-slate-600"
                />

              </div>

            ):null
        )}

      </div>

    </section>

  );

}


/* =======================================================
   INFO
   ======================================================= */

function Info({a,b}){

  return(

    <div>

      <div className="text-slate-400">

        {a}

      </div>


      <div className="font-bold">

        {b||'—'}

      </div>

    </div>

  );

}