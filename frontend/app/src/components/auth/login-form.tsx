"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

const LoginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export function LoginForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>("")
  const { login } = useAuth()

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Helper function to format field errors
  const getFieldError = (fieldName: string) => {
    if (apiErrors[fieldName]) {
      return apiErrors[fieldName].join(", ")
    }
    return undefined
  }

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    setIsLoading(true)
    setApiErrors({})
    setGeneralError("")

    try {
      await login(data.email, data.password)
    } catch (error: any) {
      console.error("Login error:", error)

      if (error.response?.status === 400 || error.response?.status === 401) {
        const errorData = error.response.data
        // Check for email verification error messages
        if (
          errorData.non_field_errors?.some((msg: string) => msg.includes("verified"))) {
          // Redirect to email verification
          navigate("/verify-email", {
            state: {
              email: data.email,
              userData: {
                email: data.email,
              },
            },
          })

          toast.info("Email verification required", {
            description: "Please verify your email address to continue.",
          })
          return
        }
      }

      if (error.response?.data) {
        const errorData = error.response.data

        // Handle field-specific errors
        if (typeof errorData === "object" && !errorData.detail && !errorData.non_field_errors) {
          setApiErrors(errorData)

          // Set form errors for each field
          Object.keys(errorData).forEach((field) => {
            if (form.getValues(field as any) !== undefined) {
              form.setError(field as any, {
                type: "server",
                message: errorData[field].join(", "),
              })
            }
          })
        }
        // Handle non-field errors (common for login failures)
        else if (errorData.non_field_errors) {
          setGeneralError(errorData.non_field_errors.join(", "))
        }
        // Handle detail error (most common for dj-rest-auth login)
        else if (errorData.detail) {
          setGeneralError(errorData.detail)
        }
        // Handle other error formats
        else if (typeof errorData === "string") {
          setGeneralError(errorData)
        } else {
          setGeneralError("Login failed. Please check your credentials.")
        }
      } else {
        setGeneralError(error.message || "Login failed. Please try again.")
      }

      toast.error("Sign in failed", {
        description: "Please check your credentials and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-text-primary min-h-screen flex items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md bg-bg-secondary shadow-xl py-6">
        <CardHeader className="px-8">
          <CardTitle className="text-3xl font-bold !text-text-primary">
            Sign In
          </CardTitle>
          <CardDescription className="text-text-secondary font-semibold text-md">Connect agronomists and farmers for real-time agricultural insights</CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          {generalError && (
            <Alert variant="destructive" className="mb-4 !text-error bg-red-100 border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="!text-error">{getFieldError("email")}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-text-primary hover:!bg-transparent cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error">{getFieldError("password")}</FormMessage>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full text-text-primary hover:text-white font-semibold uppercase bg-accent hover:bg-primary-hover cursor-pointer rounded-sm dark:hover:text-black dark:bg-primary-hover dark:hover:bg-accent"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="text-text-secondary font-semibold mt-2 space-y-2 text-center text-md">
            Don't have an account?
            <Link to="/register">
              <Button variant="link" className="p-1 font-bold text-md cursor-pointer text-primary dark:text-accent ">
                Sign up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
