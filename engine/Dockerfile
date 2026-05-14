FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml /app/
# Usually we'd use pip install . but since we want dev dependencies or simple setup:
RUN pip install setuptools && pip install --no-cache-dir -e .

COPY . /app/

# Expose FastAPI port
EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
