"use client"

import { SignInButton, SignOutButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[350px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </SignInButton>
          </Unauthenticated>
          <Authenticated>
            <h2 className="text-xl font-semibold mb-4">You&apos;re Authenticated!</h2>
            <SignOutButton>
              <Button variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </SignOutButton>
          </Authenticated>
        </CardContent>
      </Card>
    </div>
  )
}