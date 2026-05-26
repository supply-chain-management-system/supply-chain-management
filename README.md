
```
supply-chain-management
├─ ai_services
│  ├─ ai_app
│  │  ├─ agents
│  │  ├─ api
│  │  │  └─ v1
│  │  │     └─ routes
│  │  │        ├─ business_manager
│  │  │        │  └─ bm_routes.py
│  │  │        └─ factory_manager
│  │  │           └─ factory_routes.py
│  │  ├─ core
│  │  ├─ databases
│  │  │  └─ database.py
│  │  ├─ main.py
│  │  ├─ prompt
│  │  │  └─ factory_manager
│  │  │     └─ doc_prompt.py
│  │  ├─ prompts
│  │  ├─ schemas
│  │  │  ├─ business_manager
│  │  │  │  └─ bm_schemas.py
│  │  │  └─ factory_manager
│  │  │     └─ factory_schema.py
│  │  ├─ services
│  │  ├─ tests
│  │  ├─ tools
│  │  │  ├─ business_manager
│  │  │  │  └─ bm_tools.py
│  │  │  └─ factory_manager
│  │  │     └─ production_doc.py
│  │  ├─ utils
│  │  ├─ workers
│  │  └─ workflows
│  │     └─ business_manager
│  │        └─ bm_graph.py
│  ├─ Dockerfile
│  └─ requirements.txt
├─ client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  └─ api.jsx
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ common
│  │  │  │  └─ button.jsx
│  │  │  └─ layout
│  │  │     └─ landing_page.jsx
│  │  ├─ features
│  │  │  ├─ admin_front
│  │  │  │  ├─ admin_layout
│  │  │  │  │  └─ A_Layout.jsx
│  │  │  │  └─ admin_pages
│  │  │  │     ├─ AddManager.css
│  │  │  │     ├─ AddManager.jsx
│  │  │  │     ├─ Admin_dashboard.jsx
│  │  │  │     ├─ Admin_managers.jsx
│  │  │  │     ├─ Admin_Navbar.jsx
│  │  │  │     ├─ BusinessManagerDetails.jsx
│  │  │  │     ├─ business_card.jsx
│  │  │  │     ├─ container-model.jsx
│  │  │  │     ├─ CreateWarehouse.jsx
│  │  │  │     └─ Managers.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ componets
│  │  │  │  │  └─ comp.jsx
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ companyonboard.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ face-verification.jsx
│  │  │  │     ├─ forgot-password.jsx
│  │  │  │     ├─ invitation.jsx
│  │  │  │     ├─ login.jsx
│  │  │  │     ├─ register-face.jsx
│  │  │  │     ├─ reset-password.jsx
│  │  │  │     ├─ signup.jsx
│  │  │  │     └─ verify-email.jsx
│  │  │  ├─ business_manager
│  │  │  │  ├─ components
│  │  │  │  │  ├─ CopilotWidget.jsx
│  │  │  │  │  └─ ProductionDrafts.jsx
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ BusinessManagerLayout.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ DashboardPage.jsx
│  │  │  │     ├─ FactoryPage.jsx
│  │  │  │     ├─ FMAnalyticsPage.jsx
│  │  │  │     ├─ LMAnalyticsPage.jsx
│  │  │  │     ├─ LogisticsPage.jsx
│  │  │  │     ├─ RequestsPage.jsx
│  │  │  │     ├─ SMAnalyticsPage.jsx
│  │  │  │     ├─ SuppliersPage.jsx
│  │  │  │     ├─ SupplyManagerPage.jsx
│  │  │  │     ├─ WarehousePage.jsx
│  │  │  │     └─ WMAnalyticsPage.jsx
│  │  │  ├─ factory_manager
│  │  │  │  ├─ component
│  │  │  │  │  ├─ alert.jsx
│  │  │  │  │  ├─ navbar.jsx
│  │  │  │  │  └─ sidebar.jsx
│  │  │  │  ├─ layout
│  │  │  │  │  └─ dashboarslayout.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ dashboard.jsx
│  │  │  │     ├─ factory_machine.jsx
│  │  │  │     ├─ factory_material.jsx
│  │  │  │     ├─ factory_team.jsx
│  │  │  │     ├─ outputlogs.jsx
│  │  │  │     └─ production_page.jsx
│  │  │  ├─ logistics_manager
│  │  │  │  ├─ LogisticsDashboard.jsx
│  │  │  │  ├─ LogisticsLayout.jsx
│  │  │  │  ├─ LogisticsSidebar.jsx
│  │  │  │  └─ pages
│  │  │  │     └─ LogisticsFleetPage.jsx
│  │  │  ├─ supplier_manager
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ SupplierManagerLayout.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ DashboardPage.jsx
│  │  │  │     ├─ InventoryPage.jsx
│  │  │  │     ├─ OrdersPage.jsx
│  │  │  │     ├─ RequestsPage.jsx
│  │  │  │     ├─ SMAnalyticsPage.jsx
│  │  │  │     └─ SuppliersPage.jsx
│  │  │  ├─ users
│  │  │  │  └─ user.jsx
│  │  │  └─ warehouse_manager
│  │  │     ├─ InventoryPage.jsx
│  │  │     ├─ RackPage.jsx
│  │  │     ├─ StockUpdatePage.jsx
│  │  │     ├─ WarehouseDashboard.jsx
│  │  │     ├─ Wareproducts.jsx
│  │  │     ├─ ware_layout.jsx
│  │  │     └─ ware_navbar.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ protectedroutes
│  │  │  ├─ authenticate_protector.jsx
│  │  │  └─ block_public_pages.jsx
│  │  └─ redux
│  │     ├─ authprovider.jsx
│  │     ├─ authslice.jsx
│  │     ├─ factoryManagerSlice.js
│  │     ├─ inventorySlice.js
│  │     ├─ logisticsDashboardSlice.js
│  │     ├─ logisticsManagerSlice.js
│  │     ├─ orderSlice.js
│  │     ├─ requestsSlice.js
│  │     ├─ store.js
│  │     ├─ supplierSlice.js
│  │     └─ warehouseManagerSlice.js
│  └─ vite.config.js
├─ docker-compose.yml
├─ nginx
│  └─ nginx.conf
├─ package-lock.json
└─ server
   ├─ .dockerignore
   ├─ alembic
   │  ├─ env.py
   │  ├─ README
   │  ├─ script.py.mako
   │  └─ versions
   │     ├─ 04b337de26bd_create_team_managers_table.py
   │     ├─ 1548e982668a_chage_pumainatnce.py
   │     ├─ 199926db8b0e_use_non_native_enum.py
   │     ├─ 1b5a03ee9a45_merge_heads.py
   │     ├─ 1f91c281ece0_sync_factory_base_fix.py
   │     ├─ 36ce455bf70b_add_base_tenant_models.py
   │     ├─ 48f858af26ee_chage_purchase_date_typo.py
   │     ├─ 4c9bc90e5ef2_msg.py
   │     ├─ 63cd5b206da6_message.py
   │     ├─ 6ade91bf0948_sync_factory_base_fix.py
   │     ├─ 761a9435d4ab_adding_new_tables.py
   │     ├─ 76800d95fee9_message.py
   │     ├─ 889ed874465c_create_approvals_table.py
   │     ├─ 8b6a2d4f9c13_vehicle_stand_capacity_fields.py
   │     ├─ 9893232cafdc_merge_multiple_heads.py
   │     ├─ f0ca61c5e4f4_message.py
   │     └─ f3a12d342ed8_initial.py
   ├─ alembic.ini
   ├─ app
   │  ├─ api
   │  │  ├─ v1
   │  │  │  ├─ routes
   │  │  │  │  ├─ admin
   │  │  │  │  │  ├─ admin_pages.py
   │  │  │  │  │  ├─ config.py
   │  │  │  │  │  └─ emailsend.py
   │  │  │  │  ├─ auth
   │  │  │  │  │  ├─ authentication.py
   │  │  │  │  │  ├─ company_auth.py
   │  │  │  │  │  └─ otp.py
   │  │  │  │  ├─ business_manager
   │  │  │  │  │  ├─ dashboard.py
   │  │  │  │  │  ├─ factory_manager.py
   │  │  │  │  │  ├─ logistics_manager.py
   │  │  │  │  │  ├─ supply_manager.py
   │  │  │  │  │  ├─ team.py
   │  │  │  │  │  ├─ warehouse_manager.py
   │  │  │  │  │  └─ __init__.py
   │  │  │  │  ├─ company
   │  │  │  │  │  └─ company.py
   │  │  │  │  ├─ factory_manager
   │  │  │  │  ├─ owner_routes
   │  │  │  │  │  └─ business_card.py
   │  │  │  │  ├─ subscriptions
   │  │  │  │  │  ├─ subscriptions.py
   │  │  │  │  │  └─ __init__.py
   │  │  │  │  ├─ sub_managers
   │  │  │  │  │  ├─ factory_manager
   │  │  │  │  │  │  ├─ analytics.py
   │  │  │  │  │  │  ├─ factory_machine.py
   │  │  │  │  │  │  ├─ production.py
   │  │  │  │  │  │  └─ team.py
   │  │  │  │  │  ├─ logistics_dashboard.py
   │  │  │  │  │  ├─ request.py
   │  │  │  │  │  └─ warehouse_manager
   │  │  │  │  │     └─ api_warehouse.py
   │  │  │  │  └─ supplier_manager
   │  │  │  │     ├─ inventory.py
   │  │  │  │     ├─ orders.py
   │  │  │  │     ├─ suppliers.py
   │  │  │  │     └─ __init__.py
   │  │  │  └─ __init__.py
   │  │  └─ __init__.py
   │  ├─ core
   │  │  ├─ celery.py
   │  │  ├─ config.py
   │  │  └─ security.py
   │  ├─ db
   │  │  ├─ database.py
   │  │  ├─ deps.py
   │  │  └─ __init__.py
   │  ├─ main.py
   │  ├─ middlewares
   │  │  └─ comapny
   │  │     └─ company_middleware.py
   │  ├─ models
   │  │  ├─ auth
   │  │  │  ├─ user.py
   │  │  │  └─ __init__.py
   │  │  ├─ business_manager
   │  │  │  ├─ business_owners.py
   │  │  │  ├─ domain.py
   │  │  │  ├─ team.py
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  ├─ company.py
   │  │  │  └─ __init__.py
   │  │  ├─ company_auth
   │  │  │  └─ managers.py
   │  │  ├─ factory_manager
   │  │  ├─ owner_models
   │  │  │  └─ business_card.py
   │  │  ├─ subscriptions
   │  │  │  ├─ subscription_plan.py
   │  │  │  └─ __init__.py
   │  │  ├─ sub_managers
   │  │  │  ├─ factory_manager
   │  │  │  │  ├─ factory_machinery.py
   │  │  │  │  ├─ production.py
   │  │  │  │  ├─ teams.py
   │  │  │  │  └─ __init__.py
   │  │  │  ├─ logistics_manager
   │  │  │  │  ├─ domain.py
   │  │  │  │  └─ __init__.py
   │  │  │  ├─ request.py
   │  │  │  └─ warehouse_manager
   │  │  │     └─ warehouse.py
   │  │  ├─ supplier_manager
   │  │  │  ├─ inventory.py
   │  │  │  ├─ order.py
   │  │  │  ├─ supplier.py
   │  │  │  └─ __init__.py
   │  │  └─ __init__.py
   │  ├─ schemas
   │  │  ├─ admin_schemas
   │  │  │  └─ admin_s.py
   │  │  ├─ auth
   │  │  │  ├─ company.py
   │  │  │  └─ user.py
   │  │  ├─ business_manager
   │  │  │  ├─ business_onwers.py
   │  │  │  ├─ team.py
   │  │  │  ├─ team_schemas.py
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  └─ company.py
   │  │  ├─ factory_manager
   │  │  ├─ owner_schemas
   │  │  │  └─ business_card.py
   │  │  ├─ subscriptions
   │  │  │  ├─ subscription_plan.py
   │  │  │  └─ __init__.py
   │  │  ├─ sub_managers
   │  │  │  ├─ factory_manager
   │  │  │  │  ├─ factory_machine.py
   │  │  │  │  ├─ factory_team.py
   │  │  │  │  └─ production.py
   │  │  │  ├─ request.py
   │  │  │  └─ warehouse_manager
   │  │  │     └─ ware_schemas.py
   │  │  ├─ supplier_manager
   │  │  │  ├─ inventory.py
   │  │  │  ├─ order.py
   │  │  │  ├─ supplier.py
   │  │  │  └─ __init__.py
   │  │  └─ __init__.py
   │  ├─ services
   │  │  ├─ ai
   │  │  │  ├─ documentation_service.py
   │  │  │  └─ task.py
   │  │  ├─ auth
   │  │  │  ├─ dependancy.py
   │  │  │  ├─ google_auth.py
   │  │  │  ├─ jwt_services.py
   │  │  │  ├─ mail_service.py
   │  │  │  ├─ rolebased.py
   │  │  │  ├─ user_crud.py
   │  │  │  └─ __init__.py
   │  │  ├─ business_manager
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  ├─ company_service.py
   │  │  │  └─ schema_service.py
   │  │  ├─ email_service.py
   │  │  ├─ managers
   │  │  │  └─ manager_services.py
   │  │  ├─ subscriptions
   │  │  │  ├─ subscription_service.py
   │  │  │  └─ __init__.py
   │  │  ├─ sub_managers
   │  │  │  └─ factory_manager
   │  │  │     └─ factory_machine.py
   │  │  └─ __init__.py
   │  ├─ tests
   │  │  └─ __init__.py
   │  └─ __init__.py
   ├─ Dockerfile
   ├─ inspect_schemas.py
   ├─ migrate_po.py
   ├─ requirements.txt
   ├─ test_query.py
   └─ update_db.py     bbbbbbbbbbn bbbn bbbbbbbbbbbb

```