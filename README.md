# Dancing Ponies — Telegram Mini App

> Совместные списки желаний и задач прямо в Telegram.

## О проекте

**Dancing Ponies** — это Telegram Mini App для создания и совместного использования списков желаний (wishlists) и списков задач (todolists). Пользователи аутентифицируются через Telegram WebApp, создают списки, добавляют элементы, приглашают других участников и отслеживают выполнение.

## Архитектура

```bash
┌─────────────┐      HTTP/REST       ┌─────────────┐
│   Frontend  │ ◄──────────────────► │   Backend   │
│  (React 19) │                      │  (FastAPI)  │
│   Telegram  │                      │   SQLite    │
│  Mini App   │                      │             │
└─────────────┘                      └─────────────┘
```

## Структура репозитория

```bash
.
├── backend/          # FastAPI + SQLAlchemy backend
│   ├── src/          # Исходный код
│   ├── tests/        # Тесты (pytest)
│   ├── .env.example  # Шаблон переменных окружения
│   └── requirements.txt
├── frontend/         # React 19 + Vite frontend
│   ├── src/          # Исходный код
│   ├── public/       # Статические файлы
│   ├── .env.example  # Шаблон переменных окружения
│   └── package.json
├── .gitignore
├── pyproject.toml    # Python проект (uv)
├── .pre-commit-config.yaml
├── LICENSE           # MIT
└── README.md         # Этот файл
```

## Быстрый старт

### Требования

- Python 3.13+
- Node.js 20+
- [uv](https://docs.astral.sh/uv/) (для Python зависимостей)

### Backend

```bash
cd backend
# Создать .env по шаблону .env.example
# Установить зависимости
uv sync
# Применить миграции БД
alembic upgrade head
# Запустить
uvicorn src.main:app --reload --host 0.0.0.0 --port 55555
```

### Frontend

```bash
cd frontend
npm install
# Создать .env по шаблону .env.example
npm run dev
```

### Линтинг и форматирование

**Backend:**

```bash
cd backend
ruff check . --fix
ruff format .
```

**Frontend:**

```bash
cd frontend
npm run check
npm run lint
```

## Основные возможности

- Создание и управление списками желаний и задач
- Совместный доступ через приглашения
- Загрузка фотографий к желаниям (сжатие до 550×550)
- Аутентификация через Telegram WebApp
- Каскадное удаление элементов при удалении списка

## Документация

- [Backend](./backend/README.md) — API, модели, аутентификация, миграции
- [Frontend](./frontend/README.md) — архитектура, компоненты, роутинг

## Лицензия

[MIT](./LICENSE)
