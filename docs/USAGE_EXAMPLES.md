# أمثلة الاستخدام - Examples

## 📋 جدول المحتويات

1. [استخدام Repositories في Server Components](#server-components)
2. [استخدام API Client في Client Components](#client-components)
3. [استخدام React Hooks](#react-hooks)
4. [أمثلة متقدمة](#advanced-examples)

---

## Server Components

### مثال 1: عرض قائمة النطاقات

```typescript
// app/domains/page.tsx
import { domainRepository } from '@/lib/db/repositories';

export default async function DomainsPage() {
  const domains = await domainRepository.findMany({
    include: {
      client: true,
      registrar: true,
    },
    orderBy: {
      domainName: 'asc',
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">النطاقات</h1>
      <div className="grid gap-4">
        {domains.map((domain) => (
          <div key={domain.id} className="border p-4 rounded">
            <h2 className="font-bold">{domain.domainName}</h2>
            <p>العميل: {domain.client?.clientName}</p>
            <p>المسجل: {domain.registrar?.providerName}</p>
            <p>الحالة: {domain.status}</p>
            <p>تاريخ الانتهاء: {domain.expiryDate?.toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### مثال 2: عرض تفاصيل نطاق

```typescript
// app/domains/[id]/page.tsx
import { domainRepository } from '@/lib/db/repositories';
import { notFound } from 'next/navigation';

export default async function DomainDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const domain = await domainRepository.findByName(params.id);

  if (!domain) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{domain.domainName}</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">معلومات أساسية</h2>
          <p>الحالة: {domain.status}</p>
          <p>TLD: {domain.tld}</p>
          <p>تجديد تلقائي: {domain.autoRenew ? 'نعم' : 'لا'}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">التواريخ</h2>
          <p>تاريخ التسجيل: {domain.registrationDate?.toLocaleDateString()}</p>
          <p>تاريخ الانتهاء: {domain.expiryDate?.toLocaleDateString()}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">العميل</h2>
          <p>{domain.client?.clientName}</p>
          <p>{domain.client?.email}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">المسجل</h2>
          <p>{domain.registrar?.providerName}</p>
          <p>{domain.registrar?.websiteUrl}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-bold mb-2">التكاليف</h2>
        <div className="grid gap-2">
          {domain.costs?.map((cost) => (
            <div key={cost.id} className="border p-2 rounded">
              <p>
                {cost.costAmount} {cost.currency} - {cost.billingCycle}
              </p>
              <p>التاريخ القادم: {cost.nextBillingDate?.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### مثال 3: Dashboard مع إحصائيات

```typescript
// app/dashboard/page.tsx
import { domainRepository, websiteRepository, clientRepository } from '@/lib/db/repositories';

export default async function DashboardPage() {
  // جلب الإحصائيات بالتوازي
  const [domainStats, websiteStats, clientStats, expiringSoon] = await Promise.all([
    domainRepository.getStats(),
    websiteRepository.getStats(),
    clientRepository.getStats(),
    domainRepository.findExpiringSoon(30),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-bold">النطاقات</h3>
          <p className="text-3xl">{domainStats.total}</p>
          <p className="text-sm">نشط: {domainStats.active}</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">المواقع</h3>
          <p className="text-3xl">{websiteStats.total}</p>
          <p className="text-sm">نشط: {websiteStats.active}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">العملاء</h3>
          <p className="text-3xl">{clientStats.total}</p>
          <p className="text-sm">نشط: {clientStats.active}</p>
        </div>

        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-bold">ينتهي قريباً</h3>
          <p className="text-3xl">{domainStats.expiringSoon}</p>
          <p className="text-sm">خلال 30 يوم</p>
        </div>
      </div>

      {/* النطاقات التي ستنتهي قريباً */}
      <div className="border p-4 rounded">
        <h2 className="font-bold mb-4">نطاقات ستنتهي قريباً</h2>
        <div className="grid gap-2">
          {expiringSoon.map((domain) => (
            <div key={domain.id} className="flex justify-between items-center border-b pb-2">
              <span>{domain.domainName}</span>
              <span className="text-red-600">
                {domain.expiryDate?.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Client Components

### مثال 1: قائمة النطاقات مع Pagination

```typescript
// components/domains-list.tsx
'use client';

import { useDomains } from '@/hooks/use-domains';
import { useState } from 'react';

export function DomainsList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');

  const { domains, pagination, loading, error, refresh } = useDomains({
    page,
    pageSize: 10,
    status: status || undefined,
  });

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (error) {
    return <div className="text-red-600">خطأ: {error}</div>;
  }

  return (
    <div>
      {/* فلتر */}
      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="expired">منتهي</option>
          <option value="pending">معلق</option>
        </select>

        <button onClick={refresh} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
          تحديث
        </button>
      </div>

      {/* القائمة */}
      <div className="grid gap-4">
        {domains.map((domain) => (
          <div key={domain.id} className="border p-4 rounded">
            <h3 className="font-bold">{domain.domainName}</h3>
            <p>الحالة: {domain.status}</p>
            <p>العميل: {domain.client?.clientName}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            السابق
          </button>

          <span className="px-4 py-2">
            صفحة {pagination.page} من {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
```

### مثال 2: نموذج إنشاء نطاق

```typescript
// components/create-domain-form.tsx
'use client';

import { useDomainMutations } from '@/hooks/use-domains';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateDomainForm() {
  const router = useRouter();
  const { createDomain, loading, error } = useDomainMutations();

  const [formData, setFormData] = useState({
    domainName: '',
    status: 'active',
    autoRenew: true,
    whoisPrivacy: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createDomain(formData);
      alert('تم إنشاء النطاق بنجاح!');
      router.push('/domains');
    } catch (err) {
      console.error('فشل الإنشاء:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">إنشاء نطاق جديد</h2>

      {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block mb-2">اسم النطاق</label>
        <input
          type="text"
          value={formData.domainName}
          onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">الحالة</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="active">نشط</option>
          <option value="pending">معلق</option>
          <option value="suspended">معلق</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.autoRenew}
            onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
            className="mr-2"
          />
          تجديد تلقائي
        </label>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.whoisPrivacy}
            onChange={(e) => setFormData({ ...formData, whoisPrivacy: e.target.checked })}
            className="mr-2"
          />
          حماية WHOIS
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'جاري الإنشاء...' : 'إنشاء'}
      </button>
    </form>
  );
}
```

### مثال 3: بحث في المواقع

```typescript
// components/websites-search.tsx
'use client';

import { useWebsites } from '@/hooks/use-domains';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function WebsitesSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { websites, loading } = useWebsites({
    search: debouncedSearch || undefined,
  });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="ابحث في المواقع..."
        className="w-full border p-2 rounded mb-4"
      />

      {loading && <div>جاري البحث...</div>}

      <div className="grid gap-4">
        {websites.map((website) => (
          <div key={website.id} className="border p-4 rounded">
            <h3 className="font-bold">{website.websiteName}</h3>
            <p>{website.websiteUrl}</p>
            <p>النوع: {website.websiteType}</p>
            <p>البيئة: {website.environment}</p>
          </div>
        ))}
      </div>

      {!loading && websites.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 mt-4">لا توجد نتائج</div>
      )}
    </div>
  );
}
```

---

## React Hooks

### مثال: Custom Hook للـ Debounce

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Advanced Examples

### مثال 1: استخدام Transactions

```typescript
// lib/services/domain.service.ts
import prisma from '@/lib/prisma';
import { activityLogRepository } from '@/lib/db/repositories';

export class DomainService {
  /**
   * إنشاء نطاق مع تكلفة وتسجيل النشاط
   */
  static async createDomainWithCost(data: {
    domain: any;
    cost: any;
    userId: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      // إنشاء النطاق
      const domain = await tx.domain.create({
        data: data.domain,
      });

      // إنشاء التكلفة
      await tx.domainCost.create({
        data: {
          ...data.cost,
          domainId: domain.id,
        },
      });

      // تسجيل النشاط
      await tx.activityLog.create({
        data: {
          userId: data.userId,
          actionType: 'create',
          entityType: 'domain',
          entityId: domain.id,
          entityName: domain.domainName,
          description: `تم إنشاء نطاق جديد: ${domain.domainName}`,
        },
      });

      return domain;
    });
  }
}
```

### مثال 2: Cron Job لتحديث النطاقات المنتهية

```typescript
// lib/jobs/update-expired-domains.ts
import { domainRepository } from '@/lib/db/repositories';

export async function updateExpiredDomains() {
  console.log('بدء تحديث النطاقات المنتهية...');

  const result = await domainRepository.updateExpiredDomains();

  console.log(`تم تحديث ${result.count} نطاق`);

  return result;
}
```

### مثال 3: API Route مع Authentication

```typescript
// app/api/domains/route.ts
import { NextRequest } from 'next/server';
import { domainRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { verifyAuth } from '@/lib/auth';

export const GET = asyncHandler(async (req: NextRequest) => {
  // التحقق من المصادقة
  const user = await verifyAuth(req);
  if (!user) {
    return ApiResponseHelper.unauthorized();
  }

  // التحقق من الصلاحيات
  if (user.role === 'client') {
    // العميل يرى نطاقاته فقط
    const domains = await domainRepository.findByClient(user.clientId);
    return ApiResponseHelper.success(domains);
  }

  // المسؤول يرى كل شيء
  const domains = await domainRepository.findMany();
  return ApiResponseHelper.success(domains);
});
```

---

تم إنشاء أمثلة شاملة للاستخدام! 🎉
