import Link from 'next/link'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-4xl tracking-wider text-foreground">Mulla</h1>
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          <h2 className="text-2xl font-serif text-foreground mb-3">
            Authentication Error
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {params?.error 
              ? `Error: ${params.error}` 
              : 'Sorry, something went wrong during authentication. Please try again.'
            }
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full h-12 rounded-xl">
              <Link href="/auth/login">
                Try Again
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-12 rounded-xl">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Need help?{' '}
          <Link href="mailto:support@mulla.co.ke" className="text-foreground hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
