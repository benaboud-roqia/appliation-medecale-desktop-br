import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Settings, Bluetooth, Wifi, Usb, Moon, Sun, Users, Award } from 'lucide-react'

interface SettingsData {
  theme: 'light' | 'dark'
  gloveConnectionMode: 'bluetooth' | 'wifi' | 'usb'
  measurementFrequency: number
  alertThresholds: {
    pressure: number
    temperature: number
    emg: number
  }
}

export const SettingsPage: React.FC = () => {
  const { accessToken } = useAuth()
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'light',
    gloveConnectionMode: 'bluetooth',
    measurementFrequency: 1000,
    alertThresholds: {
      pressure: 50,
      temperature: 30,
      emg: 20
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/settings`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Paramètres enregistrés avec succès')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chargement des paramètres...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Configuration de l'application et des appareils</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thème de l'interface</Label>
              <p className="text-sm text-gray-600">Choisir entre le mode clair et sombre</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-gray-600" />
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, theme: checked ? 'dark' : 'light' })
                }
              />
              <Moon className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connexion au gant intelligent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mode de connexion préféré</Label>
            <Select 
              value={settings.gloveConnectionMode} 
              onValueChange={(value: 'bluetooth' | 'wifi' | 'usb') => 
                setSettings({ ...settings, gloveConnectionMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bluetooth">
                  <div className="flex items-center">
                    <Bluetooth className="w-4 h-4 mr-2" />
                    Bluetooth
                  </div>
                </SelectItem>
                <SelectItem value="wifi">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-2" />
                    Wi-Fi
                  </div>
                </SelectItem>
                <SelectItem value="usb">
                  <div className="flex items-center">
                    <Usb className="w-4 h-4 mr-2" />
                    USB
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fréquence de mesure (ms)</Label>
            <Input
              type="number"
              value={settings.measurementFrequency}
              onChange={(e) => 
                setSettings({ 
                  ...settings, 
                  measurementFrequency: parseInt(e.target.value) || 1000 
                })
              }
              min="100"
              max="5000"
              step="100"
            />
            <p className="text-sm text-gray-600">
              Intervalle entre les mesures (100ms à 5000ms)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seuils d'alerte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pression minimale (mmHg)</Label>
            <Input
              type="number"
              value={settings.alertThresholds.pressure}
              onChange={(e) => 
                setSettings({ 
                  ...settings, 
                  alertThresholds: { 
                    ...settings.alertThresholds, 
                    pressure: parseInt(e.target.value) || 50 
                  } 
                })
              }
              min="0"
              max="200"
            />
            <p className="text-sm text-gray-600">
              Déclencher une alerte si la pression descend en dessous de cette valeur
            </p>
          </div>

          <div className="space-y-2">
            <Label>Température minimale (°C)</Label>
            <Input
              type="number"
              value={settings.alertThresholds.temperature}
              onChange={(e) => 
                setSettings({ 
                  ...settings, 
                  alertThresholds: { 
                    ...settings.alertThresholds, 
                    temperature: parseInt(e.target.value) || 30 
                  } 
                })
              }
              min="0"
              max="50"
            />
            <p className="text-sm text-gray-600">
              Déclencher une alerte si la température descend en dessous de cette valeur
            </p>
          </div>

          <div className="space-y-2">
            <Label>EMG minimal (µV)</Label>
            <Input
              type="number"
              value={settings.alertThresholds.emg}
              onChange={(e) => 
                setSettings({ 
                  ...settings, 
                  alertThresholds: { 
                    ...settings.alertThresholds, 
                    emg: parseInt(e.target.value) || 20 
                  } 
                })
              }
              min="0"
              max="100"
            />
            <p className="text-sm text-gray-600">
              Déclencher une alerte si l'activité EMG descend en dessous de cette valeur
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité et confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Settings className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-green-900 mb-1">Chiffrement activé</div>
                <p className="text-sm text-green-700">
                  Toutes les données sont chiffrées en AES-256 conformément aux normes RGPD et médicales
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-blue-900 mb-1">Synchronisation cloud sécurisée</div>
                <p className="text-sm text-blue-700">
                  Connexion HTTPS avec le serveur IoMT pour la sauvegarde des données
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Équipe du projet</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-900 mb-1">Benaboud Roqia</div>
              <p className="text-sm text-purple-700">Développeur & Chercheur</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-900 mb-1">Zouaoui Sirine</div>
              <p className="text-sm text-purple-700">Développeur & Chercheur</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-900 mb-1">Chebeout Ibrahim</div>
              <p className="text-sm text-purple-700">Développeur & Chercheur</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-900 mb-1">Rassim</div>
              <p className="text-sm text-purple-700">Développeur & Chercheur</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-900 mb-1">Lamerie Lokmane</div>
              <p className="text-sm text-purple-700">Développeur & Chercheur</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">Supervision</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-900 mb-1">Dr Tolba Zakaria</div>
                <p className="text-sm text-blue-700">Superviseur académique</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-900 mb-1">Dehimi Nour El Houda</div>
                <p className="text-sm text-blue-700">Co-superviseur</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={loadSettings}>
          Annuler
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </Button>
      </div>
    </div>
  )
}
