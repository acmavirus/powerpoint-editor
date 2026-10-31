FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install headless LibreOffice, metric-compatible MS fonts, Google Noto & Roboto fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-impress \
    libreoffice-common \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-noto-core \
    fonts-noto-cjk \
    fonts-noto-ui-core \
    fonts-croscore \
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    fonts-roboto \
    fontconfig \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/storage/uploads /app/storage/outputs /app/storage/samples /usr/local/share/fonts/embedded_fonts

EXPOSE 9031

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9031"]
