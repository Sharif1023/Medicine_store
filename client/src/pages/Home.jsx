import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {useQuery} from '@tanstack/react-query';
import {Link} from 'react-router-dom';

import {
  ArrowRight,
  Bell,
  ClipboardCheck,
  FlaskConical,
  Headphones,
  HeartPulse,
  Pill,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Truck,
  Upload
} from 'lucide-react';

import http,{assetUrl} from '../api/http';
import ProductCard from '../components/ProductCard';
import RichContent from '../components/RichContent';


/* =========================================================
   ICON HELPER
   ========================================================= */

const iconFor=(name,index=0)=>{

  const map={
    Stethoscope,
    FlaskConical,
    Bell,
    ClipboardCheck,
    HeartPulse,
    Pill,
    Truck,
    ShieldCheck,
    RotateCcw,
    Headphones,
    Upload
  };


  return(
    map[name]||
    [
      Stethoscope,
      FlaskConical,
      Bell,
      ClipboardCheck,
      HeartPulse
    ][index%5]
  );

};


/* =========================================================
   HOME
   ========================================================= */

export default function Home(){

  const {data}=useQuery({

    queryKey:['home'],

    queryFn:()=>
      http
        .get('/home')
        .then(
          r=>r.data.data
        )

  });


  const d=data||{

    categories:[],
    banners:[],
    services:[],
    bestSellers:[],
    newArrivals:[],
    featuredProducts:[],
    sections:[],
    brands:[],
    settings:{}

  };


  const s=
    d.settings||
    {};


  const sections=useMemo(
    ()=>
      new Map(
        (d.sections||[])
          .map(
            x=>[
              x.section_key,
              x
            ]
          )
      ),
    [d.sections]
  );


  const banner=(position)=>
    d.banners?.find(
      x=>
        x.position===
        position
    );


  const banners=(position)=>
    (d.banners||[])
      .filter(
        x=>
          x.position===
          position
      );


  const visible=(key)=>
    sections.size===0||
    sections.has(key);


  /* =====================================================
     SECTION RENDERERS
     ===================================================== */

  const renderers={

    hero:()=>(
      <Hero
        banners={
          banners('hero')
        }
        settings={s}
      />
    ),


    trust:()=>(
      <Trust
        section={
          sections.get('trust')
        }
        settings={s}
      />
    ),


    categories:()=>(
      <CategorySection
        section={
          sections.get('categories')
        }
        rows={
          d.categories||
          []
        }
      />
    ),


    best_sellers:()=>(
      <ProductSection
        section={
          sections.get('best_sellers')
        }
        rows={
          d.bestSellers||
          []
        }
      />
    ),


    prescription:()=>(
      <PrescriptionBanner
        section={
          sections.get('prescription')
        }
        banner={
          banner('prescription')
        }
      />
    ),


    services:()=>(
      <Services
        section={
          sections.get('services')
        }
        rows={
          d.services||
          []
        }
      />
    ),


    featured:()=>(
      <ProductSection
        section={
          sections.get('featured')
        }
        rows={
          d.featuredProducts||
          []
        }
      />
    ),


    brands:()=>(
      <Brands
        section={
          sections.get('brands')
        }
        rows={
          d.brands||
          []
        }
      />
    ),


    new_arrivals:()=>(
      <ProductSection
        section={
          sections.get('new_arrivals')
        }
        rows={
          d.newArrivals||
          []
        }
      />
    ),


    newsletter:()=>(
      <Newsletter
        section={
          sections.get('newsletter')
        }
      />
    )

  };


  const ordered=
    (d.sections||[]).length
      ? d.sections.map(
          x=>x.section_key
        )
      : Object.keys(
          renderers
        );


  return(

    <main>


      {ordered
        .filter(
          k=>
            visible(k)&&
            renderers[k]
        )
        .map(
          k=>(
            <div key={k}>

              {renderers[k]()}

            </div>
          )
        )
      }


      {(d.banners||[])
        .filter(
          x=>
            x.position===
            'promotion'
        )
        .map(
          x=>(
            <Promotion
              key={x.id}
              banner={x}
            />
          )
        )
      }

    </main>

  );

}


/* =========================================================
   HERO
   ========================================================= */

function Hero({
  banners=[],
  settings
}){

  const slides=
    banners.length
      ? banners
      : [null];


  const [index,setIndex]=useState(0);


  useEffect(()=>{

    setIndex(0);

  },[
    banners.length
  ]);


  useEffect(()=>{

    if(slides.length<2){
      return;
    }


    const id=
      setInterval(
        ()=>{

          setIndex(
            i=>
              (i+1)%
              slides.length
          );

        },
        5000
      );


    return()=>
      clearInterval(id);

  },[
    slides.length
  ]);


  const banner=
    slides[index];


  const title=
    banner?.title||
    'Better Health, Delivered Daily.';


  const subtitle=
    banner?.subtitle||
    '<p>Genuine healthcare products, trusted service and convenient delivery from one modern storefront.</p>';


  const cta=
    banner?.button_text||
    'Shop Medicines';


  const ctaUrl=
    banner?.button_url||
    '/products';


  return(

    <section className="hero-surface overflow-hidden">

      <div
        className="
          container-app
          grid
          items-center
          gap-7
          py-8
          md:gap-10
          md:py-12
          lg:min-h-[520px]
          lg:grid-cols-2
        "
      >


        {/* =============================================
            HERO CONTENT
            ============================================= */}

        <div>

          <span className="badge bg-white text-brand-700 shadow">

            ✦{' '}

            {
              settings[
                'home.hero_badge'
              ]||
              'Your Health, Our Priority'
            }

          </span>


          <h1
            className="
              mt-5
              max-w-2xl
              text-4xl
              font-black
              leading-[1.04]
              tracking-tight
              md:text-6xl
            "
          >

            {title}

          </h1>


          <RichContent
            html={subtitle}

            className="
              rich-content
              mt-5
              max-w-xl
              text-base
              text-slate-600
              md:text-lg
            "
          />


          <div className="mt-7 flex flex-wrap gap-3">

            <Link
              to={ctaUrl}
              className="btn-primary"
            >

              {cta}

              <ArrowRight size={18}/>

            </Link>


            <Link
              to="/account/prescriptions"
              className="btn-secondary"
            >

              <Upload size={18}/>

              Upload Prescription

            </Link>

          </div>


          <p className="mt-7 text-sm font-semibold text-slate-600">

            {
              settings[
                'home.hero_note'
              ]||
              '100% genuine products • Secure checkout • Professional support'
            }

          </p>


          {banner?.content&&(

            <RichContent
              html={
                banner.content
              }

              className="rich-content mt-5 max-w-xl text-sm text-slate-500"
            />

          )}

        </div>


        {/* =============================================
            HERO IMAGE

            MOBILE + DESKTOP SHOW
            ============================================= */}

        <div
          className="
            relative
            min-h-[240px]
            sm:min-h-[320px]
            md:min-h-[390px]
          "
        >

          {banner?.image?(

            <picture
              key={
                banner.id
              }
            >


              {/* MOBILE IMAGE */}

              {banner.mobile_image&&(

                <source
                  media="(max-width: 767px)"

                  srcSet={
                    assetUrl(
                      banner.mobile_image
                    )
                  }
                />

              )}


              {/* DESKTOP / FALLBACK IMAGE */}

              <img
                src={
                  assetUrl(
                    banner.image
                  )
                }

                alt={
                  banner.title||
                  'Healthcare promotion'
                }

                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  rounded-3xl
                  object-cover
                  shadow-xl
                  transition-opacity
                  duration-500
                  md:rounded-[2.5rem]
                  md:shadow-2xl
                "
              />

            </picture>

          ):(

            <HeroIllustration/>

          )}


          {/* SLIDER DOTS */}

          {slides.length>1&&(

            <div
              className="
                absolute
                bottom-4
                left-1/2
                z-10
                flex
                -translate-x-1/2
                gap-2
              "
            >

              {slides.map(
                (x,i)=>(

                  <button
                    type="button"

                    aria-label={
                      `Show hero slide ${i+1}`
                    }

                    key={
                      x?.id||
                      i
                    }

                    onClick={()=>
                      setIndex(i)
                    }

                    className={
                      `h-2.5 rounded-full bg-white shadow transition-all ${
                        i===index
                          ? 'w-8'
                          : 'w-2.5 opacity-70'
                      }`
                    }
                  />

                )
              )}

            </div>

          )}

        </div>

      </div>

    </section>

  );

}


/* =========================================================
   HERO ILLUSTRATION
   ========================================================= */

function HeroIllustration(){

  return(

    <div className="relative h-full min-h-[240px] sm:min-h-[320px] md:min-h-[390px]">

      <div className="absolute inset-8 rounded-[3rem] bg-brand-100/70 blur-3xl"/>


      <div
        className="
          card
          absolute
          left-1/2
          top-4
          w-52
          -translate-x-1/2
          rounded-[2rem]
          border-8
          border-slate-900
          p-3
          shadow-2xl
          sm:w-64
          sm:rounded-[2.5rem]
        "
      >

        <div className="rounded-[1.5rem] bg-brand-600 p-4 text-white sm:rounded-[1.8rem] sm:p-5">

          <div className="text-xs">

            Healthcare, simplified

          </div>


          <div className="mt-3 rounded-xl bg-white/95 p-3 text-xs text-slate-500">

            Search medicines...

          </div>


          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">

            {[
              'Medicines',
              'Upload Rx',
              'Lab Tests',
              'Orders'
            ].map(
              x=>(

                <div
                  className="rounded-xl bg-white/10 p-2 text-center text-[10px] sm:p-3 sm:text-xs"
                  key={x}
                >

                  {x}

                </div>

              )
            )}

          </div>


          <div className="mt-4 rounded-2xl bg-white p-3 text-ink sm:mt-5 sm:p-4">

            <div className="text-xs font-black sm:text-sm">

              Store offers

            </div>

            <div className="text-[10px] text-slate-500 sm:text-xs">

              Admin-controlled promotions

            </div>

          </div>

        </div>

      </div>


      <div className="absolute bottom-3 left-1 h-28 w-24 rounded-2xl bg-white p-3 shadow-xl sm:bottom-10 sm:left-2 sm:h-44 sm:w-36 sm:rounded-3xl sm:p-5">

        <Pill
          className="text-brand-600"
          size={28}
        />

        <div className="mt-3 text-xs font-black sm:mt-7 sm:text-base">

          Healthcare

        </div>

        <div className="text-[9px] text-slate-500 sm:text-xs">

          Everyday essentials

        </div>

      </div>


      <div className="absolute bottom-2 right-1 h-32 w-24 rounded-2xl bg-white p-3 shadow-xl sm:bottom-6 sm:right-2 sm:h-48 sm:w-40 sm:rounded-3xl sm:p-5">

        <ShieldCheck
          className="text-brand-600"
          size={28}
        />

        <div className="mt-4 text-xs font-black sm:mt-8 sm:text-base">

          Secure Care

        </div>

        <div className="text-[9px] text-slate-500 sm:text-xs">

          Trusted workflow

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   TRUST

   MOBILE: HIDDEN
   TABLET/DESKTOP: SHOW
   ========================================================= */

function Trust({
  section,
  settings
}){

  const rows=[

    [
      Truck,

      settings[
        'home.trust_1_title'
      ]||
      'Express Delivery',

      settings[
        'home.trust_1_text'
      ]||
      'Reliable delivery updates'
    ],


    [
      ShieldCheck,

      settings[
        'home.trust_2_title'
      ]||
      'Secure Payments',

      settings[
        'home.trust_2_text'
      ]||
      'Protected checkout'
    ],


    [
      RotateCcw,

      settings[
        'home.trust_3_title'
      ]||
      'Easy Returns',

      settings[
        'home.trust_3_text'
      ]||
      'Policy-based support'
    ],


    [
      Headphones,

      settings[
        'home.trust_4_title'
      ]||
      'Customer Support',

      settings[
        'home.trust_4_text'
      ]||
      'Help when you need it'
    ]

  ];


  return(

    <section
      className="
        container-app
        relative
        z-10
        -mt-5
        hidden
        md:block
      "
    >

      <div
        className="
          card
          grid
          grid-cols-4
          divide-x
          divide-slate-100
        "
      >

        {rows.map(
          ([I,t,sub])=>(

            <div
              className="flex items-center gap-3 p-5"
              key={t}
            >

              <I
                className="shrink-0 text-brand-600"
              />


              <div className="min-w-0">

                <div className="text-sm font-bold">

                  {t}

                </div>


                <div className="text-xs text-slate-500">

                  {sub}

                </div>

              </div>

            </div>

          )
        )}

      </div>


      {section?.subtitle&&(

        <RichContent
          html={
            section.subtitle
          }

          className="rich-content mt-4 text-sm text-slate-500"
        />

      )}

    </section>

  );

}


/* =========================================================
   SECTION HEADER
   ========================================================= */

function SectionHead({
  section,
  fallback,
  viewAll=true
}){

  return(

    <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">

      <div className="min-w-0">

        <h2 className="text-xl font-black sm:text-2xl">

          {
            section?.title||
            fallback
          }

        </h2>


        {section?.subtitle&&(

          <RichContent
            html={
              section.subtitle
            }

            className="rich-content mt-2 max-w-2xl text-xs text-slate-500 sm:text-sm"
          />

        )}

      </div>


      {viewAll&&(

        <Link
          className="shrink-0 text-xs font-bold text-brand-700 sm:text-sm"
          to="/products"
        >

          View all →

        </Link>

      )}

    </div>

  );

}


/* =========================================================
   SHOP BY CATEGORY

   MOBILE = 4 PER ROW
   ========================================================= */

function CategorySection({
  section,
  rows
}){

  return(

    <section className="container-app py-8 sm:py-10">

      <SectionHead
        section={section}
        fallback="Shop by Category"
      />


      <div
        className="
          grid
          grid-cols-4
          gap-2
          sm:gap-4
          lg:grid-cols-8
        "
      >

        {rows.map(
          c=>(

            <Link
              key={c.id}

              to={
                '/products?category='+
                c.slug+
                '#products-top'
              }

              className="
                card
                min-w-0
                p-2
                text-center
                transition
                hover:-translate-y-1
                hover:border-brand-200
                sm:p-4
                lg:p-5
              "
            >

              <div
                className="
                  mx-auto
                  grid
                  h-11
                  w-11
                  place-items-center
                  overflow-hidden
                  rounded-xl
                  bg-brand-50
                  text-xl
                  sm:h-14
                  sm:w-14
                  sm:rounded-2xl
                  lg:h-16
                  lg:w-16
                  lg:text-2xl
                "
              >

                {c.image?(

                  <img
                    src={
                      assetUrl(
                        c.image
                      )
                    }

                    alt={
                      c.name
                    }

                    className="h-full w-full object-cover"
                  />

                ):(

                  '✚'

                )}

              </div>


              <div
                className="
                  mt-2
                  line-clamp-2
                  break-words
                  text-[10px]
                  font-bold
                  leading-3
                  sm:mt-3
                  sm:text-xs
                  sm:leading-4
                  lg:text-sm
                "
              >

                {c.name}

              </div>

            </Link>

          )
        )}

      </div>

    </section>

  );

}


/* =========================================================
   PRODUCT SECTION

   BEST SELLERS
   FEATURED PRODUCTS
   NEW ARRIVALS

   MOBILE = 2 PER ROW
   ========================================================= */

function ProductSection({
  section,
  rows
}){

  if(!rows.length){
    return null;
  }


  return(

    <section className="container-app py-8 sm:py-10">

      <SectionHead
        section={section}
        fallback="Products"
      />


      <div
        className="
          grid
          grid-cols-2
          auto-rows-fr
          items-stretch
          gap-2.5
          sm:gap-4
          lg:grid-cols-4
          xl:grid-cols-5
        "
      >

        {rows
          .slice(0,10)
          .map(
            p=>(

              <div
                key={p.id}

                className="
                  h-full
                  min-w-0
                  [&>*]:h-full
                "
              >

                <ProductCard
                  p={p}
                />

              </div>

            )
          )
        }

      </div>

    </section>

  );

}


/* =========================================================
   PRESCRIPTION BANNER
   ========================================================= */

function PrescriptionBanner({
  section,
  banner
}){

  return(

    <section className="container-app my-8">

      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white md:p-10">

        <div className="grid items-center gap-8 md:grid-cols-2">


          <div>

            <div className="text-2xl font-black sm:text-3xl">

              {
                banner?.title||
                section?.title||
                'Upload Prescription & Get Medicines Delivered'
              }

            </div>


            {banner?.subtitle?(

              <RichContent
                html={
                  banner.subtitle
                }

                className="rich-content mt-3 text-white/85"
              />

            ):(

              <p className="mt-3 max-w-xl text-sm text-white/80">

                Upload securely. A pharmacist can review prescription-required items before fulfillment.

              </p>

            )}


            <Link
              to={
                banner?.button_url||
                '/account/prescriptions'
              }

              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-brand-700"
            >

              {
                banner?.button_text||
                'Upload Now'
              }

            </Link>

          </div>


          {banner?.image?(

            <img
              src={
                assetUrl(
                  banner.image
                )
              }

              className="mx-auto max-h-56 rounded-2xl object-contain"

              alt="Prescription service"
            />

          ):(

            <div className="flex justify-center gap-6 text-white/90">

              <Upload size={72}/>

              <ShieldCheck size={72}/>

              <Pill size={72}/>

            </div>

          )}

        </div>

      </div>

    </section>

  );

}


/* =========================================================
   HEALTHCARE SERVICES

   MOBILE = 2 PER ROW
   ========================================================= */

function Services({
  section,
  rows
}){

  return(

    <section className="container-app py-8 sm:py-10">

      <SectionHead
        section={section}
        fallback="Healthcare Services"
        viewAll={false}
      />


      <div
        className="
          grid
          grid-cols-2
          auto-rows-fr
          items-stretch
          gap-2.5
          sm:gap-4
          xl:grid-cols-4
        "
      >

        {rows.map(
          (s,i)=>{

            const I=
              iconFor(
                s.icon,
                i
              );


            return(

              <div
                className="
                  card
                  flex
                  h-full
                  min-w-0
                  flex-col
                  overflow-hidden
                  p-3
                  sm:p-6
                "

                key={
                  s.id
                }
              >

                {s.image?(

                  <img
                    src={
                      assetUrl(
                        s.image
                      )
                    }

                    alt={
                      s.name
                    }

                    className="
                      mb-3
                      h-20
                      w-full
                      rounded-lg
                      object-cover
                      sm:mb-4
                      sm:h-28
                      sm:rounded-xl
                    "
                  />

                ):(

                  <I
                    className="text-brand-600"
                    size={28}
                  />

                )}


                <h3 className="mt-2 text-sm font-black sm:text-base">

                  {s.name}

                </h3>


                <RichContent
                  html={
                    s.description
                  }

                  className="
                    rich-content
                    mt-2
                    line-clamp-3
                    flex-1
                    text-[11px]
                    leading-4
                    text-slate-500
                    sm:line-clamp-4
                    sm:text-sm
                  "
                />


                <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">

                  <span className="text-xs font-black text-brand-700 sm:text-sm">

                    {
                      Number(
                        s.price
                      )>0

                        ? `৳${Number(
                            s.price
                          ).toLocaleString()}`

                        : 'Contact us'
                    }

                  </span>


                  <Link
                    to={
                      s.slug
                        ? `/service/${s.slug}`
                        : '/'
                    }

                    className="text-[11px] font-bold text-brand-700 sm:text-sm"
                  >

                    Explore →

                  </Link>

                </div>

              </div>

            );

          }
        )}

      </div>

    </section>

  );

}


/* =========================================================
   FEATURED BRANDS

   MOBILE = 4 PER ROW
   ========================================================= */

function Brands({
  section,
  rows
}){

  if(!rows.length){
    return null;
  }


  return(

    <section className="container-app py-8 sm:py-10">

      <SectionHead
        section={section}
        fallback="Featured Brands"
      />


      <div
        className="
          grid
          grid-cols-4
          gap-2
          sm:gap-3
          md:grid-cols-6
        "
      >

        {rows.map(
          b=>(

            <Link
              to={
                '/products?brand='+
                b.slug
              }

              key={
                b.id
              }

              className="
                card
                grid
                min-h-16
                min-w-0
                place-items-center
                overflow-hidden
                p-2
                text-center
                text-[10px]
                font-black
                transition
                hover:border-brand-200
                sm:min-h-20
                sm:p-3
                sm:text-xs
                md:min-h-24
                md:p-4
                md:text-sm
              "
            >

              {b.logo?(

                <img
                  src={
                    assetUrl(
                      b.logo
                    )
                  }

                  alt={
                    b.name
                  }

                  className="
                    max-h-8
                    max-w-full
                    object-contain
                    sm:max-h-10
                    md:max-h-12
                  "
                />

              ):(

                <span className="line-clamp-2 break-words">

                  {b.name}

                </span>

              )}

            </Link>

          )
        )}

      </div>

    </section>

  );

}


/* =========================================================
   PROMOTION
   ========================================================= */

function Promotion({
  banner
}){

  return(

    <section className="container-app py-6">

      <div className="card overflow-hidden bg-brand-50">

        <div className="grid items-center md:grid-cols-2">


          <div className="p-6 sm:p-8">

            <h2 className="text-2xl font-black sm:text-3xl">

              {banner.title}

            </h2>


            <RichContent
              html={
                banner.subtitle
              }

              className="rich-content mt-3 text-slate-600"
            />


            {banner.button_text&&(

              <Link
                className="btn-primary mt-5"

                to={
                  banner.button_url||
                  '/products'
                }
              >

                {banner.button_text}

              </Link>

            )}

          </div>


          {banner.image&&(

            <img
              src={
                assetUrl(
                  banner.image
                )
              }

              alt={
                banner.title
              }

              className="h-full max-h-72 w-full object-cover"
            />

          )}

        </div>

      </div>

    </section>

  );

}


/* =========================================================
   NEWSLETTER
   ========================================================= */

function Newsletter({
  section
}){

  const [email,setEmail]=
    useState('');


  const [message,setMessage]=
    useState('');


  const submit=async e=>{

    e.preventDefault();


    try{

      const r=
        await http.post(
          '/newsletter',
          {
            email
          }
        );


      setMessage(
        r.data.message
      );


      setEmail('');


    }catch(err){

      setMessage(
        err.response?.data?.message||
        'Could not subscribe'
      );

    }

  };


  return(

    <section className="container-app py-8 sm:py-10">

      <div className="card bg-slate-950 p-6 text-white md:p-10">

        <div className="grid items-center gap-6 md:grid-cols-2">


          <div>

            <h2 className="text-2xl font-black">

              {
                section?.title||
                'Stay in the loop'
              }

            </h2>


            {section?.subtitle?(

              <RichContent
                html={
                  section.subtitle
                }

                className="rich-content mt-2 text-slate-300"
              />

            ):(

              <p className="mt-2 text-sm text-slate-300">

                Receive store news, service updates and selected promotions.

              </p>

            )}

          </div>


          <form
            onSubmit={
              submit
            }

            className="flex gap-2"
          >

            <input
              className="input min-w-0 text-ink"

              type="email"

              required

              placeholder="you@example.com"

              value={
                email
              }

              onChange={
                e=>
                  setEmail(
                    e.target.value
                  )
              }
            />


            <button
              type="submit"
              className="btn-primary shrink-0"
            >

              Subscribe

            </button>

          </form>

        </div>


        {message&&(

          <div className="mt-3 text-xs text-brand-200">

            {message}

          </div>

        )}

      </div>

    </section>

  );

}