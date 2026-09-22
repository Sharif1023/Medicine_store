import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {Filter,Search,X} from 'lucide-react';

import http from '../api/http';
import ProductCard from '../components/ProductCard';
import {useSiteConfig} from '../hooks/useSiteConfig';


export default function Products(){

  const [sp,setSp]=useSearchParams();

  const [mobile,setMobile]=useState(false);

  const key=sp.toString();

  const {data:cfg}=useSiteConfig();


  /* =====================================================
     BRANDS
     ===================================================== */

  const brands=useQuery({
    queryKey:['brands'],

    queryFn:()=>
      http
        .get('/brands')
        .then(r=>r.data.data)
  });


  /* =====================================================
     PRODUCTS
     ===================================================== */

  const {
    data,
    isLoading
  }=useQuery({
    queryKey:[
      'products',
      key
    ],

    queryFn:()=>
      http
        .get(
          '/products?'+key
        )
        .then(
          r=>r.data
        )
  });


  /* =====================================================
     UPDATE SEARCH PARAM
     ===================================================== */

  const set=(k,v)=>{

    const n=
      new URLSearchParams(
        sp
      );


    if(v){

      n.set(
        k,
        v
      );

    }else{

      n.delete(k);

    }


    if(k!=='page'){

      n.delete('page');

    }


    setSp(n);
  };


  /* =====================================================
     PAGINATION
     ===================================================== */

  const page=
    Number(
      sp.get('page')||
      1
    );


  const pages=
    Number(
      data?.pagination?.pages||
      1
    );


  /* =====================================================
     SELECTED CATEGORY
     ===================================================== */

  const selectedCategory=
    (cfg?.categories||[])
      .find(
        c=>
          c.slug===
          sp.get('category')
      );


  /* =====================================================
     PAGE
     ===================================================== */

  return(

    <main
      id="products-top"
      className="container-app scroll-mt-28 py-10"
    >


      {/* ===============================================
          PAGE HEADER
          =============================================== */}

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">


        <div>

          <div className="text-sm text-slate-500">
            Home / Products
          </div>


          <h1 className="mt-2 text-3xl font-black">
            {
              selectedCategory
                ? selectedCategory.name
                : 'Healthcare Products'
            }
          </h1>


          <p className="text-sm text-slate-500">
            {
              data?.pagination?.total||
              0
            } products found
          </p>

        </div>


        {/* SORT / MOBILE FILTER */}

        <div className="flex gap-2">


          <button
            type="button"
            className="btn-secondary lg:hidden"
            onClick={()=>
              setMobile(true)
            }
          >

            <Filter size={17}/>

            Filters

          </button>


          <select
            className="input w-52"

            value={
              sp.get('sort')||
              'newest'
            }

            onChange={e=>
              set(
                'sort',
                e.target.value
              )
            }
          >

            <option value="newest">
              Newest
            </option>

            <option value="price_asc">
              Price low to high
            </option>

            <option value="price_desc">
              Price high to low
            </option>

            <option value="rating">
              Highest rated
            </option>

          </select>

        </div>

      </div>


      {/* ===============================================
          MAIN PRODUCTS AREA
          =============================================== */}

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">


        {/* =============================================
            DESKTOP FILTER
            ============================================= */}

        <aside className="hidden h-fit lg:block">

          <Filters
            sp={sp}
            set={set}
            categories={
              cfg?.categories||
              []
            }
            brands={
              brands.data||
              []
            }
          />

        </aside>


        {/* =============================================
            PRODUCTS
            ============================================= */}

        <section className="min-w-0">


          {isLoading?(

            <SkeletonGrid/>

          ):(data?.data||[]).length?(

            <>


              {/* =======================================
                  PRODUCT GRID

                  Mobile: 2 columns
                  Tablet: 2 columns
                  Desktop XL: 4 columns

                  auto-rows-fr = equal row height
                  items-stretch = stretch all cards
                  ======================================= */}

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

                {data.data.map(p=>(

                  <div
                    key={p.id}
                    className="
                      min-w-0
                      h-full
                      [&>*]:h-full
                    "
                  >

                    <ProductCard
                      p={p}
                    />

                  </div>

                ))}

              </div>


              {/* PAGINATION */}

              <Pagination
                page={page}
                pages={pages}

                go={n=>
                  set(
                    'page',
                    n
                  )
                }
              />

            </>

          ):(

            /* =========================================
               EMPTY STATE
               ========================================= */

            <div className="card p-12 text-center">

              <Search
                className="mx-auto text-slate-300"
                size={42}
              />


              <h2 className="mt-4 text-xl font-black">
                No products found
              </h2>


              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>


              <button
                type="button"
                className="btn-secondary mt-5"

                onClick={()=>
                  setSp(
                    new URLSearchParams()
                  )
                }
              >
                Clear filters
              </button>

            </div>

          )}

        </section>

      </div>


      {/* ===============================================
          MOBILE FILTER DRAWER
          =============================================== */}

      {mobile&&(

        <div className="fixed inset-0 z-[80] bg-slate-950/50 lg:hidden">


          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 h-full w-full"
            onClick={()=>
              setMobile(false)
            }
          />


          <div
            className="
              absolute
              inset-y-0
              right-0
              z-10
              w-[90%]
              max-w-sm
              overflow-y-auto
              bg-white
              p-5
              shadow-2xl
            "
          >

            <div className="mb-4 flex items-center justify-between">

              <b>
                Filters
              </b>


              <button
                type="button"
                aria-label="Close filters"

                onClick={()=>
                  setMobile(false)
                }
              >

                <X/>

              </button>

            </div>


            <Filters
              sp={sp}
              set={set}

              categories={
                cfg?.categories||
                []
              }

              brands={
                brands.data||
                []
              }
            />

          </div>

        </div>

      )}

    </main>

  );
}


/* =========================================================
   FILTERS
   ========================================================= */

function Filters({
  sp,
  set,
  categories,
  brands
}){

  const [q,setQ]=useState(
    sp.get('q')||
    ''
  );


  const submit=e=>{

    e.preventDefault();

    set(
      'q',
      q
    );

  };


  return(

    <div className="card p-5">


      <h3 className="font-black">
        Filters
      </h3>


      {/* SEARCH */}

      <form
        className="mt-5"
        onSubmit={submit}
      >

        <label className="label">
          Search
        </label>


        <div className="flex gap-2">

          <input
            value={q}

            onChange={e=>
              setQ(
                e.target.value
              )
            }

            className="input min-w-0"

            placeholder="Name, generic, SKU..."
          />


          <button
            type="submit"
            className="btn-secondary shrink-0 px-3"
          >
            <Search size={17}/>
          </button>

        </div>

      </form>


      {/* CATEGORY */}

      <label className="label mt-5">
        Category
      </label>


      <select
        className="input"

        value={
          sp.get('category')||
          ''
        }

        onChange={e=>
          set(
            'category',
            e.target.value
          )
        }
      >

        <option value="">
          All categories
        </option>


        {categories.map(c=>(

          <option
            value={c.slug}
            key={c.id}
          >
            {c.name}
          </option>

        ))}

      </select>


      {/* BRAND */}

      <label className="label mt-5">
        Brand
      </label>


      <select
        className="input"

        value={
          sp.get('brand')||
          ''
        }

        onChange={e=>
          set(
            'brand',
            e.target.value
          )
        }
      >

        <option value="">
          All brands
        </option>


        {brands.map(b=>(

          <option
            value={b.slug}
            key={b.id}
          >
            {b.name}
          </option>

        ))}

      </select>


      {/* CLEAR */}

      <button
        type="button"
        className="btn-ghost mt-5 w-full"

        onClick={()=>{

          setQ('');

          set(
            'q',
            ''
          );

          set(
            'category',
            ''
          );

          set(
            'brand',
            ''
          );

        }}
      >
        Clear all filters
      </button>

    </div>

  );
}


/* =========================================================
   PAGINATION
   ========================================================= */

function Pagination({
  page,
  pages,
  go
}){

  if(pages<=1){
    return null;
  }


  const items=[];


  for(
    let i=Math.max(
      1,
      page-2
    );

    i<=Math.min(
      pages,
      page+2
    );

    i++
  ){

    items.push(i);

  }


  return(

    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">


      <button
        type="button"
        disabled={
          page<=1
        }

        onClick={()=>
          go(
            page-1
          )
        }

        className="btn-secondary px-3 py-2"
      >
        ←
      </button>


      {items.map(i=>(

        <button
          type="button"
          onClick={()=>
            go(i)
          }

          key={i}

          className={
            i===page
              ? 'btn-primary px-4 py-2'
              : 'btn-secondary px-4 py-2'
          }
        >
          {i}
        </button>

      ))}


      <button
        type="button"

        disabled={
          page>=pages
        }

        onClick={()=>
          go(
            page+1
          )
        }

        className="btn-secondary px-3 py-2"
      >
        →
      </button>

    </div>

  );
}


/* =========================================================
   SKELETON GRID
   ========================================================= */

function SkeletonGrid(){

  return(

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

      {Array
        .from({
          length:8
        })
        .map((_,i)=>(

          <div
            className="card h-full animate-pulse p-3 sm:p-4"
            key={i}
          >

            <div className="aspect-square rounded-xl bg-slate-100"/>

            <div className="mt-4 h-4 w-3/4 rounded bg-slate-100"/>

            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100"/>

          </div>

        ))}

    </div>

  );
}