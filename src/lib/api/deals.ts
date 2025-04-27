import { db } from '@/lib/db';

export async function getPipelines() {
  try {
    const pipelines = await db.query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.created_by,
        p.created_at,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM pipelines p
      JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    
    // جلب مراحل كل مسار
    for (const pipeline of pipelines) {
      const stages = await db.query(`
        SELECT id, name, order_num, color
        FROM pipeline_stages
        WHERE pipeline_id = ?
        ORDER BY order_num ASC
      `, [pipeline.id]);
      
      pipeline.stages = stages;
    }
    
    return pipelines;
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    throw new Error('فشل في جلب بيانات مسارات المبيعات');
  }
}

export async function getPipelineById(id: number) {
  try {
    const pipeline = await db.query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.created_by,
        p.created_at,
        p.updated_at,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM pipelines p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [id]);
    
    if (pipeline.length === 0) {
      return null;
    }
    
    // جلب مراحل المسار
    const stages = await db.query(`
      SELECT id, name, order_num, color
      FROM pipeline_stages
      WHERE pipeline_id = ?
      ORDER BY order_num ASC
    `, [id]);
    
    return {
      ...pipeline[0],
      stages
    };
  } catch (error) {
    console.error(`Error fetching pipeline ${id}:`, error);
    throw new Error('فشل في جلب بيانات مسار المبيعات');
  }
}

export async function createPipeline(pipelineData: {
  name: string;
  description?: string;
  created_by: number;
  stages: Array<{
    name: string;
    color?: string;
  }>;
}) {
  try {
    const { name, description, created_by, stages } = pipelineData;
    
    // إنشاء مسار المبيعات الجديد
    const result = await db.query(
      `INSERT INTO pipelines (name, description, created_by)
       VALUES (?, ?, ?)`,
      [name, description || null, created_by]
    );
    
    const pipelineId = result.lastID;
    
    // إضافة مراحل المسار
    for (let i = 0; i < stages.length; i++) {
      await db.query(
        `INSERT INTO pipeline_stages (pipeline_id, name, order_num, color)
         VALUES (?, ?, ?, ?)`,
        [pipelineId, stages[i].name, i + 1, stages[i].color || null]
      );
    }
    
    return { id: pipelineId };
  } catch (error) {
    console.error('Error creating pipeline:', error);
    throw error;
  }
}

export async function updatePipeline(id: number, pipelineData: {
  name?: string;
  description?: string;
}) {
  try {
    // التحقق من وجود المسار
    const existingPipeline = await db.query('SELECT id FROM pipelines WHERE id = ?', [id]);
    if (existingPipeline.length === 0) {
      throw new Error('مسار المبيعات غير موجود');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(pipelineData)) {
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
      `UPDATE pipelines SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating pipeline ${id}:`, error);
    throw error;
  }
}

export async function deletePipeline(id: number) {
  try {
    // التحقق من وجود المسار
    const existingPipeline = await db.query('SELECT id FROM pipelines WHERE id = ?', [id]);
    if (existingPipeline.length === 0) {
      throw new Error('مسار المبيعات غير موجود');
    }
    
    // التحقق من عدم وجود صفقات مرتبطة بالمسار
    const dealsCount = await db.query('SELECT COUNT(*) as count FROM deals WHERE pipeline_id = ?', [id]);
    if (dealsCount[0].count > 0) {
      throw new Error('لا يمكن حذف المسار لأنه يحتوي على صفقات');
    }
    
    // حذف مراحل المسار
    await db.query('DELETE FROM pipeline_stages WHERE pipeline_id = ?', [id]);
    
    // حذف المسار
    await db.query('DELETE FROM pipelines WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting pipeline ${id}:`, error);
    throw error;
  }
}

export async function updatePipelineStages(pipelineId: number, stages: Array<{
  id?: number;
  name: string;
  color?: string;
}>) {
  try {
    // التحقق من وجود المسار
    const existingPipeline = await db.query('SELECT id FROM pipelines WHERE id = ?', [pipelineId]);
    if (existingPipeline.length === 0) {
      throw new Error('مسار المبيعات غير موجود');
    }
    
    // حذف جميع المراحل الحالية
    await db.query('DELETE FROM pipeline_stages WHERE pipeline_id = ?', [pipelineId]);
    
    // إضافة المراحل الجديدة
    for (let i = 0; i < stages.length; i++) {
      await db.query(
        `INSERT INTO pipeline_stages (pipeline_id, name, order_num, color)
         VALUES (?, ?, ?, ?)`,
        [pipelineId, stages[i].name, i + 1, stages[i].color || null]
      );
    }
    
    // تحديث وقت تعديل المسار
    await db.query(
      'UPDATE pipelines SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [pipelineId]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating stages for pipeline ${pipelineId}:`, error);
    throw error;
  }
}

export async function getDeals(filters?: {
  pipelineId?: number;
  stageId?: number;
  customerId?: number;
  assignedTo?: number;
  status?: string;
}) {
  try {
    let query = `
      SELECT 
        d.id, 
        d.title, 
        d.customer_id, 
        d.pipeline_id, 
        d.stage_id, 
        d.value, 
        d.currency, 
        d.assigned_to,
        d.probability,
        d.expected_close_date,
        d.actual_close_date,
        d.status,
        d.created_at,
        d.updated_at,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        p.name as pipeline_name,
        ps.name as stage_name,
        ps.color as stage_color,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM deals d
      JOIN customers c ON d.customer_id = c.id
      JOIN pipelines p ON d.pipeline_id = p.id
      JOIN pipeline_stages ps ON d.stage_id = ps.id
      LEFT JOIN users u ON d.assigned_to = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.pipelineId) {
        query += ' AND d.pipeline_id = ?';
        queryParams.push(filters.pipelineId);
      }
      
      if (filters.stageId) {
        query += ' AND d.stage_id = ?';
        queryParams.push(filters.stageId);
      }
      
      if (filters.customerId) {
        query += ' AND d.customer_id = ?';
        queryParams.push(filters.customerId);
      }
      
      if (filters.assignedTo) {
        query += ' AND d.assigned_to = ?';
        queryParams.push(filters.assignedTo);
      }
      
      if (filters.status) {
        query += ' AND d.status = ?';
        queryParams.push(filters.status);
      }
    }
    
    query += ' ORDER BY d.updated_at DESC';
    
    const deals = await db.query(query, queryParams);
    return deals;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw new Error('فشل في جلب بيانات الصفقات');
  }
}

export async function getDealById(id: number) {
  try {
    const deal = await db.query(`
      SELECT 
        d.id, 
        d.title, 
        d.customer_id, 
        d.pipeline_id, 
        d.stage_id, 
        d.value, 
        d.currency, 
        d.assigned_to,
        d.probability,
        d.expected_close_date,
        d.actual_close_date,
        d.status,
        d.notes,
        d.created_at,
        d.updated_at,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.company as customer_company,
        p.name as pipeline_name,
        ps.name as stage_name,
        ps.color as stage_color,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM deals d
      JOIN customers c ON d.customer_id = c.id
      JOIN pipelines p ON d.pipeline_id = p.id
      JOIN pipeline_stages ps ON d.stage_id = ps.id
      LEFT JOIN users u ON d.assigned_to = u.id
      WHERE d.id = ?
    `, [id]);
    
    if (deal.length === 0) {
      return null;
    }
    
    // جلب المنتجات المرتبطة بالصفقة
    const products = await db.query(`
      SELECT id, name, quantity, price
      FROM deal_products
      WHERE deal_id = ?
    `, [id]);
    
    // جلب المهام المرتبطة بالصفقة
    const tasks = await db.query(`
      SELECT 
        t.id, 
        t.title, 
        t.type, 
        t.status, 
        t.priority,
        t.due_date,
        t.assigned_to,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.related_type = 'deal' AND t.related_id = ?
      ORDER BY t.due_date ASC
    `, [id]);
    
    return {
      ...deal[0],
      products,
      tasks
    };
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw new Error('فشل في جلب بيانات الصفقة');
  }
}

export async function createDeal(dealData: {
  title: string;
  customer_id: number;
  pipeline_id: number;
  stage_id: number;
  value?: number;
  currency?: string;
  assigned_to?: number;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  products?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}) {
  try {
    const {
      title,
      customer_id,
      pipeline_id,
      stage_id,
      value,
      currency,
      assigned_to,
      probability,
      expected_close_date,
      notes,
      products
    } = dealData;
    
    // التحقق من وجود العميل
    const existingCustomer = await db.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (existingCustomer.length === 0) {
      throw new Error('العميل غير موجود');
    }
    
    // التحقق من وجود المسار والمرحلة
    const existingStage = await db.query(
      'SELECT id FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
      [stage_id, pipeline_id]
    );
    if (existingStage.length === 0) {
      throw new Error('مسار المبيعات أو المرحلة غير موجودة');
    }
    
    // إنشاء الصفقة الجديدة
    const result = await db.query(
      `INSERT INTO deals (
        title, customer_id, pipeline_id, stage_id, value, currency,
        assigned_to, probability, expected_close_date, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        title,
        customer_id,
        pipeline_id,
        stage_id,
        value || null,
        currency || 'SAR',
        assigned_to || null,
        probability || null,
        expected_close_date || null,
        notes || null
      ]
    );
    
    const dealId = result.lastID;
    
    // إضافة المنتجات إذا وجدت
    if (products && products.length > 0) {
      for (const product of products) {
        await db.query(
          `INSERT INTO deal_products (deal_id, name, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [dealId, product.name, product.quantity, product.price]
        );
      }
    }
    
    return { id: dealId };
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
}

export async function updateDeal(id: number, dealData: {
  title?: string;
  value?: number;
  currency?: string;
  assigned_to?: number;
  probability?: number;
  expected_close_date?: string;
  actual_close_date?: string;
  status?: string;
  notes?: string;
}) {
  try {
    // التحقق من وجود الصفقة
    const existingDeal = await db.query('SELECT id FROM deals WHERE id = ?', [id]);
    if (existingDeal.length === 0) {
      throw new Error('الصفقة غير موجودة');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(dealData)) {
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
      `UPDATE deals SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating deal ${id}:`, error);
    throw error;
  }
}

export async function updateDealStage(id: number, stageId: number) {
  try {
    // التحقق من وجود الصفقة
    const existingDeal = await db.query('SELECT pipeline_id FROM deals WHERE id = ?', [id]);
    if (existingDeal.length === 0) {
      throw new Error('الصفقة غير موجودة');
    }
    
    // التحقق من وجود المرحلة وتوافقها مع مسار الصفقة
    const existingStage = await db.query(
      'SELECT id FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
      [stageId, existingDeal[0].pipeline_id]
    );
    if (existingStage.length === 0) {
      throw new Error('المرحلة غير موجودة أو لا تنتمي لنفس مسار المبيعات');
    }
    
    // تحديث مرحلة الصفقة
    await db.query(
      'UPDATE deals SET stage_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [stageId, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating stage for deal ${id}:`, error);
    throw error;
  }
}

export async function closeDeal(id: number, status: 'won' | 'lost', actualCloseDate?: string) {
  try {
    // التحقق من وجود الصفقة
    const existingDeal = await db.query('SELECT id FROM deals WHERE id = ?', [id]);
    if (existingDeal.length === 0) {
      throw new Error('الصفقة غير موجودة');
    }
    
    // تحديث حالة الصفقة
    await db.query(
      'UPDATE deals SET status = ?, actual_close_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, actualCloseDate || new Date().toISOString().split('T')[0], id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error closing deal ${id}:`, error);
    throw error;
  }
}

export async function reopenDeal(id: number) {
  try {
    // التحقق من وجود الصفقة
    const existingDeal = await db.query('SELECT id FROM deals WHERE id = ?', [id]);
    if (existingDeal.length === 0) {
      throw new Error('الصفقة غير موجودة');
    }
    
    // إعادة فتح الصفقة
    await db.query(
      'UPDATE deals SET status = "open", actual_close_date = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error reopening deal ${id}:`, error);
    throw error;
  }
}

export async function deleteDeal(id: number) {
  try {
    // التحقق من وجود الصفقة
    const existingDeal = await db.query('SELECT id FROM deals WHERE id = ?', [id]);
    if (existingDeal.length === 0) {
      throw new Error('الصفقة غير موجودة');
    }
    
    // حذف المنتجات المرتبطة بالصفقة
    await db.query('DELETE FROM deal_products WHERE deal_id = ?', [id]);
    
    // حذف المهام المرتبطة بالصفقة
    await db.query('DELETE FROM tasks WHERE related_type = "deal" AND related_id = ?', [id]);
    
    // حذف الصفقة
    await db.query('DELETE FROM deals WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting deal ${id}:`, error);
    throw error;
  }
}
