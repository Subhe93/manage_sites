# 👥 نظام إدارة المستخدمين - Users Module

## ✅ ما تم إنجازه

تم إنشاء نظام متكامل لإدارة المستخدمين مع جميع الميزات المطلوبة.

---

## 📦 الملفات المُنشأة

### 1. API Routes

| الملف | الوصف | الحالة |
|------|-------|--------|
| `app/api/users/route.ts` | GET (قائمة + فلاتر), POST (إنشاء) | ✅ |
| `app/api/users/[id]/route.ts` | GET, PUT, DELETE | ✅ |
| `app/api/users/stats/route.ts` | إحصائيات المستخدمين | ✅ |

### 2. React Hooks

| الملف | الوصف | الحالة |
|------|-------|--------|
| `hooks/use-users.ts` | Hooks للمستخدمين | ✅ |

### 3. Components

| الملف | الوصف | الحالة |
|------|-------|--------|
| `components/users/users-table.tsx` | جدول المستخدمين | ✅ |
| `components/users/users-filters.tsx` | الفلاتر | ✅ |
| `components/users/user-form.tsx` | نموذج إضافة/تعديل | ✅ |
| `components/users/users-stats.tsx` | الإحصائيات | ✅ |

### 4. Pages

| الملف | الوصف | الحالة |
|------|-------|--------|
| `app/users/page.tsx` | قائمة المستخدمين | ✅ |
| `app/users/new/page.tsx` | إضافة مستخدم | ✅ |
| `app/users/[id]/page.tsx` | عرض تفاصيل | ✅ |
| `app/users/[id]/edit/page.tsx` | تعديل مستخدم | ✅ |

---

## 🎯 الميزات

### ✅ قائمة المستخدمين
- عرض جميع المستخدمين في جدول
- Pagination (صفحات)
- إحصائيات (إجمالي، نشط، غير نشط، حسب الدور)
- إجراءات سريعة (عرض، تعديل، حذف)

### ✅ الفلاتر
- البحث (بالاسم، البريد، اسم المستخدم)
- تصفية حسب الدور (مدير عام، مدير، مطور، عميل، مشاهد)
- تصفية حسب الحالة (نشط، غير نشط)
- زر إعادة تعيين الفلاتر

### ✅ إضافة مستخدم
- نموذج شامل
- التحقق من البيانات
- تشفير كلمة المرور
- رسائل خطأ واضحة
- رسائل نجاح

### ✅ تعديل مستخدم
- تحميل البيانات الحالية
- تحديث جزئي
- تغيير كلمة المرور اختياري
- التحقق من البيانات

### ✅ عرض تفاصيل المستخدم
- معلومات أساسية
- معلومات النشاط
- الصلاحيات
- إعدادات الإشعارات

### ✅ حذف مستخدم
- تأكيد الحذف
- رسالة تحذير
- حذف نهائي

---

## 🔌 API Endpoints

### GET /api/users
جلب جميع المستخدمين مع فلاتر

**Query Parameters:**
```
page=1
pageSize=10
role=admin
isActive=true
search=ahmed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2024-03-20T10:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "createdClients": 5,
        "permissions": 10,
        "activityLogs": 100
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

### POST /api/users
إنشاء مستخدم جديد

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "role": "developer",
  "isActive": true
}
```

### GET /api/users/:id
جلب مستخدم معين

### PUT /api/users/:id
تحديث مستخدم

**Request Body:** (جميع الحقول اختيارية)
```json
{
  "fullName": "Updated Name",
  "role": "admin",
  "isActive": false
}
```

### DELETE /api/users/:id
حذف مستخدم

### GET /api/users/stats
إحصائيات المستخدمين

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 45,
    "inactive": 5,
    "byRole": [
      { "role": "admin", "count": 10 },
      { "role": "developer", "count": 20 },
      { "role": "client", "count": 15 },
      { "role": "viewer", "count": 5 }
    ]
  }
}
```

---

## 💻 استخدام الكود

### في Server Component

```typescript
import { userRepository } from '@/lib/db/repositories';

export default async function MyPage() {
  const users = await userRepository.findMany();
  const activeUsers = await userRepository.findActiveUsers();
  
  return <div>{/* عرض البيانات */}</div>;
}
```

### في Client Component

```typescript
'use client';
import { useUsers } from '@/hooks/use-users';

export function UsersList() {
  const { users, loading, error } = useUsers({
    page: 1,
    pageSize: 10,
    role: 'admin',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
}
```

### استدعاء API مباشرة

```typescript
import { UsersApi } from '@/lib/api/client';

// جلب المستخدمين
const result = await UsersApi.getAll({ page: 1 });

// إنشاء مستخدم
const newUser = await UsersApi.create({
  username: 'test',
  email: 'test@example.com',
  password: 'password123',
  role: 'developer',
});

// تحديث مستخدم
await UsersApi.update(1, { fullName: 'Updated Name' });

// حذف مستخدم
await UsersApi.delete(1);

// إحصائيات
const stats = await UsersApi.getStats();
```

---

## 🎨 الواجهات

### صفحة القائمة
- `/users` - قائمة جميع المستخدمين
- إحصائيات في الأعلى
- فلاتر متقدمة
- جدول مع pagination
- إجراءات سريعة

### صفحة الإضافة
- `/users/new` - نموذج إضافة مستخدم جديد
- جميع الحقول المطلوبة
- التحقق من البيانات
- رسائل خطأ واضحة

### صفحة التعديل
- `/users/:id/edit` - نموذج تعديل مستخدم
- تحميل البيانات الحالية
- تحديث جزئي
- كلمة المرور اختيارية

### صفحة التفاصيل
- `/users/:id` - عرض تفاصيل المستخدم
- معلومات كاملة
- الصلاحيات
- إعدادات الإشعارات
- أزرار تعديل وحذف

---

## 🔒 الأمان

### تشفير كلمة المرور
```typescript
import * as bcrypt from 'bcrypt';

// عند الإنشاء
const hashedPassword = await bcrypt.hash(password, 10);

// عند التحديث (إذا تم تغيير كلمة المرور)
if (newPassword) {
  updateData.passwordHash = await bcrypt.hash(newPassword, 10);
}
```

### التحقق من البيانات
```typescript
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['super_admin', 'admin', 'developer', 'client', 'viewer']),
});
```

### إزالة البيانات الحساسة
```typescript
// إزالة passwordHash من الاستجابة
const { passwordHash, ...sanitizedUser } = user;
return sanitizedUser;
```

---

## 🧪 الاختبار

### اختبار API

```bash
# جلب المستخدمين
curl http://localhost:3000/api/users

# إنشاء مستخدم
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "password123",
    "role": "developer"
  }'

# تحديث مستخدم
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Updated Name"}'

# حذف مستخدم
curl -X DELETE http://localhost:3000/api/users/1
```

---

## 📊 البيانات التجريبية

تم إنشاء 3 مستخدمين تجريبيين في seed:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| superadmin | superadmin@example.com | password123 | super_admin |
| admin | admin@example.com | password123 | admin |
| developer | developer@example.com | password123 | developer |

---

## ✅ الخلاصة

تم إنشاء نظام متكامل لإدارة المستخدمين يتضمن:

1. ✅ API Routes كاملة (CRUD + Stats)
2. ✅ React Hooks سهلة الاستخدام
3. ✅ Components قابلة لإعادة الاستخدام
4. ✅ Pages جاهزة للاستخدام
5. ✅ Filters متقدمة
6. ✅ Pagination
7. ✅ Validation
8. ✅ Error Handling
9. ✅ Security (تشفير كلمات المرور)
10. ✅ UI/UX ممتازة

**النظام جاهز للاستخدام! 🚀**

---

## 🔄 الخطوات التالية

يمكنك الآن:
1. تشغيل المشروع: `npm run dev`
2. الذهاب إلى: `http://localhost:3000/users`
3. تجربة جميع الميزات
4. إضافة مستخدمين جدد
5. تعديل وحذف المستخدمين

---

**تم بنجاح! 🎉**
