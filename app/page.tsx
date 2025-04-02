import Link from "next/link";
import { PieChart, BarChart3, ArrowRight, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-950 font-noto">
      {/* Navigation Bar */}
      <header className="w-full py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center bg-white dark:bg-gray-950 shadow-sm">
        <div>
          <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">Family<span className="text-blue-500 dark:text-blue-300">Budget</span></span>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
          <Link 
            href="/register"
            className="text-sm font-medium px-4 py-2 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            ลงทะเบียน
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 px-6 md:px-8 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                บริหารการเงินครอบครัว <span className="text-blue-600 dark:text-blue-400">อย่างชาญฉลาด</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                ติดตามรายรับรายจ่าย วางแผนการออม และดูรายงานแบบเรียลไทม์ในที่เดียว
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  เริ่มต้นใช้งานฟรี
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/budget"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  ทดลองใช้งาน
                </Link>
              </div>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-blue-200/50 dark:shadow-blue-900/20 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=772&q=80" 
                alt="Financial Planning" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full py-16 px-6 md:px-8 lg:px-12 bg-blue-50 dark:bg-blue-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">คุณสมบัติเด่น</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">ทุกสิ่งที่คุณต้องการเพื่อจัดการการเงินของครอบครัวอย่างมีประสิทธิภาพ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">บันทึกรายรับรายจ่าย</h3>
              <p className="text-gray-600 dark:text-gray-300">จัดการรายรับรายจ่ายได้ง่ายดาย แบ่งตามหมวดหมู่ที่คุณต้องการ</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">ปฏิทินการเงิน</h3>
              <p className="text-gray-600 dark:text-gray-300">ดูรายการรายรับรายจ่ายในรูปแบบปฏิทินที่เข้าใจง่าย</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">รายงานสรุป</h3>
              <p className="text-gray-600 dark:text-gray-300">ดูรายงานสรุปรายเดือน รายสัปดาห์ และสถิติการใช้จ่าย</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-16 px-6 md:px-8 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">พร้อมเริ่มต้นวางแผนการเงินครอบครัว?</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            ลงทะเบียนฟรีวันนี้และเริ่มต้นใช้งานได้ทันที ไม่มีค่าใช้จ่ายซ่อนเร้น
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              ลงทะเบียนฟรี
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-8 lg:px-12 bg-blue-600 dark:bg-blue-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-white text-2xl font-bold">Family<span className="text-blue-100">Budget</span></span>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-blue-100 hover:text-white">เกี่ยวกับเรา</Link>
              <Link href="/contact" className="text-blue-100 hover:text-white">ติดต่อเรา</Link>
              <Link href="/privacy" className="text-blue-100 hover:text-white">นโยบายความเป็นส่วนตัว</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-blue-200">
            <p>© 2025 FamilyBudget. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}