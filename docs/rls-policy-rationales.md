# RLS Policy Rationales (Short)

- `profiles`: ผู้ใช้เห็น/แก้ได้เฉพาะโปรไฟล์ตัวเอง เพื่อป้องกันข้อมูลส่วนบุคคลรั่วไหล
- `restaurants`: ลูกค้าเห็นเฉพาะร้านที่ active, ส่วน staff/admin จัดการได้เฉพาะร้านตนเอง
- `categories`: ลูกค้าอ่านหมวดที่ active, staff/admin แก้หมวดเพื่อดูแลเมนู
- `menu_items`: ลูกค้าอ่านเฉพาะเมนูที่ขายอยู่, staff/admin จัดการรายละเอียดเมนู
- `promo_campaigns`: ลูกค้าเห็นเฉพาะแคมเปญที่ active และอยู่ในช่วงเวลา, staff/admin บริหารทุกสถานะ
- `memberships`: ลูกค้าเข้าถึง membership ของตัวเอง, staff/admin จัดการสมาชิกในร้านตนเอง
- `lucky_draw_entries`: ลูกค้าเข้าถึงสิทธิ์จับรางวัลของตัวเอง, staff/admin ตรวจสอบและจัดการแคมเปญ
- `notifications`: ลูกค้าอ่านแจ้งเตือนของตัวเอง, staff/admin ส่งและจัดการแจ้งเตือน
- `push_subscriptions`: เจ้าของ subscription จัดการ endpoint ตัวเอง, staff/admin ช่วยดูแลในขอบเขตร้าน
- `admin_users`: จำกัดให้ admin ระดับร้านเท่านั้นที่เพิ่ม/ลบสิทธิ์หลังบ้าน
- `audit_logs`: staff เขียน log ได้เพื่อความครบถ้วนของ trace, admin อ่านได้เพื่อควบคุมความเสี่ยง
