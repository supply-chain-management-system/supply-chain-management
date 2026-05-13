
```
supply-chain-management
├─ ai_services
│  ├─ ai_app
│  │  ├─ agents
│  │  ├─ api
│  │  │  └─ v1
│  │  │     └─ routes
│  │  │        └─ business_manager
│  │  │           └─ bm_routes.py
│  │  ├─ core
│  │  ├─ databases
│  │  │  └─ database.py
│  │  ├─ main.py
│  │  ├─ prompts
│  │  ├─ schemas
│  │  │  └─ business_manager
│  │  │     └─ bm_schemas.py
│  │  ├─ services
│  │  ├─ tests
│  │  ├─ tools
│  │  │  └─ business_manager
│  │  │     └─ bm_tools.py
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
│  │  │  │     ├─ LogisticsPage.jsx
│  │  │  │     ├─ RequestsPage.jsx
│  │  │  │     ├─ SuppliersPage.jsx
│  │  │  │     └─ WarehousePage.jsx
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
└─ server
   ├─ .dockerignore
   ├─ alembic
   │  ├─ env.py
   │  ├─ README
   │  ├─ script.py.mako
   │  └─ versions
   │     └─ 3d3c75a0010b_add_business_id_to_users.py
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
   │  │  │  │  │  ├─ team.py
   │  │  │  │  │  ├─ warehouse_manager.py
   │  │  │  │  │  └─ __init__.py
   │  │  │  │  ├─ company
   │  │  │  │  │  └─ company.py
   │  │  │  │  ├─ factory_manager
   │  │  │  │  ├─ owner_routes
   │  │  │  │  │  └─ business_card.py
   │  │  │  │  └─ sub_managers
   │  │  │  │     ├─ factory_manager
   │  │  │  │     │  ├─ production.py
   │  │  │  │     │  └─ team.py
   │  │  │  │     ├─ request.py
   │  │  │  │     └─ warehouse_manager
   │  │  │  │        └─ api_warehouse.py
   │  │  │  └─ __init__.py
   │  │  └─ __init__.py
   │  ├─ core
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
   │  │  ├─ sub_managers
   │  │  │  ├─ factory_manager
   │  │  │  │  ├─ machinery.py
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
   │  │  ├─ factory_manager
   │  │  ├─ owner_schemas
   │  │  │  └─ business_card.py
   │  │  ├─ sub_managers
   │  │  │  ├─ factory_manager
   │  │  │  │  ├─ factory_team.py
   │  │  │  │  └─ production.py
   │  │  │  ├─ request.py
   │  │  │  └─ warehouse_manager
   │  │  │     └─ ware_schemas.py
   │  │  └─ __init__.py
   │  ├─ services
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
   │  │  │  │  ├─ graph.py
   │  │  │  │  └─ tools.py
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  ├─ company_service.py
   │  │  │  └─ schema_service.py
   │  │  ├─ email_service.py
   │  │  └─ __init__.py
   │  ├─ tests
   │  │  └─ __init__.py
   │  └─ __init__.py
   ├─ Dockerfile
   └─ requirements.txt

```