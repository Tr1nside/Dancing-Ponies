# Dancing Ponies — Frontend

> React 19 + Vite frontend для Telegram Mini App.

## Технологический стек

| Компонент | Технология |
| ----------- | ----------- |
| Framework | React 19 |
| Router | React Router DOM 7 |
| Build Tool | Vite 8 |
| Language | TypeScript 6 (strict) |
| Styling | Pure CSS (Telegram theme variables) |
| HTTP | Axios |
| Telegram SDK | `@telegram-apps/sdk` v2.11.3 |
| Linting | Biome (primary) + ESLint (secondary) |
| Debug | `eruda` (mobile console) |

## Структура проекта

```bash
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts       # Axios instance с auth header
│   │   ├── wishlists.ts    # API списков
│   │   ├── wishes.ts       # API желаний
│   │   └── todos.ts        # API задач
│   ├── components/
│   │   ├── BackButton.tsx     # Кнопка назад
│   │   ├── DropdownMenu.tsx   # Выпадающее меню действий
│   │   ├── MembersPanel.tsx   # Панель участников + приглашения
│   │   ├── TodoCard.tsx       # Карточка задачи
│   │   └── WishCard.tsx       # Карточка желания
│   ├── pages/
│   │   ├── WishlistsPage.tsx  # Главная: все списки
│   │   ├── WishesPage.tsx     # Список желаний
│   │   ├── TodosPage.tsx      # Список задач
│   │   ├── WishPage.tsx       # Детальная страница желания
│   │   ├── TodoPage.tsx       # Детальная страница задачи
│   │   └── InvitePage.tsx     # Принятие приглашения
│   ├── types/
│   │   └── index.ts        # Все TypeScript типы
│   ├── App.tsx             # Роутер + обработка Telegram startParam
│   ├── main.tsx            # Точка входа (Telegram SDK init)
│   └── index.css           # Все стили (~600 строк)
├── public/                 # Статические файлы
├── .env.example            # Шаблон переменных окружения
├── vite.config.ts          # Конфиг Vite
├── tsconfig.json           # TypeScript (project references)
├── tsconfig.app.json       # TS config для приложения
├── tsconfig.node.json      # TS config для Vite config
├── biome.json              # Конфиг Biome
├── eslint.config.js        # Конфиг ESLint
└── package.json
```

## Конфигурация

Создайте файл `.env` в директории `frontend/` по шаблону `.env.example`:

```bash
VITE_API_URL=http://localhost:55555      # URL backend API
VITE_BOT_USERNAME=@your_bot_username     # Username бота для deep links
VITE_DEBUG=true                          # Режим отладки (без Telegram SDK)
```

Для локальной разработки также создайте `.env.local`:

```bash
VITE_DEV_INIT_DATA=123456                # Fallback user ID для debug
VITE_DEBUG_START_PARAM=                  # Fallback invite token для debug
```

### Режим отладки (VITE_DEBUG=true)

При `VITE_DEBUG=true`:

- Telegram SDK не инициализируется
- `initData` берётся из `VITE_DEV_INIT_DATA`
- `startParam` берётся из `VITE_DEBUG_START_PARAM`

**Никогда не включайте в production!**

## Запуск

```bash
cd frontend
npm install

# Режим разработки
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## Скрипты

| Скрипт | Описание |
| -------- | ---------- |
| `npm run dev` | Запуск dev-сервера Vite |
| `npm run build` | Сборка production (`tsc -b && vite build`) |
| `npm run preview` | Предпросмотр production сборки |
| `npm run format` | Форматирование Biome |
| `npm run lint` | Линтинг Biome |
| `npm run check` | Формат + линт + организация импортов (Biome) |
| `npm run eslint` | Линтинг ESLint (дополнительно) |

## Роутинг

| Route | Компонент | Описание |
| ------- | ----------- | ---------- |
| `/` | `WishlistsPage` | Главная: все списки |
| `/invite/:token` | `InvitePage` | Принятие приглашения |
| `/wishlists/:wishlistId/wishes` | `WishesPage` | Желания в списке |
| `/wishlists/:wishlistId/todos` | `TodosPage` | Задачи в списке |
| `/wishes/:wishId` | `WishPage` | Детальная страница желания |
| `/todos/:todoId` | `TodoPage` | Детальная страница задачи |

### Telegram Deep Links

При запуске через Telegram с параметром `startapp={token}`:

1. `App.tsx` считывает `retrieveLaunchParams().startParam`
2. Пользователь редиректится на `/invite/{token}`
3. `InvitePage` вызывает `acceptInvite(token)` и показывает результат

Формат пригласительной ссылки:

```bash
https://t.me/{BOT_USERNAME}?startapp={token}
```

## Архитектура API слоя

### client.ts

Axios instance с:

- `baseURL` из `VITE_API_URL`
- Заголовком `x-init-data` из `window.Telegram.WebApp.initData` или `VITE_DEV_INIT_DATA`

### wishlists.ts

```typescript
getWishlists()          // GET /wishlists/
createWishlist(data)    // POST /wishlists/
getWishlist(id)         // GET /wishlists/{id}
updateWishlist(id, data) // PATCH /wishlists/{id}
deleteWishlist(id)      // DELETE /wishlists/{id}
createInvite(id)        // POST /wishlists/{id}/invite → возвращает t.me ссылку
acceptInvite(token)     // POST /invites/{token}/accept
kickMember(listId, userId) // DELETE /wishlists/{listId}/members/{userId}
```

### wishes.ts

```typescript
getWishes(listId)       // GET /wishlists/{listId}/wishes
getWish(id)             // GET /wishes/{id}
createWish(data)        // POST /wishlists/{data.wishlist_id}/wishes
updateWish(id, data)    // PATCH /wishes/{id}
handleWishComplete(id, data) // PATCH /wishes/{id}/complete
deleteWish(id)          // DELETE /wishes/{id}
```

### todos.ts

```typescript
getTodos(listId)        // GET /wishlists/{listId}/todos
getTodo(id)             // GET /todos/{id}
createTodo(data)        // POST /wishlists/{data.todolist_id}/todos
updateTodo(id, data)    // PATCH /todos/{id}
handleTodoComplete(id, data) // PATCH /todos/{id}/complete
deleteTodo(id)          // DELETE /todos/{id}
```

## Компоненты

### BackButton

SVG-стрелка назад. Навигация через `useNavigate()`.

### DropdownMenu

Три вертикальные точки → выпадающее меню. Закрывается по клику вне. Поддерживает условные пункты меню (фильтруются через `.filter(Boolean)`).

### MembersPanel

- Показывает владельца и список участников
- Генерация пригласительной ссылки (через `createInvite`)
- Владелец может исключать участников
- Отображается в модальном bottom sheet

### WishCard

- Чекбокс выполнения (оптимистичное обновление)
- Название + цена (₽)
- Меню удаления
- Клик → переход на `/wishes/{id}`

### TodoCard

- Чекбокс выполнения (оптимистичное обновление)
- Название
- Меню удаления
- Клик → переход на `/todos/{id}`

## Страницы

### WishlistsPage (главная)

- Форма создания списка (title, emoji, тип: wishlist/todolist)
- Список всех списков карточками
- Владелец может удалять свои списки
- Клик на карточку → переход к wishes/todos

### WishesPage / TodosPage

- Шапка с эмодзи, названием, меню
- **Management modal**: редактирование title/emoji (владелец), панель участников, приглашение
- Форма создания элемента
- Список карточек

### WishPage

- Редактируемые поля: title, description, price, URL
- Кнопка "Купить" (открывает URL)
- Переключение выполнения
- Режим редактирования через dropdown

### TodoPage

- Аналогично WishPage, но без price/URL
- Редактируемые: title, description

### InvitePage

- Принимает token из URL
- Вызывает `acceptInvite(token)`
- Успех: "Вас добавили в список!" + кнопка перехода
- Ошибка: "Ссылка недействительна или вы уже участник"

## Типы данных

Основные типы определены в `src/types/index.ts`:

```typescript
type ListType = "wishlist" | "todolist";

type User = {
  id: number;
  first_name: string;
  username: string | null;
};

type Wishlist = {
  id: number;
  title: string;
  emoji: string;
  list_type: ListType;
  owner_id: number;
  owner: User;
  created_at: string;
  members: User[];
};

type Wish = {
  id: number;
  title: string;
  wishlist_id: number;
  description: string | null;
  url: string | null;
  price: number | null;
  is_completed: boolean;
};

type Todo = {
  id: number;
  todolist_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  priority: number;
};
```

## Стили

Все стили в едином файле `index.css` (~600 строк). Особенности:

- **Telegram-native look** через CSS-переменные (`--tg-theme-*`)
- **Neumorphism**: inset/outset box-shadows на карточках
- **Mobile-first**: `max-width: 600px`, центрированный контейнер
- **Кастомный чекбокс** с SVG-галочкой
- **Modal bottom sheet** для панели участников

## Паттерны

### Оптимистичные обновления

UI обновляется сразу, откатывается при ошибке API:

```typescript
const handleComplete = async () => {
  const updated = { ...todo, is_completed: !todo.is_completed };
  setTodo(updated); // оптимистичное обновление
  try {
    await handleTodoComplete(todo.id, { is_completed: updated.is_completed });
  } catch {
    setTodo(todo); // откат при ошибке
  }
};
```

### Определение текущего пользователя

```typescript
let currentUserId = 0;
try {
  const { initData } = retrieveLaunchParams();
  currentUserId = initData?.user?.id ?? 0;
} catch {
  currentUserId = Number(import.meta.env.VITE_DEV_INIT_DATA);
}
const isOwner = wishlist?.owner_id === currentUserId;
```

## Деплой

### Сборка

```bash
npm run build
```

Результат в `frontend/dist/` — статические файлы для раздачи через любой веб-сервер.

### Telegram Mini App

1. Загрузите содержимое `dist/` на CDN / статический хостинг
2. В @BotFather настройте Mini App URL: `/setminiapp`
3. Укажите URL собранного фронтенда

## Известные ограничения

- Нет Error Boundaries — любая необработанная ошибка падает на страницу
- Нет loading skeletons — просто текст "Загрузка..."
- Нет пагинации — все списки загружаются целиком
- Смешанные языки в UI (русский + английский)
- Валюта жёстко задана как ₽ (рубль)
