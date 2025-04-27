import { db } from '@/lib/db';

export async function getAnalytics(filters?: {
  type?: string;
  period?: string;
  date?: string;
}) {
  try {
    let query = `
      SELECT 
        id, 
        type, 
        period, 
        date, 
        metrics, 
        created_at
      FROM analytics
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.type) {
        query += ' AND type = ?';
        queryParams.push(filters.type);
      }
      
      if (filters.period) {
        query += ' AND period = ?';
        queryParams.push(filters.period);
      }
      
      if (filters.date) {
        query += ' AND date = ?';
        queryParams.push(filters.date);
      }
    }
    
    query += ' ORDER BY date DESC';
    
    const analytics = await db.query(query, queryParams);
    
    // تحويل البيانات من JSON إلى كائن JavaScript
    for (const analytic of analytics) {
      if (analytic.metrics) {
        analytic.metrics = JSON.parse(analytic.metrics);
      }
    }
    
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('فشل في جلب بيانات الإحصائيات');
  }
}

export async function getSalesSummary(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    // الحصول على إجمالي المبيعات حسب الفترة
    let dateFormat, groupBy;
    
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupBy = 'date(actual_close_date)';
        break;
      case 'week':
        dateFormat = '%Y-%W';
        groupBy = "strftime('%Y-%W', actual_close_date)";
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupBy = "strftime('%Y-%m', actual_close_date)";
        break;
      case 'year':
        dateFormat = '%Y';
        groupBy = "strftime('%Y', actual_close_date)";
        break;
    }
    
    const salesByPeriod = await db.query(`
      SELECT 
        ${groupBy} as period,
        SUM(value) as total_value,
        COUNT(*) as deal_count
      FROM deals
      WHERE status = 'won' AND actual_close_date IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 12
    `);
    
    // الحصول على إجمالي المبيعات حسب المرحلة
    const salesByStage = await db.query(`
      SELECT 
        ps.name as stage_name,
        ps.color as stage_color,
        COUNT(*) as deal_count,
        SUM(d.value) as total_value
      FROM deals d
      JOIN pipeline_stages ps ON d.stage_id = ps.id
      WHERE d.status = 'open'
      GROUP BY d.stage_id
      ORDER BY ps.order_num ASC
    `);
    
    // الحصول على أداء فريق المبيعات
    const teamPerformance = await db.query(`
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        COUNT(CASE WHEN d.status = 'won' THEN 1 ELSE NULL END) as won_deals,
        COUNT(CASE WHEN d.status = 'lost' THEN 1 ELSE NULL END) as lost_deals,
        SUM(CASE WHEN d.status = 'won' THEN d.value ELSE 0 END) as total_value
      FROM deals d
      JOIN users u ON d.assigned_to = u.id
      WHERE d.assigned_to IS NOT NULL
      GROUP BY d.assigned_to
      ORDER BY total_value DESC
    `);
    
    return {
      salesByPeriod,
      salesByStage,
      teamPerformance
    };
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw new Error('فشل في جلب ملخص المبيعات');
  }
}

export async function getActivitySummary(period: 'day' | 'week' | 'month' = 'week') {
  try {
    // الحصول على نشاط الرسائل حسب الفترة
    let dateFormat, groupBy;
    
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupBy = 'date(created_at)';
        break;
      case 'week':
        dateFormat = '%Y-%W';
        groupBy = "strftime('%Y-%W', created_at)";
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupBy = "strftime('%Y-%m', created_at)";
        break;
    }
    
    const messageActivity = await db.query(`
      SELECT 
        ${groupBy} as period,
        COUNT(CASE WHEN sender_type = 'user' THEN 1 ELSE NULL END) as sent_count,
        COUNT(CASE WHEN sender_type = 'customer' THEN 1 ELSE NULL END) as received_count
      FROM messages
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 12
    `);
    
    // الحصول على نشاط المهام
    const taskActivity = await db.query(`
      SELECT 
        ${groupBy} as period,
        COUNT(CASE WHEN status = 'pending' THEN 1 ELSE NULL END) as pending_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END) as completed_count
      FROM tasks
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 12
    `);
    
    // الحصول على نشاط العملاء الجدد
    const newCustomers = await db.query(`
      SELECT 
        ${groupBy} as period,
        COUNT(*) as count
      FROM customers
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 12
    `);
    
    return {
      messageActivity,
      taskActivity,
      newCustomers
    };
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    throw new Error('فشل في جلب ملخص النشاط');
  }
}

export async function getDashboardSummary() {
  try {
    // إجمالي العملاء
    const customersCount = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'lead' THEN 1 ELSE NULL END) as leads,
        COUNT(CASE WHEN status = 'customer' THEN 1 ELSE NULL END) as customers
      FROM customers
    `);
    
    // إجمالي الصفقات
    const dealsCount = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 ELSE NULL END) as open,
        COUNT(CASE WHEN status = 'won' THEN 1 ELSE NULL END) as won,
        COUNT(CASE WHEN status = 'lost' THEN 1 ELSE NULL END) as lost,
        SUM(CASE WHEN status = 'won' THEN value ELSE 0 END) as won_value
      FROM deals
    `);
    
    // إجمالي المحادثات
    const conversationsCount = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 ELSE NULL END) as active,
        COUNT(CASE WHEN status = 'closed' THEN 1 ELSE NULL END) as closed
      FROM conversations
    `);
    
    // إجمالي المهام
    const tasksCount = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 ELSE NULL END) as pending,
        COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END) as completed,
        COUNT(CASE WHEN due_date < date('now') AND status = 'pending' THEN 1 ELSE NULL END) as overdue
      FROM tasks
    `);
    
    // الصفقات الأخيرة
    const recentDeals = await db.query(`
      SELECT 
        d.id, 
        d.title, 
        d.value, 
        d.currency, 
        d.status,
        d.created_at,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name
      FROM deals d
      JOIN customers c ON d.customer_id = c.id
      ORDER BY d.created_at DESC
      LIMIT 5
    `);
    
    // المهام القادمة
    const upcomingTasks = await db.query(`
      SELECT 
        t.id, 
        t.title, 
        t.type, 
        t.priority, 
        t.due_date,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status = 'pending' AND t.due_date >= date('now')
      ORDER BY t.due_date ASC
      LIMIT 5
    `);
    
    return {
      customersCount: customersCount[0],
      dealsCount: dealsCount[0],
      conversationsCount: conversationsCount[0],
      tasksCount: tasksCount[0],
      recentDeals,
      upcomingTasks
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw new Error('فشل في جلب ملخص لوحة التحكم');
  }
}

export async function saveAnalytics(analyticsData: {
  type: string;
  period: string;
  date: string;
  metrics: any;
}) {
  try {
    const { type, period, date, metrics } = analyticsData;
    
    // تحويل البيانات إلى JSON
    const metricsJson = JSON.stringify(metrics);
    
    // حفظ البيانات
    const result = await db.query(
      `INSERT INTO analytics (type, period, date, metrics)
       VALUES (?, ?, ?, ?)`,
      [type, period, date, metricsJson]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error('Error saving analytics:', error);
    throw error;
  }
}
