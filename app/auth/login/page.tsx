import Link from 'next/link'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-950">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-md">
                    <LoginForm />
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-4 px-4 sm:px-6 border-t border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-950 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>© 2025 พิศลย์ อุตตาลกาญจนา. สงวนลิขสิทธิ์.</p>
            </footer>
        </div>
    )
}