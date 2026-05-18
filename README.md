
```
supply-chain-management
├─ ai_services
│  ├─ ai_app
│  │  ├─ api
│  │  │  └─ v1
│  │  │     └─ routes
│  │  │        ├─ business_manager
│  │  │        │  └─ bm_routes.py
│  │  │        └─ factory_manager
│  │  │           └─ factory_routes.py
│  │  ├─ databases
│  │  │  └─ database.py
│  │  ├─ main.py
│  │  ├─ prompt
│  │  │  └─ factory_manager
│  │  │     └─ doc_prompt.py
│  │  ├─ schemas
│  │  │  ├─ business_manager
│  │  │  │  └─ bm_schemas.py
│  │  │  └─ factory_manager
│  │  │     └─ factory_schema.py
│  │  ├─ tools
│  │  │  ├─ business_manager
│  │  │  │  └─ bm_tools.py
│  │  │  └─ factory_manager
│  │  │     └─ production_doc.py
│  │  └─ workflows
│  │     ├─ business_manager
│  │     │  └─ bm_graph.py
│  │     └─ factory_manager
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
│  │  │     └─ add.jsx
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
│  │     ├─ logisticsManagerSlice.js
│  │     ├─ requestsSlice.js
│  │     ├─ store.js
│  │     ├─ supplierSlice.js
│  │     └─ warehouseManagerSlice.js
│  └─ vite.config.js
├─ docker-compose.yml
├─ nginx
│  └─ nginx.conf
├─ package-lock.json
├─ README.md
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
   │     ├─ 48f858af26ee_chage_purchase_date_typo.py
   │     ├─ 4c9bc90e5ef2_msg.py
   │     ├─ 63cd5b206da6_message.py
   │     ├─ 6ade91bf0948_sync_factory_base_fix.py
   │     ├─ 761a9435d4ab_adding_new_tables.py
   │     ├─ 76800d95fee9_message.py
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
   │  │  │  │  │  ├─ suppliers.py
   │  │  │  │  │  ├─ supply_manager.py
   │  │  │  │  │  ├─ team.py
   │  │  │  │  │  ├─ warehouse_manager.py
   │  │  │  │  │  └─ __init__.py
   │  │  │  │  ├─ company
   │  │  │  │  │  └─ company.py
   │  │  │  │  ├─ owner_routes
   │  │  │  │  │  └─ business_card.py
   │  │  │  │  └─ sub_managers
   │  │  │  │     ├─ factory_manager
   │  │  │  │     │  ├─ analytics.py
   │  │  │  │     │  ├─ factory_machine.py
   │  │  │  │     │  ├─ production.py
   │  │  │  │     │  └─ team.py
   │  │  │  │     ├─ request.py
   │  │  │  │     └─ warehouse_manager
   │  │  │  │        └─ api_warehouse.py
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
   │  │  ├─ owner_models
   │  │  │  └─ business_card.py
   │  │  ├─ sub_managers
   │  │  │  ├─ factory_manager
   │  │  │  │  ├─ factory_machinery.py
   │  │  │  │  ├─ production.py
   │  │  │  │  ├─ teams.py
   │  │  │  │  └─ __init__.py
   │  │  │  ├─ request.py
   │  │  │  └─ warehouse_manager
   │  │  │     └─ warehouse.py
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
   │  │  ├─ owner_schemas
   │  │  │  └─ business_card.py
   │  │  ├─ sub_managers
   │  │  │  ├─ factory_manager
   │  │  │  │  ├─ factory_machine.py
   │  │  │  │  ├─ factory_team.py
   │  │  │  │  └─ production.py
   │  │  │  ├─ request.py
   │  │  │  └─ warehouse_manager
   │  │  │     └─ ware_schemas.py
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
   │  │  │  ├─ agent
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  ├─ company_service.py
   │  │  │  └─ schema_service.py
   │  │  ├─ email_service.py
   │  │  ├─ sub_managers
   │  │  │  └─ factory_manager
   │  │  │     └─ factory_machine.py
   │  │  └─ __init__.py
   │  ├─ tests
   │  │  └─ __init__.py
   │  └─ __init__.py
   ├─ client
   ├─ Dockerfile
   └─ requirements.txt

```