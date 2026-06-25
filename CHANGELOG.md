# Changelog

Все значимые изменения этого проекта будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

### Добавлено

- Документация: `README.md`, `backend/README.md`, `frontend/README.md`
- Документация: `CONTRIBUTING.md`, `CHANGELOG.md`
- `.env.example` файлы для backend и frontend
- Улучшен `.gitignore` (исключены БД, .env, IDE-файлы)

### Изменено

- Удалены отслеживаемые `.env` файлы из git
- Удалены отслеживаемые SQLite БД (`ponies.db`, `backend/ponies.db`) из git

## [0.1.0] — 2024-06-18

### Добавлено

- Базовая архитектура FastAPI + SQLAlchemy backend
- React 19 + Vite frontend
- CRUD для wishlists, wishes, todos
- Система приглашений через токены
- Аутентификация через Telegram WebApp initData
- Rate limiting (100 req/min per IP)
- Базовые тесты pytest
- Pre-commit hooks (ruff, pre-commit-hooks)
