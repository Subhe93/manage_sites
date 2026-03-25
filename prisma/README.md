# Prisma Database Setup

## المتطلبات

- Node.js 16+
- PostgreSQL / MySQL / SQLite

## التثبيت

1. تثبيت الحزم المطلوبة:
```bash
npm install
# أو
yarn install
```

2. إعداد ملف البيئة:
```bash
cp .env.example .env
```

3. تحديث `DATABASE_URL` في ملف `.env` بمعلومات قاعدة البيانات الخاصة بك.

## الأوامر المتاحة

### إنشاء قاعدة البيانات والجداول

```bash
# إنشاء migration جديد
npm run prisma:migrate

# أو دفع التغييرات مباشرة (للتطوير فقط)
npm run db:push
```

### تشغيل Seed لملء البيانات الأولية

```bash
npm run prisma:seed
# أو
npm run db:seed
```

### إنشاء Prisma Client

```bash
npm run prisma:generate
```

### فتح Prisma Studio (واجهة إدارة قاعدة البيانات)

```bash
npm run prisma:studio
```

## البيانات الأولية (Seed Data)

بعد تشغيل seed، سيتم إنشاء:

### المستخدمين
- **Super Admin**: `superadmin@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **Developer**: `developer@example.com` / `password123`

### العملاء
- Tech Solutions Ltd
- Digital Marketing Co

### النطاقات
- techsolutions.com
- digitalmarketing.com

### الخوادم
- Production Server 1 (VPS)
- Development Server (Cloud)

### المواقع
- Tech Solutions Main Site (WordPress)
- Digital Marketing Portal (Next.js)

وغيرها من البيانات التجريبية...

## هيكل قاعدة البيانات

تحتوي قاعدة البيانات على الجداول التالية:

- **users**: المستخدمين
- **clients**: العملاء
- **service_providers**: مزودي الخدمات
- **domains**: النطاقات
- **domain_costs**: تكاليف النطاقات
- **whois_history**: سجل WHOIS
- **servers**: الخوادم
- **server_accounts**: حسابات الخوادم
- **server_costs**: تكاليف الخوادم
- **server_monitoring**: مراقبة الخوادم
- **websites**: المواقع
- **website_credentials**: بيانات الدخول للمواقع
- **website_costs**: تكاليف المواقع
- **custom_field_definitions**: تعريفات الحقول المخصصة
- **custom_field_values**: قيم الحقول المخصصة
- **cloudflare_accounts**: حسابات Cloudflare
- **cloudflare_domains**: نطاقات Cloudflare
- **google_ads_accounts**: حسابات Google Ads
- **google_ads_campaigns**: حملات Google Ads
- **google_search_console_accounts**: حسابات Google Search Console
- **google_search_console_properties**: خصائص GSC
- **google_tag_manager_accounts**: حسابات Google Tag Manager
- **google_tag_manager_containers**: حاويات GTM
- **google_analytics_accounts**: حسابات Google Analytics
- **repositories**: المستودعات
- **user_permissions**: صلاحيات المستخدمين
- **notifications**: الإشعارات
- **notification_settings**: إعدادات الإشعارات
- **activity_logs**: سجل الأنشطة
- **tags**: الوسوم
- **entity_tags**: ربط الوسوم بالكيانات
- **documents**: المستندات
- **maintenance_schedules**: جداول الصيانة
- **maintenance_logs**: سجلات الصيانة
- **security_incidents**: الحوادث الأمنية
- **uptime_checks**: فحوصات وقت التشغيل
- **uptime_logs**: سجلات وقت التشغيل
- **api_keys**: مفاتيح API
- **system_settings**: إعدادات النظام

## ملاحظات

- جميع كلمات المرور في البيانات التجريبية مشفرة باستخدام bcrypt
- البيانات الحساسة (API keys, passwords) يجب تشفيرها قبل التخزين
- يمكن تعديل ملف `seed.ts` لإضافة المزيد من البيانات التجريبية
