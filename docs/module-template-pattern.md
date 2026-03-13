# Base Module Template Pattern

แต่ละ entity ใช้ pattern เดียวกัน:

1. `zod schema` รับผิดชอบ validate input (`create` / `update`)
2. `repository` รับผิดชอบ data access ผ่าน Supabase (`find/list/insert/update`)
3. `service` รับผิดชอบ orchestration และ parse schema ก่อนส่ง repository

ตำแหน่งไฟล์:

```txt
lib/modules/shared/base-entity.repository.ts
lib/modules/entities/*.module.ts
components/customer/customer-module-page-template.tsx
components/admin/admin-module-page-template.tsx
```

แนวทางขยายงาน:
- เพิ่ม method เฉพาะ domain ใน repository (เช่น `listActiveByRestaurant`)
- เพิ่ม business rules ใน service (เช่น points validation, campaign eligibility)
- ให้ route handlers เรียกผ่าน service เท่านั้น ไม่เรียก repository ตรง
