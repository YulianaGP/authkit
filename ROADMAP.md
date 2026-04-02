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

## SESIÓN 2 — CREDENTIALS AUTH + EMAIL
**Objetivo:** Register, login, verificación de email y reset de contraseña funcionando end-to-end

- [ ] Server Action: `register` (hash bcrypt + crear User + enviar email de verificación)
- [ ] Server Action: `login` (NextAuth signIn + rate limiting + check 2FA)
- [ ] Server Action: `verifyEmail` (verificar token + marcar emailVerified)
- [ ] Server Action: `forgotPassword` (crear PasswordReset token + enviar email)
- [ ] Server Action: `resetPassword` (validar token + actualizar password)
- [ ] UI: página de login completa con shadcn
- [ ] UI: página de register completa con shadcn
- [ ] UI: página de verify-email
- [ ] UI: página de forgot-password
- [ ] UI: página de reset-password
- [ ] Templates de email con Resend (verificación + reset)

---

## SESIÓN 3 — OAUTH + RATE LIMITING
**Objetivo:** Google, GitHub y Discord OAuth funcionando + rate limiting activo

- [ ] Provider Google en `auth.ts`
- [ ] Provider GitHub en `auth.ts`
- [ ] Provider Discord en `auth.ts`
- [ ] Botones OAuth en UI de login/register
- [ ] Rate limiting: 5 intentos → bloqueo temporal 15 min (Upstash Redis)
- [ ] Mostrar error claro al usuario cuando está bloqueado

---

## SESIÓN 4 — 2FA (TOTP)
**Objetivo:** Setup de 2FA, verificación en login, recovery codes

- [ ] Server Action: `setup2FA` — genera secreto TOTP + QR code
- [ ] Server Action: `enable2FA` — verifica primer código + guarda secreto
- [ ] Server Action: `disable2FA`
- [ ] Server Action: `verify2FA` — verifica código en login
- [ ] Generar 8 recovery codes al activar 2FA (guardados hasheados en DB)
- [ ] UI: página de setup 2FA con QR code
- [ ] UI: paso de 2FA en el flujo de login
- [ ] UI: mostrar recovery codes una sola vez

---

## SESIÓN 5 — ADMIN PANEL + AUDIT LOG
**Objetivo:** Sesiones activas, geo-detección, revocar, logout all

- [ ] Guardar AuditLog en cada login (IP, UserAgent, geo, device, browser, action)
- [ ] Geolocalización: Vercel headers (`x-vercel-ip-country`, `x-vercel-ip-city`) + fallback ip-api.com
- [ ] Parse de UserAgent con `ua-parser-js`
- [ ] Alerta en email cuando login desde país nuevo (Resend)
- [ ] UI: página de sesiones activas (device, browser, IP, location, last active)
- [ ] Server Action: `revokeSession`
- [ ] Server Action: `logoutAllDevices`
- [ ] UI: admin panel para ADMIN (listar usuarios, ver sesiones, revocar)

---

## SESIÓN 6 — RBAC + PERFIL
**Objetivo:** Sistema de roles completo + página de perfil

- [ ] `proxy.ts` con lógica de roles (redirigir si rol insuficiente)
- [ ] Helper `hasRole(session, role)` reutilizable
- [ ] UI: página de perfil (nombre, email, avatar, cambiar password)
- [ ] Server Action: `updateProfile`
- [ ] Server Action: `updateAvatar`
- [ ] UI: badge de rol visible en dashboard
- [ ] UI: página de admin solo accesible para ADMIN

---

## SESIÓN 7 — POLISH PARA VENTA
**Objetivo:** Template listo para publicar en Gumroad/Lemonsqueezy

- [ ] README completo en inglés con demo GIF
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
