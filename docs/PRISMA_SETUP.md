# دليل إعداد Prisma - خطوة بخطوة

## 📋 نظرة عامة

تم إنشاء قاعدة بيانات Prisma كاملة بناءً على ملف `database-fields-documentation.csv` مع بيانات تجريبية شاملة.

## 🚀 البدء السريع

### 1. تثبيت الحزم المطلوبة

```bash
npm install
# أو
yarn install
```

### 2. إعداد قاعدة البيانات

قم بإنشاء ملف `.env` في المجلد الرئيسي:

```bash
cp .env.example .env
```

ثم قم بتحديث `DATABASE_URL` في ملف `.env`:

**PostgreSQL (موصى به):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/domain_manager?schema=public"
```

**MySQL:**
```env
DATABASE_URL="mysql://username:password@localhost:3306/domain_manager"
```

**SQLite (للتطوير المحلي):**
```env
DATABASE_URL="file:./dev.db"
```

### 3. إنشاء قاعدة البيانات

```bash
# إنشاء الجداول
npm run db:push

# أو إنشاء migration
npm run prisma:migrate
```

### 4. ملء البيانات التجريبية

```bash
npm run prisma:seed
```

### 5. فتح Prisma Studio (اختياري)

```bash
npm run prisma:studio
```

سيتم فتح واجهة رسومية على `http://localhost:5555` لإدارة البيانات.

## 📊 البيانات التجريبية المتوفرة

### 👤 المستخدمين
| البريد الإلكتروني | كلمة المرور | الدور |
|-------------------|-------------|-------|
| superadmin@example.com | password123 | Super Admin |
| admin@example.com | password123 | Admin |
| developer@example.com | password123 | Developer |

### 🏢 العملاء
- Tech Solutions Ltd (السعودية)
- Digital Marketing Co (الإمارات)

### 🌐 النطاقات
- techsolutions.com
- digitalmarketing.com

### 🖥️ الخوادم
- Production Server 1 (VPS - Frankfurt)
- Development Server (Cloud - New York)

### 🌍 المواقع
- Tech Solutions Main Site (WordPress)
- Digital Marketing Portal (Next.js)

## 🔧 الأوامر المتاحة

| الأمر | الوصف |
|------|-------|
| `npm run prisma:generate` | إنشاء Prisma Client |
| `npm run prisma:migrate` | إنشاء migration جديد |
| `npm run db:push` | دفع التغييرات مباشرة للقاعدة |
| `npm run prisma:seed` | ملء البيانات التجريبية |
| `npm run prisma:studio` | فتح واجهة إدارة البيانات |

## 📁 هيكل الملفات

```
prisma/
├── schema.prisma      # تعريف قاعدة البيانات
├── seed.ts           # البيانات التجريبية
└── README.md         # التوثيق التفصيلي

.env                  # إعدادات قاعدة البيانات
.env.example          # مثال لملف الإعدادات
```

## 🔐 الأمان

- جميع كلمات المرور مشفرة باستخدام bcrypt
- البيانات الحساسة (API keys, tokens) يجب تشفيرها قبل التخزين
- لا تشارك ملف `.env` أبداً

## 📚 استخدام Prisma في الكود

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// مثال: جلب جميع النطاقات
const domains = await prisma.domain.findMany({
  include: {
    client: true,
    registrar: true,
  },
});

// مثال: إنشاء نطاق جديد
const newDomain = await prisma.domain.create({
  data: {
    domainName: 'example.com',
    tld: '.com',
    status: 'active',
    autoRenew: true,
    whoisPrivacy: true,
  },
});

// مثال: تحديث موقع
const updatedWebsite = await prisma.website.update({
  where: { id: 1 },
  data: {
    status: 'maintenance',
  },
});
```

## 🎯 الجداول الرئيسية

### إدارة النطاقات
- `domains` - النطاقات
- `domain_costs` - تكاليف النطاقات
- `whois_history` - سجل WHOIS

### إدارة الخوادم
- `servers` - الخوادم
- `server_accounts` - حسابات الخوادم
- `server_costs` - تكاليف الخوادم
- `server_monitoring` - مراقبة الخوادم

### إدارة المواقع
- `websites` - المواقع
- `website_credentials` - بيانات الدخول
- `website_costs` - التكاليف

### خدمات Google
- `google_ads_accounts` & `google_ads_campaigns`
- `google_search_console_accounts` & `google_search_console_properties`
- `google_tag_manager_accounts` & `google_tag_manager_containers`
- `google_analytics_accounts`

### Cloudflare
- `cloudflare_accounts`
- `cloudflare_domains`

### النظام
- `users` - المستخدمين
- `clients` - العملاء
- `notifications` - الإشعارات
- `activity_logs` - سجل الأنشطة
- `tags` & `entity_tags` - الوسوم
- `documents` - المستندات
- `uptime_checks` & `uptime_logs` - مراقبة وقت التشغيل
- `security_incidents` - الحوادث الأمنية
- `maintenance_schedules` & `maintenance_logs` - الصيانة

## 🐛 حل المشاكل

### خطأ في الاتصال بقاعدة البيانات
تأكد من:
- تشغيل خادم قاعدة البيانات
- صحة بيانات الاتصال في `.env`
- وجود قاعدة البيانات المحددة

### خطأ في seed
```bash
# حذف البيانات وإعادة seed
npm run db:push -- --force-reset
npm run prisma:seed
```

### إعادة إنشاء قاعدة البيانات من الصفر
```bash
# حذف كل شيء
rm -rf prisma/migrations
rm -f *.db

# إعادة الإنشاء
npm run db:push
npm run prisma:seed
```

## 📖 مصادر إضافية

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## ✅ التحقق من التثبيت

بعد إكمال الخطوات أعلاه، يمكنك التحقق من نجاح التثبيت:

```bash
# فتح Prisma Studio
npm run prisma:studio
```

يجب أن ترى جميع الجداول مع البيانات التجريبية.

---

تم إنشاء هذا المشروع بناءً على `database-fields-documentation.csv` 🎉
