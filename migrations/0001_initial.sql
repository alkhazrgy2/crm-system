-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  status TEXT DEFAULT 'active'
);

-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'lead',
  source TEXT,
  assigned_to INTEGER,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_contact TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- إنشاء جدول جهات الاتصال
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- إنشاء جدول المحادثات
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  subject TEXT,
  assigned_to INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- إنشاء جدول الرسائل
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL,
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- إنشاء جدول قراءة الرسائل
CREATE TABLE IF NOT EXISTS message_reads (
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- إنشاء جدول مسارات المبيعات
CREATE TABLE IF NOT EXISTS pipelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- إنشاء جدول مراحل مسارات المبيعات
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pipeline_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  color TEXT,
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
);

-- إنشاء جدول الصفقات
CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  customer_id INTEGER NOT NULL,
  pipeline_id INTEGER NOT NULL,
  stage_id INTEGER NOT NULL,
  value REAL,
  currency TEXT DEFAULT 'SAR',
  assigned_to INTEGER,
  probability REAL,
  expected_close_date DATE,
  actual_close_date DATE,
  status TEXT DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id),
  FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- إنشاء جدول المنتجات في الصفقات
CREATE TABLE IF NOT EXISTS deal_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- إنشاء جدول المهام
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to INTEGER,
  related_type TEXT,
  related_id INTEGER,
  completed_at TIMESTAMP,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- إنشاء جدول القوالب
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- إنشاء جدول الروبوتات
CREATE TABLE IF NOT EXISTS bots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- إنشاء جدول إجراءات الروبوتات
CREATE TABLE IF NOT EXISTS bot_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  FOREIGN KEY (bot_id) REFERENCES bots(id)
);

-- إنشاء جدول الإحصائيات
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  period TEXT NOT NULL,
  date DATE NOT NULL,
  metrics TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إدخال بيانات تجريبية للمستخدمين
INSERT INTO users (email, password, first_name, last_name, role, status)
VALUES 
('admin@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'محمد', 'أحمد', 'admin', 'active'),
('agent1@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'سارة', 'خالد', 'agent', 'active'),
('agent2@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'أحمد', 'علي', 'agent', 'active');

-- إدخال بيانات تجريبية للعملاء
INSERT INTO customers (first_name, last_name, email, phone, company, position, status, source, assigned_to)
VALUES 
('أحمد', 'محمد', 'ahmed@example.com', '+966 50 123 4567', 'شركة التقنية المتطورة', 'مدير تقنية المعلومات', 'customer', 'website', 1),
('سارة', 'أحمد', 'sara@example.com', '+966 55 987 6543', 'مؤسسة الإبداع', 'مديرة التسويق', 'lead', 'referral', 2),
('محمد', 'علي', 'mohamed@example.com', '+966 54 456 7890', 'شركة النور للتجارة', 'المدير التنفيذي', 'customer', 'exhibition', 3),
('فاطمة', 'حسن', 'fatima@example.com', '+966 56 321 7654', 'مؤسسة الأمل', 'مديرة المبيعات', 'lead', 'website', 1),
('خالد', 'عبدالله', 'khaled@example.com', '+966 59 789 1234', 'شركة المستقبل', 'مدير المشتريات', 'customer', 'social_media', 2);

-- إدخال بيانات تجريبية لمسارات المبيعات
INSERT INTO pipelines (name, description, created_by)
VALUES ('مسار المبيعات الرئيسي', 'المسار الافتراضي لإدارة صفقات المبيعات', 1);

-- إدخال بيانات تجريبية لمراحل مسارات المبيعات
INSERT INTO pipeline_stages (pipeline_id, name, order_num, color)
VALUES 
(1, 'جهات اتصال جديدة', 1, '#3498db'),
(1, 'اجتماع أولي', 2, '#9b59b6'),
(1, 'تقديم عرض', 3, '#e74c3c'),
(1, 'مفاوضات', 4, '#f39c12'),
(1, 'صفقة مغلقة', 5, '#2ecc71');

-- إدخال بيانات تجريبية للصفقات
INSERT INTO deals (title, customer_id, pipeline_id, stage_id, value, assigned_to, status)
VALUES 
('مشروع تطوير موقع إلكتروني', 1, 1, 1, 15000, 1, 'open'),
('خدمات استضافة سحابية', 2, 1, 2, 8000, 2, 'open'),
('تطبيق جوال للمبيعات', 3, 1, 2, 25000, 3, 'open'),
('نظام إدارة المخزون', 5, 1, 3, 20000, 1, 'open'),
('خدمات تسويق رقمي', 4, 1, 4, 12000, 2, 'open'),
('تطوير تطبيق ويب', 3, 1, 5, 30000, 3, 'won');

-- إدخال بيانات تجريبية للمحادثات
INSERT INTO conversations (customer_id, channel, status, assigned_to)
VALUES 
(1, 'whatsapp', 'active', 1),
(2, 'instagram', 'active', 2),
(3, 'email', 'active', 3),
(4, 'whatsapp', 'active', 1),
(5, 'instagram', 'active', 2);

-- إدخال بيانات تجريبية للرسائل
INSERT INTO messages (conversation_id, sender_type, sender_id, content)
VALUES 
(1, 'customer', 1, 'مرحباً، أود الاستفسار عن خدماتكم في تطوير المواقع الإلكترونية'),
(1, 'user', 1, 'مرحباً بك! يسعدنا تقديم المساعدة. هل يمكنك إخباري بمزيد من التفاصيل عن مشروعك؟'),
(1, 'customer', 1, 'أحتاج إلى موقع إلكتروني لشركتي يعرض منتجاتنا ويتيح للعملاء التواصل معنا'),
(2, 'customer', 2, 'هل يمكنني الحصول على معلومات إضافية عن خدمات الاستضافة السحابية؟'),
(2, 'user', 2, 'بالتأكيد! نقدم خدمات استضافة سحابية بأسعار تنافسية وأداء عالي. هل تفضل أن أرسل لك عرض أسعار مفصل؟'),
(3, 'customer', 3, 'شكراً لكم على العرض المقدم. سأقوم بمراجعته والرد عليكم قريباً'),
(3, 'user', 3, 'شكراً لك على اهتمامك. نحن في انتظار ردك، وإذا كان لديك أي استفسارات إضافية فلا تتردد في التواصل معنا'),
(4, 'customer', 4, 'أحتاج إلى مساعدة في تفعيل الحساب'),
(4, 'user', 1, 'مرحباً! يمكنني مساعدتك في ذلك. هل يمكنك إخباري برقم الطلب أو البريد الإلكتروني المسجل؟'),
(5, 'customer', 5, 'متى سيتم شحن الطلب؟'),
(5, 'user', 2, 'مرحباً! سأتحقق من حالة طلبك فوراً. هل يمكنك تزويدي برقم الطلب؟');

-- إدخال بيانات تجريبية للمهام
INSERT INTO tasks (title, description, type, status, priority, due_date, assigned_to, related_type, related_id, created_by)
VALUES 
('متابعة عرض السعر', 'متابعة العميل بخصوص عرض السعر المقدم للمشروع', 'call', 'pending', 'high', '2025-04-30', 1, 'customer', 1, 1),
('إرسال معلومات إضافية', 'إرسال معلومات تفصيلية عن خدمات الاستضافة السحابية', 'email', 'pending', 'medium', '2025-04-28', 2, 'deal', 2, 1),
('اجتماع تقديم العرض', 'اجتماع مع العميل لتقديم عرض تطبيق الجوال', 'meeting', 'pending', 'high', '2025-05-02', 3, 'deal', 3, 1),
('تحديث بيانات العميل', 'تحديث معلومات الاتصال وبيانات الشركة', 'task', 'completed', 'low', '2025-04-25', 1, 'customer', 2, 1),
('متابعة الدفعة الأولى', 'التأكد من استلام الدفعة الأولى للمشروع', 'task', 'pending', 'medium', '2025-04-29', 2, 'deal', 4, 1);

-- إدخال بيانات تجريبية للقوالب
INSERT INTO templates (name, type, subject, content, variables, created_by)
VALUES 
('ترحيب بالعميل الجديد', 'message', NULL, 'مرحباً {{customer_name}}، شكراً لتواصلك معنا. يسعدنا خدمتك ومساعدتك في {{service_type}}. كيف يمكننا مساعدتك اليوم؟', 'customer_name,service_type', 1),
('متابعة العرض', 'email', 'متابعة العرض - {{deal_name}}', 'عزيزي {{customer_name}}،\n\nأتمنى أن تكون بخير. أود متابعة العرض الذي قدمناه لكم بخصوص {{deal_name}}.\n\nهل لديكم أي استفسارات أو ملاحظات حول العرض؟\n\nنتطلع للتواصل معكم قريباً.\n\nمع خالص التحية،\n{{user_name}}', 'customer_name,deal_name,user_name', 2);

-- إدخال بيانات تجريبية للروبوتات
INSERT INTO bots (name, description, trigger_type, trigger_value, is_active, created_by)
VALUES 
('روبوت الترحيب التلقائي', 'يرسل رسالة ترحيب تلقائية للعملاء الجدد', 'event', 'new_customer', 1, 1),
('متابعة العروض', 'يرسل رسالة متابعة بعد 3 أيام من إرسال العرض', 'schedule', 'deal_follow_up', 1, 2);

-- إدخال بيانات تجريبية لإجراءات الروبوتات
INSERT INTO bot_actions (bot_id, type, config, order_num)
VALUES 
(1, 'send_message', '{"template_id": 1}', 1),
(2, 'send_message', '{"template_id": 2}', 1),
(2, 'create_task', '{"title": "متابعة العميل", "type": "call", "priority": "medium", "due_days": 1}', 2);
