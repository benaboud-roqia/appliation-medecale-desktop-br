import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './components/LoginPage'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { PatientsPage } from './components/PatientsPage'
import { PatientDetails } from './components/PatientDetails'
import { GloveConnection } from './components/GloveConnection'
import { AIAnalysis } from './components/AIAnalysis'
import { PrescriptionEditor } from './components/PrescriptionEditor'
import { AlertsPage } from './components/AlertsPage'
import { SettingsPage } from './components/SettingsPage'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient)
    setCurrentPage('patient-details')
  }

  const handleBackFromPatient = () => {
    setSelectedPatient(null)
    setCurrentPage('patients')
  }

  const renderPage = () => {
    if (currentPage === 'patient-details' && selectedPatient) {
      return <PatientDetails patient={selectedPatient} onBack={handleBackFromPatient} />
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'patients':
        return <PatientsPage onSelectPatient={handleSelectPatient} />
      case 'glove':
        return <GloveConnection />
      case 'ai-analysis':
        return <AIAnalysis />
      case 'prescriptions':
        return <PrescriptionEditor />
      case 'alerts':
        return <AlertsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
