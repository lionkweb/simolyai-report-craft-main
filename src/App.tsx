
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import ComingSoon from './pages/ComingSoon';
import Faq from './pages/Faq';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';
import Payment from './pages/Payment';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';
import Dashboard from './pages/Dashboard';
import Questionnaire from './pages/Questionnaire';
import FormPreview from './pages/FormPreview';
import AdminLayout from './components/admin/AdminLayout';
import Guide from './pages/Guide';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import PagePreview from './pages/PagePreview';
import Report from './pages/Report';
import FormEditorPage from './components/form-builder/FormEditorPage';
import UserDashboard from './pages/UserDashboard';

import {
  AdminDashboard,
  AdminLogin,
  AdminUserManagement,
  CustomerDetails,
  FormBuilder,
  FormBuilderEditor,
  PageEditor,
  FormPageEditor,
  Settings,
  ChatGPTIntegration,
  PlansManagement,
  PlanEditor,
  PromptTemplatesManager,
  PromptTemplatesList,
  PromptEditor,
  ReportTemplateEditor,
  ReportsPage
} from './pages/admin';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/dashboard/*" element={<UserDashboard />} />
          <Route path="/questionnaire/:id" element={<Questionnaire />} />
          <Route path="/form-preview/:id" element={<FormPreview />} />
          <Route path="/page-preview/:id" element={<PagePreview />} />
          <Route path="/report/:id" element={<Report />} />
          
          <Route path="/form-builder/editor" element={<FormEditorPage />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } />
          <Route path="/admin/users" element={
            <AdminLayout>
              <AdminUserManagement />
            </AdminLayout>
          } />
          <Route path="/admin/users/:id" element={
            <AdminLayout>
              <CustomerDetails />
            </AdminLayout>
          } />
          <Route path="/admin/form-builder" element={
            <AdminLayout>
              <FormBuilder />
            </AdminLayout>
          } />
          <Route path="/admin/form-builder/:action/:id?" element={
            <AdminLayout>
              <FormBuilderEditor />
            </AdminLayout>
          } />
          <Route path="/admin/form-builder/page-layout/:formId" element={
            <AdminLayout>
              <FormPageEditor />
            </AdminLayout>
          } />
          <Route path="/admin/page-editor" element={
            <AdminLayout>
              <PageEditor />
            </AdminLayout>
          } />
          <Route path="/admin/page-editor/:id" element={
            <AdminLayout>
              <PageEditor />
            </AdminLayout>
          } />
          <Route path="/admin/settings" element={
            <AdminLayout>
              <Settings />
            </AdminLayout>
          } />
          <Route path="/admin/plans" element={
            <AdminLayout>
              <PlansManagement />
            </AdminLayout>
          } />
          <Route path="/admin/plans/create" element={
            <AdminLayout>
              <PlanEditor />
            </AdminLayout>
          } />
          <Route path="/admin/plans/edit/:id" element={
            <AdminLayout>
              <PlanEditor />
            </AdminLayout>
          } />
          <Route path="/admin/chatgpt" element={
            <AdminLayout>
              <ChatGPTIntegration />
            </AdminLayout>
          } />
          <Route path="/admin/plans/:planId/prompts" element={
            <AdminLayout>
              <PromptTemplatesList />
            </AdminLayout>
          } />
          <Route path="/admin/plans/:planId/prompts/new" element={
            <AdminLayout>
              <PromptEditor />
            </AdminLayout>
          } />
          <Route path="/admin/plans/:planId/prompts/edit/:promptId" element={
            <AdminLayout>
              <PromptEditor />
            </AdminLayout>
          } />
          <Route path="/admin/plans/:planId/reports" element={
            <AdminLayout>
              <ReportTemplateEditor />
            </AdminLayout>
          } />
          <Route path="/admin/reports" element={
            <AdminLayout>
              <ReportsPage />
            </AdminLayout>
          } />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
