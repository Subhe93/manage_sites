# توثيق API ونظام قاعدة البيانات

## 📁 هيكل المشروع

```
lib/
├── prisma.ts                    # Prisma Client Singleton
├── db/
│   ├── base-repository.ts       # Base Repository Pattern
│   └── repositories/
│       ├── index.ts             # مركز تصدير الـ Repositories
│       ├── user.repository.ts
│       ├── domain.repository.ts
│       ├── website.repository.ts
│       ├── client.repository.ts
│       ├── server.repository.ts
│       ├── notification.repository.ts
│       └── activity-log.repository.ts
├── api/
│   ├── response.ts              # API Response Helper
│   └── error-handler.ts         # Error Handler
app/api/
├── domains/
│   ├── route.ts                 # GET, POST /api/domains
│   ├── [id]/route.ts            # GET, PUT, DELETE /api/domains/:id
│   └── stats/route.ts           # GET /api/domains/stats
└── websites/
    ├── route.ts                 # GET, POST /api/websites
    └── [id]/route.ts            # GET, PUT, DELETE /api/websites/:id
```

## 🏗️ معمارية النظام

### 1. Repository Pattern

نستخدم Repository Pattern لفصل منطق الوصول للبيانات عن منطق الأعمال:

```typescript
// استخدام Repository
import { domainRepository } from '@/lib/db/repositories';

// جلب جميع النطاقات
const domains = await domainRepository.findMany();

// جلب نطاق معين
const domain = await domainRepository.findById(1);

// إنشاء نطاق جديد
const newDomain = await domainRepository.create({
  domainName: 'example.com',
  status: 'active',
  // ...
});

// تحديث نطاق
const updated = await domainRepository.update(1, {
  status: 'expired',
});

// حذف نطاق
await domainRepository.delete(1);
```

### 2. Base Repository

جميع الـ Repositories ترث من `BaseRepository` الذي يوفر:

- `findMany()` - جلب عدة سجلات
- `findById()` - جلب سجل بالمعرف
- `findOne()` - جلب سجل واحد بشرط
- `create()` - إنشاء سجل جديد
- `update()` - تحديث سجل
- `delete()` - حذف سجل
- `count()` - عد السجلات
- `exists()` - التحقق من وجود سجل
- `paginate()` - جلب مع pagination

### 3. API Response Helper

استجابات موحدة لجميع الـ APIs:

```typescript
import { ApiResponseHelper } from '@/lib/api/response';

// استجابة ناجحة
return ApiResponseHelper.success(data);

// استجابة مع pagination
return ApiResponseHelper.successWithPagination(data, pagination);

// استجابة خطأ
return ApiResponseHelper.error('Error message', 400);

// استجابات جاهزة
return ApiResponseHelper.notFound();
return ApiResponseHelper.unauthorized();
return ApiResponseHelper.forbidden();
return ApiResponseHelper.validationError(errors);
```

### 4. Error Handler

معالجة مركزية للأخطاء:

```typescript
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req) => {
  // الكود هنا
  // الأخطاء تُلتقط وتُعالج تلقائياً
});
```

## 🔌 API Endpoints

### Domains API

#### GET /api/domains
جلب جميع النطاقات مع pagination

**Query Parameters:**
- `page` (number) - رقم الصفحة (افتراضي: 1)
- `pageSize` (number) - عدد العناصر في الصفحة (افتراضي: 10)
- `status` (string) - تصفية حسب الحالة
- `clientId` (number) - تصفية حسب العميل

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "domainName": "example.com",
      "status": "active",
      "expiryDate": "2025-01-15T00:00:00.000Z",
      "client": {
        "id": 1,
        "clientName": "Tech Solutions"
      },
      "registrar": {
        "id": 1,
        "providerName": "Namecheap"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /api/domains
إنشاء نطاق جديد

**Request Body:**
```json
{
  "domainName": "example.com",
  "tld": ".com",
  "status": "active",
  "registrarId": 1,
  "clientId": 1,
  "registrationDate": "2024-01-15T00:00:00.000Z",
  "expiryDate": "2025-01-15T00:00:00.000Z",
  "autoRenew": true,
  "renewalNotificationDays": 30,
  "whoisPrivacy": true,
  "nameservers": "ns1.cloudflare.com, ns2.cloudflare.com",
  "notes": "ملاحظات"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "domainName": "example.com",
    // ...
  }
}
```

#### GET /api/domains/[id]
جلب نطاق معين

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "domainName": "example.com",
    "client": { /* ... */ },
    "registrar": { /* ... */ },
    "costs": [ /* ... */ ],
    "websites": [ /* ... */ ]
  }
}
```

#### PUT /api/domains/[id]
تحديث نطاق

**Request Body:** (جميع الحقول اختيارية)
```json
{
  "status": "expired",
  "expiryDate": "2026-01-15T00:00:00.000Z",
  "notes": "تم التجديد"
}
```

#### DELETE /api/domains/[id]
حذف نطاق

**Response:** 204 No Content

#### GET /api/domains/stats
إحصائيات النطاقات

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "active": 85,
    "expired": 10,
    "expiringSoon": 5,
    "expiringSoonList": [ /* ... */ ]
  }
}
```

### Websites API

#### GET /api/websites
جلب جميع المواقع

**Query Parameters:**
- `page`, `pageSize` - pagination
- `status` - تصفية حسب الحالة
- `clientId` - تصفية حسب العميل
- `type` - تصفية حسب النوع
- `environment` - تصفية حسب البيئة
- `search` - البحث في الاسم والوصف

#### POST /api/websites
إنشاء موقع جديد

**Request Body:**
```json
{
  "websiteName": "My Website",
  "domainId": 1,
  "clientId": 1,
  "serverAccountId": 1,
  "websiteType": "wordpress",
  "framework": "WordPress 6.4",
  "environment": "production",
  "websiteUrl": "https://example.com",
  "adminUrl": "https://example.com/wp-admin",
  "databaseName": "example_db",
  "databaseType": "MySQL 8.0",
  "status": "active",
  "description": "وصف الموقع",
  "notes": "ملاحظات"
}
```

#### GET /api/websites/[id]
جلب موقع مع جميع العلاقات

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "websiteName": "My Website",
    "domain": { /* ... */ },
    "client": { /* ... */ },
    "serverAccount": {
      "server": { /* ... */ }
    },
    "credentials": [ /* ... */ ],
    "costs": [ /* ... */ ],
    "repositories": [ /* ... */ ],
    "uptimeChecks": [ /* ... */ ]
  }
}
```

#### PUT /api/websites/[id]
تحديث موقع

#### DELETE /api/websites/[id]
حذف موقع

## 💡 أمثلة الاستخدام

### في Server Components

```typescript
// app/domains/page.tsx
import { domainRepository } from '@/lib/db/repositories';

export default async function DomainsPage() {
  const domains = await domainRepository.findMany({
    include: {
      client: true,
      registrar: true,
    },
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

### في Client Components (عبر API)

```typescript
// components/domains-list.tsx
'use client';

import { useEffect, useState } from 'react';

export function DomainsList() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/domains?page=1&pageSize=10')
      .then((res) => res.json())
      .then((data) => {
        setDomains(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {domains.map((domain) => (
        <div key={domain.id}>{domain.domainName}</div>
      ))}
    </div>
  );
}
```

### إنشاء Repository جديد

```typescript
// lib/db/repositories/tag.repository.ts
import { Tag, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class TagRepository extends BaseRepository<
  Tag,
  Prisma.TagCreateInput,
  Prisma.TagUpdateInput,
  Prisma.TagWhereInput
> {
  protected model = prisma.tag;

  // دوال مخصصة
  async findByName(tagName: string) {
    return this.model.findUnique({
      where: { tagName },
    });
  }

  async findPopular(limit: number = 10) {
    return this.model.findMany({
      include: {
        _count: {
          select: {
            entityTags: true,
          },
        },
      },
      orderBy: {
        entityTags: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }
}

export const tagRepository = new TagRepository();
```

### إنشاء API Route جديد

```typescript
// app/api/tags/route.ts
import { NextRequest } from 'next/server';
import { tagRepository } from '@/lib/db/repositories/tag.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest) => {
  const tags = await tagRepository.findMany({
    include: {
      _count: {
        select: {
          entityTags: true,
        },
      },
    },
  });

  return ApiResponseHelper.success(tags);
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  
  const tag = await tagRepository.create(body);
  
  return ApiResponseHelper.created(tag);
});
```

## 🔒 الأمان

### التحقق من البيانات

نستخدم Zod للتحقق من البيانات:

```typescript
import { z } from 'zod';

const schema = z.object({
  domainName: z.string().min(3).max(255),
  status: z.enum(['active', 'expired', 'pending']),
});

const validatedData = schema.parse(body);
```

### معالجة الأخطاء

جميع الأخطاء تُعالج تلقائياً:
- Prisma errors (duplicate, not found, etc.)
- Zod validation errors
- Custom API errors
- Generic errors

## 📊 Pagination

جميع الـ APIs تدعم pagination:

```typescript
const result = await repository.paginate({
  page: 1,
  pageSize: 10,
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
});

// result.data - البيانات
// result.pagination - معلومات الصفحات
```

## 🎯 أفضل الممارسات

1. **استخدم Repositories** بدلاً من Prisma مباشرة
2. **استخدم asyncHandler** لجميع API routes
3. **استخدم ApiResponseHelper** للاستجابات الموحدة
4. **استخدم Zod** للتحقق من البيانات
5. **أضف دوال مخصصة** في الـ Repositories حسب الحاجة
6. **استخدم transactions** للعمليات المعقدة
7. **أضف indexes** للحقول المستخدمة في البحث
8. **استخدم select** لتحديد الحقول المطلوبة فقط

## 🚀 التوسع المستقبلي

يمكن بسهولة إضافة:
- Authentication & Authorization
- Rate Limiting
- Caching (Redis)
- File Upload
- WebSockets
- Background Jobs
- API Versioning
- GraphQL

---

تم إنشاء هذا النظام بأفضل الممارسات للصيانة والمرونة 🎉
