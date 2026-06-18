FROM python:3.12-slim

RUN pip install uv

WORKDIR /app
COPY . .

RUN uv sync --frozen && uv cache prune --ci

EXPOSE 8000

CMD uv run uvicorn --app-dir backend src.main:app --host 0.0.0.0 --port ${PORT:-8000}
