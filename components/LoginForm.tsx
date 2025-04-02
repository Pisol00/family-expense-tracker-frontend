'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, User, ArrowRight } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    // Validate form
    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      setIsLoading(false)
      return
    }

    // Mock login process
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, we'll allow login with any credentials
      // In a real app, this would be an API call to your backend
      
      console.log('Logged in with:', { username, password })
      
      // Redirect to budget page
      router.push('/budget')
    } catch (err) {
      setError('มีข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border border-blue-100 dark:border-blue-900 overflow-hidden">
      <CardHeader className="space-y-1 bg-white dark:bg-gray-950 border-b border-blue-50 dark:border-blue-950 pb-6">
        <div className="space-y-0.5 text-center">
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="mt-2">
            เข้าสู่ระบบเพื่อจัดการบัญชีรายรับรายจ่ายของคุณ
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 bg-white dark:bg-gray-950">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อผู้ใช้</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-400/70">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="username" 
                type="text"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 border-blue-100 dark:border-blue-900 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">รหัสผ่าน</Label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-400/70">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder='รหัสผ่าน'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-blue-100 dark:border-blue-900 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเข้าสู่ระบบ...
              </div>
            ) : (
              <div className="flex items-center">
                เข้าสู่ระบบ
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}