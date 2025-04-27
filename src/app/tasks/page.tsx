'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Plus, Calendar, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function TasksPage() {
  // بيانات تجريبية للمهام
  const tasks = [
    {
      id: 1,
      title: 'متابعة عرض السعر',
      description: 'متابعة العميل بخصوص عرض السعر المقدم للمشروع',
      type: 'call',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-04-30',
      assignedTo: 'محمد أحمد',
      relatedTo: {
        type: 'customer',
        name: 'شركة التقنية المتطورة'
      }
    },
    {
      id: 2,
      title: 'إرسال معلومات إضافية',
      description: 'إرسال معلومات تفصيلية عن خدمات الاستضافة السحابية',
      type: 'email',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-04-28',
      assignedTo: 'سارة خالد',
      relatedTo: {
        type: 'deal',
        name: 'خدمات استضافة سحابية'
      }
    },
    {
      id: 3,
      title: 'اجتماع تقديم العرض',
      description: 'اجتماع مع العميل لتقديم عرض تطبيق الجوال',
      type: 'meeting',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-05-02',
      assignedTo: 'أحمد علي',
      relatedTo: {
        type: 'deal',
        name: 'تطبيق جوال للمبيعات'
      }
    },
    {
      id: 4,
      title: 'تحديث بيانات العميل',
      description: 'تحديث معلومات الاتصال وبيانات الشركة',
      type: 'task',
      status: 'completed',
      priority: 'low',
      dueDate: '2025-04-25',
      assignedTo: 'محمد أحمد',
      relatedTo: {
        type: 'customer',
        name: 'مؤسسة الإبداع'
      }
    },
    {
      id: 5,
      title: 'متابعة الدفعة الأولى',
      description: 'التأكد من استلام الدفعة الأولى للمشروع',
      type: 'task',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-04-29',
      assignedTo: 'سارة خالد',
      relatedTo: {
        type: 'deal',
        name: 'نظام إدارة المخزون'
      }
    }
  ]

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">إدارة المهام</h1>
      </header>
      
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث عن مهمة..." className="pr-10" />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 ml-2" />
              عرض التقويم
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مهمة
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-4">
          <TabsList>
            <TabsTrigger value="all">جميع المهام</TabsTrigger>
            <TabsTrigger value="pending">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
            <TabsTrigger value="my">مهامي</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right p-3 font-medium">المهمة</th>
                <th className="text-right p-3 font-medium">النوع</th>
                <th className="text-right p-3 font-medium">الأولوية</th>
                <th className="text-right p-3 font-medium">تاريخ الاستحقاق</th>
                <th className="text-right p-3 font-medium">المسؤول</th>
                <th className="text-right p-3 font-medium">متعلق بـ</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                      {task.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">{task.description}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.type === 'call' ? 'bg-blue-100 text-blue-800' : 
                      task.type === 'email' ? 'bg-indigo-100 text-indigo-800' : 
                      task.type === 'meeting' ? 'bg-purple-100 text-purple-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.type === 'call' ? 'اتصال' : 
                       task.type === 'email' ? 'بريد' : 
                       task.type === 'meeting' ? 'اجتماع' : 'مهمة'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority === 'high' ? 'عالية' : 
                       task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 ml-1 text-muted-foreground" />
                      {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="p-3">{task.assignedTo}</td>
                  <td className="p-3">
                    <span className="text-sm">
                      {task.relatedTo.type === 'customer' ? 'عميل: ' : 'صفقة: '}
                      <span className="text-muted-foreground">{task.relatedTo.name}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    {task.status === 'completed' ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        <span>مكتملة</span>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">إكمال</Button>
                    )}
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm">تعديل</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
