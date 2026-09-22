import {imageFallback} from '../../api/assets';
import {adminConfirm,adminPrompt,adminAlert} from '../../components/admin/AdminDialogs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Upload,
  Star,
  Trash2,
  Braces,
  FileText,
  RefreshCw,
  Link2,
  Image as ImageIcon,
} from 'lucide-react';

import http, { assetUrl } from '../../api/http';
import RichTextEditor from '../../components/admin/RichTextEditor';


/* =========================================================
   HELPERS
   ========================================================= */

const slugify = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
    .replace(/^-+|-+$/g, '');


const isValidHttpUrl = (value) => {
  try {
    const url = new URL(String(value || '').trim());

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
};


const parseImageUrls = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);


/*
 * External image URL -> File
 *
 * This allows us to keep using the existing:
 *
 * POST /admin/products/:id/images
 *
 * endpoint with FormData.
 */
const urlToImageFile = async (
  imageUrl,
  namePrefix = 'product-image',
) => {
  const cleanUrl = String(imageUrl || '').trim();

  if (!isValidHttpUrl(cleanUrl)) {
    throw new Error(
      `Invalid image URL: ${cleanUrl}`,
    );
  }

  let response;

  try {
    response = await fetch(cleanUrl, {
      method: 'GET',
      mode: 'cors',
    });
  } catch {
    throw new Error(
      `Could not download image from URL: ${cleanUrl}. The image server may be blocking external access/CORS.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Image URL returned HTTP ${response.status}: ${cleanUrl}`,
    );
  }

  const blob = await response.blob();

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!allowedTypes.includes(blob.type)) {
    throw new Error(
      `Unsupported image type "${blob.type || 'unknown'}". Please use JPG, PNG or WebP.`,
    );
  }

  const extensionMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  const extension =
    extensionMap[blob.type] || 'jpg';

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8);

  const filename =
    `${namePrefix}-${Date.now()}-${randomPart}.${extension}`;

  return new File(
    [blob],
    filename,
    {
      type: blob.type,
    },
  );
};


const resolveImageSrc = (url) => {
  const value = String(url || '');

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return assetUrl(value);
};


/* =========================================================
   EMPTY PRODUCT
   ========================================================= */

const empty = {
  name: '',
  slug: '',
  sku: '',
  barcode: '',
  genericName: '',

  brandId: '',
  manufacturerId: '',
  categoryId: '',

  productType: 'Medicine',
  dosageForm: 'Tablet',
  strength: '',
  packSize: '',

  unitLabel: 'Tablet',
  unitPrice: '',

  unitsPerStrip: 10,
  stripPrice: '',

  stripsPerBox: 10,
  unitsPerBox: 100,
  boxPrice: '',

  discountPercent: 20,

  shortDescription: '',
  description: '',
  ingredients: '',
  usageInfo: '',
  warnings: '',
  storageInfo: '',

  regularPrice: '',
  salePrice: '',
  costPrice: '',

  taxRate: 0,
  lowStockThreshold: 10,

  seoTitle: '',
  seoDescription: '',

  prescriptionRequired: false,
  featured: false,
  bestSeller: false,
  newArrival: false,
  active: true,
};


/* =========================================================
   DB -> FORM
   ========================================================= */

const fromDb = (p) => ({
  name: p.name || '',
  slug: p.slug || '',
  sku: p.sku || '',
  barcode: p.barcode || '',
  genericName: p.generic_name || '',

  brandId: p.brand_id || '',
  manufacturerId: p.manufacturer_id || '',
  categoryId: p.category_id || '',

  productType: p.product_type || '',
  dosageForm: p.dosage_form || '',
  strength: p.strength || '',
  packSize: p.pack_size || '',

  unitLabel: p.unit_label || 'Tablet',
  unitPrice: p.unit_price ?? '',

  unitsPerStrip:
    p.units_per_strip ?? 10,

  stripPrice:
    p.strip_price ?? '',

  stripsPerBox:
    p.strips_per_box ?? 10,

  unitsPerBox:
    p.units_per_box ?? 100,

  boxPrice:
    p.box_price ?? '',

  discountPercent:
    p.discount_percent ?? 20,

  shortDescription:
    p.short_description || '',

  description:
    p.description || '',

  ingredients:
    p.ingredients || '',

  usageInfo:
    p.usage_info || '',

  warnings:
    p.warnings || '',

  storageInfo:
    p.storage_info || '',

  regularPrice:
    p.regular_price ?? '',

  salePrice:
    p.sale_price ?? '',

  costPrice:
    p.cost_price ?? '',

  taxRate:
    p.tax_rate ?? 0,

  lowStockThreshold:
    p.low_stock_threshold ?? 10,

  seoTitle:
    p.seo_title || '',

  seoDescription:
    p.seo_description || '',

  prescriptionRequired:
    Boolean(p.prescription_required),

  featured:
    Boolean(p.is_featured),

  bestSeller:
    Boolean(p.is_best_seller),

  newArrival:
    Boolean(p.is_new_arrival),

  active:
    Boolean(p.is_active),
});


/* =========================================================
   PRODUCT FORM
   ========================================================= */

export default function ProductForm() {
  const { id } = useParams();

  const editing = Boolean(id);

  const nav = useNavigate();

  const qc = useQueryClient();


  /* -------------------------------------------------------
     GENERAL STATE
     ------------------------------------------------------- */

  const [tab, setTab] =
    useState('form');

  const [f, setF] =
    useState(empty);

  const [busy, setBusy] =
    useState(false);

  const [err, setErr] =
    useState('');


  /* -------------------------------------------------------
     FILE IMAGE STATE
     ------------------------------------------------------- */

  const [cover, setCover] =
    useState(null);

  const [extras, setExtras] =
    useState([]);


  /* -------------------------------------------------------
     IMAGE URL STATE
     ------------------------------------------------------- */

  const [coverUrl, setCoverUrl] =
    useState('');

  /*
   * One URL per line.
   */
  const [extraImageUrls, setExtraImageUrls] =
    useState('');


  /* -------------------------------------------------------
     JSON IMPORT STATE
     ------------------------------------------------------- */

  const [json, setJson] =
    useState(
      JSON.stringify(
        {
          name: 'Demo Product',

          slug: 'demo-product',

          sku: 'DEMO-JSON-001',

          genericName:
            'Demo ingredient',

          categoryId: 1,

          brandId: 1,

          manufacturerId: 1,

          productType:
            'Medicine',

          dosageForm:
            'Tablet',

          strength:
            '500 mg',

          packSize:
            '10 tablets',

          shortDescription:
            '<p>Short formatted description.</p>',

          description:
            '<p><strong>Full product description</strong> can contain formatted text.</p>',

          ingredients:
            '<p>Ingredient information.</p>',

          usageInfo:
            '<p>Use according to the package label or professional guidance.</p>',

          warnings:
            '<p>Safety and warning information.</p>',

          storageInfo:
            '<p>Store according to the package label.</p>',

          regularPrice: 120,

          discountPercent: 20,

          salePrice: 96,

          costPrice: 70,

          unitLabel:
            'Tablet',

          unitPrice:
            9.6,

          unitsPerStrip:
            10,

          stripPrice:
            96,

          stripsPerBox:
            10,

          unitsPerBox:
            100,

          boxPrice:
            900,

          prescriptionRequired:
            false,

          featured:
            true,

          bestSeller:
            false,

          newArrival:
            true,

          active:
            true,

          images: [
            {
              url: 'https://example.com/product-cover.jpg',
              isPrimary: true,
              altText:
                'Demo product cover',
            },
          ],

          batches: [
            {
              batchNumber:
                'JSON-BATCH-001',

              manufacturingDate:
                '2026-01-01',

              expiryDate:
                '2028-01-01',

              purchasePrice:
                70,

              sellingPrice:
                100,

              quantity:
                50,
            },
          ],
        },
        null,
        2,
      ),
    );


  /* =======================================================
     REFERENCES
     ======================================================= */

  const refs = useQuery({
    queryKey: [
      'admin-product-refs',
    ],

    queryFn: async () => {
      const [
        categories,
        brands,
        manufacturers,
      ] = await Promise.all([
        http.get(
          '/admin/categories',
        ),

        http.get(
          '/admin/brands',
        ),

        http.get(
          '/admin/manufacturers',
        ),
      ]);

      return {
        categories:
          categories.data.data,

        brands:
          brands.data.data,

        manufacturers:
          manufacturers.data.data,
      };
    },
  });


  /* =======================================================
     CURRENT PRODUCT
     ======================================================= */

  const product = useQuery({
    queryKey: [
      'admin-product',
      id,
    ],

    enabled:
      editing,

    queryFn: () =>
      http
        .get(
          '/admin/products/' +
          id,
        )
        .then(
          (r) =>
            r.data.data,
        ),
  });


  useEffect(() => {
    if (product.data) {
      setF(
        fromDb(
          product.data,
        ),
      );
    }
  }, [product.data]);


  const set = (key, value) => {
    setF((current) => ({
      ...current,
      [key]: value,
    }));
  };


  /* =======================================================
     SAVE PRODUCT
     ======================================================= */

  const save = async () => {
    setBusy(true);

    setErr('');

    try {
      let productId =
        id;


      /* -----------------------------------------------
         CREATE / UPDATE BASIC PRODUCT
         ----------------------------------------------- */

      if (editing) {
        await http.patch(
          '/admin/products/' +
          id,
          f,
        );
      } else {
        const response =
          await http.post(
            '/admin/products',
            f,
          );

        productId =
          response.data.data.id;
      }


      /* -----------------------------------------------
         PREPARE IMAGE URLS
         ----------------------------------------------- */

      const galleryUrls =
        parseImageUrls(
          extraImageUrls,
        );

      if (
        coverUrl.trim() &&
        !isValidHttpUrl(
          coverUrl,
        )
      ) {
        throw new Error(
          'Please enter a valid Cover Image URL beginning with http:// or https://',
        );
      }


      for (
        const imageUrl of galleryUrls
      ) {
        if (
          !isValidHttpUrl(
            imageUrl,
          )
        ) {
          throw new Error(
            `Invalid gallery image URL: ${imageUrl}`,
          );
        }
      }


      const hasImages =
        Boolean(cover) ||
        extras.length > 0 ||
        Boolean(
          coverUrl.trim(),
        ) ||
        galleryUrls.length > 0;


      /* -----------------------------------------------
         UPLOAD FILES + URL IMAGES
         ----------------------------------------------- */

      if (
        hasImages &&
        productId
      ) {
        const fd =
          new FormData();


        /*
         * Cover priority:
         *
         * 1. Uploaded file
         * 2. Cover URL
         */

        if (cover) {
          fd.append(
            'cover',
            cover,
          );
        } else if (coverUrl.trim()) {
          fd.append('coverUrl', coverUrl.trim());
        }


        /*
         * Local extra images
         */

        for (
          const image of extras
        ) {
          fd.append(
            'images',
            image,
          );
        }


        /*
         * External URL gallery images
         */

        if (galleryUrls.length) {
          fd.append('imageUrls', JSON.stringify(galleryUrls));
        }


        /*
         * Existing image upload endpoint.
         *
         * Backend continues receiving:
         *
         * cover
         * images[]
         */

        await http.post(
          `/admin/products/${productId}/images`,
          fd,
        );
      }


      await qc.invalidateQueries({
        queryKey: [
          'adminProducts',
        ],
      });


      nav(
        '/admin/products',
      );

    } catch (e) {
      setErr(
        e.response?.data?.message ||
        e.message ||
        'Could not save product',
      );
    } finally {
      setBusy(false);
    }
  };


  /* =======================================================
     JSON
     ======================================================= */

  const formatJson = () => {
    try {
      setJson(
        JSON.stringify(
          JSON.parse(json),
          null,
          2,
        ),
      );

      setErr('');
    } catch (e) {
      setErr(
        'Invalid JSON: ' +
        e.message,
      );
    }
  };


  const importJson =
    async () => {
      setBusy(true);

      setErr('');

      try {
        const parsed =
          JSON.parse(json);

        const payload =
          Array.isArray(parsed)
            ? {
              products:
                parsed,
            }
            : Array.isArray(
              parsed?.products,
            )
              ? parsed
              : parsed?.product
                ? parsed
                : {
                  product:
                    parsed,
                };


        await http.post(
          '/admin/products/import-json',
          payload,
        );


        await qc.invalidateQueries({
          queryKey: [
            'adminProducts',
          ],
        });


        nav(
          '/admin/products',
        );

      } catch (e) {
        setErr(
          e.response?.data?.message ||
          e.message ||
          'Invalid JSON or import failed',
        );
      } finally {
        setBusy(false);
      }
    };


  /* =======================================================
     EXISTING IMAGE ACTION
     ======================================================= */

  const imageAction =
    async (
      imageId,
      action,
    ) => {

      if (
        action ===
        'delete' &&
        !await adminConfirm(
          'Delete this product image?',
        )
      ) {
        return;
      }


      if (
        action ===
        'primary'
      ) {
        await http.patch(
          `/admin/products/${id}/images/${imageId}`,
          {
            isPrimary:
              true,
          },
        );
      } else {
        await http.delete(
          `/admin/products/${id}/images/${imageId}`,
        );
      }


      await product.refetch();
    };


  /* =======================================================
     LOADING
     ======================================================= */

  if (
    editing &&
    product.isLoading
  ) {
    return (
      <div className="admin-section">
        Loading product...
      </div>
    );
  }


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="w-full max-w-none">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <Link
            to="/admin/products"
            className="btn-ghost"
          >
            <ArrowLeft
              size={18}
            />
          </Link>


          <div>

            <h1 className="admin-page-title">
              {editing
                ? 'Edit Product'
                : 'Add Product'}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Complete medicine/product data,
              images, SEO, pricing and visibility.
            </p>

          </div>

        </div>


        <div className="flex rounded-xl border bg-white p-1">

          <button
            type="button"
            onClick={() =>
              setTab('form')
            }
            className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'form'
                ? 'bg-brand-600 text-white'
                : ''
              }`}
          >
            <FileText
              className="mr-1 inline"
              size={15}
            />

            Form
          </button>


          {!editing && (

            <button
              type="button"
              onClick={() =>
                setTab(
                  'json',
                )
              }
              className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'json'
                  ? 'bg-brand-600 text-white'
                  : ''
                }`}
            >
              <Braces
                className="mr-1 inline"
                size={15}
              />

              JSON
            </button>

          )}

        </div>

      </div>


      {/* =================================================
          JSON IMPORT
          ================================================= */}

      {tab === 'json' &&
        !editing ? (

        <div className="admin-section mt-6">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="text-xl font-black">
                Add product from JSON
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Paste one product object or an
                array of up to 100 products.
                External image URLs can be supplied
                through an{' '}
                <code>
                  images
                </code>{' '}
                array, and initial FEFO stock can
                be created with an optional{' '}
                <code>
                  batches
                </code>{' '}
                array.
              </p>

            </div>


            <button
              type="button"
              className="btn-secondary"
              onClick={
                formatJson
              }
            >
              <RefreshCw
                size={16}
              />

              Format
            </button>

          </div>


          <textarea
            value={json}
            onChange={(e) =>
              setJson(
                e.target.value,
              )
            }
            className="mt-5 min-h-[520px] w-full rounded-xl bg-slate-950 p-5 font-mono text-sm leading-6 text-emerald-200 outline-none"
            spellCheck="false"
          />


          {err && (
            <ErrorBox>
              {err}
            </ErrorBox>
          )}


          <button
            type="button"
            disabled={busy}
            onClick={
              importJson
            }
            className="btn-primary mt-5"
          >
            <Braces
              size={17}
            />

            {busy
              ? 'Importing...'
              : 'Validate & Import JSON'}
          </button>

        </div>

      ) : (

        <div className="mt-6 space-y-6">


          {/* =============================================
              BASIC INFORMATION
              ============================================= */}

          <Section
            title="Basic Information"
            note="Names, slugs and catalog identifiers are fully editable."
          >

            <Grid>

              <Input
                label="Product name"
                value={f.name}
                set={(v) =>
                  set(
                    'name',
                    v,
                  )
                }
                required
              />


              <div>

                <label className="label">
                  Slug
                </label>

                <div className="flex gap-2">

                  <input
                    className="input"
                    value={f.slug}
                    onChange={(e) =>
                      set(
                        'slug',
                        e.target
                          .value,
                      )
                    }
                  />

                  <button
                    type="button"
                    className="btn-secondary px-3"
                    onClick={() =>
                      set(
                        'slug',
                        slugify(
                          f.name,
                        ),
                      )
                    }
                  >
                    Generate
                  </button>

                </div>

              </div>


              <Input
                label="SKU"
                value={f.sku}
                set={(v) =>
                  set(
                    'sku',
                    v,
                  )
                }
                help="Leave blank on new product to auto-generate."
              />


              <Input
                label="Barcode"
                value={f.barcode}
                set={(v) =>
                  set(
                    'barcode',
                    v,
                  )
                }
              />


              <Input
                label="Generic name"
                value={f.genericName}
                set={(v) =>
                  set(
                    'genericName',
                    v,
                  )
                }
              />


              <Input
                label="Product type"
                value={f.productType}
                set={(v) =>
                  set(
                    'productType',
                    v,
                  )
                }
              />

            </Grid>

          </Section>


          {/* =============================================
              CLASSIFICATION
              ============================================= */}

          <Section title="Classification">

            <Grid>

              <Select
                label="Category"
                value={
                  f.categoryId
                }
                set={(v) =>
                  set(
                    'categoryId',
                    v,
                  )
                }
                options={
                  refs.data
                    ?.categories ||
                  []
                }
              />


              <Select
                label="Brand"
                value={
                  f.brandId
                }
                set={(v) =>
                  set(
                    'brandId',
                    v,
                  )
                }
                options={
                  refs.data
                    ?.brands ||
                  []
                }
              />


              <Select
                label="Manufacturer"
                value={
                  f.manufacturerId
                }
                set={(v) =>
                  set(
                    'manufacturerId',
                    v,
                  )
                }
                options={
                  refs.data
                    ?.manufacturers ||
                  []
                }
              />


              <Input
                label="Dosage form"
                value={
                  f.dosageForm
                }
                set={(v) =>
                  set(
                    'dosageForm',
                    v,
                  )
                }
                placeholder="Tablet, capsule, cream, device..."
              />


              <Input
                label="Strength"
                value={
                  f.strength
                }
                set={(v) =>
                  set(
                    'strength',
                    v,
                  )
                }
                placeholder="500 mg"
              />


              <Input
                label="Pack size"
                value={
                  f.packSize
                }
                set={(v) =>
                  set(
                    'packSize',
                    v,
                  )
                }
                placeholder="10 tablets"
              />

            </Grid>

          </Section>


          {/* =============================================
              PRODUCT CONTENT
              ============================================= */}

          <Section
            title="Product Content"
            note="Every long text field includes Bold, Italic, Underline, color, heading, lists, alignment and link controls."
          >

            <Editor
              label="Short description"
              value={
                f.shortDescription
              }
              set={(v) =>
                set(
                  'shortDescription',
                  v,
                )
              }
              minHeight={110}
            />


            <Editor
              label="Full description"
              value={
                f.description
              }
              set={(v) =>
                set(
                  'description',
                  v,
                )
              }
              minHeight={190}
            />


            <div className="grid gap-5 lg:grid-cols-2">

              <Editor
                label="Ingredients / Composition"
                value={
                  f.ingredients
                }
                set={(v) =>
                  set(
                    'ingredients',
                    v,
                  )
                }
              />


              <Editor
                label="Usage / Catalog Information"
                value={
                  f.usageInfo
                }
                set={(v) =>
                  set(
                    'usageInfo',
                    v,
                  )
                }
              />


              <Editor
                label="Warnings"
                value={
                  f.warnings
                }
                set={(v) =>
                  set(
                    'warnings',
                    v,
                  )
                }
              />


              <Editor
                label="Storage Information"
                value={
                  f.storageInfo
                }
                set={(v) =>
                  set(
                    'storageInfo',
                    v,
                  )
                }
              />

            </div>

          </Section>


          {/* =============================================
              PRICING & INVENTORY
              ============================================= */}

          <Section
            title="Pricing & Inventory"
            note="Default medicine discount is 20%. You can change the percentage per product. Unit/strip/box quantities control how stock is deducted."
          >

            <Grid>

              <Input
                label="Regular / MRP price"
                type="number"
                value={
                  f.regularPrice
                }
                set={(v) => {
                  set(
                    'regularPrice',
                    v,
                  );

                  const n =
                    Number(
                      v || 0,
                    );

                  const d =
                    Number(
                      f.discountPercent ||
                      0,
                    );

                  if (n >= 0) {
                    set(
                      'salePrice',
                      (
                        n *
                        (1 -
                          d /
                          100)
                      ).toFixed(
                        2,
                      ),
                    );
                  }
                }}
                required
              />


              <Input
                label="Discount (%)"
                type="number"
                value={
                  f.discountPercent
                }
                set={(v) => {
                  set(
                    'discountPercent',
                    v,
                  );

                  const n =
                    Number(
                      f.regularPrice ||
                      0,
                    );

                  const d =
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          v ||
                          0,
                        ),
                      ),
                    );

                  if (n >= 0) {
                    set(
                      'salePrice',
                      (
                        n *
                        (1 -
                          d /
                          100)
                      ).toFixed(
                        2,
                      ),
                    );
                  }
                }}
                help="Default 20% for medicines. Sale price is calculated automatically but can still be edited."
              />


              <Input
                label="Sale price"
                type="number"
                value={
                  f.salePrice
                }
                set={(v) =>
                  set(
                    'salePrice',
                    v,
                  )
                }
                required
              />


              <Input
                label="Cost price"
                type="number"
                value={
                  f.costPrice
                }
                set={(v) =>
                  set(
                    'costPrice',
                    v,
                  )
                }
              />


              <Input
                label="Single unit label"
                value={
                  f.unitLabel
                }
                set={(v) =>
                  set(
                    'unitLabel',
                    v,
                  )
                }
                placeholder="Tablet / Capsule / Sachet"
              />


              <Input
                label="Single unit price"
                type="number"
                value={
                  f.unitPrice
                }
                set={(v) =>
                  set(
                    'unitPrice',
                    v,
                  )
                }
              />


              <Input
                label="Units per strip"
                type="number"
                value={
                  f.unitsPerStrip
                }
                set={(v) =>
                  set(
                    'unitsPerStrip',
                    v,
                  )
                }
              />


              <Input
                label="Strip price"
                type="number"
                value={
                  f.stripPrice
                }
                set={(v) =>
                  set(
                    'stripPrice',
                    v,
                  )
                }
              />


              <Input
                label="Strips per box"
                type="number"
                value={
                  f.stripsPerBox
                }
                set={(v) => {
                  set(
                    'stripsPerBox',
                    v,
                  );

                  set(
                    'unitsPerBox',
                    Math.max(
                      1,
                      Number(
                        v || 1,
                      ),
                    ) *
                    Math.max(
                      1,
                      Number(
                        f.unitsPerStrip ||
                        1,
                      ),
                    ),
                  );
                }}
              />


              <Input
                label="Units per box"
                type="number"
                value={
                  f.unitsPerBox
                }
                set={(v) =>
                  set(
                    'unitsPerBox',
                    v,
                  )
                }
                help="Total physical units deducted when one box is ordered."
              />


              <Input
                label="Box price"
                type="number"
                value={
                  f.boxPrice
                }
                set={(v) =>
                  set(
                    'boxPrice',
                    v,
                  )
                }
              />


              <Input
                label="Tax rate (%)"
                type="number"
                value={
                  f.taxRate
                }
                set={(v) =>
                  set(
                    'taxRate',
                    v,
                  )
                }
              />


              <Input
                label="Low-stock threshold"
                type="number"
                value={
                  f.lowStockThreshold
                }
                set={(v) =>
                  set(
                    'lowStockThreshold',
                    v,
                  )
                }
                help="Stock is tracked in physical units."
              />

            </Grid>


            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

              <Check
                label="Active"
                value={
                  f.active
                }
                set={(v) =>
                  set(
                    'active',
                    v,
                  )
                }
              />


              <Check
                label="Prescription required"
                value={
                  f.prescriptionRequired
                }
                set={(v) =>
                  set(
                    'prescriptionRequired',
                    v,
                  )
                }
              />


              <Check
                label="Featured"
                value={
                  f.featured
                }
                set={(v) =>
                  set(
                    'featured',
                    v,
                  )
                }
              />


              <Check
                label="Best seller"
                value={
                  f.bestSeller
                }
                set={(v) =>
                  set(
                    'bestSeller',
                    v,
                  )
                }
              />


              <Check
                label="New arrival"
                value={
                  f.newArrival
                }
                set={(v) =>
                  set(
                    'newArrival',
                    v,
                  )
                }
              />

            </div>

          </Section>


          {/* =============================================
              PRODUCT IMAGES
              ============================================= */}

          <Section
            title="Product Images"
            note="Upload images from your computer or paste direct JPG, PNG or WebP image URLs. External URL images are downloaded and passed through the existing server image optimizer."
          >

            {/* COVER IMAGE */}

            <div>

              <h3 className="mb-3 font-black text-slate-800">
                Cover / Primary Image
              </h3>


              <div className="grid gap-5 lg:grid-cols-2">

                {/* LOCAL COVER */}

                <FileBox
                  label="Upload cover image"
                  file={cover}
                  set={(file) => {
                    setCover(
                      file,
                    );

                    if (file) {
                      setCoverUrl(
                        '',
                      );
                    }
                  }}
                />


                {/* URL COVER */}

                <UrlImageBox
                  label="Cover image URL"
                  value={
                    coverUrl
                  }
                  set={(value) => {
                    setCoverUrl(
                      value,
                    );

                    if (
                      value.trim()
                    ) {
                      setCover(
                        null,
                      );
                    }
                  }}
                  placeholder="https://example.com/product-image.jpg"
                />

              </div>

            </div>


            {/* EXTRA GALLERY */}

            <div className="mt-7 border-t border-slate-200 pt-6">

              <h3 className="mb-3 font-black text-slate-800">
                Extra images
              </h3>


              <div className="grid gap-5 lg:grid-cols-2">

                {/* LOCAL EXTRA IMAGES */}

                <div>

                  <label className="label">
                    Upload extra images
                  </label>


                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50/30">

                    <Upload
                      size={22}
                    />

                    <span>
                      Choose multiple
                      images
                    </span>

                    <span className="text-xs font-normal text-slate-400">
                      JPG, PNG or WebP
                    </span>


                    <input
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(
                        e,
                      ) =>
                        setExtras(
                          Array.from(
                            e.target
                              .files ||
                            [],
                          ),
                        )
                      }
                    />

                  </label>


                  {extras.length >
                    0 && (

                      <div className="mt-3">

                        <p className="text-xs font-semibold text-slate-500">
                          {
                            extras.length
                          }{' '}
                          extra image(s)
                          selected
                        </p>


                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">

                          {extras.map(
                            (
                              file,
                              index,
                            ) => (

                              <LocalImagePreview
                                key={`${file.name}-${index}`}
                                file={
                                  file
                                }
                              />

                            ),
                          )}

                        </div>

                      </div>

                    )}

                </div>


                {/* EXTRA URL IMAGES */}

                <div>

                  <label className="label">
                    Extra image URLs
                  </label>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">

                      <Link2
                        size={17}
                      />

                      One image URL
                      per line

                    </div>


                    <textarea
                      className="input min-h-32 resize-y bg-white"
                      value={
                        extraImageUrls
                      }
                      onChange={(
                        e,
                      ) =>
                        setExtraImageUrls(
                          e.target
                            .value,
                        )
                      }
                      placeholder={
                        'https://example.com/image-1.jpg\nhttps://example.com/image-2.png\nhttps://example.com/image-3.webp'
                      }
                    />


                    <p className="admin-field-help">
                      Use direct image
                      URLs beginning
                      with http:// or
                      https://.
                    </p>

                  </div>


                  {parseImageUrls(
                    extraImageUrls,
                  ).length >
                    0 && (

                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">

                        {parseImageUrls(
                          extraImageUrls,
                        ).map(
                          (
                            url,
                            index,
                          ) => (

                            <ExternalImagePreview
                              key={`${url}-${index}`}
                              url={
                                url
                              }
                            />

                          ),
                        )}

                      </div>

                    )}

                </div>

              </div>

            </div>


            {/* CURRENT GALLERY */}

            {editing &&
              product.data
                ?.images
                ?.length >
              0 && (

                <div className="mt-7 border-t border-slate-200 pt-6">

                  <div className="mb-3 font-bold">
                    Current gallery
                  </div>


                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

                    {product.data.images.map(
                      (img) => (

                        <div
                          className="relative rounded-xl border border-slate-200 bg-white p-2"
                          key={
                            img.id
                          }
                        >

                          <img
                            src={resolveImageSrc(
                              img.image_url,
                            )}
                            alt={
                              img.alt_text ||
                              f.name ||
                              'Product image'
                            }
                            className="aspect-square w-full rounded-lg bg-slate-50 object-contain"
                          />


                          {img.is_primary ? (

                            <span className="badge absolute left-3 top-3 bg-amber-100 text-amber-700">

                              <Star
                                size={12}
                              />

                              Cover

                            </span>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                imageAction(
                                  img.id,
                                  'primary',
                                )
                              }
                              className="mt-2 w-full rounded-lg bg-slate-100 py-1.5 text-xs font-bold transition hover:bg-brand-50"
                            >
                              Set cover
                            </button>

                          )}


                          <button
                            type="button"
                            onClick={() =>
                              imageAction(
                                img.id,
                                'delete',
                              )
                            }
                            className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2
                              size={
                                13
                              }
                            />

                            Delete
                          </button>

                        </div>

                      ),
                    )}

                  </div>

                </div>

              )}

          </Section>


          {/* =============================================
              SEO
              ============================================= */}

          <Section title="SEO">

            <Grid>

              <Input
                label="SEO title"
                value={
                  f.seoTitle
                }
                set={(v) =>
                  set(
                    'seoTitle',
                    v,
                  )
                }
              />


              <div className="md:col-span-2">

                <label className="label">
                  SEO description
                </label>


                <textarea
                  className="input min-h-24"
                  value={
                    f.seoDescription
                  }
                  onChange={(
                    e,
                  ) =>
                    set(
                      'seoDescription',
                      e.target
                        .value,
                    )
                  }
                  maxLength={
                    255
                  }
                />


                <p className="admin-field-help">
                  {
                    f
                      .seoDescription
                      .length
                  }
                  /255 characters
                </p>

              </div>

            </Grid>

          </Section>


          {/* =============================================
              ERROR
              ============================================= */}

          {err && (
            <ErrorBox>
              {err}
            </ErrorBox>
          )}


          {/* =============================================
              SAVE
              ============================================= */}

          <div className="sticky bottom-4 z-20 flex justify-end gap-3 rounded-2xl border bg-white/95 p-4 shadow-panel backdrop-blur">

            <Link
              to="/admin/products"
              className="btn-secondary"
            >
              Cancel
            </Link>


            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="btn-primary"
            >
              <Save
                size={18}
              />

              {busy
                ? 'Saving...'
                : editing
                  ? 'Update Product'
                  : 'Create Product'}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   SECTION
   ========================================================= */

function Section({
  title,
  note,
  children,
}) {
  return (
    <section className="admin-section">

      <h2 className="text-lg font-black">
        {title}
      </h2>


      {note && (
        <p className="mt-1 text-sm text-slate-500">
          {note}
        </p>
      )}


      <div className="mt-5">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   GRID
   ========================================================= */

function Grid({ children }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {children}
    </div>
  );
}


/* =========================================================
   INPUT
   ========================================================= */

function Input({
  label,
  value,
  set,
  type = 'text',
  required,
  placeholder,
  help,
}) {
  return (
    <div>

      <label className="label">

        {label}

        {required && (
          <span className="text-rose-500">
            {' '}
            *
          </span>
        )}

      </label>


      <input
        className="input"
        type={type}
        value={value ?? ''}
        placeholder={
          placeholder
        }
        required={
          Boolean(
            required,
          )
        }
        onChange={(e) =>
          set(
            e.target.value,
          )
        }
      />


      {help && (
        <p className="admin-field-help">
          {help}
        </p>
      )}

    </div>
  );
}


/* =========================================================
   SELECT
   ========================================================= */

function Select({
  label,
  value,
  set,
  options,
}) {
  return (
    <div>

      <label className="label">
        {label}
      </label>


      <select
        className="input"
        value={value ?? ''}
        onChange={(e) =>
          set(
            e.target.value,
          )
        }
      >

        <option value="">
          Not selected
        </option>


        {options.map(
          (option) => (

            <option
              key={
                option.id
              }
              value={
                option.id
              }
            >
              {
                option.name
              }
            </option>

          ),
        )}

      </select>

    </div>
  );
}


/* =========================================================
   EDITOR
   ========================================================= */

function Editor({
  label,
  value,
  set,
  minHeight,
}) {
  return (
    <div className="mb-5">

      <label className="label">
        {label}
      </label>


      <RichTextEditor
        value={value}
        onChange={set}
        minHeight={
          minHeight ||
          145
        }
      />

    </div>
  );
}


/* =========================================================
   CHECKBOX
   ========================================================= */

function Check({
  label,
  value,
  set,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold">

      <input
        className="h-4 w-4 accent-[rgb(var(--brand-600))]"
        type="checkbox"
        checked={Boolean(
          value,
        )}
        onChange={(e) =>
          set(
            e.target
              .checked,
          )
        }
      />

      {label}

    </label>
  );
}


/* =========================================================
   FILE IMAGE BOX
   ========================================================= */

function FileBox({
  label,
  file,
  set,
}) {
  const preview =
    useMemo(
      () =>
        file
          ? URL.createObjectURL(
            file,
          )
          : '',
      [file],
    );


  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(
          preview,
        );
      }
    },
    [preview],
  );


  return (
    <div>

      <label className="label">
        {label}
      </label>


      <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50/30">

        <Upload
          size={22}
        />


        <span>
          {file
            ? file.name
            : 'Choose image'}
        </span>


        <span className="text-xs font-normal text-slate-400">
          JPG, PNG or WebP
        </span>


        <input
          className="hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            set(
              e.target
                .files?.[0] ||
              null,
            )
          }
        />

      </label>


      {preview && (

        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2">

          <img
            src={preview}
            alt="Selected preview"
            className="h-40 w-full rounded-lg bg-slate-50 object-contain"
          />

        </div>

      )}

    </div>
  );
}


/* =========================================================
   URL IMAGE BOX
   ========================================================= */

function UrlImageBox({
  label,
  value,
  set,
  placeholder,
}) {
  const valid =
    !value.trim() ||
    isValidHttpUrl(
      value,
    );


  return (
    <div>

      <label className="label">
        {label}
      </label>


      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

        <div className="flex items-center gap-2">

          <Link2
            className="shrink-0 text-slate-400"
            size={18}
          />


          <input
            type="url"
            className="input bg-white"
            value={value}
            onChange={(e) =>
              set(
                e.target
                  .value,
              )
            }
            placeholder={
              placeholder
            }
          />

        </div>


        {!valid && (
          <p className="mt-2 text-xs font-semibold text-rose-600">
            Enter a valid
            http:// or https://
            image URL.
          </p>
        )}


        {value.trim() &&
          valid && (

            <div className="mt-3 overflow-hidden rounded-xl border bg-white p-2">

              <img
                src={
                  value.trim()
                }
                alt="URL preview"
                className="h-40 w-full rounded-lg bg-slate-50 object-contain"
                onError={(
                  e,
                ) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />

            </div>

          )}

      </div>

    </div>
  );
}


/* =========================================================
   LOCAL EXTRA IMAGE PREVIEW
   ========================================================= */

function LocalImagePreview({
  file,
}) {
  const preview =
    useMemo(
      () =>
        URL.createObjectURL(
          file,
        ),
      [file],
    );


  useEffect(
    () => () => {
      URL.revokeObjectURL(
        preview,
      );
    },
    [preview],
  );


  return (
    <div className="overflow-hidden rounded-lg border bg-white p-1">

      <img
        src={preview}
        alt={file.name}
        className="aspect-square w-full rounded-md bg-slate-50 object-contain"
      />

    </div>
  );
}


/* =========================================================
   EXTERNAL IMAGE PREVIEW
   ========================================================= */

function ExternalImagePreview({
  url,
}) {
  const valid =
    isValidHttpUrl(
      url,
    );


  return (
    <div
      className={`overflow-hidden rounded-lg border p-1 ${valid
          ? 'bg-white'
          : 'border-rose-200 bg-rose-50'
        }`}
    >

      {valid ? (

        <img
          src={url}
          alt="External product"
          className="aspect-square w-full rounded-md bg-slate-50 object-contain"
          onError={(e) => {
            e.currentTarget.style.opacity =
              '0.25';
          }}
        />

      ) : (

        <div className="flex aspect-square items-center justify-center p-2 text-center text-[10px] font-semibold text-rose-600">

          Invalid URL

        </div>

      )}

    </div>
  );
}


/* =========================================================
   ERROR BOX
   ========================================================= */

function ErrorBox({
  children,
}) {
  return (
    <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      {children}
    </div>
  );
}