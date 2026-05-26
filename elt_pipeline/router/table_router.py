from elt_pipeline.router.registry import TRANSFORMER_REGISTRY

class TableRouter:

    def route(self, event):
        table = event.get("table")
        schema = event.get("schema")

        if not table:
            return None

        transformer_class = TRANSFORMER_REGISTRY.get(table)

        if not transformer_class:
            return None

   
        return transformer_class()