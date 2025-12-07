"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores";
import { APP_CONFIG } from "@/lib/constants";

// Form validation schema
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Watch password for requirements display
  const watchedPassword = watch("password");
  React.useEffect(() => {
    setPassword(watchedPassword || "");
  }, [watchedPassword]);

  // Clear error on mount
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-float" />
        <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full bg-brand-400/20 blur-3xl animate-float animation-delay-200" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-white">
              {APP_CONFIG.name}
            </span>
          </Link>

          <h1 className="font-display text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Start Creating
            <br />
            Beautiful Invitations
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            Sign up free and create your first invitation in under a minute.
            No credit card required.
          </p>

          {/* Benefits */}
          <div className="mt-12 space-y-4">
            {[
              "3 free invitations to start",
              "5 free AI generations",
              "Unlimited RSVP tracking",
              "No credit card required",
            ].map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                {benefit}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex lg:hidden items-center justify-center gap-2.5 mb-8"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-surface-900">
              {APP_CONFIG.name}
            </span>
          </Link>

          <Card variant="elevated" padding="lg" className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription className="text-base">
                Start creating beautiful invitations today
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="label">
                    Full name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    leftIcon={<User className="h-5 w-5" />}
                    error={errors.name?.message}
                    {...register("name")}
                  />
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="label">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="h-5 w-5" />}
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    leftIcon={<Lock className="h-5 w-5" />}
                    showPasswordToggle
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  {/* Password requirements */}
                  {password && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {passwordRequirements.map((req) => {
                        const isValid = req.regex.test(password);
                        return (
                          <div
                            key={req.label}
                            className={`flex items-center gap-1.5 text-xs ${
                              isValid ? "text-success-600" : "text-surface-400"
                            }`}
                          >
                            <CheckCircle2
                              className={`h-3.5 w-3.5 ${
                                isValid ? "opacity-100" : "opacity-40"
                              }`}
                            />
                            {req.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm password field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="label">
                    Confirm password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    leftIcon={<Lock className="h-5 w-5" />}
                    showPasswordToggle
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="h-4 w-4 mt-0.5 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    {...register("acceptTerms")}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-surface-600"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-error-600">
                    {errors.acceptTerms.message}
                  </p>
                )}

                {/* Error display */}
                {error && (
                  <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting || isLoading}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Create account
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-surface-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social signup buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="h-12">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" className="h-12">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                  Apple
                </Button>
              </div>

              {/* Sign in link */}
              <p className="mt-6 text-center text-sm text-surface-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
