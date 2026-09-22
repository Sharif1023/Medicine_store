import {track} from '../services/tracking';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  TicketPercent,
  Wallet,
} from 'lucide-react';

import http from '../api/http';
import { useSiteConfig, setting } from '../hooks/useSiteConfig';
import RichContent from '../components/RichContent';


/* =========================================================
   BANGLADESH DIVISION + DISTRICT DATA
   ========================================================= */

const bangladeshLocations = {
  Dhaka: [
    'Dhaka',
    'Faridpur',
    'Gazipur',
    'Gopalganj',
    'Kishoreganj',
    'Madaripur',
    'Manikganj',
    'Munshiganj',
    'Narayanganj',
    'Narsingdi',
    'Rajbari',
    'Shariatpur',
    'Tangail',
  ],

  Chattogram: [
    'Bandarban',
    'Brahmanbaria',
    'Chandpur',
    'Chattogram',
    'Cumilla',
    "Cox's Bazar",
    'Feni',
    'Khagrachhari',
    'Lakshmipur',
    'Noakhali',
    'Rangamati',
  ],

  Rajshahi: [
    'Bogura',
    'Joypurhat',
    'Naogaon',
    'Natore',
    'Chapainawabganj',
    'Pabna',
    'Rajshahi',
    'Sirajganj',
  ],

  Khulna: [
    'Bagerhat',
    'Chuadanga',
    'Jashore',
    'Jhenaidah',
    'Khulna',
    'Kushtia',
    'Magura',
    'Meherpur',
    'Narail',
    'Satkhira',
  ],

  Barishal: [
    'Barguna',
    'Barishal',
    'Bhola',
    'Jhalokathi',
    'Patuakhali',
    'Pirojpur',
  ],

  Sylhet: [
    'Habiganj',
    'Moulvibazar',
    'Sunamganj',
    'Sylhet',
  ],

  Rangpur: [
    'Dinajpur',
    'Gaibandha',
    'Kurigram',
    'Lalmonirhat',
    'Nilphamari',
    'Panchagarh',
    'Rangpur',
    'Thakurgaon',
  ],

  Mymensingh: [
    'Jamalpur',
    'Mymensingh',
    'Netrokona',
    'Sherpur',
  ],
};


/* =========================================================
   CHECKOUT PAGE
   ========================================================= */

export default function Checkout() {
  const nav = useNavigate();

  const { data: cfg } = useSiteConfig();

  const addresses = useQuery({
    queryKey: ['addresses'],
    queryFn: () =>
      http
        .get('/user/addresses')
        .then((r) => r.data.data),
  });


  /* =======================================================
     STATE
     ======================================================= */

  const [addressId, setAddressId] = useState('');

  const [manual, setManual] = useState({
    fullName: '',
    phone: '',
    division: 'Dhaka',
    district: 'Dhaka',
    addressLine: '',
  });

  const [method, setMethod] = useState('cod');

  const [couponCode, setCouponCode] = useState('WELCOME10');

  const [senderLast4, setSenderLast4] = useState('');

  const [transactionId, setTransactionId] = useState('');

  const [preview, setPreview] = useState(null);

  const [msg, setMsg] = useState('');


  /* =======================================================
     LOAD DEFAULT SAVED ADDRESS
     ======================================================= */

  useEffect(() => {
    const addressList = addresses.data || [];

    const defaultAddress =
      addressList.find((x) => x.is_default) ||
      addressList[0];

    if (defaultAddress && !addressId) {
      setAddressId(String(defaultAddress.id));
    }
  }, [addresses.data, addressId]);


  /* =======================================================
     PAYMENT METHODS
     ======================================================= */

  const methods=useQuery({queryKey:['payment-methods'],queryFn:()=>http.get('/payment-methods').then(r=>r.data.data)});
  const enabled=(methods.data||[]).map(x=>[x.key,x.name]);


  useEffect(() => {
    if (
      !enabled.some(([key]) => key === method) &&
      enabled[0]
    ) {
      setMethod(enabled[0][0]);
    }
  }, [enabled, method]);


  /* =======================================================
     DIVISION CHANGE
     ======================================================= */

  const handleDivisionChange = (e) => {
    const division = e.target.value;

    const districts =
      bangladeshLocations[division] || [];

    setManual((prev) => ({
      ...prev,
      division,
      district: districts[0] || '',
    }));
  };


  /* =======================================================
     CHECKOUT PAYLOAD
     ======================================================= */

  const payload = () => ({
    addressId: addressId || undefined,

    address: addressId
      ? undefined
      : manual,

    paymentMethod: method,

    couponCode:
      couponCode.trim() || undefined,

    senderLast4:
      senderLast4.trim() || undefined,

    transactionId:
      transactionId.trim() || undefined,
  });


  /* =======================================================
     CALCULATE TOTAL
     ======================================================= */

  const calculate = async () => {
    try {
      const response = await http.post(
        '/user/checkout/preview',
        payload(),
      );

      setPreview(response.data.data);

      setMsg('Totals updated');
    } catch (e) {
      setMsg(
        e.response?.data?.message ||
          'Could not calculate checkout',
      );
    }
  };


  /* =======================================================
     PLACE ORDER
     ======================================================= */

  const place = useMutation({
  mutationFn: () =>
    http
      .post('/user/checkout', payload())
      .then((r) => r.data.data),

  onSuccess: async (order) => {
    await track('add_payment_info');
    if(method==='cod')await track('purchase',{order_id:order.id,value:order.total});
    if(methods.data?.find(x=>x.key===method)?.online){try{const r=await http.post('/user/orders/'+order.id+'/pay');window.location.assign(r.data.data.redirectUrl);return}catch(e){nav('/account/orders?payment=pending');return}}
    nav('/account/orders');
  },

  onError: (e) =>
    setMsg(
      e.response?.data?.message ||
        'Checkout failed',
    ),
});


  /* =======================================================
     MONEY FORMAT
     ======================================================= */

  const money = (number) =>
    setting(cfg, 'currency.symbol', '৳') +
    Number(number || 0).toLocaleString();


  /* =======================================================
     MOBILE PAYMENT
     ======================================================= */

  const mobilePay = [
    'bkash',
    'nagad',
  ].includes(method);

  const payNumber = setting(
    cfg,
    `payment.${method}.number`,
    '',
  );

  const payInstructions = setting(
    cfg,
    `payment.${method}.instructions`,
    '',
  );


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="container-app py-10">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-black">
          Secure Checkout
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Shipping, coupon, prescription and stock
          checks happen on the server.
        </p>
      </div>


      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_380px]">

        {/* ===============================================
            LEFT COLUMN
            =============================================== */}

        <div className="space-y-5">


          {/* =============================================
              DELIVERY ADDRESS
              ============================================= */}

          <section className="card p-6">

            <h2 className="flex items-center gap-2 text-xl font-black">
              <MapPin className="text-brand-600" />
              Delivery address
            </h2>


            {/* SAVED ADDRESSES */}

            {(addresses.data || []).length > 0 && (
              <div className="mt-5 grid gap-3">

                {addresses.data.map((address) => (
                  <label
                    key={address.id}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      String(address.id) === addressId
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200'
                    }`}
                  >

                    <input
                      className="mr-3"
                      type="radio"
                      checked={
                        String(address.id) === addressId
                      }
                      onChange={() =>
                        setAddressId(
                          String(address.id),
                        )
                      }
                    />

                    <b>
                      {address.label} —{' '}
                      {address.full_name}
                    </b>

                    <div className="ml-6 mt-1 text-sm text-slate-500">
                      {[
                        address.address_line,
                        address.area,
                        address.district,
                        address.division,
                      ]
                        .filter(Boolean)
                        .join(', ')}

                      {address.phone && (
                        <> · {address.phone}</>
                      )}
                    </div>

                  </label>
                ))}


                <button
                  type="button"
                  onClick={() => setAddressId('')}
                  className="btn-ghost w-fit"
                >
                  Use a different address
                </button>

              </div>
            )}


            {/* ===========================================
                MANUAL ADDRESS
                =========================================== */}

            {(!addressId ||
              !(addresses.data || []).length) && (

              <div className="mt-5 grid gap-4 sm:grid-cols-2">


                {/* FULL NAME */}

                <label>
                  <span className="label">
                    Full name
                  </span>

                  <input
                    className="input"
                    type="text"
                    value={manual.fullName}
                    onChange={(e) =>
                      setManual((prev) => ({
                        ...prev,
                        fullName:
                          e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </label>


                {/* PHONE */}

                <label>
                  <span className="label">
                    Phone
                  </span>

                  <input
                    className="input"
                    type="tel"
                    value={manual.phone}
                    onChange={(e) =>
                      setManual((prev) => ({
                        ...prev,
                        phone:
                          e.target.value,
                      }))
                    }
                    placeholder="01XXXXXXXXX"
                  />
                </label>


                {/* DIVISION */}

                <label>
                  <span className="label">
                    Division
                  </span>

                  <select
                    className="input cursor-pointer"
                    value={manual.division}
                    onChange={
                      handleDivisionChange
                    }
                  >
                    {Object.keys(
                      bangladeshLocations,
                    ).map((division) => (
                      <option
                        key={division}
                        value={division}
                      >
                        {division}
                      </option>
                    ))}
                  </select>
                </label>


                {/* DISTRICT */}

                <label>
                  <span className="label">
                    District
                  </span>

                  <select
                    className="input cursor-pointer"
                    value={manual.district}
                    onChange={(e) =>
                      setManual((prev) => ({
                        ...prev,
                        district:
                          e.target.value,
                      }))
                    }
                  >
                    {(
                      bangladeshLocations[
                        manual.division
                      ] || []
                    ).map((district) => (
                      <option
                        key={district}
                        value={district}
                      >
                        {district}
                      </option>
                    ))}
                  </select>
                </label>


                {/* FULL ADDRESS */}

                <label className="sm:col-span-2">
                  <span className="label">
                    Full address
                  </span>

                  <textarea
                    className="input min-h-[110px] resize-y"
                    value={manual.addressLine}
                    onChange={(e) =>
                      setManual((prev) => ({
                        ...prev,
                        addressLine:
                          e.target.value,
                      }))
                    }
                    placeholder="House / Flat, Road, Village / Area and complete delivery address"
                  />
                </label>

              </div>
            )}

          </section>


          {/* =============================================
              PAYMENT METHOD
              ============================================= */}

          <section className="card p-6">

            <h2 className="flex items-center gap-2 text-xl font-black">
              <Wallet className="text-brand-600" />
              Payment method
            </h2>


            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              {enabled.map(([key, label]) => (

                <label
                  key={key}
                  className={`card flex cursor-pointer items-center gap-3 p-4 ${
                    method === key
                      ? 'border-brand-500 bg-brand-50'
                      : ''
                  }`}
                >

                  <input
                    type="radio"
                    checked={method === key}
                    onChange={() =>
                      setMethod(key)
                    }
                  />

                  <span className="font-bold">
                    {label}
                  </span>

                </label>

              ))}

            </div>


            {/* MOBILE PAYMENT */}

            {mobilePay && (

              <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-5">

                <div className="text-sm text-slate-500">
                  Send payment to
                </div>

                <div className="mt-1 break-words text-2xl font-black text-brand-700">
                  {payNumber ||
                    'Admin has not configured a receiving number yet'}
                </div>


                {payInstructions && (
                  <RichContent
                    html={payInstructions}
                    className="rich-content mt-3 text-sm text-slate-700"
                  />
                )}


                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <label>
                    <span className="label">
                      Sender last 4 digits
                    </span>

                    <input
                      className="input"
                      maxLength={4}
                      inputMode="numeric"
                      value={senderLast4}
                      onChange={(e) =>
                        setSenderLast4(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 4),
                        )
                      }
                      placeholder="1234"
                    />
                  </label>


                  <label>
                    <span className="label">
                      Transaction ID
                    </span>

                    <input
                      className="input"
                      value={transactionId}
                      onChange={(e) =>
                        setTransactionId(
                          e.target.value,
                        )
                      }
                      placeholder="e.g. 9ABCD12345"
                    />
                  </label>

                </div>


                <p className="mt-2 text-xs text-slate-500">
                  Provide either the sender last 4
                  digits or the transaction ID. The
                  order will remain pending/processing
                  until verified by admin.
                </p>

              </div>
            )}


            {/* OTHER PAYMENT METHOD */}

            {method !== 'cod' &&
              !mobilePay && (

                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  This project includes a safe
                  development/mock gateway flow.
                  Configure real gateway
                  credentials/adapters before
                  production use.
                </p>

              )}

          </section>

        </div>


        {/* ===============================================
            ORDER / COUPON SUMMARY
            =============================================== */}

        <aside className="card h-fit p-6">

          <h3 className="flex items-center gap-2 font-black">
            <TicketPercent size={18} />
            Coupon
          </h3>


          <div className="mt-3 flex gap-2">

            <input
              className="input"
              value={couponCode}
              onChange={(e) =>
                setCouponCode(e.target.value)
              }
            />

            <button
              type="button"
              className="btn-secondary px-3"
              onClick={calculate}
            >
              Apply
            </button>

          </div>


          {/* PRICE PREVIEW */}

          {preview && (

            <div className="mt-6 space-y-3 text-sm">

              <Row
                a="Subtotal"
                b={money(preview.subtotal)}
              />

              <Row
                a="Shipping"
                b={
                  preview.shipping
                    ? money(preview.shipping)
                    : 'Free'
                }
              />

              <Row
                a="Discount"
                b={
                  '− ' +
                  money(preview.discount)
                }
              />


              <div className="flex justify-between border-t pt-4 text-lg font-black">
                <span>Total</span>

                <span>
                  {money(preview.total)}
                </span>
              </div>

            </div>
          )}


          <button
            type="button"
            onClick={calculate}
            className="btn-secondary mt-5 w-full"
          >
            Review total
          </button>


          <button
            type="button"
            disabled={place.isPending||!enabled.length}
            onClick={() => place.mutate()}
            className="btn-primary mt-3 w-full"
          >
            <CheckCircle2 size={18} />

            {place.isPending
              ? 'Placing order...'
              : 'Place Order'}
          </button>


          {msg && (
            <p className="mt-3 text-xs text-slate-500">
              {msg}
            </p>
          )}

        </aside>

      </div>

    </main>
  );
}


/* =========================================================
   SUMMARY ROW
   ========================================================= */

function Row({ a, b }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">
        {a}
      </span>

      <b>{b}</b>
    </div>
  );
}