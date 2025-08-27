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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sprout, Users, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { ThemeToggle } from "../theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

const RegisterFormSchema = z
  .object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }).max(150, {
      message: "Username must be less than 150 characters.",
    }).regex(/^[\w.@+-]+$/, {
      message: "Username can only contain letters, numbers, and @/./+/-/_ characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password1: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    password2: z.string(),
    role: z.enum(["Farmer", "Agronomist"], {
      required_error: "Please select your role.",
    }),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "Passwords don't match",
    path: ["password2"],
  })

export function RegisterForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>("")
  const { register } = useAuth()

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password1: "",
      password2: "",
      role: "Farmer",
    },
  })

  // Helper function to format field errors
  const getFieldError = (fieldName: string) => {
    if (apiErrors[fieldName]) {
      return apiErrors[fieldName].join(", ")
    }
    return undefined
  }

  async function onSubmit(data: z.infer<typeof RegisterFormSchema>) {
    setIsLoading(true)
    setApiErrors({})
    setGeneralError("")

    try {
      const result = await register({
        username: data.username,
        email: data.email,
        password1: data.password1,
        password2: data.password2,
        role: data.role,
      })

      // Navigate to email verification
      navigate("/verify-email", {
        state: {
          email: data.email,
          userData: {
            username: data.username,
            email: data.email,
            role: data.role,
          },
        },
      })

      toast.success("Account created!", {
        description: result.detail || "Please check your email to verify your account.",
      })
    } catch (error: any) {
      console.error("Registration error:", error)

      if (error.response?.data) {
        const errorData = error.response.data

        // Handle field-specific errors
        if (typeof errorData === 'object' && !errorData.detail && !errorData.non_field_errors) {
          setApiErrors(errorData)

          // Set form errors for each field
          Object.keys(errorData).forEach((field) => {
            if (form.getValues(field as any) !== undefined) {
              form.setError(field as any, {
                type: "server",
                message: errorData[field].join(", ")
              })
            }
          })
        }
        // Handle non-field errors
        else if (errorData.non_field_errors) {
          setGeneralError(errorData.non_field_errors.join(", "))
        }
        // Handle detail error
        else if (errorData.detail) {
          setGeneralError(errorData.detail)
        }
        // Handle other error formats
        else if (typeof errorData === 'string') {
          setGeneralError(errorData)
        } else {
          setGeneralError("Registration failed. Please try again.")
        }
      } else {
        setGeneralError(error.message || "Registration failed. Please try again.")
      }

      toast.error("Registration failed", {
        description: "Please check the form for errors and try again.",
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
            Sign Up
          </CardTitle>
          <CardDescription className="text-text-secondary font-semibold text-md">Create your account to start sending or receiving agricultural alerts</CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          {generalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error">{getFieldError("username")}</FormMessage>
                  </FormItem>
                )}
              />

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
                    <FormMessage className="text-error">{getFieldError("email")}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        {/* Farmer */}
                        <div className="relative flex-1">
                          <RadioGroupItem value="Farmer" id="farmer" className="sr-only peer" />
                          <Label
                            htmlFor="farmer"
                            className="cursor-pointer uppercase px-6 py-[10px] text-primary dark:text-accent border-2 border-primary dark:border-accent rounded flex justify-center items-center gap-2 font-semibold transition-colors
                                peer-data-[state=checked]:bg-primary
                                peer-data-[state=checked]:!text-bg-primary
                                peer-data-[state=checked]:ring-1 text-muted-foreground
                                dark:peer-data-[state=checked]:bg-accent
                                dark:peer-data-[state=checked]:border-accent"
                          >
                            <Sprout className="w-5 h-5" />
                            Farmer
                          </Label>
                        </div>

                        {/* Agronomist */}
                        <div className="relative flex-1">
                          <RadioGroupItem value="Agronomist" id="agronomist" className="sr-only peer" />
                          <Label
                            htmlFor="agronomist"
                            className="cursor-pointer uppercase px-6 py-[10px] text-primary dark:text-accent border-2 border-primary dark:border-accent rounded flex justify-center items-center gap-2 font-semibold transition-colors
                                peer-data-[state=checked]:bg-primary
                                peer-data-[state=checked]:!text-bg-primary
                                peer-data-[state=checked]:ring-1 text-muted-foreground
                                dark:peer-data-[state=checked]:bg-accent
                                dark:peer-data-[state=checked]:border-accent"
                          >
                            <Users className="w-5 h-5" />
                            Agronomist
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-error">{getFieldError("role")}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                    <FormMessage className="text-error">{getFieldError("password1")}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error">{getFieldError("password2")}</FormMessage>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full text-text-primary hover:text-white font-semibold uppercase bg-accent hover:bg-primary-hover cursor-pointer rounded-sm dark:hover:text-black dark:bg-primary-hover dark:hover:bg-accent"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="text-text-secondary font-semibold mt-2 space-y-2 text-center text-md">
            <Link to="/login">
              Already have an account?
              <Button variant="link" className="p-1 font-bold text-md cursor-pointer text-primary dark:text-accent ">
                Sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
