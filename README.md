# 🛠️ SZ Metal Admin Panel

Bu proje, **Next.js 15 (App Router)**, **Supabase**, **Tailwind CSS**, **MUI (Material UI)** ve **TypeScript** kullanılarak geliştirilmiş tam özellikli bir **Admin Panel** uygulamasıdır. Eğitim amaçlı oluşturulmuştur ve modern web geliştirme yaklaşımlarını içermektedir.

---

## 🚀 Teknolojiler

| Teknoloji   | Açıklama |
|------------|----------|
| [Next.js 15](https://nextjs.org) | App Router mimarisiyle SSR + RSC destekli |
| [Supabase](https://supabase.com) | Authentication, veritabanı ve API katmanı |
| [Tailwind CSS](https://tailwindcss.com) | Hızlı stil yazımı için utility-first CSS framework |
| [MUI](https://mui.com) | React için Material tasarım bileşenleri |
| [TypeScript](https://www.typescriptlang.org) | Güçlü tip kontrolü |
| [DataGrid](https://mui.com/x/react-data-grid/) | Gelişmiş tablo ve listeleme yetenekleri |
| [Zod/Yup](https://zod.dev / https://github.com/jquense/yup) | Form doğrulama |
| [React Hook Form](https://react-hook-form.com) | Form state yönetimi |

---

## 📁 Proje Yapısı

```bash
app/
├── (admin)/
│   ├── account/
│   ├── dashboard/
│   ├── clients/
│   ├── requests/
│   │   └── [id]/
│   ├── systems/
│   │   └── [slug]/step2, step3
│   ├── types/
│   ├── _components_/layout, ui, charts, dialogs...
│   ├── _constants_/requests, systems, validations...
│   ├── _hooks_/
│   └── _utils_/
├── (auth)/login, register, reset-password, forgot-password
├── unauthorized/
lib/
types/
middleware.ts
