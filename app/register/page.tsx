import { ItemRegistration } from '@/components/ItemRegistration'
import { Navigation } from '@/components/Navigation'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-stone-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <ItemRegistration />
      </main>
    </div>
  )
}