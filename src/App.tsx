import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OverviewPage from './pages/OverviewPage';
import FactoryPage from './pages/FactoryPage';
import StationPage from './pages/StationPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import MaintenancePage from './pages/MaintenancePage';
import { I18nProvider } from './i18n/I18nContext';

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<OverviewPage />} />
            <Route path="factory/:factoryId" element={<FactoryPage />} />
            <Route path="station/:stationId" element={<StationPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
