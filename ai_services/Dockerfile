# ai_services/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the AI code
COPY . .

# Expose the AI microservice port
EXPOSE 8001

# Run the AI server
CMD ["uvicorn", "ai_app.main:app", "--host", "0.0.0.0", "--port", "8001"]