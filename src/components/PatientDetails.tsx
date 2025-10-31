import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Activity, 
  Brain,
  Pill
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string
  email: string
  medicalHistory: string
  diagnosis: string
}

interface PatientDetailsProps {
  patient: Patient
  onBack: () => void
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, onBack }) => {
  const { accessToken } = useAuth()
  const [measurements, setMeasurements] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatientData()
  }, [patient.id])

  const loadPatientData = async () => {
    setLoading(true)
    try {
      const [measurementsRes, analysesRes, prescriptionsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/measurements/${patient.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/ai-analysis/${patient.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/prescriptions/${patient.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ])

      const measurementsData = await measurementsRes.json()
      const analysesData = await analysesRes.json()
      const prescriptionsData = await prescriptionsRes.json()

      setMeasurements(measurementsData.measurements || [])
      setAnalyses(analysesData.analyses || [])
      setPrescriptions(prescriptionsData.prescriptions || [])
    } catch (error) {
      console.error('Error loading patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = measurements
    .slice(-20)
    .map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      Pression: m.pressure.toFixed(1),
      Température: m.temperature.toFixed(1),
      EMG: m.emg.toFixed(1)
    }))

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-gray-900">{patient.firstName} {patient.lastName}</h1>
          <p className="text-gray-600">Dossier médical complet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Informations patient</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Date de naissance</div>
                <div className="text-gray-900">
                  {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Téléphone</div>
                <div className="text-gray-900">{patient.phone}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-gray-900">{patient.email}</div>
              </div>
            </div>

            {patient.diagnosis && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-1">Diagnostic principal</div>
                <div className="text-gray-900">{patient.diagnosis}</div>
              </div>
            )}

            {patient.medicalHistory && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-1">Antécédents médicaux</div>
                <div className="text-gray-700 text-sm">{patient.medicalHistory}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Données médicales</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="measurements">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="measurements">
                  <Activity className="w-4 h-4 mr-2" />
                  Mesures
                </TabsTrigger>
                <TabsTrigger value="analyses">
                  <Brain className="w-4 h-4 mr-2" />
                  Analyses IA
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  <Pill className="w-4 h-4 mr-2" />
                  Ordonnances
                </TabsTrigger>
              </TabsList>

              <TabsContent value="measurements" className="space-y-4">
                {measurements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune mesure enregistrée
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Dernière pression</div>
                        <div className="text-blue-900">
                          {measurements[measurements.length - 1].pressure.toFixed(1)} mmHg
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Dernière température</div>
                        <div className="text-orange-900">
                          {measurements[measurements.length - 1].temperature.toFixed(1)} °C
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Dernier EMG</div>
                        <div className="text-purple-900">
                          {measurements[measurements.length - 1].emg.toFixed(1)} µV
                        </div>
                      </div>
                    </div>

                    {chartData.length > 0 && (
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
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="analyses" className="space-y-4">
                {analyses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune analyse IA effectuée
                  </div>
                ) : (
                  analyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-900">{analysis.diagnosis}</span>
                        <span className={`px-2 py-1 rounded text-sm text-white ${
                          analysis.risk === 'élevé' ? 'bg-red-500' :
                          analysis.risk === 'modéré' ? 'bg-orange-500' : 'bg-green-500'
                        }`}>
                          {analysis.risk}
                        </span>
                      </div>
                      <div className="text-sm text-purple-700">
                        Confiance: {(analysis.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="prescriptions" className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune ordonnance
                  </div>
                ) : (
                  prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-900">
                          {new Date(prescription.date).toLocaleDateString('fr-FR')}
                        </span>
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        {prescription.medications.map((med: any, index: number) => (
                          <div key={index} className="text-sm text-blue-700">
                            {med.name} - {med.dosage}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
