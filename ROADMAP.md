# ROADMAP — authkit
**Template de autenticación profesional para Next.js 16**
**Yuliana Girón Palacios | Full Stack Developer → Fintech + AI**

> Abrir este archivo al inicio de cada sesión. Ver qué quedó `[~]` y continuar desde ahí.

---

## CÓMO USAR ESTE ARCHIVO

- `[ ]` = pendiente
- `[x]` = completado
- `[~]` = en progreso
- Actualizar el estado cada vez que se completa algo

---

## STACK

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.2 + React 19.2.4 |
| Lenguaje | TypeScript 5 |
| Auth | NextAuth v5.0.0-beta.30 |
| DB ORM | Prisma 6 (bajado de v7 — ver Decisiones Técnicas) |
| UI | shadcn/ui 4.1.2 + Tailwind CSS 4.2.2 |
| Email | Resend |
| Rate limiting | Upstash Redis + @upstash/ratelimit |
| 2FA | otpauth + qrcode |
| User-Agent parsing | ua-parser-js |
| Validación | Zod 4 |

### Breaking changes clave de Next.js 16 (leer antes de codificar)
- `middleware.ts` → **`proxy.ts`**, export `proxy` (no `middleware`)
- `cookies()`, `headers()`, `params`, `searchParams` son **async** — deben awaitearse
- Turbopack por defecto en `next dev` y `next build`
- `cacheLife` / `cacheTag` sin prefijo `unstable_`

---

## FEATURES A IMPLEMENTAR

### Auth core
- Register + login con credenciales
- Google OAuth / GitHub OAuth / Discord OAuth
- Verificación de email (double opt-in con Resend)
- Reset de contraseña por email
- 2FA con TOTP (Google Authenticator, Authy, 1Password)
- Códigos de recuperación para 2FA

### Seguridad
- Rate limiting en login (5 intentos → bloqueo con Upstash Redis)
- Security headers en `next.config.ts`
- RBAC: roles `ADMIN` / `USER` / `MODERATOR`
- `proxy.ts` que protege rutas según rol

### Sesiones y auditoría
- Lista de sesiones activas con Device, Browser, IP, Location, Last active
- Revocar sesión individual
- Logout de todos los dispositivos
- AuditLog: IP, UserAgent, Location (Vercel geo headers + fallback ip-api.com), timestamp, action
- Alerta "New login detected from another location"

### Perfil
- Página de perfil
- Cambio de avatar

### Admin panel
- Ver todas las sesiones del usuario
- Revocar sesión individual
- Logout all devices

### Para venta
- README con demo GIF obligatorio
- `.env.example` documentado
- `SETUP.md` — guía paso a paso
- Deploy funcional en Vercel como demo
- Licencia MIT

---

## SESIÓN 1 — FUNDACIÓN ← ESTAMOS AQUÍ
**Objetivo:** Schema de DB, configuración de NextAuth, estructura de rutas, shadcn/ui

### 1.1 — shadcn/ui
- [x] Inicializar shadcn/ui (detectó Tailwind v4, instaló tw-animate-css, OKLCH colors)

### 1.2 — Prisma schema
- [x] Crear `prisma/schema.prisma`
  - [x] Enum `Role`: ADMIN / USER / MODERATOR
  - [x] Enum `AuditAction`: LOGIN, LOGOUT, REGISTER, etc.
  - [x] Model `User`: id, name, email, emailVerified, image, password, role, twoFactorEnabled, twoFactorSecret, createdAt, updatedAt
  - [x] Model `Account`: para OAuth (NextAuth standard)
  - [x] Model `Session`: para sesiones de DB (NextAuth standard)
  - [x] Model `VerificationToken`: para email verification (NextAuth standard)
  - [x] Model `PasswordReset`: token, userId, expiresAt, usedAt
  - [x] Model `AuditLog`: userId, action, ip, userAgent, country, city, device, browser, os, success, metadata
  - [x] Model `RecoveryCode`: para 2FA backup codes (hasheados)

### 1.3 — Infraestructura base
- [x] Crear `src/lib/db.ts` — Prisma singleton
- [x] Crear `src/auth.ts` — NextAuth v5 config (credentials + Google + GitHub + Discord)
- [x] Crear `src/types/next-auth.d.ts` — tipos extendidos (role, twoFactorEnabled)
- [x] Crear `src/proxy.ts` — protección de rutas por rol (Next.js 16: proxy, no middleware)
- [x] Agregar security headers a `next.config.ts`

### 1.4 — Estructura de rutas
- [x] `src/app/api/auth/[...nextauth]/route.ts` — Route Handler de NextAuth
- [x] `src/app/(auth)/layout.tsx` — layout público centrado
- [x] `src/app/(auth)/login/page.tsx` — placeholder
- [x] `src/app/(auth)/register/page.tsx` — placeholder
- [x] `src/app/(auth)/verify-email/page.tsx` — placeholder
- [x] `src/app/(auth)/forgot-password/page.tsx` — placeholder
- [x] `src/app/(auth)/reset-password/page.tsx` — placeholder (maneja token vía searchParams async)
- [x] `src/app/(auth)/two-factor/page.tsx` — placeholder
- [x] `src/app/(protected)/layout.tsx` — layout protegido (verifica sesión con redirect)
- [x] `src/app/(protected)/dashboard/page.tsx` — placeholder
- [x] `src/app/(protected)/profile/page.tsx` — placeholder
- [x] `src/app/(protected)/sessions/page.tsx` — placeholder
- [x] `src/app/(protected)/admin/page.tsx` — placeholder (doble check de rol ADMIN)

### 1.5 — Archivo de entorno
- [x] Crear `.env.example` (DATABASE_URL, AUTH_*, RESEND_*, UPSTASH_*)

---

## SESIÓN 2 — CREDENTIALS AUTH + EMAIL ✅ COMPLETADA (2026-04-02)
**Objetivo:** Register, login, verificación de email y reset de contraseña funcionando end-to-end

- [x] Zod schemas para todos los formularios (`src/lib/validations/auth.ts`)
- [x] Token utilities: generateVerificationToken, generatePasswordResetToken (`src/lib/tokens.ts`)
- [x] Email functions con Resend: verification, reset, new-location alert (`src/lib/mail.ts`)
- [x] Server Action: `register` (bcrypt hash + crear User + enviar email de verificación)
- [x] Server Action: `login` (NextAuth signIn + check emailVerified + reenvío de verificación)
- [x] Server Action: `logout`
- [x] Server Action: `verifyEmail` (verificar token + marcar emailVerified)
- [x] Server Action: `forgotPassword` (PasswordReset token + email, sin revelar si email existe)
- [x] Server Action: `resetPassword` (validar token + hash bcrypt + marcar usedAt)
- [x] UI: OAuthButtons (Google, GitHub, Discord) con loading state
- [x] UI: LoginForm — react-hook-form + zod + shadcn
- [x] UI: RegisterForm — react-hook-form + zod + shadcn
- [x] UI: VerifyEmailForm — auto-verifica al cargar con el token del URL
- [x] UI: ForgotPasswordForm — react-hook-form + zod + shadcn
- [x] UI: ResetPasswordForm — react-hook-form + zod + shadcn
- [x] Páginas actualizadas con componentes reales (login, register, verify-email, forgot-password, reset-password)

---

## SESIÓN 3 — OAUTH + RATE LIMITING ✅ COMPLETADA (2026-04-07)
**Objetivo:** Google, GitHub y Discord OAuth funcionando + rate limiting activo

- [x] Provider Google en `auth.ts` + credenciales configuradas
- [x] Provider GitHub en `auth.ts` + credenciales configuradas
- [x] Provider Discord en `auth.ts` + credenciales configuradas
- [x] `allowDangerousEmailAccountLinking` en todos los providers OAuth
- [x] Botones OAuth en UI de login/register (Google, GitHub, Discord)
- [x] Rate limiting: 5 intentos → bloqueo con tiempo restante (Upstash Redis)
- [x] Prefijo `authkit:login` para aislar keys en DB compartida de Upstash
- [x] Mensaje de error con minutos restantes visible en LoginForm
- [x] Probado: 6to intento muestra mensaje de bloqueo ✅

---

## SESIÓN 4 — 2FA (TOTP) ✅ COMPLETADA (2026-04-07)
**Objetivo:** Setup de 2FA, verificación en login, recovery codes

- [x] `src/lib/two-factor.ts` — generateTOTPSecret, generateQRCodeDataURL, verifyTOTPCode, generateRecoveryCodes, hashRecoveryCodes, verifyRecoveryCode
- [x] Server Action: `setup2FA` — genera secreto TOTP + QR code data URL
- [x] Server Action: `enable2FA` — verifica primer código + activa 2FA + genera 8 recovery codes hasheados
- [x] Server Action: `disable2FA` — requiere código TOTP válido para desactivar
- [x] Server Action: `verifyTwoFactor` — acepta TOTP o recovery code, marca recovery code como usado
- [x] Login action: intercepta usuarios con 2FA activo → redirige a /two-factor?userId=...
- [x] UI: `TwoFactorSetup` — flujo en 2 pasos (idle → scan QR → verificar código)
- [x] UI: `TwoFactorForm` — acepta TOTP o recovery code, toggle entre modos
- [x] UI: `RecoveryCodesDisplay` — muestra 8 códigos en grid, botón copy, mostrados solo una vez
- [x] UI: Profile page con sección de 2FA setup integrada
- [x] proxy.ts actualizado — /two-factor en authRoutes

---

## SESIÓN 5 — ADMIN PANEL + AUDIT LOG ✅ COMPLETADA (2026-04-07)
**Objetivo:** Sesiones activas, geo-detección, revocar, logout all

- [x] `src/lib/audit.ts` — createAuditLog con IP, UserAgent, geo (Vercel headers + ip-api.com fallback), ua-parser-js
- [x] AuditLog registrado en cada LOGIN y LOGIN_FAILED
- [x] Server Actions: getAuditLogs, revokeSession, logoutAllDevices, getAllUsers
- [x] UI: página de sesiones — lista de actividad con device icon, browser, OS, ubicación, tiempo relativo
- [x] UI: botón "Sign out all devices" con confirmación
- [x] UI: admin panel — tabla en desktop, cards en mobile (fully responsive)
- [x] UI: badges de role, verified, 2FA por usuario
- [x] Profile page — responsive con max-w + padding adaptativo

---

## SESIÓN 6 — RBAC + PERFIL ✅ COMPLETADA (2026-04-09)
**Objetivo:** Sistema de roles completo + página de perfil

- [x] `proxy.ts` con lógica de roles (redirigir si rol insuficiente)
- [x] Helper `hasRole(session, role)` reutilizable (`src/lib/roles.ts`)
- [x] UI: página de perfil (nombre, email, cambiar password, 2FA toggle)
- [x] Server Action: `updateProfile`
- [x] Server Action: `updatePassword`
- [x] UI: badge de rol visible en dashboard
- [x] UI: página de admin solo accesible para ADMIN
- [x] Navbar con links según rol
- [x] TwoFactorSection: setup + disable flow desde perfil

---

## SESIÓN 7 — CALIDAD (Nivel 1)
**Objetivo:** Detalles que dan percepción de calidad premium

- [ ] Toast notifications (sonner) — reemplazar Alert inline en formularios
- [ ] Loading skeletons en dashboard y admin panel
- [ ] Dark mode toggle en navbar
- [ ] Páginas de error personalizadas (`not-found.tsx`, `error.tsx`)

---

## SESIÓN 8 — FEATURES PREMIUM (Nivel 2)
**Objetivo:** Features que justifican precio $69-99

### 8A — Export CSV (admin)
- [ ] Server Action `exportAuditLogCSV` — genera CSV con todos los audit logs
- [ ] Botón "Export CSV" en admin panel
- [ ] Descarga directa en el browser sin página nueva

### 8B — Email de nueva ubicación
- [ ] Comparar país/ciudad del login actual vs último login del usuario en audit_logs
- [ ] Si es diferente → enviar `sendNewLocationAlert` (ya existe en mail.ts)
- [ ] Integrar en `loginFormAction` y en `events.signIn` (OAuth)

### 8C — Onboarding post-registro
- [ ] Página `/onboarding` con wizard de 3 pasos: nombre → plan → listo
- [ ] Redirigir a `/onboarding` después del primer login (campo `onboardingDone` en User)
- [ ] Agregar campo `onboardingDone Boolean @default(false)` al schema de Prisma
- [ ] proxy.ts redirige a /onboarding si no está completado

### 8D — Impersonation (admin)
- [ ] Server Action `impersonateUser` — admin inicia sesión como otro user
- [ ] Banner visible "You are impersonating X — Exit" en navbar
- [ ] Server Action `stopImpersonation` — restaura sesión de admin
- [ ] Solo accesible para ADMIN, loggeado en audit_logs

---

## SESIÓN 9 — DIFERENCIADOR ÚNICO (Nivel 3)
**Objetivo:** Lo que ningún otro template tiene

- [ ] Página `/docs` interactiva dentro de la app
- [ ] Video demo de 2 minutos embebido en README

---

## SESIÓN 10 — POLISH PARA VENTA
**Objetivo:** Template listo para publicar en Gumroad/Lemonsqueezy

- [ ] README completo en inglés con screenshots
- [ ] `.env.example` con todos los campos documentados
- [ ] `SETUP.md` — guía paso a paso desde cero
- [ ] `LICENSE` — MIT
- [ ] Deploy funcional en Vercel
- [ ] Verificar que todas las features funcionan en producción

---

## LOG DE SESIONES

| Fecha | Sesión | Completado |
|---|---|---|
| 2026-04-01 | 1 — Fundación | shadcn/ui, Prisma schema, NextAuth v5, proxy.ts, security headers, rutas, .env.example ✅ |
| 2026-04-02 | 2 — Credentials auth + email | Zod schemas, tokens, Resend emails, Server Actions (register/login/verify/forgot/reset), UI completa ✅ |
| 2026-04-07 | 3 — OAuth + rate limiting | Google/GitHub/Discord OAuth, rate limiting 5 intentos/15min con Upstash ✅ |
| 2026-04-07 | 4 — 2FA TOTP | TOTP setup+verify, 8 recovery codes hasheados, interceptor en login, UI completa ✅ |
| 2026-04-07 | 5 — AuditLog + admin panel | ua-parser-js, geo Vercel+ip-api, sessions page, admin panel responsive ✅ |

---

## DECISIONES TÉCNICAS

| Decisión | Razón |
|---|---|
| `proxy.ts` en lugar de `middleware.ts` | Next.js 16 renombró middleware a proxy |
| TOTP en lugar de SMS para 2FA | Sin costo, funciona offline, estándar de la industria |
| OKLCH en lugar de HSL | shadcn v4 + Tailwind 4 usan OKLCH — más moderno |
| Vercel geo headers como fuente primaria de geolocalización | Gratis, built-in, sin latencia extra |
| ip-api.com como fallback de geolocalización | Free tier 1000 req/min para otros hosts |
| Prisma 6 en lugar de Prisma 7 | Prisma 7 requiere driver adapters y prisma.config.ts — patrón desconocido para la mayoría de compradores. Prisma 6 es el estándar del ecosistema Next.js + NextAuth. Menos fricción = más ventas. |

---

*Roadmap creado: 2026-04-01*
*Proyecto: authkit — template vendible $29–49 en Gumroad/Lemonsqueezy*
