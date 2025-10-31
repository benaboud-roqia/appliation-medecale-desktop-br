import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Bell, AlertTriangle, CheckCircle2, Info, Clock } from 'lucide-react'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  patientId?: string
  patientName?: string
  createdAt: string
  read: boolean
}

export const AlertsPage: React.FC = () => {
  const { accessToken } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/alerts`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/alerts/${alertId}/read`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )

      if (response.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a))
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'info': return <Info className="w-5 h-5 text-blue-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-orange-50 border-orange-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const unreadCount = alerts.filter(a => !a.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chargement des alertes...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Alertes et notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `${unreadCount} alerte${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes les alertes ont été lues'
            }
          </p>
        </div>

        {unreadCount > 0 && (
          <Badge variant="destructive">
            {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune alerte pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          alerts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((alert) => (
              <Card 
                key={alert.id} 
                className={`border ${getAlertBgColor(alert.type)} ${alert.read ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-2 mb-1">
                          <span>{alert.title}</span>
                          {!alert.read && (
                            <Badge variant="destructive" className="text-xs">Nouveau</Badge>
                          )}
                        </CardTitle>
                        <p className="text-gray-700 mt-2">{alert.message}</p>
                        
                        {alert.patientName && (
                          <div className="mt-3 text-sm text-gray-600">
                            Patient: <span className="text-gray-900">{alert.patientName}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(alert.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marquer comme lu
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}
