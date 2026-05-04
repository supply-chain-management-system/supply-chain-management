
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
│  │  │  │  └─ AddManager.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ componets
│  │  │  │  │  └─ comp.jsx
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ companyonboard.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ login.jsx
│  │  │  │     └─ signup.jsx
│  │  │  ├─ business_manager
│  │  │  │  ├─ layouts
│  │  │  │  │  └─ BusinessManagerLayout.jsx
│  │  │  │  └─ pages
│  │  │  │     ├─ DashboardPage.jsx
│  │  │  │     ├─ FactoryPage.jsx
│  │  │  │     ├─ LogisticsPage.jsx
│  │  │  │     ├─ RequestsPage.jsx
│  │  │  │     ├─ SuppliersPage.jsx
│  │  │  │     └─ WarehousePage.jsx
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
   │     ├─ 1821065707ca_initial.py
   │     ├─ 4b1e939bf196_initial.py
   │     ├─ 83669dc32955_initial.py
   │     ├─ ad03d2863a7c_initial.py
   │     └─ bb3151fb6fbc_initial.py
   ├─ alembic.ini
   ├─ app
   │  ├─ api
   │  │  ├─ deps.py
   │  │  ├─ v1
   │  │  │  ├─ routes
   │  │  │  │  ├─ admin
   │  │  │  │  │  └─ admin_pages.py
   │  │  │  │  ├─ auth
   │  │  │  │  │  └─ authentication.py
   │  │  │  │  ├─ business_manager
   │  │  │  │  │  ├─ dashboard.py
   │  │  │  │  │  ├─ team.py
   │  │  │  │  │  └─ __init__.py
   │  │  │  │  └─ company
   │  │  │  │     └─ company.py
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
   │  │  └─ __init__.py
   │  ├─ schemas
   │  │  ├─ auth
   │  │  │  ├─ company.py
   │  │  │  └─ user.py
   │  │  ├─ business_manager
   │  │  │  ├─ business_onwers.py
   │  │  │  ├─ team.py
   │  │  │  └─ __init__.py
   │  │  ├─ company
   │  │  │  └─ company.py
   │  │  └─ __init__.py
   │  ├─ services
   │  │  ├─ auth
   │  │  │  ├─ dependancy.py
   │  │  │  ├─ jwt_services.py
   │  │  │  ├─ user_crud.py
   │  │  │  └─ __init__.py
   │  │  ├─ business_manager
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