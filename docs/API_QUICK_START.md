# دليل البدء السريع - API & Database

## 🚀 البدء في 5 دقائق

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إعداد قاعدة البيانات
```bash
# إنشاء ملف .env
cp .env.example .env

# تحديث DATABASE_URL في .env
DATABASE_URL="postgresql://user:password@localhost:5432/domain_manager"

# إنشاء قاعدة البيانات
npm run db:push

# ملء البيانات التجريبية
npm run prisma:seed
```

### 3. تشغيل المشروع
```bash
npm run dev
```

## 📝 أمثلة سريعة

### استخدام Repository في Server Component

```typescript
// app/domains/page.tsx
import { domainRepository } from '@/lib/db/repositories';

export default async function DomainsPage() {
  // جلب جميع النطاقات
  const domains = await domainRepository.findMany();
  
  // جلب النطاقات التي ستنتهي قريباً
  const expiring = await domainRepository.findExpiringSoon(30);
  
  // جلب إحصائيات
  const stats = await domainRepository.getStats();
  
  return <div>{/* عرض البيانات */}</div>;
}
```

### استخدام API في Client Component

```typescript
'use client';

import { useEffect, useState } from 'react';

export function DomainsList() {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    // جلب النطاقات
    fetch('/api/domains?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setDomains(data.data));
  }, []);

  return (
    <div>
      {domains.map(domain => (
        <div key={domain.id}>{domain.domainName}</div>
      ))}
    </div>
  );
}
```

### إنشاء نطاق جديد

```typescript
async function createDomain() {
  const response = await fetch('/api/domains', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domainName: 'example.com',
      status: 'active',
      clientId: 1,
      registrarId: 1,
      autoRenew: true,
    }),
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('تم الإنشاء:', result.data);
  }
}
```

### تحديث نطاق

```typescript
async function updateDomain(id: number) {
  const response = await fetch(`/api/domains/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'expired',
      notes: 'تم التحديث',
    }),
  });
  
  const result = await response.json();
}
```

### حذف نطاق

```typescript
async function deleteDomain(id: number) {
  await fetch(`/api/domains/${id}`, {
    method: 'DELETE',
  });
}
```

## 🔌 API Endpoints المتاحة

### Domains
- `GET /api/domains` - جلب جميع النطاقات
- `POST /api/domains` - إنشاء نطاق
- `GET /api/domains/:id` - جلب نطاق معين
- `PUT /api/domains/:id` - تحديث نطاق
- `DELETE /api/domains/:id` - حذف نطاق
- `GET /api/domains/stats` - إحصائيات النطاقات

### Websites
- `GET /api/websites` - جلب جميع المواقع
- `POST /api/websites` - إنشاء موقع
- `GET /api/websites/:id` - جلب موقع معين
- `PUT /api/websites/:id` - تحديث موقع
- `DELETE /api/websites/:id` - حذف موقع

## 📦 Repositories المتاحة

```typescript
import {
  userRepository,
  domainRepository,
  websiteRepository,
  clientRepository,
  serverRepository,
  notificationRepository,
  activityLogRepository,
} from '@/lib/db/repositories';
```

### دوال Repository الأساسية

كل repository يوفر:

```typescript
// جلب جميع السجلات
await repository.findMany({ where, orderBy, include });

// جلب سجل بالمعرف
await repository.findById(id, include);

// جلب سجل واحد
await repository.findOne(where, include);

// إنشاء سجل
await repository.create(data);

// تحديث سجل
await repository.update(id, data);

// حذف سجل
await repository.delete(id);

// عد السجلات
await repository.count(where);

// التحقق من وجود سجل
await repository.exists(where);

// جلب مع pagination
await repository.paginate({
  page: 1,
  pageSize: 10,
  where,
  orderBy,
  include,
});
```

## 🎯 أمثلة متقدمة

### استخدام Transactions

```typescript
import prisma from '@/lib/prisma';

await prisma.$transaction(async (tx) => {
  // إنشاء نطاق
  const domain = await tx.domain.create({
    data: { /* ... */ },
  });
  
  // إنشاء تكلفة للنطاق
  await tx.domainCost.create({
    data: {
      domainId: domain.id,
      costAmount: 12.99,
      currency: 'USD',
      billingCycle: 'yearly',
    },
  });
  
  // تسجيل النشاط
  await tx.activityLog.create({
    data: {
      userId: 1,
      actionType: 'create',
      entityType: 'domain',
      entityId: domain.id,
      description: 'تم إنشاء نطاق جديد',
    },
  });
});
```

### البحث المتقدم

```typescript
// البحث في المواقع
const results = await websiteRepository.search('wordpress');

// جلب النطاقات التي ستنتهي قريباً
const expiring = await domainRepository.findExpiringSoon(30);

// جلب المواقع حسب العميل
const websites = await websiteRepository.findByClient(clientId);

// جلب الخوادم النشطة
const servers = await serverRepository.findActive();
```

### Pagination

```typescript
const result = await domainRepository.paginate({
  page: 1,
  pageSize: 10,
  where: { status: 'active' },
  orderBy: { domainName: 'asc' },
  include: {
    client: true,
    registrar: true,
  },
});

console.log(result.data); // البيانات
console.log(result.pagination); // معلومات الصفحات
```

## 🔍 تصحيح الأخطاء

### تفعيل Prisma Logs

في ملف `.env`:
```env
NODE_ENV=development
```

سيتم عرض جميع الـ queries في console.

### استخدام Prisma Studio

```bash
npm run prisma:studio
```

يفتح واجهة رسومية على `http://localhost:5555`

## 📚 المزيد من التوثيق

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - توثيق شامل
- [PRISMA_SETUP.md](./PRISMA_SETUP.md) - إعداد Prisma
- [prisma/README.md](./prisma/README.md) - معلومات قاعدة البيانات

## 💡 نصائح

1. استخدم **Repositories** بدلاً من Prisma مباشرة
2. استخدم **Server Components** عندما تستطيع (أسرع)
3. استخدم **API Routes** للـ Client Components فقط
4. استخدم **Transactions** للعمليات المعقدة
5. استخدم **Pagination** للبيانات الكبيرة
6. أضف **Indexes** للحقول المستخدمة في البحث

---

جاهز للبدء! 🚀
