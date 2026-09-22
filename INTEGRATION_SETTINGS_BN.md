# Medico — cPanel ও Integration Settings সম্পূর্ণ গাইড

## ১. সবচেয়ে গুরুত্বপূর্ণ উত্তর: Admin-এ দিলে আবার .env-এ দিতে হবে?

**না। SMTP, mailbox password, optional IMAP, payment credentials, SMS credentials, notification switches, Pixel/GA/GTM—সব Admin Panel-এ save করবেন। এগুলো database-এ থাকে; গোপন credential encrypted থাকে। একই জিনিস আবার .env-এ লিখবেন না।**

`.env` শুধু server চালানোর মৌলিক configuration রাখে: database connection, JWT secrets, frontend/API address, upload directory এবং credential encryption key। SMS endpoint allowlist-ও server-এ থাকে।

আগের `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `IMAP_*`, `MAIL_FROM_*`, `PAYMENT_MODE` এই release-এ আর ব্যবহার হয় না। প্রয়োজনীয় mail values Admin Email Settings-এ বসিয়ে পরীক্ষা করার পর নিজের .env থেকেও এই পুরোনো lines সরাতে পারেন। **DB/JWT/SETTINGS_ENCRYPTION_KEY মুছবেন না।** পুরোনো mail credentials স্বয়ংক্রিয়ভাবে database-এ import করা হয় না।

| কোথায় | কী রাখবেন |
| --- | --- |
| server/.env অথবা cPanel app environment | DB, JWT, CLIENT_URL, PUBLIC_API_URL, upload path, encryption key, SMS allowlist |
| client/.env | build করার সময় VITE_API_URL |
| Admin → Email Settings | SMTP ও optional IMAP; এক mailbox username/password |
| Admin → Payment Settings | gateway mode, enable, merchant credential |
| Admin → SMS Settings | provider API credential, URL, sender |
| Admin → Notification Settings | channel switches, admin contacts, order/SMS templates |
| Admin → Analytics & Pixel Settings | analytics enable, IDs, optional scripts, retention |

## ২. Existing website update: database মুছবেন না

1. Database ও server/uploads backup নিন। নিজের .env backup নিন।
2. Updated source বসান, নিজের server/.env রাখুন। node_modules ZIP-এ থাকে না।
3. Project root থেকে:

```bash
npm run install:all
npm --prefix server run setup:key
npm run db:migrate
npm test
npm run verify
```

`setup:key` প্রয়োজন হলে server/.env-এ একটি encryption key লিখবে। আগে valid key থাকলে সেটাই রাখবে। cPanel environment-এ key থাকলে সেটাও বদলাবে না। `.env` backup রাখুন; হারিয়ে গেলে saved credential decrypt করা যাবে না। পুরোনো valid key বদলে নতুন key বসাবেন না। Node app restart করুন।

নতুন migration: `004_mailbox_and_images.sql`। আগের 001, 002, 003-সহ migration runner সঠিক ক্রমে চালায়। 004 inbox fields যোগ করে এবং bundled demo catalog-এর **একই নামের product-এ কোনো image record না থাকলেই** image link যোগ করে। Existing product image overwrite করে না। SQL seed-এও একই missing-image insert আছে।

শুধু নতুন database-এর structure দরকার হলে `database/full_schema.sql` আছে। এতে real customer/product data নেই। Existing store-এ `db:reset`, `DROP DATABASE` বা demo seed চালাবেন না।

## ৩. cPanel-এ Node backend চালানো

Hosting-এ Node.js app support থাকতে হবে। Panel-এর নাম provider অনুযায়ী `Setup Node.js App` বা `Application Manager` হতে পারে।

- Application root: project-এর **server** folder।
- Startup file: **app.cjs** (এই ZIP-এ আছে)। Host custom startup support না দিলে hosting support-কে `app.cjs` সেট করতে বলুন।
- Supported current Node version নিন; এই project Node 20+ ধরে তৈরি।
- Database/user cPanel-এ আগে বানিয়ে user-কে database permission দিন। `DB_NAME` ও `DB_USER`-এ cPanel prefix-সহ পুরো নাম লিখুন।
- Environment variables panel-এ দিলে একই key-এর ভিন্ন value .env-এ রাখবেন না। Panel-এর process environment অগ্রাধিকার পায়।
- npm dependencies install করে migration চালান, তারপর Restart করুন।

উদাহরণ—নিজের actual values বসাবেন:

```env
NODE_ENV=production
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cpaneluser_medico
DB_USER=cpaneluser_medico
DB_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_ACCESS_SECRET=LONG_RANDOM_ACCESS_SECRET
JWT_REFRESH_SECRET=DIFFERENT_LONG_RANDOM_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://medico.example.com
UPLOAD_DIR=./uploads
SETTINGS_ENCRYPTION_KEY=YOUR_EXISTING_BASE64_KEY
PUBLIC_API_URL=https://api.example.com
SMS_ALLOWED_HOSTS=
```

Hosting যদি নিজের PORT দেয় সেটিই ব্যবহার করুন। `CLIENT_URL` frontend origin; `PUBLIC_API_URL` backend base URL, শেষে `/api/v1` নয়। Backend subpath-এ থাকলে তার path-ও দিন, যেমন `https://example.com/backend`।

Frontend-এর `client/.env`:

```env
VITE_API_URL=https://api.example.com/api/v1
```

তারপর:

```bash
npm run build
```

`client/dist`-এর contents frontend document root-এ দিন। Vite variables build-এর সময় বসে; server .env পাল্টালে পুরোনো frontend build বদলায় না। Backend অন্য domain/subpath-এ হলে correct URL দিয়ে অবশ্যই rebuild করুন। Production build-এর default same-origin `/api/v1`; local development-এ client/.env.example-এর localhost URL ব্যবহার করুন। Frontend server-এ SPA fallback থাকতে হবে, যাতে `/offers` বা `/account` refresh করলেও index.html আসে। Backend paths frontend fallback দিয়ে ঢেকে দেবেন না।

Backend `/health` খুলে JSON দেখুন। যেমন `https://api.example.com/health`।

## ৪. cPanel Email Settings — ধাপে ধাপে

cPanel → **Email Accounts → আপনার mailbox-এর Connect Devices → Secure SSL/TLS Settings** খুলুন। সেখানকার actual outgoing/incoming server ব্যবহার করুন; website domain অনুমান করে বসাবেন না।

Admin → **Email Settings**:

| Field | কী দেবেন |
| --- | --- |
| Enable outgoing email | On |
| Outgoing server (SMTP) | cPanel দেখানো hostname; `https://` বা path নয় |
| SMTP port | cPanel secure setting অনুযায়ী সাধারণত 465 |
| Connection security | 465-এর জন্য SSL/TLS; host সমর্থন করলে 587-এর জন্য STARTTLS |
| Mailbox email / username | পুরো mailbox address, যেমন medicine@your-domain.com |
| Mailbox password | সেই email mailbox-এর password; cPanel login password নয় |
| Sender display name | Medico বা আপনার দোকানের নাম |
| Sender email | সাধারণত একই mailbox address |

Save Settings চাপুন। **এবার SMTP values .env-এ আর লিখতে হবে না।** Saved password frontend-এ ফেরত দেওয়া হয় না; খালি রাখলে আগের password থাকে। Password বদলাতে নতুনটা দিয়ে Save করুন।

তারপর Notification Settings-এ **Enable Email channel** On রাখুন। Email Settings ও channel—দুটিই On হলে outgoing mail চলবে।

পরীক্ষা:

1. **Test SMTP connection**: server login/connection পরীক্ষা করে; কোনো email পাঠায় না।
2. **Send test to my admin email**: বর্তমানে login করা admin account-এর email-এ test যায়। Sender mailbox-এ যাবে এমন নয়। প্রয়োজনে admin profile-এর email ঠিক করুন।
3. Success মানে SMTP server গ্রহণ করেছে; recipient-এর Inbox/Spam এবং hosting delivery log-ও দেখুন।

### Email Center-এর inbox দরকার হলে

একই Email Settings-এর **Enable inbox in Email Center** On করুন। Incoming server cPanel থেকে দিন; secure IMAP সাধারণত 993। Sent folder সাধারণত `Sent`, তবে actual mailbox folder আলাদা হলে সেটি দিন। একই username/password ব্যবহার হয়। আলাদা IMAP password বা .env values লাগবে না। Save করে **Test inbox connection** চাপুন।

শুধু registration/order/reset mail পাঠাতে inbox enable করার দরকার নেই। Email Center-এর Sent tab mailbox-এ থাকা messages পড়ে; SMTP send নিজে থেকে সব provider-এর Sent folder-এ copy সংরক্ষণ করে না।

### Save/Test ব্যর্থ হলে

| Message/লক্ষণ | করণীয় |
| --- | --- |
| Encryption key missing | setup:key চালিয়ে Node app restart করুন |
| Existing encrypted credential unreadable | আগের সঠিক encryption key restore করুন; নতুন key দিয়ে মেলানো যাবে না |
| Unknown column/table বা settings load fails | সঠিক database-এ npm run db:migrate চালান |
| Mailbox login failed | পুরো mailbox address ও mailbox password ঠিক করুন |
| Certificate/connection error | cPanel-এর SSL hostname ও port মিলিয়ে দিন; TLS verification বন্ধ করবেন না |
| Timeout | hosting support-কে outgoing SMTP restriction/firewall পরীক্ষা করতে বলুন |
| Test accepted, mail নেই | Inbox/Spam, recipient address, mail delivery log ও hosting deliverability settings দেখুন |
| Email channel off | Notification Settings-এর Email switch চালু করুন |

## ৫. Notification Settings ও templates

| Switch/Field | কাজ |
| --- | --- |
| Enable Email channel | central outgoing email অনুমতি |
| Enable SMS channel | SMS trigger/delivery অনুমতি |
| Enable in-app notifications | customer account-এর notification list |
| New-order admin email/phone | নতুন order alert কোথায় যাবে |

Registration welcome, order confirmation, status changes ও admin new order notification আছে। Customer cancellation-ও status notification দেয়। Order ও welcome delivery queue-তে যায়; provider সাময়িক ব্যর্থ হলে retry হয়। Direct password-reset/email-change/support mail-এর failure UI-তে জানানো হয়।

**Email Templates**: welcome, password reset OTP, password changed, email-change OTP। HTML থাকলে customer variables escaped হয়।

**Notification Settings → Message Templates**: order email, SMS, admin order alerts। Variables: `{{name}}`, `{{email}}`, `{{order_id}}`, `{{amount}}`, `{{status}}`, `{{otp}}`—সংশ্লিষ্ট event-এ যে তথ্য থাকে সেটিই পাওয়া যায়।

Recent Deliveries: pending, sending, sent, failed বা skipped। Failed হলে configuration ঠিক করে নতুন test করুন; এই release-এ failed job-এর manual resend button নেই। Retry সর্বোচ্চ পাঁচবার। Crash-এর বিরল ক্ষেত্রে provider একই message দুইবার পেতে পারে; queue delivery exactly-once দাবি করা হচ্ছে না।

### cPanel background queue

API process চালু থাকলে worker প্রতি পাঁচ সেকেন্ডে queue পরীক্ষা করে। Shared hosting app idle হলে বন্ধ হতে পারে। নির্ভরযোগ্যতার জন্য cPanel Cron Jobs-এ প্রতি মিনিটে **নিজের Node executable ও project-এর absolute path** দিয়ে চালাতে পারেন:

```text
* * * * * /ABSOLUTE/PATH/TO/node /home/CPANELUSER/medico/server/src/scripts/notifications-process.js
```

Process environment শুধু panel-এ থাকলে cron সেগুলো নাও পেতে পারে; cron-এর জন্য server/.env-এ প্রয়োজনীয় DB/key values রাখুন। Script server/.env নিজেই খুঁজে নেয়। SQL job claiming থাকায় running API worker-এর সঙ্গে একই job একসঙ্গে claim হওয়ার কথা নয়; real database staging-এ যাচাই করুন।

## ৬. Payment Settings

**বর্তমানে online adapter: SSLCOMMERZ।** Stripe, PayPal, bKash, Nagad-এর reserved settings আছে; তাদের online adapter না থাকা পর্যন্ত enable করা যায় না। পুরোনো manual bKash/Nagad/Rocket/COD Website Settings-এ থাকে। Manual payment transaction info admin যাচাই করেন; এটি auto gateway verification নয়।

SSLCOMMERZ setup:

1. Sandbox mode দিয়ে শুরু করুন।
2. Merchant/Store ID এবং Secret/Store Password দিন।
3. API URL blank রাখলে ওই mode-এর official endpoint ব্যবহার হয়।
4. PUBLIC_API_URL public HTTPS backend base হতে হবে।
5. Enable করে Save করুন। Checkout available gateways দেখাবে।

Success/Failed/Cancel return URLs optional frontend destinations; same CLIENT_URL origin হতে হবে। Blank থাকলে app-এর default return pages ব্যবহৃত হয়। এগুলো backend callbacks নয়।

Callback paths: `/api/v1/payments/sslcommerz/success`, `/fail`, `/cancel`, `/ipn` (সবগুলোর একই `/payments/sslcommerz` prefix)। Provider validation-এ amount, currency, transaction ও status মিললে paid হয়। শুধুমাত্র success page খুললে paid হয় না। Credentials বদলালেও existing session তার encrypted snapshot দিয়ে verify হয়। Uncertain session creation হলে merchant portal দেখে reconcile করুন; অন্ধভাবে নতুন payment তৈরি করবেন না। Refund UI-এর accounting record payment provider-এ টাকা ফেরত পাঠায় না; merchant portal-এ actual refund করতে হয়।

## ৭. SMS Settings

বর্তমানে `generic_json` adapter আছে। শুধু provider name লিখলেই যেকোনো Bangladesh SMS API কাজ করবে না; request/response format মিলতে হবে।

Admin fields: Enable SMS, API URL, API key, optional secret, Sender ID, Country code (`880`)। Endpoint-এর exact hostname server-এর `SMS_ALLOWED_HOSTS`-এ যোগ করুন—এটি credential নয়, trusted destination সীমা। উদাহরণ `sms.example.com`।

Request: HTTPS POST, `Authorization: Bearer API_KEY`, JSON:

```json
{"to":"8801711111111","message":"Order confirmed","sender_id":"Medico","secret_key":"optional-secret"}
```

Expected response: successful HTTP response ও `{"success":true}`। অন্য format হলে provider-specific adapter লাগবে। Save করে SMS channel On রাখুন, test দিন; test যাবে signed-in admin-এর phone-এ। Order/welcome SMS ও profile phone OTP আছে। Phone OTP পাঁচ মিনিটে expire হয় এবং email verification-এর থেকে আলাদা থাকে।

## ৮. Analytics & Pixel Settings

Master **Enable analytics and tracking** On করলে customer consent-এর পরে internal activity database-এ জমে। Meta/Google accounts ছাড়াও internal Analytics dashboard কাজ করে।

| Option | Value/কাজ |
| --- | --- |
| Meta Pixel | Meta Events Manager-এর numeric Pixel ID |
| Google Analytics | GA4 measurement ID, `G-...` |
| Google Tag Manager | container ID, `GTM-...` |
| Custom header/footer scripts | প্রয়োজন হলে trusted tracking snippet; না লাগলে blank |
| Activity retention days | 1–365 দিনের মধ্যে সংরক্ষণসীমা |

একই GA/Pixel সরাসরি এবং GTM—দুই জায়গায় install করবেন না, নইলে duplicate events হতে পারে। Custom scripts storefront-এ execute করে; customer/password/health details script-এ দেবেন না। GTM/third-party automatic tracking provider dashboard থেকেও configure করুন।

Customer প্রথমে Accept optional দিলে optional scripts ও activity শুরু হয়; Reject করলে shopping কাজ করে কিন্তু analytics জমে না। Cookie preferences থেকে পরিবর্তন করা যায়। Application tracking account/admin/auth/invoice pages বাদ দেয় এবং query-string URL সংরক্ষণ করে না। Search event-এর search term আলাদাভাবে জমতে পারে। পুরোনো tab settings change বুঝতে reload লাগতে পারে।

## ৯. Analytics dashboard কীভাবে কাজ করে?

Flow: customer consent → page/action event → `/api/v1/activity` → `user_activity_logs` → Admin Analytics reports। Browser ID ও session ID দিয়ে counts হয়; একজন মানুষ একাধিক device/browser ব্যবহার করলে একাধিক visitor হতে পারেন।

| Report/Metric | অর্থ |
| --- | --- |
| Unique visitors | নির্বাচিত সময়ে আলাদা browser visitor ID |
| Sessions | আলাদা visit session; ৩০ মিনিট নিষ্ক্রিয়তার পরে নতুন session |
| Page views | page_view events; refresh/revisit আলাদা count হতে পারে |
| Conversion rate | purchase করা distinct visitor / distinct visitors × 100 |
| Most visited pages | page path অনুযায়ী page_view count |
| User Behavior | সাম্প্রতিক event list; session ID দিয়ে journey মিলিয়ে দেখুন |
| Product Analytics | views, cart additions, search terms, estimated abandoned products, paid/delivered sales |
| Customer Analytics | নতুন account, activity-তে দেখা account, returning browser visitors |
| Conversion Funnel | একই session-এ product view → cart → checkout → purchase ক্রমের counts |
| Real Time Visitors | শেষ দুই মিনিটে activity আছে এমন sessions ও last page/device/browser |

Visible page থেকে প্রায় ৪৫ সেকেন্ডে heartbeat যায়; realtime admin view প্রায় ১৫ সেকেন্ডে refresh হয়। Country/location এই release-এ সাধারণত Unavailable; GeoIP provider যুক্ত করা নেই। IP সংরক্ষণ করা হয় না।

উদাহরণ: product 100 → cart 60 → checkout 30 → purchase 20। প্রথম ধাপে 40, দ্বিতীয় ধাপে 30, তৃতীয় ধাপে 10 session বাদ পড়েছে। এটি ওই ordered funnel-এর সংখ্যা; সব customer বাধ্যতামূলকভাবে product page হয়ে checkout করেন না।

Purchase event: owned COD order বা verified paid order eligible। Unpaid manual payment purchase হিসেবে count হয় না। প্রতি order database-এ purchase deduplicate হয়। Browser বন্ধ, consent না দেওয়া, blocker, payment return না আসা বা custom return page-এ event না থাকলে sale analytics-এ কম দেখা যেতে পারে। **আসল revenue/order মিলাতে Orders/Reports ব্যবহার করুন।** Abandoned cart report session-based estimate; চূড়ান্ত customer intent নয়।

### নিজে পরীক্ষা

1. Analytics master enable করুন; pixel IDs না দিয়েও শুরু করা যায়।
2. Store নতুন browser session-এ খুলে optional consent Accept করুন।
3. Product খুলুন, cart-এ add করুন, checkout যান, test COD order করুন।
4. Admin → Analytics-এ Traffic, Behavior, Funnel, Real Time দেখুন।
5. অন্য session-এ Reject করে দেখুন নতুন optional tracking request যাচ্ছে না।

Retention কার্যকর করতে daily cron-এ চালান:

```text
0 3 * * * /ABSOLUTE/PATH/TO/node /home/CPANELUSER/medico/server/src/scripts/analytics-retention.js
```

## ১০. Public Quantity Offers

Admin → Quantity Offers-এ product, `unit/strip/box`, bundle quantity, মোট bundle price, UTC start/end date এবং Active দিন। Public `/offers`-এর Quantity Offers অংশে active, সময়সীমার মধ্যে থাকা, active/non-deleted products দেখায়। Campaign Offers-ও আলাদা অংশে থাকে।

উদাহরণ: normal strip 100, 3 strips 240। Public card-এ 3 strips/240 ও savings দেখাবে। Add bundle চাপলে cart-এ 3 strips যোগ হবে। সাতটি হলে 2 bundles + 1 regular = 580। একাধিক tier থাকলে একটি eligible offer ব্যবহার করে সবচেয়ে কম total নেওয়া হয়; আলাদা tiers মিশিয়ে calculation হয় না। Checkout সব price আবার server থেকে যাচাই করে। Stock কম থাকলে bundle button disabled; prescription-required products-এর checkout-এ approved prescription প্রয়োজন।

## ১১. Product image সঠিকভাবে দেখানোর নিয়ম

Database row ছবির file নিজে বহন করে না। Local image হলে **database record ও server/uploads file দুটোই** থাকতে হবে।

- Admin product image upload করুন, অথবা usable direct HTTPS image URL দিন। External website-এর product page URL image URL নয়। External links hotlink/404 হলে নিজে file upload করুন।
- Local DB path example: `/uploads/products/photo.webp`। File: `server/uploads/products/photo.webp`।
- JSON import supports image entries with `url`, `image_url` বা `imageUrl`; image list সঠিক product-এ যুক্ত হতে হবে।
- Backend API origin ভুল/localhost রেখে live build করলে image request ভুল server-এ যেতে পারে। Frontend VITE_API_URL ঠিক করে rebuild করুন।
- New migration SQL-seeded bundled catalog-এর missing image rows যোগ করে; অন্য product-এর অনুপস্থিত আসল ছবি এটি বানায় না।
- Existing uploads deploy/restore করুন; Linux filename case-sensitive। `Photo.png` ও `photo.png` এক নয়।
- Test URL: API base-এর পরে `/uploads/products/01-paracetamol-500-mg-tablet.png`। এটি খুললে বাস্তব PNG আসা উচিত, index.html নয়। 404 হলে file/path/deployment দেখুন; 403 হলে hosting permissions দেখুন।
- Broken remote/resource images-এর জায়গায় fallback placeholder দেখায়; এটি আসল ছবি উদ্ধার হওয়ার দাবি নয়।

## ১২. Verification ও সীমাবদ্ধতা

পরীক্ষার প্রকৃত ফল `VERIFICATION.md`-তে আছে। Automated checks বাস্তব SMTP/IMAP/SMS/provider credentials বা live MySQL testing-এর বিকল্প নয়। Deploy-এর পরে registration, OTP, COD/manual/SSLCOMMERZ sandbox order, stock, coupon, quantity offer, cancellation ও tracking consent staging-এ পরীক্ষা করুন।

## Official setup references

- cPanel mailbox settings: https://docs.cpanel.net/cpanel/email/set-up-mail-client/
- cPanel Node application setup: https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/
- Custom startup configuration (hosting administrator): https://support.cpanel.net/hc/en-us/articles/360057519553-How-to-create-a-custom-NodeJS-startup-file
