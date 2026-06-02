from elt_pipeline.transformers.production import ProductionTransformer
from elt_pipeline.transformers.factory import FactoryTransformer
from elt_pipeline.transformers.machine import MachineTransformer
from elt_pipeline.transformers.material import MaterialTransformer
from elt_pipeline.transformers.material_transaction import MaterialTransactionTransformer
from elt_pipeline.transformers.worker import WorkerTransformer
from elt_pipeline.transformers.production_team import ProductionTeamTransformer

TRANSFORMER_REGISTRY = {
    "factories": FactoryTransformer,
    "production": ProductionTransformer,
    "machines": MachineTransformer,
    "factory_materials": MaterialTransformer,
    "factory_material_transactions": MaterialTransactionTransformer,
    "workers": WorkerTransformer,
    "production_team": ProductionTeamTransformer,
}