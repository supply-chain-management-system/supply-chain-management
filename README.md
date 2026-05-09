
```
supply-chain-management
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
│  │  │  │     └─ Managers.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ componets
│  │  │  │  │  └─ comp.jsx
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ companyonboard.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ face-verification.jsx
│  │  │  │     ├─ login.jsx
│  │  │  │     ├─ register-face.jsx
│  │  │  │     └─ signup.jsx
│  │  │  ├─ business_manager
│  │  │  │  ├─ components
│  │  │  │  │  ├─ CopilotWidget.jsx
│  │  │  │  │  └─ ProductionDrafts.jsx
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ BusinessManagerLayout.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ DashboardPage.jsx
│  │  │  │     ├─ FactoryPage.jsx
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
│  │  │  └─ users
│  │  │     └─ user.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ redux
│  │     ├─ authslice.jsx
│  │     ├─ requestsSlice.js
│  │     └─ store.js
│  └─ vite.config.js
├─ package-lock.json
└─ server
   ├─ alembic
   │  ├─ env.py
   │  ├─ README
   │  ├─ script.py.mako
   │  └─ versions
   │     └─ 163dbaf49eca_fresh_complete_schema.py
   ├─ alembic.ini
   ├─ app
   │  ├─ api
   │  │  ├─ deps.py
   │  │  ├─ v1
   │  │  │  ├─ routes
   │  │  │  │  ├─ admin
   │  │  │  │  │  ├─ admin_pages.py
   │  │  │  │  │  ├─ config.py
   │  │  │  │  │  └─ emailsend.py
   │  │  │  │  ├─ auth
   │  │  │  │  │  ├─ authentication.py
   │  │  │  │  │  └─ otp.py
   │  │  │  │  ├─ business_manager
   │  │  │  │  │  ├─ ai_agent.py
   │  │  │  │  │  ├─ dashboard.py
   │  │  │  │  │  ├─ team.py
   │  │  │  │  │  └─ __init__.py
   │  │  │  │  ├─ company
   │  │  │  │  │  └─ company.py
   │  │  │  │  └─ factory_manager
   │  │  │  │     ├─ production.py
   │  │  │  │     └─ team.py
   │  │  │  └─ __init__.py
   │  │  └─ __init__.py
   │  ├─ core
   │  │  ├─ config.py
   │  │  └─ security.py
   │  ├─ db
   │  │  ├─ database.py
   │  │  └─ __init__.py
   │  ├─ main.py
   │  ├─ models
   │  │  ├─ auth
   │  │  │  ├─ user.py
   │  │  │  └─ __init__.py
   │  │  ├─ business_manager
   │  │  │  ├─ business_owners.py
   │  │  │  ├─ domain.py
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  ├─ company.py
   │  │  │  └─ __init__.py
   │  │  ├─ company_auth
   │  │  │  └─ managers.py
   │  │  ├─ factory_manager
   │  │  │  ├─ production.py
   │  │  │  ├─ teams.py
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
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  └─ company.py
   │  │  ├─ factory_manager
   │  │  │  ├─ factory_team.py
   │  │  │  └─ production.py
   │  │  └─ __init__.py
   │  ├─ services
   │  │  ├─ auth
   │  │  │  ├─ dependancy.py
   │  │  │  ├─ google_auth.py
   │  │  │  ├─ jwt_services.py
   │  │  │  ├─ user_crud.py
   │  │  │  └─ __init__.py
   │  │  ├─ business_manager
   │  │  │  ├─ agent
   │  │  │  │  ├─ graph.py
   │  │  │  │  ├─ state.py
   │  │  │  │  ├─ tools.py
   │  │  │  │  └─ __init__.py
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  └─ company_service.py
   │  │  ├─ email_service.py
   │  │  └─ __init__.py
   │  ├─ tests
   │  │  └─ __init__.py
   │  └─ __init__.py
   └─ requirements.txt

```