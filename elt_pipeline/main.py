from elt_pipeline.consumer.kafka_consumer import KafkaELTConsumer


if __name__ == "__main__":
    consumer = KafkaELTConsumer()
    consumer.start()
