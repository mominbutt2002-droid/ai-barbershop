# Кромка

Барбершоп в Казани: лендинг, запись на кресло, админка, Telegram-бот и Mini App. Сайт и бот пишут в одну базу PostgreSQL (Neon).

Стек: JavaScript, Next.js, React, Prisma, grammY.

## Запуск локально

Скопируйте `.env.example` в `.env`, укажите `DATABASE_URL` и `DIRECT_URL` от Neon.

```bash
npm install
npm run db:setup
npm run dev
```

Сайт: http://localhost:3000  
Админка: http://localhost:3000/admin/login, пароль из `ADMIN_PASSWORD`.

`npm run db:setup` заново записывает мокап: 4 мастера, 6 услуг и заявки. Старые заявки стираются.

## Telegram и Mini App

1. Токен бота — в `BOT_TOKEN`, id группы — в `GROUP_CHAT_ID`.
2. Публичный HTTPS-адрес сайта — в `WEBAPP_URL` (на Vercel это домен проекта).
3. После деплоя откройте `/api/telegram/setup` с заголовком `Authorization: Bearer <CRON_SECRET или SESSION_SECRET>` — бот поставит вебхук и кнопку «Календарь».

Mini App: `/mini`. Запись из приложения и из чата попадает в ту же базу.

Напоминания клиенту: за час и за 5 минут, плюс кнопка в админке. На Vercel их дергает cron `/api/cron/reminders`.

## Публикация

База — Neon Postgres. Сайт — Vercel. В окружении Vercel нужны те же переменные, что в `.env.example`.
