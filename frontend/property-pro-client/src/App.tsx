import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/authStore'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import SelectRolePage from '@/pages/auth/SelectRolePage'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LandlordDashboard from '@/pages/dashboard/LandlordDashboard'
import TenantDashboard from '@/pages/dashboard/TenantDashboard'
import PropertiesPage from '@/pages/properties/PropertiesPage'
import PropertyDetailPage from '@/pages/properties/PropertyDetailPage'
import TenantsPage from '@/pages/tenants/TenantsPage'
import TenantDetailPage from '@/pages/tenants/TenantDetailPage'

export default function App() {
  const { initFromStorage } = useAuthStore()

  useEffect(() => {
    initFromStorage()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding/select-role" element={<SelectRolePage />} />

        {/* Protected */}
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Landlord', 'Admin']}>
              <LandlordDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tenant/dashboard" element={
            <ProtectedRoute allowedRoles={['Tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/properties" element={
            <ProtectedRoute allowedRoles={['Landlord', 'Admin']}>
              <PropertiesPage />
            </ProtectedRoute>
          } />
          <Route path="/properties/:id" element={
            <ProtectedRoute allowedRoles={['Landlord', 'Admin']}>
              <PropertyDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/tenants" element={
            <ProtectedRoute allowedRoles={['Landlord', 'Admin']}>
              <TenantsPage />
            </ProtectedRoute>
          } />
          <Route path="/tenants/:id" element={
            <ProtectedRoute allowedRoles={['Landlord', 'Admin']}>
              <TenantDetailPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
