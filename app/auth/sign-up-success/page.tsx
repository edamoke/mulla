import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-4xl tracking-wider text-foreground">Mulla</h1>
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-serif text-foreground mb-3">
            Check your email
          </h2>
          
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account and start shopping.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full h-12 rounded-xl">
              <Link href="/auth/login">
                Continue to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-12 rounded-xl">
              <Link href="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <Link href="/auth/sign-up" className="text-foreground hover:underline">
            try again
          </Link>
        </p>
      </div>
    </div>
  )
}
