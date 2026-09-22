# দ্রুত update ও setup

এই release আপনার medicine_corrected_complete(1).zip-এর update। বিস্তারিত এক জায়গায়: **INTEGRATION_SETTINGS_BN.md**।

1. Database, server/uploads এবং নিজের .env backup নিন। Updated source বসান, নিজের .env রাখুন।
2. Project root থেকে:

```bash
npm run install:all
npm --prefix server run setup:key
npm run db:migrate
```

3. Node app restart করুন। Admin → Email Settings-এ SMTP ও প্রয়োজন হলে inbox/IMAP সেট করুন। এগুলো আর .env-এ লিখবেন না। পুরোনো SMTP_*, IMAP_*, MAIL_FROM_* এবং PAYMENT_MODE values ব্যবহৃত হয় না। DB/JWT/encryption key রাখুন।
4. Local development: client/.env.example কপি করে client/.env করুন এবং npm run dev চালান।
5. Live: client/.env-এ actual API URL দিয়ে npm run build চালান। client/dist frontend-এ deploy করুন। Backend application root server, startup app.cjs।
6. Public /offers-এ quantity offers দেখুন। Missing bundled catalog image rows migration 004 যোগ করে; custom image-এর actual file server/uploads-এ থাকতে হবে।

Existing database মুছবেন না; db:reset বা demo seed চালাবেন না। Live provider/database acceptance tests নিজের staging-এ করুন।
