import { db } from '@/lib/db';

export async function getTasks(filters?: {
  status?: string;
  priority?: string;
  assignedTo?: number;
  relatedType?: string;
  relatedId?: number;
  dueDate?: string;
}) {
  try {
    let query = `
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.type, 
        t.status, 
        t.priority, 
        t.due_date, 
        t.assigned_to,
        t.related_type,
        t.related_id,
        t.completed_at,
        t.created_by,
        t.created_at,
        u1.first_name as assigned_first_name,
        u1.last_name as assigned_last_name,
        u2.first_name as created_by_first_name,
        u2.last_name as created_by_last_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.status) {
        query += ' AND t.status = ?';
        queryParams.push(filters.status);
      }
      
      if (filters.priority) {
        query += ' AND t.priority = ?';
        queryParams.push(filters.priority);
      }
      
      if (filters.assignedTo) {
        query += ' AND t.assigned_to = ?';
        queryParams.push(filters.assignedTo);
      }
      
      if (filters.relatedType) {
        query += ' AND t.related_type = ?';
        queryParams.push(filters.relatedType);
        
        if (filters.relatedId) {
          query += ' AND t.related_id = ?';
          queryParams.push(filters.relatedId);
        }
      }
      
      if (filters.dueDate) {
        query += ' AND t.due_date = ?';
        queryParams.push(filters.dueDate);
      }
    }
    
    query += ' ORDER BY t.due_date ASC, t.priority DESC';
    
    const tasks = await db.query(query, queryParams);
    
    // إضافة معلومات عن الكيان المرتبط بالمهمة
    for (const task of tasks) {
      if (task.related_type && task.related_id) {
        if (task.related_type === 'customer') {
          const customer = await db.query(
            'SELECT first_name, last_name, company FROM customers WHERE id = ?',
            [task.related_id]
          );
          if (customer.length > 0) {
            task.related_name = customer[0].company 
              ? `${customer[0].first_name} ${customer[0].last_name} (${customer[0].company})`
              : `${customer[0].first_name} ${customer[0].last_name}`;
          }
        } else if (task.related_type === 'deal') {
          const deal = await db.query(
            'SELECT title FROM deals WHERE id = ?',
            [task.related_id]
          );
          if (deal.length > 0) {
            task.related_name = deal[0].title;
          }
        }
      }
    }
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('فشل في جلب بيانات المهام');
  }
}

export async function getTaskById(id: number) {
  try {
    const task = await db.query(`
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.type, 
        t.status, 
        t.priority, 
        t.due_date, 
        t.assigned_to,
        t.related_type,
        t.related_id,
        t.completed_at,
        t.created_by,
        t.created_at,
        t.updated_at,
        u1.first_name as assigned_first_name,
        u1.last_name as assigned_last_name,
        u2.first_name as created_by_first_name,
        u2.last_name as created_by_last_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [id]);
    
    if (task.length === 0) {
      return null;
    }
    
    // إضافة معلومات عن الكيان المرتبط بالمهمة
    if (task[0].related_type && task[0].related_id) {
      if (task[0].related_type === 'customer') {
        const customer = await db.query(
          'SELECT id, first_name, last_name, company, email, phone FROM customers WHERE id = ?',
          [task[0].related_id]
        );
        if (customer.length > 0) {
          task[0].related_entity = {
            ...customer[0],
            name: customer[0].company 
              ? `${customer[0].first_name} ${customer[0].last_name} (${customer[0].company})`
              : `${customer[0].first_name} ${customer[0].last_name}`
          };
        }
      } else if (task[0].related_type === 'deal') {
        const deal = await db.query(
          'SELECT id, title, value, currency, status FROM deals WHERE id = ?',
          [task[0].related_id]
        );
        if (deal.length > 0) {
          task[0].related_entity = {
            ...deal[0],
            name: deal[0].title
          };
        }
      }
    }
    
    return task[0];
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    throw new Error('فشل في جلب بيانات المهمة');
  }
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  type: string;
  priority?: string;
  due_date?: string;
  assigned_to?: number;
  related_type?: string;
  related_id?: number;
  created_by: number;
}) {
  try {
    const {
      title,
      description,
      type,
      priority,
      due_date,
      assigned_to,
      related_type,
      related_id,
      created_by
    } = taskData;
    
    // التحقق من وجود الكيان المرتبط إذا تم تحديده
    if (related_type && related_id) {
      if (related_type === 'customer') {
        const customer = await db.query('SELECT id FROM customers WHERE id = ?', [related_id]);
        if (customer.length === 0) {
          throw new Error('العميل غير موجود');
        }
      } else if (related_type === 'deal') {
        const deal = await db.query('SELECT id FROM deals WHERE id = ?', [related_id]);
        if (deal.length === 0) {
          throw new Error('الصفقة غير موجودة');
        }
      } else {
        throw new Error('نوع الكيان المرتبط غير صالح');
      }
    }
    
    // إنشاء المهمة الجديدة
    const result = await db.query(
      `INSERT INTO tasks (
        title, description, type, status, priority, due_date,
        assigned_to, related_type, related_id, created_by
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        type,
        priority || 'medium',
        due_date || null,
        assigned_to || null,
        related_type || null,
        related_id || null,
        created_by
      ]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTask(id: number, taskData: {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: number;
}) {
  try {
    // التحقق من وجود المهمة
    const existingTask = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      throw new Error('المهمة غير موجودة');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(taskData)) {
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
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
}

export async function completeTask(id: number) {
  try {
    // التحقق من وجود المهمة
    const existingTask = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      throw new Error('المهمة غير موجودة');
    }
    
    // تحديث حالة المهمة إلى مكتملة
    await db.query(
      'UPDATE tasks SET status = "completed", completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error completing task ${id}:`, error);
    throw error;
  }
}

export async function reopenTask(id: number) {
  try {
    // التحقق من وجود المهمة
    const existingTask = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      throw new Error('المهمة غير موجودة');
    }
    
    // إعادة فتح المهمة
    await db.query(
      'UPDATE tasks SET status = "pending", completed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error reopening task ${id}:`, error);
    throw error;
  }
}

export async function deleteTask(id: number) {
  try {
    // التحقق من وجود المهمة
    const existingTask = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      throw new Error('المهمة غير موجودة');
    }
    
    // حذف المهمة
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
}
