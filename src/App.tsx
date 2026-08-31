import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/hooks/useAppState';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Requests } from '@/pages/Requests';
import { RequestDetail } from '@/pages/RequestDetail';
import { Quotations } from '@/pages/Quotations';
import { QuotationDetail } from '@/pages/QuotationDetail';
import { QuotationForm } from '@/pages/QuotationForm';
import { Projects } from '@/pages/Projects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { ProjectForm } from '@/pages/ProjectForm';
import { Procurement } from '@/pages/Procurement';
import { Materials } from '@/pages/Materials';
import { Resources } from '@/pages/Resources';
import { Invoices } from '@/pages/Invoices';
import { Documents } from '@/pages/Documents';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/quotations/new" element={<QuotationForm />} />
            <Route path="/quotations/:id/edit" element={<QuotationForm />} />
            <Route path="/quotations/:id" element={<QuotationDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/documents" element={<Documents />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
