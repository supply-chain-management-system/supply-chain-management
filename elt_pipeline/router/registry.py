from elt_pipeline.transformers.production import ProductionTransformer
from elt_pipeline.transformers.factory import FactoryTransformer
from elt_pipeline.transformers.machine import MachineTransformer
from elt_pipeline.transformers.material import MaterialTransformer
from elt_pipeline.transformers.material_transaction import MaterialTransactionTransformer
from elt_pipeline.transformers.worker import WorkerTransformer
from elt_pipeline.transformers.production_team import ProductionTeamTransformer
from elt_pipeline.transformers.warehouse import WarehouseTransformer
from elt_pipeline.transformers.rack import RackTransformer
from elt_pipeline.transformers.product import ProductTransformer
from elt_pipeline.transformers.inventory_ware import InventoryWareTransformer
from elt_pipeline.transformers.logistics_vehicle import LogisticsVehicleTransformer
from elt_pipeline.transformers.logistics_shipment import LogisticsShipmentTransformer
from elt_pipeline.transformers.logistics_activity import LogisticsActivityTransformer
from elt_pipeline.transformers.supplier import (
    SupplierTransformer,
    RawMaterialInventoryTransformer,
    PurchaseOrderTransformer,
)

TRANSFORMER_REGISTRY = {
    "factories": FactoryTransformer,
    "production": ProductionTransformer,
    "machines": MachineTransformer,
    "factory_materials": MaterialTransformer,
    "factory_material_transactions": MaterialTransactionTransformer,
    "workers": WorkerTransformer,
    "production_team": ProductionTeamTransformer,
    "warehouses": WarehouseTransformer,
    "racks": RackTransformer,
    "products": ProductTransformer,
    "inventory_ware": InventoryWareTransformer,
    "logistics_vehicles": LogisticsVehicleTransformer,
    "logistics_shipments": LogisticsShipmentTransformer,
    "logistics_activities": LogisticsActivityTransformer,
    "suppliers": SupplierTransformer,
    "raw_material_inventory": RawMaterialInventoryTransformer,
    "purchase_orders": PurchaseOrderTransformer,
}