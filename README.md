# 🏠 La Maison — Backend

CRM-система для ресторана **La Maison**.  
REST API на **NestJS** + **Prisma** + **PostgreSQL** с JWT-аутентификацией через httpOnly-cookies.

---

## Возможности

| Модуль          | Описание                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Auth**        | Регистрация / вход / обновление токенов (access + refresh в cookies), ролевая модель (Admin, Waiter, Cook, Customer) |
| **Users**       | Управление пользователями, аллергены                                                                                 |
| **Menu**        | Категории, блюда, ингредиенты, связи «блюдо ↔ ингредиент»                                                            |
| **Tables**      | Столики ресторана (типы: 2 / 4 / 6 мест)                                                                             |
| **Floor Items** | Схема зала — размещение столиков, бара, WC, выходов                                                                  |
| **Reservation** | Бронирование столиков со статусами (BOOKED → SEATED → PAID → COMPLETED и т.д.)                                       |
| **Orders**      | Заказы привязаны к бронированию, позиции со статусами (COOKING → READY → SERVED)                                     |

<p align="center">
  <img src="screens/schema.jpg"  />
</p>

---

## Стек технологий

- **Runtime:** Node.js
- **Framework:** NestJS 11
- **ORM:** Prisma 7 (PostgreSQL)
- **Auth:** Passport JWT (access + refresh tokens, httpOnly cookies)
- **Validation:** class-validator + class-transformer, Joi (env)
- **Docs:** Swagger (доступен по `/docs`)
- **Rate Limiting:** @nestjs/throttler
- **Контейнеризация:** Docker Compose (PostgreSQL 15)

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <url>
cd la-maison-backend
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Создать файл `.env`

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/backend_db"
PORT=3000

JWT_ACCESS_SECRET=access_secret_very_long
JWT_REFRESH_SECRET=refresh_secret_very_long

JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

### 4. Поднять базу данных

```bash
docker-compose up -d
```

### 5. Применить миграции и сгенерировать клиент Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Запустить сервер

```bash
npm run start:dev
```

Приложение запустится на `http://localhost:3000`.  
Swagger-документация доступна по адресу `http://localhost:3000/docs`.

---

## Структура проекта

```
src/
├── main.ts                   # Точка входа, настройка Swagger, CORS, pipes
├── app.module.ts             # Корневой модуль
├── auth/                     # Аутентификация (JWT, guards, strategies)
│   ├── decorators/           # @CurrentUser, @Public, @Roles
│   ├── guards/               # JwtAccessGuard, JwtRefreshGuard, RolesGuard
│   ├── strategies/           # Passport-стратегии (access / refresh)
│   └── dto/                  # LoginDto, RegisterDto
├── users/                    # Пользователи
├── menu/                     # Меню (категории, блюда, ингредиенты)
├── tables/                   # Столики
├── floor-items/              # Элементы плана зала
├── reservation/              # Бронирования
├── orders/                   # Заказы
├── prisma/                   # PrismaModule / PrismaService
└── common/
    ├── filters/              # AllExceptionFilter
    ├── interceptors/         # ResponseInterceptor, LoggingInterceptor
    └── utils/                # Утилиты (fileToBase64 и др.)
```

---

## Схема БД (основные модели)

```
User ─────────────────────────────────────────
MenuCategory ── Dish ── DishIngredient ── Ingredient
Tables ── FloorItems
Reservation ── Order ── OrderItem ── Dish
```

### Роли пользователей

| Роль       | Описание           |
| ---------- | ------------------ |
| `ADMIN`    | Менеджер ресторана |
| `WAITER`   | Официант           |
| `COOK`     | Повар              |
| `CUSTOMER` | Клиент             |

---

## API-документация

После запуска сервера полная интерактивная документация доступна по адресу:

```
http://localhost:3000/docs
```

Аутентификация реализована через **httpOnly cookies** (`accessToken` / `refreshToken`).
