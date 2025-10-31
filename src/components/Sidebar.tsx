import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Brain, 
  FileText, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'glove', label: 'Gant intelligent', icon: Activity },
    { id: 'ai-analysis', label: 'Analyse IA', icon: Brain },
    { id: 'prescriptions', label: 'Ordonnances', icon: FileText },
    { id: 'alerts', label: 'Alertes', icon: Bell },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm opacity-80">MediGlove</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-sm opacity-60">Connecté en tant que</div>
          <div className="mt-1">{user?.name}</div>
          <div className="text-xs text-blue-400 mt-1">{user?.specialty}</div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
