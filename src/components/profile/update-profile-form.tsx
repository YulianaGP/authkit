"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UpdateProfileSchema, type UpdateProfileInput } from "@/lib/validations/auth"
import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export function UpdateProfileForm({ currentName }: { currentName: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { name: currentName },
  })

  const onSubmit = (data: UpdateProfileInput) => {
    setResult(null)
    startTransition(async () => {
      const res = await updateProfile(data)
      setResult(res)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" disabled={isPending} {...field} />
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
          {isPending ? "Saving…" : "Save"}
        </Button>
      </form>
    </Form>
  )
}
