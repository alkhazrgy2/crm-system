'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function PipelinesPage() {
  // بيانات تجريبية لمراحل مسار المبيعات
  const stages = [
    { id: 1, name: 'جهات اتصال جديدة', color: 'bg-blue-500' },
    { id: 2, name: 'اجتماع أولي', color: 'bg-indigo-500' },
    { id: 3, name: 'تقديم عرض', color: 'bg-purple-500' },
    { id: 4, name: 'مفاوضات', color: 'bg-pink-500' },
    { id: 5, name: 'صفقة مغلقة', color: 'bg-green-500' }
  ]

  // بيانات تجريبية للصفقات
  const deals = [
    {
      id: 1,
      title: 'مشروع تطوير موقع إلكتروني',
      customer: 'شركة التقنية المتطورة',
      value: 15000,
      stage: 1,
      assignedTo: 'محمد أحمد',
      dueDate: '15/05/2025'
    },
    {
      id: 2,
      title: 'خدمات استضافة سحابية',
      customer: 'مؤسسة الإبداع',
      value: 8000,
      stage: 2,
      assignedTo: 'سارة خالد',
      dueDate: '20/05/2025'
    },
    {
      id: 3,
      title: 'تطبيق جوال للمبيعات',
      customer: 'شركة النور للتجارة',
      value: 25000,
      stage: 2,
      assignedTo: 'أحمد علي',
      dueDate: '01/06/2025'
    },
    {
      id: 4,
      title: 'نظام إدارة المخزون',
      customer: 'شركة المستقبل',
      value: 20000,
      stage: 3,
      assignedTo: 'محمد أحمد',
      dueDate: '10/05/2025'
    },
    {
      id: 5,
      title: 'خدمات تسويق رقمي',
      customer: 'مؤسسة الأمل',
      value: 12000,
      stage: 4,
      assignedTo: 'سارة خالد',
      dueDate: '05/05/2025'
    },
    {
      id: 6,
      title: 'تطوير تطبيق ويب',
      customer: 'شركة الإنماء',
      value: 30000,
      stage: 5,
      assignedTo: 'أحمد علي',
      dueDate: '30/04/2025'
    }
  ]

  // تجميع الصفقات حسب المرحلة
  const dealsByStage = stages.map(stage => {
    return {
      ...stage,
      deals: deals.filter(deal => deal.stage === stage.id)
    }
  })

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">مسارات المبيعات</h1>
      </header>
      
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث عن صفقة..." className="pr-10" />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة صفقة
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-h-[500px] pb-4">
            {dealsByStage.map(stage => (
              <div key={stage.id} className="flex-shrink-0 w-72">
                <div className={`h-2 ${stage.color} rounded-t-md`}></div>
                <div className="bg-card border rounded-b-md shadow-sm">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-medium">{stage.name}</h3>
                    <span className="text-sm text-muted-foreground">{stage.deals.length}</span>
                  </div>
                  
                  <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {stage.deals.map(deal => (
                      <Card key={deal.id} className="mb-2 p-3 hover:bg-muted/30 cursor-pointer">
                        <Link href={`/pipelines/deals/${deal.id}`}>
                          <h4 className="font-medium mb-1">{deal.title}</h4>
                          <div className="text-sm text-muted-foreground mb-2">{deal.customer}</div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{deal.value.toLocaleString()} ريال</span>
                            <span className="text-xs text-muted-foreground">{deal.dueDate}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            المسؤول: {deal.assignedTo}
                          </div>
                        </Link>
                      </Card>
                    ))}
                    
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة صفقة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
