FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including ffmpeg for audio processing
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create uploads and static directories
RUN mkdir -p uploads static

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 