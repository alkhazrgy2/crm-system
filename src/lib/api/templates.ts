import { db } from '@/lib/db';

export async function getTemplates(filters?: {
  type?: string;
  createdBy?: number;
}) {
  try {
    let query = `
      SELECT 
        t.id, 
        t.name, 
        t.type, 
        t.subject, 
        t.content, 
        t.variables, 
        t.created_by,
        t.created_at,
        t.updated_at,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM templates t
      JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.type) {
        query += ' AND t.type = ?';
        queryParams.push(filters.type);
      }
      
      if (filters.createdBy) {
        query += ' AND t.created_by = ?';
        queryParams.push(filters.createdBy);
      }
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const templates = await db.query(query, queryParams);
    
    // حساب عدد استخدامات كل قالب
    for (const template of templates) {
      // يمكن إضافة منطق لحساب عدد الاستخدامات هنا
      // مثلاً من خلال جدول استخدامات القوالب إذا تم إنشاؤه
      template.usage_count = 0;
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('فشل في جلب بيانات القوالب');
  }
}

export async function getTemplateById(id: number) {
  try {
    const template = await db.query(`
      SELECT 
        t.id, 
        t.name, 
        t.type, 
        t.subject, 
        t.content, 
        t.variables, 
        t.created_by,
        t.created_at,
        t.updated_at,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM templates t
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `, [id]);
    
    if (template.length === 0) {
      return null;
    }
    
    return template[0];
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw new Error('فشل في جلب بيانات القالب');
  }
}

export async function createTemplate(templateData: {
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables?: string;
  created_by: number;
}) {
  try {
    const { name, type, subject, content, variables, created_by } = templateData;
    
    // إنشاء القالب الجديد
    const result = await db.query(
      `INSERT INTO templates (name, type, subject, content, variables, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, type, subject || null, content, variables || null, created_by]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

export async function updateTemplate(id: number, templateData: {
  name?: string;
  type?: string;
  subject?: string;
  content?: string;
  variables?: string;
}) {
  try {
    // التحقق من وجود القالب
    const existingTemplate = await db.query('SELECT id FROM templates WHERE id = ?', [id]);
    if (existingTemplate.length === 0) {
      throw new Error('القالب غير موجود');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(templateData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return { success: true }; // لا يوجد شيء للتحديث
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // تنفيذ استعلام التحديث
    await db.query(
      `UPDATE templates SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    throw error;
  }
}

export async function deleteTemplate(id: number) {
  try {
    // التحقق من وجود القالب
    const existingTemplate = await db.query('SELECT id FROM templates WHERE id = ?', [id]);
    if (existingTemplate.length === 0) {
      throw new Error('القالب غير موجود');
    }
    
    // التحقق من عدم استخدام القالب في الروبوتات
    const botActions = await db.query(
      "SELECT COUNT(*) as count FROM bot_actions WHERE type = 'send_message' AND config LIKE ?",
      [`%"template_id":${id}%`]
    );
    
    if (botActions[0].count > 0) {
      throw new Error('لا يمكن حذف القالب لأنه مستخدم في روبوتات');
    }
    
    // حذف القالب
    await db.query('DELETE FROM templates WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    throw error;
  }
}

export async function getBots(filters?: {
  isActive?: boolean;
  createdBy?: number;
}) {
  try {
    let query = `
      SELECT 
        b.id, 
        b.name, 
        b.description, 
        b.trigger_type, 
        b.trigger_value, 
        b.is_active, 
        b.created_by,
        b.created_at,
        b.updated_at,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM bots b
      JOIN users u ON b.created_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.isActive !== undefined) {
        query += ' AND b.is_active = ?';
        queryParams.push(filters.isActive ? 1 : 0);
      }
      
      if (filters.createdBy) {
        query += ' AND b.created_by = ?';
        queryParams.push(filters.createdBy);
      }
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const bots = await db.query(query, queryParams);
    
    // جلب إجراءات كل روبوت
    for (const bot of bots) {
      const actions = await db.query(`
        SELECT id, type, config, order_num
        FROM bot_actions
        WHERE bot_id = ?
        ORDER BY order_num ASC
      `, [bot.id]);
      
      bot.actions = actions;
    }
    
    return bots;
  } catch (error) {
    console.error('Error fetching bots:', error);
    throw new Error('فشل في جلب بيانات الروبوتات');
  }
}

export async function getBotById(id: number) {
  try {
    const bot = await db.query(`
      SELECT 
        b.id, 
        b.name, 
        b.description, 
        b.trigger_type, 
        b.trigger_value, 
        b.is_active, 
        b.created_by,
        b.created_at,
        b.updated_at,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM bots b
      JOIN users u ON b.created_by = u.id
      WHERE b.id = ?
    `, [id]);
    
    if (bot.length === 0) {
      return null;
    }
    
    // جلب إجراءات الروبوت
    const actions = await db.query(`
      SELECT id, type, config, order_num
      FROM bot_actions
      WHERE bot_id = ?
      ORDER BY order_num ASC
    `, [id]);
    
    return {
      ...bot[0],
      actions
    };
  } catch (error) {
    console.error(`Error fetching bot ${id}:`, error);
    throw new Error('فشل في جلب بيانات الروبوت');
  }
}

export async function createBot(botData: {
  name: string;
  description?: string;
  trigger_type: string;
  trigger_value: string;
  is_active?: boolean;
  created_by: number;
  actions: Array<{
    type: string;
    config: string;
  }>;
}) {
  try {
    const { name, description, trigger_type, trigger_value, is_active, created_by, actions } = botData;
    
    // إنشاء الروبوت الجديد
    const result = await db.query(
      `INSERT INTO bots (name, description, trigger_type, trigger_value, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, trigger_type, trigger_value, is_active === false ? 0 : 1, created_by]
    );
    
    const botId = result.lastID;
    
    // إضافة إجراءات الروبوت
    for (let i = 0; i < actions.length; i++) {
      await db.query(
        `INSERT INTO bot_actions (bot_id, type, config, order_num)
         VALUES (?, ?, ?, ?)`,
        [botId, actions[i].type, actions[i].config, i + 1]
      );
    }
    
    return { id: botId };
  } catch (error) {
    console.error('Error creating bot:', error);
    throw error;
  }
}

export async function updateBot(id: number, botData: {
  name?: string;
  description?: string;
  trigger_type?: string;
  trigger_value?: string;
  is_active?: boolean;
}) {
  try {
    // التحقق من وجود الروبوت
    const existingBot = await db.query('SELECT id FROM bots WHERE id = ?', [id]);
    if (existingBot.length === 0) {
      throw new Error('الروبوت غير موجود');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(botData)) {
      if (value !== undefined) {
        if (key === 'is_active') {
          updateFields.push(`${key} = ?`);
          updateValues.push(value ? 1 : 0);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    }
    
    if (updateFields.length === 0) {
      return { success: true }; // لا يوجد شيء للتحديث
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // تنفيذ استعلام التحديث
    await db.query(
      `UPDATE bots SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating bot ${id}:`, error);
    throw error;
  }
}

export async function updateBotActions(botId: number, actions: Array<{
  id?: number;
  type: string;
  config: string;
}>) {
  try {
    // التحقق من وجود الروبوت
    const existingBot = await db.query('SELECT id FROM bots WHERE id = ?', [botId]);
    if (existingBot.length === 0) {
      throw new Error('الروبوت غير موجود');
    }
    
    // حذف جميع الإجراءات الحالية
    await db.query('DELETE FROM bot_actions WHERE bot_id = ?', [botId]);
    
    // إضافة الإجراءات الجديدة
    for (let i = 0; i < actions.length; i++) {
      await db.query(
        `INSERT INTO bot_actions (bot_id, type, config, order_num)
         VALUES (?, ?, ?, ?)`,
        [botId, actions[i].type, actions[i].config, i + 1]
      );
    }
    
    // تحديث وقت تعديل الروبوت
    await db.query(
      'UPDATE bots SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [botId]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating actions for bot ${botId}:`, error);
    throw error;
  }
}

export async function toggleBotStatus(id: number) {
  try {
    // التحقق من وجود الروبوت
    const existingBot = await db.query('SELECT id, is_active FROM bots WHERE id = ?', [id]);
    if (existingBot.length === 0) {
      throw new Error('الروبوت غير موجود');
    }
    
    // تبديل حالة الروبوت
    const newStatus = existingBot[0].is_active ? 0 : 1;
    
    await db.query(
      'UPDATE bots SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );
    
    return { success: true, is_active: Boolean(newStatus) };
  } catch (error) {
    console.error(`Error toggling status for bot ${id}:`, error);
    throw error;
  }
}

export async function deleteBot(id: number) {
  try {
    // التحقق من وجود الروبوت
    const existingBot = await db.query('SELECT id FROM bots WHERE id = ?', [id]);
    if (existingBot.length === 0) {
      throw new Error('الروبوت غير موجود');
    }
    
    // حذف إجراءات الروبوت
    await db.query('DELETE FROM bot_actions WHERE bot_id = ?', [id]);
    
    // حذف الروبوت
    await db.query('DELETE FROM bots WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting bot ${id}:`, error);
    throw error;
  }
}
