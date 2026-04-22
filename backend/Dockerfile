# ─── Stage 1: builder ───────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps into a prefix
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# ─── Stage 2: runtime ───────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Create /data directory for SQLite volume mount
RUN mkdir -p /data

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app /data
USER appuser

ENV FLASK_ENV=production
ENV PORT=5000

EXPOSE 5000

# Run with Gunicorn — 2 workers, 120s timeout for long sync requests
CMD ["gunicorn", "run:app", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
