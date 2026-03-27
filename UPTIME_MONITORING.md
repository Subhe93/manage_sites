# Uptime Monitoring System - Documentation

## نظام المراقبة التلقائي للمواقع

تم بناء نظام مراقبة احترافي يعمل على مستوى السيرفر باستخدام **node-cron** لفحص المواقع تلقائيًا وإرسال إشعارات عند حدوث مشاكل.

---

## 📋 المكونات الرئيسية

### 1. قاعدة البيانات
- **جدول جديد**: `uptime_monitor_settings`
  - إعدادات المراقبة التلقائية
  - الفترة الزمنية للفحص
  - إعدادات الإشعارات
  - عدد الفحوصات المتزامنة

### 2. الخدمات (Services)

#### `NotificationService` (`lib/services/notification.service.ts`)
- إرسال إشعارات عند:
  - موقع Down 🔴
  - موقع يتعافى ✅
  - موقع بطيء ⚠️

#### `UptimeCheckerService` (`lib/services/uptime-checker.service.ts`)
- فحص المواقع بشكل تلقائي
- حد توازي 5 روابط في نفس الوقت
- حفظ النتائج في قاعدة البيانات
- إرسال إشعارات عند الحاجة

#### `UptimeSchedulerService` (`lib/services/uptime-scheduler.service.ts`)
- جدولة الفحوصات التلقائية باستخدام `node-cron`
- دعم فترات: 1, 5, 10, 15, 30, 60 دقيقة
- إيقاف/تشغيل المراقبة ديناميكيًا

### 3. API Endpoints

#### `GET /api/settings/uptime-monitor`
- جلب إعدادات المراقبة الحالية

#### `PUT /api/settings/uptime-monitor`
- تحديث الإعدادات
- إعادة تشغيل الـ cron تلقائيًا

#### `POST /api/settings/uptime-monitor`
- `action: "run_manual_check"` - تشغيل فحص يدوي
- `action: "get_status"` - حالة الـ scheduler

### 4. واجهة المستخدم

#### صفحة الإعدادات: `/settings/uptime-monitor`
- تفعيل/تعطيل المراقبة
- اختيار الفترة الزمنية
- إعدادات الإشعارات
- عدد الفشل المتتالي قبل الإنذار
- Timeout والتوازي

#### صفحة المراقبة: `/uptime`
- عرض حالة المواقع
- جدول قابل للتوسيع
- بحث وفلترة وترتيب
- زر "Run Live Check" للفحص اليدوي

---

## 🚀 كيفية الاستخدام

### 1. تشغيل السيرفر
```bash
npm run dev
# أو
npm start
```

عند بدء السيرفر، سيتم تلقائيًا:
- تهيئة `UptimeSchedulerService`
- قراءة الإعدادات من قاعدة البيانات
- بدء الـ cron إذا كانت المراقبة مفعّلة

### 2. تفعيل المراقبة
1. افتح `/settings/uptime-monitor`
2. فعّل "Enable Automatic Monitoring"
3. اختر الفترة الزمنية (مثلاً: كل 5 دقائق)
4. اضغط "Save Settings"

### 3. إعدادات الإشعارات
- **Notify when website is down**: إشعار عند توقف الموقع
- **Notify when website recovers**: إشعار عند تعافي الموقع
- **Notify when website is degraded**: إشعار عند بطء الموقع
- **Consecutive Fails Before Alert**: عدد الفشل المتتالي قبل الإنذار (افتراضي: 2)

---

## ⚙️ الإعدادات المتقدمة

### Timeout (seconds)
- المدة القصوى لانتظار استجابة الموقع
- افتراضي: 10 ثواني
- نطاق: 5-60 ثانية

### Max Concurrent Checks
- عدد الروابط التي يتم فحصها في نفس الوقت
- افتراضي: 5
- نطاق: 1-20

### Check Interval
- الفترة الزمنية بين كل فحص
- خيارات: 1, 5, 10, 15, 30, 60 دقيقة

---

## 📊 كيف يعمل النظام

### 1. عند بدء السيرفر
```
instrumentation.ts
  ↓
lib/server-init.ts
  ↓
UptimeSchedulerService.initialize()
  ↓
قراءة الإعدادات من DB
  ↓
بدء cron إذا كانت المراقبة مفعّلة
```

### 2. عند تشغيل الفحص التلقائي
```
Cron Job (كل X دقيقة)
  ↓
UptimeCheckerService.runAutomaticCheck()
  ↓
جلب كل المواقع النشطة
  ↓
بناء قائمة الروابط (main, subdomain, API, admin)
  ↓
فحص 5 روابط في نفس الوقت
  ↓
حفظ النتائج في UptimeCheck & UptimeLog
  ↓
إرسال إشعارات عند الحاجة
```

### 3. تصنيف الحالات
- **Up** ✅: Status Code 200-399 + Response < 2500ms
- **Degraded** ⚠️: Status Code 200-399 + Response > 2500ms
- **Down** 🔴: Status Code خارج النطاق أو خطأ

---

## 🔔 نظام الإشعارات

### متى يتم إرسال الإشعار؟

#### Down Alert 🔴
- الموقع كان `up` أو `degraded`
- أصبح `down`
- عدد الفشل المتتالي >= `consecutiveFailsBeforeAlert`
- Severity: `critical`

#### Recovery Alert ✅
- الموقع كان `down`
- أصبح `up`
- Severity: `info`

#### Degraded Alert ⚠️
- الموقع كان `up`
- أصبح `degraded` (بطيء)
- Severity: `warning`

### مكان الإشعارات
- **In-App**: جدول `notifications` في قاعدة البيانات
- **Email**: (قريبًا - يمكن إضافة Nodemailer/SendGrid)

---

## 🛠️ الملفات المضافة/المعدلة

### ملفات جديدة
```
prisma/schema.prisma                          # جدول UptimeMonitorSettings
lib/services/notification.service.ts          # خدمة الإشعارات
lib/services/uptime-checker.service.ts        # خدمة الفحص
lib/services/uptime-scheduler.service.ts      # خدمة الجدولة
lib/server-init.ts                            # تهيئة السيرفر
instrumentation.ts                            # Next.js instrumentation
app/api/settings/uptime-monitor/route.ts     # API الإعدادات
app/settings/uptime-monitor/page.tsx         # صفحة الإعدادات
```

### ملفات معدلة
```
app/uptime/page.tsx                           # إزالة auto-check من الواجهة
package.json                                  # إضافة node-cron
```

---

## 📦 Dependencies المضافة

```json
{
  "node-cron": "^3.x.x",
  "@types/node-cron": "^3.x.x"
}
```

---

## 🔧 استكشاف الأخطاء

### المراقبة لا تعمل؟
1. تأكد أن الإعدادات مفعّلة في `/settings/uptime-monitor`
2. تحقق من console logs عند بدء السيرفر:
   ```
   [UptimeScheduler] Initializing uptime monitoring scheduler...
   [UptimeScheduler] Started with interval: 5 minutes
   ```

### Prisma Client Errors؟
- أعد تشغيل السيرفر بعد تشغيل `npx prisma db push`
- الأخطاء في TypeScript ستختفي بعد إعادة التشغيل

### الإشعارات لا تصل؟
- تحقق من `enableNotifications` في الإعدادات
- تحقق من جدول `notifications` في قاعدة البيانات
- راجع console logs للأخطاء

---

## 🎯 الخطوات التالية (اختياري)

### 1. إضافة Email Notifications
```bash
npm install nodemailer
```
ثم عدّل `NotificationService` لإرسال emails

### 2. إضافة Webhook Support
- إرسال POST request لـ webhook URL عند حدوث مشاكل
- مفيد للتكامل مع Slack/Discord/Telegram

### 3. Dashboard للإحصائيات
- رسوم بيانية لـ uptime percentage
- تاريخ الأعطال
- متوسط Response Time

### 4. Multi-Region Checks
- فحص الموقع من عدة مواقع جغرافية
- استخدام خدمات خارجية مثل Pingdom API

---

## 📝 ملاحظات مهمة

1. **VPS/Local Server فقط**: هذا النظام يعمل فقط مع Node.js server (VPS أو local)، لا يعمل مع Serverless (Vercel/Netlify)

2. **Restart Required**: عند تغيير الإعدادات، يتم إعادة تشغيل الـ cron تلقائيًا بدون الحاجة لإعادة تشغيل السيرفر

3. **Concurrency Limit**: افتراضيًا 5 روابط في نفس الوقت لتجنب الضغط على السيرفر والمواقع المستهدفة

4. **Database Growth**: جدول `uptime_logs` سيكبر مع الوقت. يُنصح بإضافة cleanup job لحذف السجلات القديمة (مثلاً > 30 يوم)

---

## ✅ الخلاصة

تم بناء نظام مراقبة احترافي كامل يشمل:
- ✅ مراقبة تلقائية على مستوى السيرفر
- ✅ جدولة باستخدام node-cron
- ✅ حد توازي 5 روابط
- ✅ نظام إشعارات متكامل
- ✅ واجهة إعدادات احترافية
- ✅ حفظ السجلات في قاعدة البيانات
- ✅ دعم Down/Recovery/Degraded alerts

النظام جاهز للاستخدام فورًا بعد إعادة تشغيل السيرفر! 🚀
