import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { UpdateProfileForm } from "@/components/profile/update-profile-form"
import { UpdatePasswordForm } from "@/components/profile/update-password-form"
import { TwoFactorSection } from "@/components/profile/two-factor-section"

export const metadata = { title: "Profile — AuthKit" }

export default async function ProfilePage() {
  const session = await auth()

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium truncate max-w-48">{session?.user?.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <Badge variant={session?.user?.role === "ADMIN" ? "default" : "secondary"}>
              {session?.user?.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">2FA</span>
            <Badge variant={session?.user?.twoFactorEnabled ? "default" : "secondary"}>
              {session?.user?.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Update name */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Display name</h2>
        <UpdateProfileForm currentName={session?.user?.name ?? ""} />
      </div>

      {/* Update password */}
      {session?.user && (
        <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Password</h2>
          <UpdatePasswordForm />
        </div>
      )}

      {/* 2FA */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Two-factor authentication</h2>
          <p className="text-sm text-muted-foreground">
            Protect your account with an authenticator app
          </p>
        </div>
        <TwoFactorSection enabled={session?.user?.twoFactorEnabled ?? false} />
      </div>
    </div>
  )
}
