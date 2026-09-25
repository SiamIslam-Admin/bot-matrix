FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libjpeg-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p storage storage/captcha
ENV HOST=0.0.0.0 PORT=8000 RELOAD=false PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "run.py"]
