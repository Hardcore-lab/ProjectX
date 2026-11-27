# ProjectX

<p align="center">
  <a href="#русский">Русский</a> | <a href="#english">English</a>
</p>

## Русский

ProjectX — прототип интернет-магазина на базе [EverShop](https://evershop.io/).
Репозиторий содержит исходный код приложения и тему оформления, но не содержит
резервную копию PostgreSQL или данные магазина.

> **Статус: MVP / резервная копия исходников.** Приложение собиралось и
> запускалось, но проект пока не готов к production. Перед запуском нужно
> проверить и завершить настройку каталога, CMS, оформления заказов и
> инфраструктуры.

### Возможности

- основа интернет-магазина EverShop 1.2.2;
- кастомная тема Eve и визуальные материалы ProjectX;
- страницы и компоненты витрины, корзины и навигации;
- настройки валюты по умолчанию: RUB (₽);
- административная панель EverShop.

### Ограничения

- В репозитории нет дампа базы данных или seed-данных. Новая база PostgreSQL
  будет без товаров, категорий, CMS-страниц, пользователей админ-панели и
  настроек прежнего окружения.
- Данные прежней среды (четыре тестовых товара и три категории) не входят в
  репозиторий и не восстанавливаются командами `npm ci` или `npm run setup`.
- Компоненты категорий, рекомендуемых товаров и desktop-меню на главной
  странице пусты или не завершены. Мобильная навигация содержит ссылки на CMS.
- Для ссылок, например `/page/aboutus`, необходимо создать соответствующие
  CMS-страницы. Без них маршрут вернёт 404.
- `evershop.config.js` ссылается на `extensions/customBreadcrumbs`, но исходники
  расширения в репозитории отсутствуют. Перед развёртыванием проверьте, нужно ли
  это расширение, и добавьте его исходники либо удалите ссылку.
- Оплата, email, доставка, налоги, домен и production-настройки безопасности
  здесь не сконфигурированы.

### Технологии

- Node.js и npm;
- EverShop 1.2.2;
- React;
- PostgreSQL;
- Express и GraphQL;
- SCSS, Tailwind CSS и Webpack.

### Требования

- Node.js 18 или новее (проект ранее собирался на Node.js 24);
- npm;
- PostgreSQL 14 или новее.

Для локальной разработки PostgreSQL можно запустить в Docker.

### Установка

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/Hardcore-lab/ProjectX.git
   cd ProjectX
   ```

2. Установите зафиксированные в lock-файле зависимости:

   ```bash
   npm ci
   ```

3. Создайте локальный файл окружения:

   ```bash
   cp .env.example .env
   ```

   В Windows PowerShell используйте:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Запустите PostgreSQL и создайте базу данных и пользователя, параметры
   которых указаны в `.env`.

   Пример запуска PostgreSQL в Docker:

   ```bash
   docker run -d \
     --name projectx-postgres \
     -e POSTGRES_DB=projectx \
     -e POSTGRES_USER=projectx \
     -e POSTGRES_PASSWORD=change-me \
     -p 5432:5432 \
     postgres:16-alpine
   ```

   Значения примера должны совпадать с `.env`. Для локальной базы укажите
   `DB_HOST=localhost`. При использовании Docker Compose укажите в `DB_HOST`
   имя сервиса PostgreSQL.

5. Инициализируйте EverShop и схему базы данных:

   ```bash
   npm run setup
   ```

   Эта команда инициализирует приложение, но **не** восстанавливает прежний
   каталог или CMS-содержимое.

6. Соберите и запустите витрину:

   ```bash
   npm run build
   npm start
   ```

   Откройте `http://localhost:4000`.

### Команды npm

| Команда | Назначение |
| --- | --- |
| `npm run setup` | Инициализация EverShop и настроек базы данных |
| `npm run build` | Сборка клиентской и серверной частей в `.evershop/` |
| `npm start` | Запуск production-сервера |
| `npm run dev` | Запуск сервера разработки |
| `npm run start:debug` | Запуск EverShop с отладочными сообщениями |
| `npm run user:create` | Создание пользователя админ-панели |
| `npm run user:changePassword` | Смена пароля администратора |

Административная панель доступна по адресу `/admin`. После инициализации базы
создайте администратора командой `npm run user:create`.

### Структура проекта

```text
.
├── config/
│   └── default.json              # Настройки EverShop и валюта RUB
├── themes/eve/
│   ├── components/               # Переопределения компонентов витрины
│   ├── css/                      # Глобальные стили темы
│   ├── pages/
│   │   ├── all/                  # Общий макет, логотип, навигация и подвал
│   │   └── homepage/             # Компоненты главной страницы
│   └── public/                   # Изображения и статические материалы
├── evershop.config.js            # Конфигурация темы и модулей
├── package.json                  # Скрипты и прямые зависимости
├── package-lock.json             # Зафиксированные версии зависимостей
└── .env.example                  # Шаблон переменных окружения
```

Файлы `node_modules/`, `.evershop/` и локальный `.env` исключены из Git.
Зависимости и результаты сборки создаются локально командами установки и
сборки.

### Конфигурация магазина

Основные настройки EverShop находятся в `config/default.json`. Тема и модули
настраиваются в `evershop.config.js`.

Валюта по умолчанию — RUB, символ — ₽. Эти настройки не означают, что каталог,
налоги или платёжные методы уже настроены.

### Конфигурация базы данных

Скопируйте `.env.example` в `.env` и задайте параметры подключения к PostgreSQL:

| Переменная | Назначение | Пример |
| --- | --- | --- |
| `DB_HOST` | Имя хоста PostgreSQL | `localhost` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_NAME` | Имя базы данных | `projectx` |
| `DB_USER` | Пользователь базы данных | `projectx` |
| `DB_PASSWORD` | Пароль базы данных | Задайте локально |
| `DB_SSLMODE` | Режим SSL PostgreSQL | `disable` для локальной разработки |
| `PORT` | HTTP-порт приложения | `4000` |

Не добавляйте в Git реальные пароли, API-ключи, платёжные секреты или production-файлы
`.env`.

### Разработка темы

Кастомная тема находится в `themes/eve/`:

- `themes/eve/pages/all/` — общий макет, логотип, навигация и подвал;
- `themes/eve/pages/homepage/` — секции главной страницы;
- `themes/eve/components/` — переопределения компонентов витрины;
- `themes/eve/css/` — глобальные стили;
- `themes/eve/public/` — изображения и статические ресурсы.

### Результаты предыдущей проверки

В предыдущей проверке в GitHub Codespace с PostgreSQL 16:

- `npm ci` завершилась успешно;
- `npm run build` собрала клиентскую и серверную части;
- сервер запустился, главная страница вернула HTTP 200;
- страница корзины отобразилась, но корзина была пустой;
- `/shop` и `/page/aboutus` вернули 404 из-за отсутствующего содержимого базы.

Эти результаты подтверждают сборку и запуск с настроенной базой, но не являются
end-to-end проверкой заказов, оплаты, доставки или production-развёртывания.

### Перед запуском в production

1. Восстановите или создайте каталог товаров, категории, CMS-страницы и учётные
   записи администраторов.
2. Завершите секции главной страницы и навигацию; проверьте все ссылки и маршруты.
3. Устраните отсутствующую ссылку на расширение `customBreadcrumbs`.
4. Настройте и проверьте оформление заказа, оплату, налоги, доставку, email и
   юридические страницы.
5. Используйте защищённые production-учётные данные и SSL для PostgreSQL.
6. Проверьте обновления безопасности зависимостей и выполните функциональные и
   end-to-end тесты.

---

## English

ProjectX is a prototype storefront built with [EverShop](https://evershop.io/).
The repository contains the application source and theme, but no PostgreSQL
backup or store data.

> **Status: MVP / source backup.** The app has been built and started
> successfully, but it is not production-ready. The catalog, CMS content,
> checkout configuration, and deployment settings need review before launch.

### Features

- EverShop 1.2.2 storefront foundation;
- custom Eve theme and ProjectX visual assets;
- storefront, cart, and navigation components;
- default RUB currency configuration;
- EverShop administration panel.

### Limitations

- **No database dump or seed data is included.** A fresh PostgreSQL database has
  no products, categories, CMS pages, admin users, or settings from the previous
  environment.
- The previous environment's data (four sample products and three categories)
  is not part of this repository and is not restored by `npm ci` or
  `npm run setup`.
- The homepage's featured-category, featured-product, and desktop-menu
  components are empty or incomplete. Mobile navigation contains CMS links.
- Links such as `/page/aboutus` need matching CMS pages. Without them, the route
  returns 404.
- `evershop.config.js` references `extensions/customBreadcrumbs`, but no
  extension source is tracked here. Confirm whether it is needed and add its
  source or remove the reference before deployment.
- Payment, email, shipping, tax, domain, and production security settings are
  not configured here.

### Technology stack

- Node.js and npm;
- EverShop 1.2.2;
- React;
- PostgreSQL;
- Express and GraphQL;
- SCSS, Tailwind CSS, and Webpack.

### Requirements

- Node.js 18 or newer (the project was previously built with Node.js 24);
- npm;
- PostgreSQL 14 or newer.

Docker can be used to run PostgreSQL locally.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Hardcore-lab/ProjectX.git
   cd ProjectX
   ```

2. Install the exact dependencies from the lockfile:

   ```bash
   npm ci
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Start PostgreSQL and create the database and user specified in `.env`.

   Example Docker command:

   ```bash
   docker run -d \
     --name projectx-postgres \
     -e POSTGRES_DB=projectx \
     -e POSTGRES_USER=projectx \
     -e POSTGRES_PASSWORD=change-me \
     -p 5432:5432 \
     postgres:16-alpine
   ```

   The example values must match `.env`. For a local database, set
   `DB_HOST=localhost`. For Docker Compose, use the PostgreSQL service name as
   `DB_HOST`.

5. Initialize EverShop and the database schema:

   ```bash
   npm run setup
   ```

   This initializes the application; it does **not** restore the previous
   catalog or CMS content.

6. Build and start the storefront:

   ```bash
   npm run build
   npm start
   ```

   Open `http://localhost:4000`.

### npm commands

| Command | Purpose |
| --- | --- |
| `npm run setup` | Initialize EverShop and database settings |
| `npm run build` | Compile client and server bundles into `.evershop/` |
| `npm start` | Start the production server |
| `npm run dev` | Start the development server |
| `npm run start:debug` | Start EverShop with debug logging |
| `npm run user:create` | Create an EverShop admin user |
| `npm run user:changePassword` | Change an admin user's password |

The admin interface is available at `/admin`. Create an administrator with
`npm run user:create` after database initialization.

### Project structure

```text
.
├── config/
│   └── default.json              # EverShop defaults and RUB currency
├── themes/eve/
│   ├── components/               # Storefront component overrides
│   ├── css/                      # Global theme styles
│   ├── pages/
│   │   ├── all/                  # Shared layout, logo, navigation, and footer
│   │   └── homepage/             # Homepage components
│   └── public/                   # Images and static assets
├── evershop.config.js            # Theme and module configuration
├── package.json                  # Scripts and direct dependencies
├── package-lock.json             # Locked dependency versions
└── .env.example                  # Environment variable template
```

`node_modules/`, `.evershop/`, and the local `.env` file are excluded from Git.
Dependencies and build output are created locally during installation and build.

### Store configuration

EverShop defaults are in `config/default.json`. Theme and module settings are in
`evershop.config.js`.

The default currency is RUB with the ₽ symbol. This does not mean the catalog,
taxes, or payment methods are configured.

### Database configuration

Copy `.env.example` to `.env` and set the PostgreSQL connection values:

| Variable | Purpose | Example |
| --- | --- | --- |
| `DB_HOST` | PostgreSQL hostname | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `projectx` |
| `DB_USER` | Database user | `projectx` |
| `DB_PASSWORD` | Database password | Set a private value locally |
| `DB_SSLMODE` | PostgreSQL SSL mode | `disable` for local development |
| `PORT` | Application HTTP port | `4000` |

Never commit real credentials, API keys, payment secrets, or production `.env`
files.

### Theme development

The custom theme is located in `themes/eve/`:

- `themes/eve/pages/all/` — shared layout, logo, navigation, and footer;
- `themes/eve/pages/homepage/` — homepage sections;
- `themes/eve/components/` — storefront component overrides;
- `themes/eve/css/` — global styles;
- `themes/eve/public/` — images and static assets.

### Previous verification

In a previous GitHub Codespace verification with PostgreSQL 16:

- `npm ci` completed successfully;
- `npm run build` compiled both client and server bundles;
- the server started and the homepage returned HTTP 200;
- the cart page rendered but was empty;
- `/shop` and `/page/aboutus` returned 404 because the database had no content.

These results confirm that the source can build and run with a configured
database. They do not constitute end-to-end testing of orders, payments,
shipping, or production deployment.

### Before production

1. Restore or create the product catalog, categories, CMS pages, and admin
   accounts.
2. Complete the homepage sections and navigation; verify every link and route.
3. Resolve the missing `customBreadcrumbs` extension reference.
4. Configure and test checkout, payment, taxes, shipping, email, and legal pages.
5. Use secure production credentials and PostgreSQL SSL settings.
6. Review dependency security advisories and run functional and end-to-end tests.
