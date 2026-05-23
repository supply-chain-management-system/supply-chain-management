FROM python:3.11-slim

WORKDIR /app

# copy ONLY required dependency file
COPY elt_pipeline/requirements.txt requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-m", "elt_pipeline.consumer.kafka_consumer"]