"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { z } from "zod"

const OnboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export async function completeOnboarding(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const parsed = OnboardingSchema.safeParse({ name: formData.get("name") })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      onboardingDone: true,
    },
  })

  redirect("/dashboard")
}
