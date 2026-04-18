import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ContractorsPage from './pages/ContractorsPage';
import RateRequestsPage from './pages/RateRequestsPage';
import NewRateRequestPage from './pages/NewRateRequestPage';
import RateRequestDetailPage from './pages/RateRequestDetailPage';
import PublicRatePage from './pages/PublicRatePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public page — no layout */}
        <Route path="/rate/:token" element={<PublicRatePage />} />

        {/* App with sidebar */}
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/rate-requests" replace />} />
          <Route path="/rate-requests" element={<RateRequestsPage />} />
          <Route path="/rate-requests/new" element={<NewRateRequestPage />} />
          <Route path="/rate-requests/:id" element={<RateRequestDetailPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
