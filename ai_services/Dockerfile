# Use the slim version to ensure /bin/sh is available
FROM python:3.12-slim

# Set environment variables to avoid Python buffering logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Upgrade pip first to handle complex dependencies better
RUN pip install --no-cache-dir --upgrade pip

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Expose the AI microservice port
EXPOSE 8001

# Start the server directly (this is safer than using --reload in production)
CMD ["uvicorn", "ai_app.main:app", "--host", "0.0.0.0", "--port", "8001"]