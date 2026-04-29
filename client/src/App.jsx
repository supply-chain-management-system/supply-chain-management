import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirecting to business manager dashboard for now */}
        <Route path="/" element={<Navigate to="/business-manager/dashboard" replace />} />

        {/* BUSINESS MANAGER MODULE ROUTES
          All your pages will live under the /business-manager path
        */}
        <Route path="/business-manager">
          <Route path="dashboard" element={<div>Business Manager Dashboard Placeholder</div>} />
          <Route path="factory" element={<div>Factory Monitoring Placeholder</div>} />
          <Route path="warehouse" element={<div>Warehouse Supervision Placeholder</div>} />
          <Route path="logistics" element={<div>Logistics Tracking Placeholder</div>} />
          <Route path="suppliers" element={<div>Supplier Updates Placeholder</div>} />
        </Route>

        {/* Catch-all for 404 Not Found */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;