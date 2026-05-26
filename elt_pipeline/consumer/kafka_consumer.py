from kafka import KafkaConsumer
import json
import time
from kafka.errors import NoBrokersAvailable

from elt_pipeline.consumer.config import KAFKA_BROKER, GROUP_ID
from elt_pipeline.consumer.event_parse import parse_event
from elt_pipeline.router.table_router import TableRouter
from elt_pipeline.utils.logger import get_logger
from elt_pipeline.utils.loader import load_to_target
from elt_pipeline.core.schema_resolver import SchemaResolver
from elt_pipeline.core.tenant_repository import TenantRepository
from elt_pipeline.core.db import conn

logger = get_logger("ELT_CONSUMER")



def create_consumer():
    while True:
        try:
            logger.info(" Connecting to Kafka")

            consumer = KafkaConsumer(
                bootstrap_servers=KAFKA_BROKER,
                group_id=GROUP_ID,
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                value_deserializer=lambda x: json.loads(x.decode("utf-8")) if x is not None else None,
            )

           
            consumer.subscribe(pattern=r"dbserver1\..*\..*")

            logger.info("Connected to Kafka!")
            return consumer

        except NoBrokersAvailable:
            logger.error(" Kafka not ready, retrying in 5 seconds")
            time.sleep(5)



class KafkaELTConsumer:

    def __init__(self):
        self.consumer = create_consumer()

        self.router = TableRouter()

        tenant_repo = TenantRepository(conn)
        self.schema_resolver = SchemaResolver(tenant_repo)

 
    def safe_transform(self, transformer, event):
        try:
            if not transformer:
                return None

            if not hasattr(transformer, "transform"):
                logger.error(f" Transformer missing 'transform()': {type(transformer)}")
                return None

            return transformer.transform(event)

        except Exception as e:
            logger.error(f" Transform failed: {str(e)}")
            return None

  
    def start(self):

        logger.info(" ELT Consumer Started...")

        for message in self.consumer:

            try:
                raw_event = message.value
                topic = message.topic

                logger.info(f"Topic: {topic}")
                logger.info(f" Raw Event Received")

            
                event = parse_event(raw_event)

                if not event:
                    logger.warning(" Skipping invalid event")
                    continue

                
                schema, table = self.schema_resolver.extract(topic)

                if not schema or not table:
                    logger.warning(f"Invalid topic format: {topic}")
                    continue

                if not self.schema_resolver.is_valid_tenant(schema):
                    logger.warning(f" Unregistered or invalid tenant schema: {schema}")
                    continue

                event["schema"] = schema
                event["table"] = table

                logger.info(f" Parsed Event: {event}")

                
                transformer = self.router.route(event)

                if not transformer:
                    logger.warning(f" No transformer found for {table}")
                    continue

                
                transformed = self.safe_transform(transformer, event)

                if not transformed:
                    logger.warning("Transformation returned empty result")
                    continue

                logger.info(f"⚡ Transformed Data: {transformed}")

                
                load_to_target(event["schema"], event["table"], transformed)

                print("\nFINAL OUTPUT →", transformed)

            except Exception as e:
                logger.error(f" Consumer loop error: {str(e)}")
                continue


if __name__ == "__main__":
    print("Starting ELT Consumer...")

    consumer = KafkaELTConsumer()
    consumer.start()