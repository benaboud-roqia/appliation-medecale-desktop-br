import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Brain, Activity, AlertTriangle, CheckCircle2, TrendingUp, FileText, MessageCircle, Send, Bot } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'

interface AIAnalysisResult {
  id: string
  patientId: string
  risk: 'faible' | 'modéré' | 'élevé'
  diagnosis: string
  confidence: number
  metrics: {
    avgPressure: number
    avgTemperature: number
    avgEMG: number
  }
  recommendations: string[]
  createdAt: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const AIAnalysis: React.FC = () => {
  const { accessToken } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Bonjour, je suis votre assistant IA médical. Je peux vous aider à interpréter les résultats d\'analyses, répondre à vos questions sur la neuropathie diabétique et la SLA, ou vous conseiller sur les cas cliniques. Comment puis-je vous aider ?',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      loadAnalyses()
    }
  }, [selectedPatient])

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

  const loadAnalyses = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/ai-analysis/${selectedPatient}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )
      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (error) {
      console.error('Error loading analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    if (!selectedPatient) return

    setAnalyzing(true)
    try {
      // Load measurements for this patient
      const measurementsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/measurements/${selectedPatient}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )
      const measurementsData = await measurementsRes.json()

      if (!measurementsData.measurements || measurementsData.measurements.length === 0) {
        alert('Aucune mesure disponible pour ce patient')
        return
      }

      // Run AI analysis
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/ai-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            patientId: selectedPatient,
            measurements: measurementsData.measurements
          })
        }
      )

      if (response.ok) {
        await loadAnalyses()
        alert('Analyse IA terminée avec succès')
      }
    } catch (error) {
      console.error('Error running analysis:', error)
      alert('Erreur lors de l\'analyse')
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'faible': return 'bg-green-500'
      case 'modéré': return 'bg-orange-500'
      case 'élevé': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'faible': return <CheckCircle2 className="w-5 h-5" />
      case 'modéré': return <AlertTriangle className="w-5 h-5" />
      case 'élevé': return <AlertTriangle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "D'après les données analysées, je vous recommande de surveiller attentivement les valeurs de pression et de température. Une baisse significative peut indiquer une progression de la neuropathie.",
        "La neuropathie diabétique se manifeste généralement par une diminution de la sensibilité et de la température cutanée. Les mesures EMG peuvent révéler une atteinte nerveuse précoce.",
        "Je vous suggère d'effectuer des mesures régulières et de comparer les tendances sur plusieurs semaines. Cela permettra de détecter toute détérioration progressive.",
        "Les seuils d'alerte actuels semblent appropriés. Cependant, pour ce patient, je recommande une surveillance accrue étant donné l'historique médical.",
        "La SLA (sclérose latérale amyotrophique) présente des patterns EMG caractéristiques. Les mesures régulières permettent de suivre l'évolution de la maladie.",
        "Basé sur les analyses précédentes, je recommande un contrôle endocrinologique approfondi et un ajustement potentiel du traitement antidiabétique."
      ]
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])
      setChatLoading(false)
      
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }, 1000)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Analyse IA & Diagnostic</h1>
        <p className="text-gray-600">Détection de neuropathie diabétique et SLA par intelligence artificielle</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lancer une nouvelle analyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Sélectionner un patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un patient" />
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

            <Button 
              onClick={runAnalysis} 
              disabled={!selectedPatient || analyzing}
              className="w-full"
            >
              <Brain className="w-4 h-4 mr-2" />
              {analyzing ? 'Analyse en cours...' : 'Démarrer l\'analyse IA'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <span>Assistant IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Posez votre question..."
                disabled={chatLoading}
              />
              <Button type="submit" size="icon" disabled={chatLoading || !chatInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {selectedPatient && (
        <div className="space-y-4">
          <h2 className="text-gray-900">Historique des analyses</h2>
          
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Chargement des analyses...
              </CardContent>
            </Card>
          ) : analyses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                Aucune analyse disponible pour ce patient
              </CardContent>
            </Card>
          ) : (
            analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span>Analyse du {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}</span>
                    </CardTitle>
                    <Badge className={getRiskColor(analysis.risk)}>
                      {getRiskIcon(analysis.risk)}
                      <span className="ml-1 capitalize">{analysis.risk}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Diagnostic</span>
                      <span className="text-sm text-gray-600">Confiance: {(analysis.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-gray-900">{analysis.diagnosis}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Pression moyenne</div>
                      <div className="text-blue-900">{analysis.metrics.avgPressure.toFixed(1)} mmHg</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Température moyenne</div>
                      <div className="text-orange-900">{analysis.metrics.avgTemperature.toFixed(1)} °C</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">EMG moyen</div>
                      <div className="text-purple-900">{analysis.metrics.avgEMG.toFixed(1)} µV</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">Recommandations</span>
                    </div>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Télécharger le rapport
                    </Button>
                    <Button variant="outline">
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
