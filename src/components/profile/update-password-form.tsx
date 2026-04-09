"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UpdatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations/auth"
import { updatePassword } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const onSubmit = (data: UpdatePasswordInput) => {
    setResult(null)
    startTransition(async () => {
      const res = await updatePassword(data)
      setResult(res)
      if ("success" in res) form.reset()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {result?.error && (
          <Alert variant="destructive">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
        {result?.success && (
          <Alert>
            <AlertDescription>{result.success}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Form>
  )
}
