FROM python:3.12-slim

RUN pip install uv

WORKDIR /app
COPY backend/ .

RUN uv sync --frozen && uv cache prune --ci

ENV PORT=8000
EXPOSE 8000

CMD uv run uvicorn src.main:app --host 0.0.0.0 --port $PORT
