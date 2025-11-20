FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Copy and fix wait-for-it early
COPY wait-for-it.sh .
RUN sed -i 's/\r$//' wait-for-it.sh && chmod +x wait-for-it.sh

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    cmake \
    bash \
    netcat-openbsd \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install CPU torch
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
    torch torchvision --timeout 1000

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --timeout 1000

RUN pip install --no-cache-dir ultralytics==8.3.74 --timeout 1000

# REMOVE CMD (handled by docker-compose)
