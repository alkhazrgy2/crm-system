import { ReactNode } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  CheckSquare, 
  FileText, 
  PieChart,
  Settings,
  LogOut
} from 'lucide-react'

interface SidebarProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: SidebarProps) {
  const menuItems = [
    { icon: <MessageSquare className="h-5 w-5" />, label: 'صندوق الوارد', href: '/inbox' },
    { icon: <Users className="h-5 w-5" />, label: 'العملاء', href: '/customers' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'مسارات المبيعات', href: '/pipelines' },
    { icon: <CheckSquare className="h-5 w-5" />, label: 'المهام', href: '/tasks' },
    { icon: <FileText className="h-5 w-5" />, label: 'القوالب والأتمتة', href: '/templates' },
    { icon: <PieChart className="h-5 w-5" />, label: 'التقارير', href: '/reports' },
    { icon: <Settings className="h-5 w-5" />, label: 'الإعدادات', href: '/settings' },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* الشريط الجانبي */}
      <div className="hidden md:flex w-64 flex-col bg-card border-l">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">Kommo CRM</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-muted/50 transition-colors"
              >
                <span className="ml-3 text-muted-foreground">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              م
            </div>
            <div className="mr-3">
              <div className="text-sm font-medium">محمد أحمد</div>
              <div className="text-xs text-muted-foreground">مدير</div>
            </div>
          </div>
          
          <Link
            href="/auth"
            className="flex items-center px-4 py-3 mt-4 text-sm rounded-md hover:bg-muted/50 transition-colors text-red-500"
          >
            <LogOut className="h-5 w-5 ml-3" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
