import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Activity, 
  Bluetooth, 
  Wifi, 
  Usb, 
  Power, 
  AlertCircle, 
  CheckCircle2,
  Thermometer,
  Gauge,
  Zap,
  Edit3,
  Save
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Measurement {
  timestamp: number
  pressure: number
  temperature: number
  emg: number
}

export const GloveConnection: React.FC = () => {
  const { accessToken } = useAuth()
  const [inputMode, setInputMode] = useState<'automatic' | 'manual'>('automatic')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState<'bluetooth' | 'wifi' | 'usb'>('bluetooth')
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [isRecording, setIsRecording] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [currentValues, setCurrentValues] = useState({
    pressure: 0,
    temperature: 0,
    emg: 0
  })
  const [manualValues, setManualValues] = useState({
    pressure: '',
    temperature: '',
    emg: ''
  })
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [patients, setPatients] = useState<any[]>([])
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    loadPatients()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const loadPatients = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/patients`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const handleConnect = () => {
    setIsConnected(true)
    // Simulate battery drain
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 1))
    }, 60000) // Decrease by 1% every minute
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsRecording(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startRecording = () => {
    if (!selectedPatient) {
      alert('Veuillez sélectionner un patient')
      return
    }

    setIsRecording(true)
    setMeasurements([])

    // Simulate real-time measurements
    intervalRef.current = window.setInterval(() => {
      const newMeasurement: Measurement = {
        timestamp: Date.now(),
        pressure: 60 + Math.random() * 40, // 60-100
        temperature: 32 + Math.random() * 4, // 32-36°C
        emg: 30 + Math.random() * 50 // 30-80 µV
      }

      setCurrentValues({
        pressure: newMeasurement.pressure,
        temperature: newMeasurement.temperature,
        emg: newMeasurement.emg
      })

      setMeasurements(prev => {
        const updated = [...prev, newMeasurement]
        return updated.slice(-20) // Keep last 20 measurements
      })
    }, 1000)
  }

  const stopRecording = async () => {
    setIsRecording(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Save measurements to server
    try {
      for (const measurement of measurements) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/measurements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            patientId: selectedPatient,
            ...measurement
          })
        })
      }
      alert('Mesures enregistrées avec succès')
    } catch (error) {
      console.error('Error saving measurements:', error)
    }
  }

  const saveManualMeasurement = async () => {
    if (!selectedPatient) {
      alert('Veuillez sélectionner un patient')
      return
    }

    const pressure = parseFloat(manualValues.pressure)
    const temperature = parseFloat(manualValues.temperature)
    const emg = parseFloat(manualValues.emg)

    if (isNaN(pressure) || isNaN(temperature) || isNaN(emg)) {
      alert('Veuillez entrer des valeurs numériques valides')
      return
    }

    const measurement: Measurement = {
      timestamp: Date.now(),
      pressure,
      temperature,
      emg
    }

    // Update current values display
    setCurrentValues({
      pressure,
      temperature,
      emg
    })

    // Add to measurements
    setMeasurements(prev => [...prev, measurement])

    // Save to server
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          ...measurement
        })
      })
      alert('Mesure manuelle enregistrée avec succès')
      setManualValues({ pressure: '', temperature: '', emg: '' })
    } catch (error) {
      console.error('Error saving manual measurement:', error)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  const chartData = measurements.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString('fr-FR'),
    Pression: m.pressure.toFixed(1),
    Température: m.temperature.toFixed(1),
    EMG: m.emg.toFixed(1)
  }))

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Connexion au gant intelligent</h1>
        <p className="text-gray-600">Gestion des capteurs et acquisition des données biométriques</p>
      </div>

      <Tabs value={inputMode} onValueChange={(v: any) => setInputMode(v)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="automatic" className="flex items-center space-x-2">
            <Bluetooth className="w-4 h-4" />
            <span>Mode automatique</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Saisie manuelle</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automatic" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              État de connexion
              {isConnected ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Déconnecté
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Mode de connexion</label>
              <Select value={connectionMode} onValueChange={(v: any) => setConnectionMode(v)} disabled={isConnected}>
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

            {isConnected && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Power className="w-4 h-4 mr-2" />
                    Batterie
                  </div>
                  <span className={`${batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}`}>
                    {batteryLevel}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
              </div>
            )}

            {!isConnected ? (
              <Button onClick={handleConnect} className="w-full">
                <Activity className="w-4 h-4 mr-2" />
                Connecter le gant
              </Button>
            ) : (
              <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                Déconnecter
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Valeurs actuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Pression</span>
                </div>
                <div className="text-blue-900">{currentValues.pressure.toFixed(1)}</div>
                <div className="text-xs text-gray-500">mmHg</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Température</span>
                </div>
                <div className="text-orange-900">{currentValues.temperature.toFixed(1)}</div>
                <div className="text-xs text-gray-500">°C</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">EMG</span>
                </div>
                <div className="text-purple-900">{currentValues.emg.toFixed(1)}</div>
                <div className="text-xs text-gray-500">µV</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Enregistrement des mesures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={isRecording}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              {!isRecording ? (
                <Button onClick={startRecording} disabled={!selectedPatient} className="flex-1">
                  <Activity className="w-4 h-4 mr-2" />
                  Démarrer l'enregistrement
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="flex-1">
                  Arrêter et sauvegarder
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Enregistrement en cours...</span>
                  <Badge variant="destructive" className="animate-pulse">● REC</Badge>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Pression" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Température" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="EMG" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Saisie manuelle des mesures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-pressure" className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span>Pression (mmHg)</span>
                  </Label>
                  <Input
                    id="manual-pressure"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 75.5"
                    value={manualValues.pressure}
                    onChange={(e) => setManualValues(prev => ({ ...prev, pressure: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">Plage normale : 60-100 mmHg</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-temp" className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    <span>Température (°C)</span>
                  </Label>
                  <Input
                    id="manual-temp"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 34.2"
                    value={manualValues.temperature}
                    onChange={(e) => setManualValues(prev => ({ ...prev, temperature: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">Plage normale : 32-36°C</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-emg" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>EMG (µV)</span>
                  </Label>
                  <Input
                    id="manual-emg"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 55.3"
                    value={manualValues.emg}
                    onChange={(e) => setManualValues(prev => ({ ...prev, emg: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">Plage normale : 30-80 µV</p>
                </div>

                <Button 
                  onClick={saveManualMeasurement} 
                  disabled={!selectedPatient || !manualValues.pressure || !manualValues.temperature || !manualValues.emg}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer la mesure
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valeurs enregistrées</CardTitle>
              </CardHeader>
              <CardContent>
                {currentValues.pressure > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Gauge className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Pression</span>
                      </div>
                      <div className="text-blue-900">{currentValues.pressure.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">mmHg</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Thermometer className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-gray-600">Température</span>
                      </div>
                      <div className="text-orange-900">{currentValues.temperature.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">°C</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">EMG</span>
                      </div>
                      <div className="text-purple-900">{currentValues.emg.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">µV</div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm">Total de {measurements.length} mesure(s) enregistrée(s)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune mesure enregistrée</p>
                    <p className="text-sm mt-2">Remplissez le formulaire pour ajouter une mesure</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {measurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des mesures</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Pression" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Température" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="EMG" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
