"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { CheckCircle, RefreshCw, AlertCircle } from "lucide-react"
import emailIcon from '../../assets/emailVerification.png'
import { cn } from "@/lib/utils"
import { ThemeToggle } from "../theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authApi } from "@/lib/api"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const VerificationFormSchema = z.object({
  key: z
    .string()
    .length(6, {
      message: "Verification code must be exactly 6 digits.",
    })
    .regex(/^\d{6}$/, {
      message: "Verification code must contain only numbers.",
    }),
})

export function EmailVerification() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>("")

  const email = location.state?.email || ""

  const form = useForm<z.infer<typeof VerificationFormSchema>>({
    resolver: zodResolver(VerificationFormSchema),
    defaultValues: {
      key: "",
    },
  })

  useEffect(() => {
    if (!email) {
      navigate("/register")
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  // Helper function to format field errors
  const getFieldError = (fieldName: string) => {
    if (apiErrors[fieldName]) {
      return apiErrors[fieldName].join(", ")
    }
    return undefined
  }

  const handleVerifyEmail = async (data: z.infer<typeof VerificationFormSchema>) => {
    setIsVerifying(true)
    setApiErrors({})
    setGeneralError("")

    try {
      await authApi.verifyEmail(email, data.key)
      setIsVerified(true)
      toast.success("Email verified!", {
        description: "Your account has been successfully verified.",
      })

      // Auto redirect after verification
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Email verification error:", error)
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Handle field-specific errors
        if (typeof errorData === "object" && !errorData.detail && !errorData.non_field_errors) {
          setApiErrors(errorData)
          // Set form errors for each field
          Object.keys(errorData).forEach((field) => {
            if (field in form.getValues()) {
              form.setError(field as keyof z.infer<typeof VerificationFormSchema>, {
                type: "server",
                message: errorData[field].join(", "),
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
        else if (typeof errorData === "string") {
          setGeneralError(errorData)
        } else {
          setGeneralError("Email verification failed. Please try again.")
        }
      } else {
        setGeneralError(error.message || "Email verification failed. Please try again.")
      }

      toast.error("Verification failed", {
        description: "Please check the verification code and try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setApiErrors({})
    setGeneralError("")

    try {
      await authApi.resendEmailVerification(email)
      setCountdown(60)
      setCanResend(false)
      toast.success("Verification email sent!", {
        description: "Please check your email for the new verification code.",
      })
    } catch (error: any) {
      console.error("Resend email error:", error)
      
      let errorMessage = "Failed to resend verification email. Please try again."
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(", ")
        } else if (typeof errorData === "string") {
          errorMessage = errorData
        }
      }

      setGeneralError(errorMessage)
      toast.error("Resend failed", {
        description: errorMessage,
      })
    } finally {
      setIsResending(false)
    }
  }

  if (isVerified) {
    return (
      <div className="bg-bg-primary min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md bg-bg-secondary shadow-xl py-6">
        <CardHeader className="text-center px-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary dark:bg-accent rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8 text-white dark:text-black" />
            </div>
            <CardTitle className="text-3xl font-bold !text-text-primary">Email Verified!</CardTitle>
            <CardDescription className="text-text-secondary font-semibold text-md">
              Your account has been successfully verified. You can now sign in to GrowGuard.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8">
            <div className="text-center">
              <p className="text-md text-text-secondary mb-4">Redirecting you to sign in...</p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary dark:border-accent mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="text-text-primary min-h-screen flex items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md bg-bg-secondary shadow-xl py-6">
        <CardHeader className="text-center px-6">
          <div className="mx-auto mb-4 w-full flex items-center justify-center">
            <img src={emailIcon} alt="w-full header image" className="dark:invert" />
          </div>
          <CardTitle className="text-3xl font-bold !text-text-primary">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-text-secondary font-semibold text-md">
            We've sent a 6-digit verification code to <strong className="text-text-primary">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generalError && (
            <Alert variant="destructive" className="mb-4 !text-error bg-red-100 border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerifyEmail)} className="space-y-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isVerifying}
                        >
                          <InputOTPGroup className="gap-2">
                            {Array.from({ length: 6 }, (_, index) => (
                              <InputOTPSlot key={index} index={index} className="text-text-primary rounded-sm border border-border dark:border-border/25 focus:border-primary focus:ring-0 focus:ring-primary px-[16px] py-[10px]"/>
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center text-error">{getFieldError("key")}</FormMessage>
                  </FormItem>
                )}
              />
              <div className="text-center">
                <p className="text-text-secondary font-semibold mt-2 space-y-2 text-center text-md">
                  didn't get a code?{" "}
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={!canResend || isResending}
                    // className="text-primary dark:text-accent  hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline"
                    className={cn("text-primary dark:text-accent underline disabled:text-text-secondary disabled:no-underline", canResend && "cursor-pointer")}
                  >
                    {isResending ? "sending..." : canResend ? "resend" : `resend in ${countdown}s`}
                  </button>
                </p>
              </div>
              {/* <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={!canResend || isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : canResend ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Code
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend in {countdown}s
                    </>
                  )}
                </Button>
              </div> */}
              <Button
                type="submit"
                className="w-full text-text-primary hover:text-white font-semibold uppercase bg-accent hover:bg-primary-hover cursor-pointer rounded-sm dark:hover:text-black dark:bg-primary-hover dark:hover:bg-accent"
                disabled={isVerifying || form.watch("key").length !== 6}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    {/* <CheckCircle className="w-4 h-4 mr-2" /> */}
                    Verify Email
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-text-secondary font-semibold mt-2 space-y-2 text-center text-md">
            Back to
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
