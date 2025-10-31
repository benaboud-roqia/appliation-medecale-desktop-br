import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Users, Activity, Brain, AlertTriangle, TrendingUp, FileText } from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  activeMeasurements: number
  aiAnalyses: number
  alerts: number
  recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: string
  }>
}

export const Dashboard: React.FC = () => {
  const { accessToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeMeasurements: 0,
    aiAnalyses: 0,
    alerts: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/patients`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/alerts`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ])

      const patientsData = await patientsRes.json()
      const alertsData = await alertsRes.json()

      setStats({
        totalPatients: patientsData.patients?.length || 0,
        activeMeasurements: 0,
        aiAnalyses: 0,
        alerts: alertsData.alerts?.filter((a: any) => !a.read).length || 0,
        recentActivity: []
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12% ce mois'
    },
    {
      title: 'Mesures actives',
      value: stats.activeMeasurements,
      icon: Activity,
      color: 'bg-green-500',
      trend: 'En temps réel'
    },
    {
      title: 'Analyses IA',
      value: stats.aiAnalyses,
      icon: Brain,
      color: 'bg-purple-500',
      trend: '+5 cette semaine'
    },
    {
      title: 'Alertes',
      value: stats.alerts,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      trend: stats.alerts > 0 ? 'Nécessite attention' : 'Aucune alerte'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chargement du tableau de bord...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité médicale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-gray-900 mb-1">{stat.value}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.message}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="text-left flex-1">
                  <div className="text-gray-900">Nouveau patient</div>
                  <div className="text-sm text-gray-600">Ajouter un patient au système</div>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Activity className="w-5 h-5 text-green-600" />
                <div className="text-left flex-1">
                  <div className="text-gray-900">Connecter le gant</div>
                  <div className="text-sm text-gray-600">Démarrer une nouvelle mesure</div>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Brain className="w-5 h-5 text-purple-600" />
                <div className="text-left flex-1">
                  <div className="text-gray-900">Analyse IA</div>
                  <div className="text-sm text-gray-600">Lancer une analyse diagnostique</div>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-orange-600" />
                <div className="text-left flex-1">
                  <div className="text-gray-900">Nouvelle ordonnance</div>
                  <div className="text-sm text-gray-600">Créer une ordonnance</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
