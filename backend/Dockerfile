# Example backend Dockerfile snippet
FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# copy wait script early so we can run it as the container command
COPY wait-for-it.sh .
RUN chmod +x wait-for-it.sh

# Install system packages required to build/ install large Python packages
# (prevents pip from compiling many packages from source and reduces memory use)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    cmake \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools and wheel
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install CPU-only PyTorch *before* installing the rest of the requirements.
# This prevents pip from selecting large CUDA-enabled wheels (nvidia-*) when
# ultralytics or other ML packages are installed.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
    torch torchvision --timeout 1000

# Copy Python requirements (note: ultralytics removed from requirements.txt)
COPY requirements.txt .

# Install remaining Python dependencies
RUN pip install --no-cache-dir -r requirements.txt --timeout 1000

# Install ultralytics separately now that a compatible torch is present.
# Pin version to match the previous setup; if you prefer a different version,
# update the version here or put it back into requirements.txt and remove this line.
RUN pip install --no-cache-dir ultralytics==8.3.74 --timeout 1000

CMD ["./wait-for-it.sh", "db:5432", "--", "gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
