import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-12 text-center">
        <div className="flex flex-col items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Website%20logo-2Ku3rMkYclPbOLLIgjyx15gQQ5PGrx.png"
            alt="Eng Hub Logo"
            width={250}
            height={100}
            className="mb-8"
          />

          <span className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Welcome to Eng Hub</span>

          <p className="mt-6 text-lg text-gray-600 max-w-prose">
            Your engineering learning platform. Connect with fellow students, access resources, and enhance your
            engineering education.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link href="/login">Sign In</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-primary hover:bg-primary/10"
          >
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-gray-100 to-transparent h-32 pointer-events-none" />
    </div>
  )
}
