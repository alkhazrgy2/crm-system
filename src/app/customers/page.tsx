'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function CustomersPage() {
  // بيانات تجريبية للعملاء
  const customers = [
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+966 50 123 4567',
      company: 'شركة التقنية المتطورة',
      status: 'عميل',
      lastContact: 'منذ 2 يوم',
      deals: 3
    },
    {
      id: 2,
      name: 'سارة أحمد',
      email: 'sara@example.com',
      phone: '+966 55 987 6543',
      company: 'مؤسسة الإبداع',
      status: 'محتمل',
      lastContact: 'منذ 5 أيام',
      deals: 1
    },
    {
      id: 3,
      name: 'محمد علي',
      email: 'mohamed@example.com',
      phone: '+966 54 456 7890',
      company: 'شركة النور للتجارة',
      status: 'عميل',
      lastContact: 'منذ أسبوع',
      deals: 5
    },
    {
      id: 4,
      name: 'فاطمة حسن',
      email: 'fatima@example.com',
      phone: '+966 56 321 7654',
      company: 'مؤسسة الأمل',
      status: 'مهتم',
      lastContact: 'منذ 3 أيام',
      deals: 0
    },
    {
      id: 5,
      name: 'خالد عبدالله',
      email: 'khaled@example.com',
      phone: '+966 59 789 1234',
      company: 'شركة المستقبل',
      status: 'عميل',
      lastContact: 'اليوم',
      deals: 2
    }
  ]

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">إدارة العملاء</h1>
      </header>
      
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث عن عميل..." className="pr-10" />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة عميل
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-4">
          <TabsList>
            <TabsTrigger value="all">جميع العملاء</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="leads">المحتملين</TabsTrigger>
            <TabsTrigger value="interested">المهتمين</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right p-3 font-medium">الاسم</th>
                <th className="text-right p-3 font-medium">البريد الإلكتروني</th>
                <th className="text-right p-3 font-medium">الهاتف</th>
                <th className="text-right p-3 font-medium">الشركة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">آخر تواصل</th>
                <th className="text-right p-3 font-medium">الصفقات</th>
                <th className="text-right p-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="p-3">{customer.email}</td>
                  <td className="p-3">{customer.phone}</td>
                  <td className="p-3">{customer.company}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customer.status === 'عميل' ? 'bg-green-100 text-green-800' : 
                      customer.status === 'محتمل' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-3">{customer.lastContact}</td>
                  <td className="p-3">{customer.deals}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
