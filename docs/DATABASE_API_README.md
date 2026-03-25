# 🚀 نظام قاعدة البيانات والـ APIs - دليل شامل

## 📋 نظرة عامة

تم إنشاء نظام متكامل لإدارة قاعدة البيانات والـ APIs بأفضل الممارسات البرمجية:

✅ **Repository Pattern** - فصل منطق الوصول للبيانات  
✅ **API Routes** - واجهات برمجية موحدة  
✅ **Error Handling** - معالجة مركزية للأخطاء  
✅ **Validation** - التحقق من البيانات باستخدام Zod  
✅ **Pagination** - دعم كامل للصفحات  
✅ **TypeScript** - أمان الأنواع الكامل  
✅ **React Hooks** - سهولة الاستخدام في الواجهة  

## 📁 هيكل الملفات

```
├── lib/
│   ├── prisma.ts                      # Prisma Client
│   ├── db/
│   │   ├── base-repository.ts         # Base Repository
│   │   └── repositories/
│   │       ├── index.ts               # مركز التصدير
│   │       ├── user.repository.ts
│   │       ├── domain.repository.ts
│   │       ├── website.repository.ts
│   │       ├── client.repository.ts
│   │       ├── server.repository.ts
│   │       ├── notification.repository.ts
│   │       └── activity-log.repository.ts
│   └── api/
│       ├── response.ts                # API Response Helper
│       ├── error-handler.ts           # Error Handler
│       └── client.ts                  # API Client للواجهة
├── hooks/
│   └── use-domains.ts                 # React Hooks
├── app/api/
│   ├── domains/
│   │   ├── route.ts                   # GET, POST
│   │   ├── [id]/route.ts              # GET, PUT, DELETE
│   │   └── stats/route.ts             # إحصائيات
│   └── websites/
│       ├── route.ts
│       └── [id]/route.ts
├── prisma/
│   ├── schema.prisma                  # Database Schema
│   ├── seed.ts                        # بيانات تجريبية
│   └── README.md
└── docs/
    ├── API_DOCUMENTATION.md           # توثيق شامل
    ├── API_QUICK_START.md             # بدء سريع
    ├── USAGE_EXAMPLES.md              # أمثلة الاستخدام
    └── PRISMA_SETUP.md                # إعداد Prisma
```

## 🎯 الميزات الرئيسية

### 1. Repository Pattern

```typescript
import { domainRepository } from '@/lib/db/repositories';

// عمليات CRUD أساسية
const domains = await domainRepository.findMany();
const domain = await domainRepository.findById(1);
const newDomain = await domainRepository.create(data);
const updated = await domainRepository.update(1, data);
await domainRepository.delete(1);

// دوال مخصصة
const expiring = await domainRepository.findExpiringSoon(30);
const stats = await domainRepository.getStats();
```

### 2. API Routes

```typescript
// GET /api/domains?page=1&pageSize=10&status=active
// POST /api/domains
// GET /api/domains/:id
// PUT /api/domains/:id
// DELETE /api/domains/:id
// GET /api/domains/stats
```

### 3. React Hooks

```typescript
import { useDomains, useDomainMutations } from '@/hooks/use-domains';

function MyComponent() {
  const { domains, loading, error } = useDomains({ page: 1 });
  const { createDomain, updateDomain, deleteDomain } = useDomainMutations();

  // استخدام البيانات...
}
```

### 4. API Client

```typescript
import { DomainsApi, WebsitesApi } from '@/lib/api/client';

// استدعاء الـ APIs
const result = await DomainsApi.getAll({ page: 1 });
const domain = await DomainsApi.getById(1);
await DomainsApi.create(data);
await DomainsApi.update(1, data);
await DomainsApi.delete(1);
```

## 🚀 البدء السريع

### 1. التثبيت

```bash
npm install
```

### 2. إعداد قاعدة البيانات

```bash
# إنشاء .env
cp .env.example .env

# تحديث DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/domain_manager"

# إنشاء قاعدة البيانات
npm run db:push

# ملء البيانات التجريبية
npm run prisma:seed
```

### 3. التشغيل

```bash
npm run dev
```

## 📚 الوثائق

| الملف | الوصف |
|------|-------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | توثيق شامل للـ APIs والـ Repositories |
| [API_QUICK_START.md](./API_QUICK_START.md) | دليل البدء السريع |
| [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | أمثلة عملية للاستخدام |
| [PRISMA_SETUP.md](./PRISMA_SETUP.md) | إعداد Prisma وقاعدة البيانات |

## 💡 أمثلة سريعة

### Server Component

```typescript
// app/domains/page.tsx
import { domainRepository } from '@/lib/db/repositories';

export default async function DomainsPage() {
  const domains = await domainRepository.findMany({
    include: { client: true, registrar: true },
  });

  return (
    <div>
      {domains.map((domain) => (
        <div key={domain.id}>{domain.domainName}</div>
      ))}
    </div>
  );
}
```

### Client Component

```typescript
// components/domains-list.tsx
'use client';

import { useDomains } from '@/hooks/use-domains';

export function DomainsList() {
  const { domains, loading, error } = useDomains({ page: 1 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {domains.map((domain) => (
        <div key={domain.id}>{domain.domainName}</div>
      ))}
    </div>
  );
}
```

### API Call

```typescript
import { DomainsApi } from '@/lib/api/client';

async function createDomain() {
  const result = await DomainsApi.create({
    domainName: 'example.com',
    status: 'active',
    autoRenew: true,
  });

  console.log('Created:', result.data);
}
```

## 🏗️ المعمارية

### طبقات النظام

```
┌─────────────────────────────────────┐
│         UI Components               │
│   (Server & Client Components)     │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌──────▼──────┐
│ Repository │    │  API Routes │
│  Pattern   │    │             │
└───┬────────┘    └──────┬──────┘
    │                    │
    └──────────┬─────────┘
               │
        ┌──────▼──────┐
        │   Prisma    │
        │   Client    │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  Database   │
        │ PostgreSQL  │
        └─────────────┘
```

### مسار البيانات

**Server Components:**
```
Component → Repository → Prisma → Database
```

**Client Components:**
```
Component → Hook → API Client → API Route → Repository → Prisma → Database
```

## 🔒 الأمان

### 1. التحقق من البيانات

```typescript
import { z } from 'zod';

const schema = z.object({
  domainName: z.string().min(3).max(255),
  status: z.enum(['active', 'expired', 'pending']),
});

const validatedData = schema.parse(body);
```

### 2. معالجة الأخطاء

```typescript
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req) => {
  // الأخطاء تُعالج تلقائياً
});
```

### 3. استجابات موحدة

```typescript
import { ApiResponseHelper } from '@/lib/api/response';

return ApiResponseHelper.success(data);
return ApiResponseHelper.error('Error message', 400);
return ApiResponseHelper.notFound();
return ApiResponseHelper.unauthorized();
```

## 📊 الـ Repositories المتاحة

| Repository | الوصف |
|-----------|-------|
| `userRepository` | إدارة المستخدمين |
| `domainRepository` | إدارة النطاقات |
| `websiteRepository` | إدارة المواقع |
| `clientRepository` | إدارة العملاء |
| `serverRepository` | إدارة الخوادم |
| `notificationRepository` | إدارة الإشعارات |
| `activityLogRepository` | سجل الأنشطة |

## 🎨 أفضل الممارسات

### ✅ افعل

- استخدم Repositories في Server Components
- استخدم API Routes في Client Components
- استخدم asyncHandler لجميع API routes
- استخدم Zod للتحقق من البيانات
- استخدم Transactions للعمليات المعقدة
- أضف Indexes للحقول المستخدمة في البحث

### ❌ لا تفعل

- لا تستخدم Prisma مباشرة في Components
- لا تنسى معالجة الأخطاء
- لا تنسى التحقق من البيانات
- لا تستخدم API Routes في Server Components
- لا تكرر الكود

## 🔧 الصيانة

### إضافة Repository جديد

1. أنشئ ملف في `lib/db/repositories/`
2. ورث من `BaseRepository`
3. أضف دوال مخصصة
4. صدّر في `index.ts`

### إضافة API Route جديد

1. أنشئ ملف في `app/api/`
2. استخدم `asyncHandler`
3. استخدم `ApiResponseHelper`
4. استخدم Zod للتحقق

### إضافة Hook جديد

1. أنشئ ملف في `hooks/`
2. استخدم `ApiClient`
3. أضف معالجة للأخطاء
4. أضف حالة التحميل

## 🚀 التوسع المستقبلي

يمكن بسهولة إضافة:

- ✅ Authentication & Authorization
- ✅ Rate Limiting
- ✅ Caching (Redis)
- ✅ File Upload
- ✅ WebSockets
- ✅ Background Jobs
- ✅ API Versioning
- ✅ GraphQL

## 📞 الدعم

للمزيد من المعلومات، راجع:

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

تم إنشاء هذا النظام بأفضل الممارسات للصيانة والمرونة والتوسع 🎉

**الميزات:**
- ✅ Repository Pattern
- ✅ API Routes
- ✅ Error Handling
- ✅ Validation
- ✅ Pagination
- ✅ TypeScript
- ✅ React Hooks
- ✅ Documentation

**جاهز للإنتاج!** 🚀
