import {
  useMemo,
  useState
} from 'react';

import {
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import {Link} from 'react-router-dom';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Braces,
  Package,
  X,
  Tag,
  Layers3
} from 'lucide-react';

import http,{
  assetUrl
} from '../../api/http';


/* =========================================================
   HELPERS
   ========================================================= */

const normalize=(value)=>
  String(value??'')
    .trim()
    .toLowerCase();


const same=(a,b)=>
  normalize(a)===
  normalize(b);


/* =========================================================
   ADMIN PRODUCTS
   ========================================================= */

export default function AdminProducts(){

  const qc=
    useQueryClient();


  /* =====================================================
     FILTER STATES
     ===================================================== */

  const [q,setQ]=
    useState('');

  const [status,setStatus]=
    useState('');

  const [categoryId,setCategoryId]=
    useState('');

  const [brandId,setBrandId]=
    useState('');


  /* =====================================================
     CATEGORIES
     ===================================================== */

  const categoriesQuery=
    useQuery({

      queryKey:[
        'admin-product-categories'
      ],

      queryFn:()=>
        http
          .get(
            '/admin/categories'
          )
          .then(
            r=>
              r.data?.data||
              []
          ),

      staleTime:
        5*60*1000

    });


  /*
   * Categories are also sorted A -> Z
   */

  const categories=
    useMemo(
      ()=>{

        const list=
          Array.isArray(
            categoriesQuery.data
          )
            ? [
                ...categoriesQuery.data
              ]
            : [];


        return list.sort(
          (a,b)=>
            String(
              a.name||
              ''
            ).localeCompare(
              String(
                b.name||
                ''
              ),
              'en',
              {
                sensitivity:'base',
                numeric:true
              }
            )
        );

      },
      [
        categoriesQuery.data
      ]
    );


  /* =====================================================
     BRANDS
     ===================================================== */

  const brandsQuery=
    useQuery({

      queryKey:[
        'admin-product-brands'
      ],

      queryFn:()=>
        http
          .get(
            '/admin/brands'
          )
          .then(
            r=>
              r.data?.data||
              []
          ),

      staleTime:
        5*60*1000

    });


  /*
   * Brands are also sorted A -> Z
   */

  const brands=
    useMemo(
      ()=>{

        const list=
          Array.isArray(
            brandsQuery.data
          )
            ? [
                ...brandsQuery.data
              ]
            : [];


        return list.sort(
          (a,b)=>
            String(
              a.name||
              ''
            ).localeCompare(
              String(
                b.name||
                ''
              ),
              'en',
              {
                sensitivity:'base',
                numeric:true
              }
            )
        );

      },
      [
        brandsQuery.data
      ]
    );


  /* =====================================================
     PRODUCTS
     ===================================================== */

  const {
    data,
    isLoading
  }=useQuery({

    queryKey:[
      'adminProducts',
      q,
      status
    ],

    queryFn:()=>
      http
        .get(
          '/admin/products',
          {
            params:{
              q,
              status,
              limit:100
            }
          }
        )
        .then(
          r=>r.data
        )

  });


  const rows=
    data?.data||
    [];


  /* =====================================================
     SELECTED CATEGORY
     ===================================================== */

  const selectedCategory=
    categories.find(
      category=>
        String(
          category.id
        )===
        String(
          categoryId
        )
    );


  /* =====================================================
     SELECTED BRAND
     ===================================================== */

  const selectedBrand=
    brands.find(
      brand=>
        String(
          brand.id
        )===
        String(
          brandId
        )
    );


  /* =====================================================
     FILTER PRODUCTS + A -> Z SORT
     ===================================================== */

  const filteredRows=
    useMemo(
      ()=>{

        return rows

          /* ===========================================
             FILTER
             =========================================== */

          .filter(
            p=>{


              /* =======================================
                 CATEGORY FILTER
                 ======================================= */

              if(categoryId){

                const matchById=
                  String(
                    p.category_id??
                    p.categoryId??
                    ''
                  )===
                  String(
                    categoryId
                  );


                const matchByName=
                  selectedCategory
                    ? same(
                        p.category,
                        selectedCategory.name
                      )
                    : false;


                const matchBySlug=
                  selectedCategory?.slug
                    ? same(
                        p.category_slug,
                        selectedCategory.slug
                      )
                    : false;


                if(
                  !matchById&&
                  !matchByName&&
                  !matchBySlug
                ){

                  return false;

                }

              }


              /* =======================================
                 BRAND FILTER
                 ======================================= */

              if(brandId){

                const matchById=
                  String(
                    p.brand_id??
                    p.brandId??
                    ''
                  )===
                  String(
                    brandId
                  );


                const matchByName=
                  selectedBrand
                    ? same(
                        p.brand,
                        selectedBrand.name
                      )
                    : false;


                const matchBySlug=
                  selectedBrand?.slug
                    ? same(
                        p.brand_slug,
                        selectedBrand.slug
                      )
                    : false;


                if(
                  !matchById&&
                  !matchByName&&
                  !matchBySlug
                ){

                  return false;

                }

              }


              return true;

            }
          )


          /* ===========================================
             PRODUCT SORTING

             A -> Z
             =========================================== */

          .sort(
            (a,b)=>
              String(
                a.name||
                ''
              ).localeCompare(
                String(
                  b.name||
                  ''
                ),
                'en',
                {
                  sensitivity:'base',
                  numeric:true
                }
              )
          );

      },
      [
        rows,
        categoryId,
        brandId,
        selectedCategory,
        selectedBrand
      ]
    );


  /* =====================================================
     ARCHIVE / DELETE
     ===================================================== */

  const remove=
    async p=>{

      if(
        !window.confirm(
          `Archive ${p.name}? Existing order history will remain intact.`
        )
      ){

        return;

      }


      try{

        await http.delete(
          '/admin/products/'+
          p.id
        );


        await qc.invalidateQueries({
          queryKey:[
            'adminProducts'
          ]
        });


      }catch(e){

        alert(
          e.response?.data?.message||
          'Could not archive product'
        );

      }

    };


  /* =====================================================
     CLEAR ALL FILTERS
     ===================================================== */

  const clearFilters=()=>{

    setQ('');

    setStatus('');

    setCategoryId('');

    setBrandId('');

  };


  const hasFilters=
    Boolean(
      q||
      status||
      categoryId||
      brandId
    );


  /* =====================================================
     PAGE
     ===================================================== */

  return(
    <>


      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">


        <div>

          <h1 className="admin-page-title">

            Products

          </h1>


          <p className="mt-1 text-sm text-slate-500">

            Full catalog control including rich descriptions,
            price, visibility, cover and gallery images,
            stock and JSON import.

          </p>

        </div>


        <div className="flex flex-wrap gap-2">


          <Link
            className="btn-secondary"
            to="/admin/products/new"
          >

            <Braces size={17}/>

            JSON Import

          </Link>


          <Link
            className="btn-primary"
            to="/admin/products/new"
          >

            <Plus size={18}/>

            Add Product

          </Link>

        </div>

      </div>


      {/* =================================================
          CATEGORY + BRAND FILTERS
          ================================================= */}

      <div className="admin-section mt-6">


        {/* ===============================================
            CATEGORY
            =============================================== */}

        <div>


          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">


            <div className="flex items-center gap-2">

              <Layers3
                size={18}
                className="text-brand-600"
              />


              <h3 className="font-black text-slate-800">

                Categories

              </h3>

            </div>


            {selectedCategory&&(

              <div className="text-xs font-semibold text-slate-500">

                Selected:{' '}

                <span className="text-brand-700">

                  {
                    selectedCategory.name
                  }

                </span>

              </div>

            )}

          </div>


          {/* =============================================
              CATEGORY ONE ROW
              ============================================= */}

          <div
            className="
              flex
              flex-nowrap
              gap-2
              overflow-x-auto
              pb-2
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >


            {/* ALL CATEGORIES */}

            <button
              type="button"

              onClick={()=>
                setCategoryId('')
              }

              className={
                `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                  !categoryId

                    ? 'border-brand-600 bg-brand-600 text-white shadow-sm'

                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                }`
              }
            >

              All Categories

            </button>


            {/* CATEGORY ITEMS */}

            {categories.map(
              category=>{

                const active=
                  String(
                    categoryId
                  )===
                  String(
                    category.id
                  );


                return(

                  <button
                    type="button"

                    key={
                      category.id
                    }

                    onClick={()=>
                      setCategoryId(
                        String(
                          category.id
                        )
                      )
                    }

                    className={
                      `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                        active

                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'

                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                      }`
                    }
                  >

                    {
                      category.name
                    }

                  </button>

                );

              }
            )}

          </div>

        </div>


        {/* ===============================================
            BRAND
            =============================================== */}

        <div className="mt-5 border-t border-slate-100 pt-5">


          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">


            <div className="flex items-center gap-2">

              <Tag
                size={18}
                className="text-brand-600"
              />


              <h3 className="font-black text-slate-800">

                Brands

              </h3>

            </div>


            {selectedBrand&&(

              <div className="text-xs font-semibold text-slate-500">

                Selected:{' '}

                <span className="text-brand-700">

                  {
                    selectedBrand.name
                  }

                </span>

              </div>

            )}

          </div>


          {/* =============================================
              BRAND ONE ROW
              ============================================= */}

          <div
            className="
              flex
              flex-nowrap
              gap-2
              overflow-x-auto
              pb-2
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >


            {/* ALL BRANDS */}

            <button
              type="button"

              onClick={()=>
                setBrandId('')
              }

              className={
                `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                  !brandId

                    ? 'border-brand-600 bg-brand-600 text-white shadow-sm'

                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                }`
              }
            >

              All Brands

            </button>


            {/* BRAND ITEMS */}

            {brands.map(
              brand=>{

                const active=
                  String(
                    brandId
                  )===
                  String(
                    brand.id
                  );


                return(

                  <button
                    type="button"

                    key={
                      brand.id
                    }

                    onClick={()=>
                      setBrandId(
                        String(
                          brand.id
                        )
                      )
                    }

                    className={
                      `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                        active

                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'

                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                      }`
                    }
                  >

                    {
                      brand.name
                    }

                  </button>

                );

              }
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          PRODUCTS SECTION
          ================================================= */}

      <div className="admin-section mt-6 overflow-hidden p-0">


        {/* ===============================================
            SEARCH / STATUS
            =============================================== */}

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">


          {/* SEARCH */}

          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">

            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />


            <input
              value={
                q
              }

              onChange={
                e=>
                  setQ(
                    e.target.value
                  )
              }

              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"

              placeholder="Search name, SKU, slug or generic name..."
            />

          </label>


          {/* STATUS */}

          <select
            className="input lg:w-44"

            value={
              status
            }

            onChange={
              e=>
                setStatus(
                  e.target.value
                )
            }
          >

            <option value="">

              All status

            </option>

            <option value="active">

              Active

            </option>

            <option value="inactive">

              Inactive

            </option>

          </select>


          {/* CLEAR FILTERS */}

          {hasFilters&&(

            <button
              type="button"

              onClick={
                clearFilters
              }

              className="btn-secondary shrink-0"
            >

              <X size={16}/>

              Clear filters

            </button>

          )}

        </div>


        {/* ===============================================
            FILTER SUMMARY
            =============================================== */}

        <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50/70 px-4 py-3 text-xs text-slate-500">


          <span className="font-bold text-slate-700">

            {
              filteredRows.length
            }

          </span>


          <span>

            product{
              filteredRows.length===
              1
                ? ''
                : 's'
            }

          </span>


          {/* A-Z */}

          <span className="badge bg-white text-slate-600">

            A → Z

          </span>


          {/* CATEGORY */}

          {selectedCategory&&(

            <span className="badge bg-brand-50 text-brand-700">

              Category:
              {' '}
              {
                selectedCategory.name
              }

            </span>

          )}


          {/* BRAND */}

          {selectedBrand&&(

            <span className="badge bg-sky-50 text-sky-700">

              Brand:
              {' '}
              {
                selectedBrand.name
              }

            </span>

          )}


          {/* STATUS */}

          {status&&(

            <span className="badge bg-slate-200 text-slate-700">

              Status:
              {' '}
              {
                status
              }

            </span>

          )}

        </div>


        {/* ===============================================
            TABLE
            =============================================== */}

        <div className="overflow-x-auto">

          <table className="admin-table">


            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  SKU
                </th>

                <th>
                  Category
                </th>

                <th>
                  Brand
                </th>

                <th>
                  Price
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Flags
                </th>

                <th>
                  Status
                </th>

                <th className="text-right">

                  Actions

                </th>

              </tr>

            </thead>


            <tbody>


              {/* =========================================
                  PRODUCTS
                  ========================================= */}

              {filteredRows.map(
                p=>(

                  <tr
                    key={
                      p.id
                    }
                  >


                    {/* PRODUCT */}

                    <td>

                      <div className="flex min-w-64 items-center gap-3">


                        {p.image?(

                          <img
                            src={
                              assetUrl(
                                p.image
                              )
                            }

                            alt={
                              p.name
                            }

                            className="h-12 w-12 shrink-0 rounded-xl bg-slate-50 object-contain"
                          />

                        ):(

                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100">

                            <Package
                              size={18}
                            />

                          </div>

                        )}


                        <div className="min-w-0">


                          <div className="font-bold">

                            {
                              p.name
                            }

                          </div>


                          <div className="text-xs text-slate-500">

                            {
                              p.generic_name||
                              p.slug
                            }

                          </div>

                        </div>

                      </div>

                    </td>


                    {/* SKU */}

                    <td className="font-mono text-xs">

                      {
                        p.sku||
                        '—'
                      }

                    </td>


                    {/* CATEGORY */}

                    <td>

                      {
                        p.category||
                        '—'
                      }

                    </td>


                    {/* BRAND */}

                    <td>

                      {
                        p.brand||
                        '—'
                      }

                    </td>


                    {/* PRICE */}

                    <td>

                      <b>

                        ৳{
                          Number(
                            p.sale_price||
                            0
                          ).toLocaleString()
                        }

                      </b>


                      {Number(
                        p.regular_price||
                        0
                      )>
                      Number(
                        p.sale_price||
                        0
                      )&&(

                        <div className="text-xs text-slate-400 line-through">

                          ৳{
                            Number(
                              p.regular_price||
                              0
                            ).toLocaleString()
                          }

                        </div>

                      )}

                    </td>


                    {/* STOCK */}

                    <td>

                      <span
                        className={
                          `badge ${
                            Number(
                              p.stock||
                              0
                            )<=0

                              ? 'bg-rose-50 text-rose-700'

                              : Number(
                                  p.stock||
                                  0
                                )<=10

                                ? 'bg-amber-50 text-amber-700'

                                : 'bg-emerald-50 text-emerald-700'
                          }`
                        }
                      >

                        {
                          p.stock??
                          0
                        }

                      </span>

                    </td>


                    {/* FLAGS */}

                    <td>

                      <div className="flex flex-wrap gap-1">


                        {p.prescription_required?(

                          <span className="badge bg-violet-50 text-violet-700">

                            Rx

                          </span>

                        ):null}


                        {p.is_featured?(

                          <span className="badge bg-sky-50 text-sky-700">

                            Featured

                          </span>

                        ):null}


                        {p.is_best_seller?(

                          <span className="badge bg-amber-50 text-amber-700">

                            Best

                          </span>

                        ):null}


                        {p.is_new_arrival?(

                          <span className="badge bg-emerald-50 text-emerald-700">

                            New

                          </span>

                        ):null}

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={
                          `badge ${
                            p.is_active

                              ? 'bg-emerald-50 text-emerald-700'

                              : 'bg-slate-100 text-slate-500'
                          }`
                        }
                      >

                        {
                          p.is_active
                            ? 'Active'
                            : 'Inactive'
                        }

                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="flex justify-end gap-1">


                        <Link
                          to={
                            `/admin/products/${p.id}/edit`
                          }

                          className="btn-ghost"
                        >

                          <Pencil
                            size={16}
                          />

                          Edit

                        </Link>


                        <button
                          type="button"

                          onClick={()=>
                            remove(p)
                          }

                          className="btn-ghost text-rose-600"
                        >

                          <Trash2
                            size={16}
                          />

                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}


              {/* =========================================
                  NO PRODUCTS
                  ========================================= */}

              {!filteredRows.length&&
                !isLoading&&(

                <tr>

                  <td
                    colSpan="9"
                    className="py-12 text-center"
                  >

                    <Package
                      size={34}
                      className="mx-auto text-slate-300"
                    />


                    <div className="mt-3 font-bold text-slate-500">

                      No products found.

                    </div>


                    <p className="mt-1 text-xs text-slate-400">

                      Try another category, brand, search or status.

                    </p>


                    {hasFilters&&(

                      <button
                        type="button"

                        onClick={
                          clearFilters
                        }

                        className="btn-secondary mt-4"
                      >

                        <X size={15}/>

                        Clear filters

                      </button>

                    )}

                  </td>

                </tr>

              )}


              {/* =========================================
                  LOADING
                  ========================================= */}

              {isLoading&&(

                <tr>

                  <td
                    colSpan="9"
                    className="py-12 text-center text-slate-400"
                  >

                    Loading products...

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </>
  );

}