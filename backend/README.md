# Dancing Ponies — Backend

> FastAPI + SQLAlchemy backend для Telegram Mini App.

## Технологический стек

| Компонент | Технология |
| ----------- | ----------- |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (DeclarativeBase, Mapped/mapped_column) |
| База данных | SQLite (файловая) |
| Валидация | Pydantic v2 |
| Аутентификация | Telegram WebApp initData (`telegram-webapp-auth`) |
| Логирование | loguru |
| Тестирование | pytest + TestClient |
| Линтинг | ruff |

## Структура проекта

```bash
backend/
├── src/
│   ├── main.py           # Точка входа FastAPI, middleware, rate limiting
│   ├── config.py         # Загрузка .env конфигурации
│   ├── database.py       # SQLAlchemy engine, session, Base
│   ├── auth.py           # Аутентификация через Telegram WebApp
│   ├── models.py         # ORM модели
│   ├── routers/
│   │   ├── wishlists.py  # CRUD списков + nested routes
│   │   ├── wishes.py     # CRUD желаний
│   │   ├── todos.py      # CRUD задач
│   │   └── invites.py    # Приглашения
│   └── schemas/
│       ├── wishlists.py  # Pydantic схемы списков
│       ├── wishes.py     # Pydantic схемы желаний
│       ├── todos.py      # Pydantic схемы задач
│       └── invites.py    # Pydantic схемы приглашений
├── tests/
│   └── test_wishlists.py # Базовые тесты списков
├── .env.example          # Шаблон переменных окружения
├── requirements.txt      # Зависимости (pip)
└── Procfile              # Heroku deployment
```

## Конфигурация

Создайте файл `.env` в директории `backend/` по шаблону `.env.example`:

```bash
BD_PATH="./dancing_ponies.db"   # Путь к SQLite БД
DEBUG=false                     # Режим отладки
BOT_TOKEN="your_bot_token"      # Токен Telegram бота
```

### Режим отладки (DEBUG=true)

При `DEBUG=true` аутентификация упрощается: вместо валидации Telegram initData, заголовок `x-init-data` принимается как raw user ID. Пользователь создаётся с `first_name="Dev"`, `username="devuser"`. **Никогда не включайте в production!**

## Запуск

```bash
cd backend

# Через uv (рекомендуется)
uv sync
uvicorn src.main:app --reload --host 0.0.0.0 --port 55555

# Через pip
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 55555

# Heroku
# web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

## API Endpoints

### Wishlists (`/wishlists`)

| Method | Endpoint | Auth | Описание |
| -------- | ---------- | ------ | ---------- |
| `GET` | `/` | ✅ | Список всех списков, где пользователь — владелец или участник |
| `POST` | `/` | ✅ | Создать новый список |
| `GET` | `/{id}` | ✅ | Получить конкретный список |
| `PATCH` | `/{id}` | ✅ | Обновить список (только владелец) |
| `DELETE` | `/{id}` | ✅ | Удалить список + каскадное удаление элементов (только владелец) |
| `DELETE` | `/{id}/members/{user_id}` | ✅ | Исключить участника (только владелец) |
| `POST` | `/{id}/invite` | ❌ | Сгенерировать токен приглашения |
| `GET` | `/{id}/wishes` | ✅ | Список желаний в списке |
| `POST` | `/{id}/wishes` | ✅ | Добавить желание |
| `GET` | `/{id}/todos` | ✅ | Список задач в списке |
| `POST` | `/{id}/todos` | ✅ | Добавить задачу |

### Wishes (`/wishes`)

| Method | Endpoint | Auth | Описание |
| -------- | ---------- | ------ | ---------- |
| `GET` | `/{wish_id}` | ✅ | Получить желание |
| `DELETE` | `/{wish_id}` | ✅ | Удалить желание |
| `PATCH` | `/{wish_id}` | ✅ | Обновить желание (title, description, price, url) |
| `PATCH` | `/{wish_id}/complete` | ✅ | Переключить `is_completed` |

### Todos (`/todos`)

| Method | Endpoint | Auth | Описание |
| -------- | ---------- | ------ | ---------- |
| `GET` | `/{todo_id}` | ✅ | Получить задачу |
| `DELETE` | `/{todo_id}` | ✅ | Удалить задачу |
| `PATCH` | `/{todo_id}` | ✅ | Обновить задачу (title, description, due_date, priority) |
| `PATCH` | `/{todo_id}/complete` | ✅ | Переключить `is_completed` |

### Invites (`/invites`)

| Method | Endpoint | Auth | Описание |
| -------- | ---------- | ------ | ---------- |
| `POST` | `/{token}/accept` | ✅ | Принять приглашение, стать участником |

### Аутентификация

Все защищённые endpoints требуют заголовок:

```bash
x-init-data: <Telegram WebApp initData>
```

В production данные валидируются через `telegram-webapp-auth` с окном 5 минут.

## Модели данных

### User

- `id` (PK) — Telegram user ID
- `first_name` — имя
- `username` — username (nullable)

### WishList

- `id` (PK)
- `title` — название
- `list_type` — `wishlist` или `todolist`
- `owner_id` (FK → User) — владелец
- `members` (M2M) — участники
- `created_at` — дата создания
- `emoji` — эмодзи-иконка

### Wish

- `id` (PK)
- `wishlist_id` (FK → WishList)
- `title` — название
- `description` — описание (nullable)
- `url` — ссылка (nullable)
- `price` — цена в ₽ (nullable)
- `is_completed` — выполнено ли

### TodoItem

- `id` (PK)
- `todolist_id` (FK → WishList)
- `title` — название
- `description` — описание (nullable)
- `is_completed` — выполнено ли
- `due_date` — срок (nullable)
- `priority` — приоритет (default: 0)

### Invite

- `id` (PK)
- `wishlist_id` (FK → WishList)
- `token` — токен приглашения
- `created_at` — дата создания

## Безопасность

- **CORS**: `allow_origins=["*"]` (для Telegram Mini App)
- **Rate limiting**: 100 запросов на IP за 60 секунд (sliding window)
- **Access control**: Проверка владельца/участника на каждом endpoint
- **Токены приглашений**: `secrets.token_urlsafe(16)`, автоочистка старше 90 дней

## Тестирование

```bash
cd backend
pytest
```

> ⚠️ Текущие тесты требуют `DEBUG=true` или bypass аутентификации, так как не передают `x-init-data`.

## Деплой

### Heroku

```bash
git push heroku main
```

Procfile уже настроен: `web: uvicorn src.main:app --host 0.0.0.0 --port $PORT`

### Другие платформы

Убедитесь, что:

1. Установлены зависимости из `requirements.txt` или `pyproject.toml`
2. Переменные окружения заданы
3. БД путь доступен для записи

## Линтинг

```bash
ruff check . --fix
ruff format .
```
