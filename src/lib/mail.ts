import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? "AuthKit <noreply@yourdomain.com>"

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.AUTH_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Verify your email</h2>
        <p style="color:#555;margin-bottom:24px">
          Click the button below to verify your email address. This link expires in 24 hours.
        </p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#171717;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:500">
          Verify email
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.AUTH_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;margin-bottom:24px">
          Click the button below to choose a new password. This link expires in 2 hours.
        </p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#171717;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:500">
          Reset password
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendNewLocationAlert(
  email: string,
  details: { city?: string; country?: string; browser?: string; device?: string }
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "New login detected on your account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">New login detected</h2>
        <p style="color:#555;margin-bottom:16px">
          A new login was detected on your account from a new location.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#999">Location</td>
              <td style="padding:8px 0">${details.city ?? "Unknown"}, ${details.country ?? "Unknown"}</td></tr>
          <tr><td style="padding:8px 0;color:#999">Device</td>
              <td style="padding:8px 0">${details.device ?? "Unknown"}</td></tr>
          <tr><td style="padding:8px 0;color:#999">Browser</td>
              <td style="padding:8px 0">${details.browser ?? "Unknown"}</td></tr>
        </table>
        <p style="color:#555;font-size:14px">
          If this was you, no action is needed. If not, please change your password immediately.
        </p>
      </div>
    `,
  })
}
