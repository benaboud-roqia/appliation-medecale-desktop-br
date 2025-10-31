import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { FileText, Plus, Trash2, Download, Calendar } from 'lucide-react'
import logo from 'figma:asset/ee3f983c04a3cb5bc3c97a2c7888ebe2b5892031.png'

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export const PrescriptionEditor: React.FC = () => {
  const { user, accessToken } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ])
  const [notes, setNotes] = useState('')
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      loadPrescriptions()
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

  const loadPrescriptions = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/prescriptions/${selectedPatient}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )
      const data = await response.json()
      setPrescriptions(data.prescriptions || [])
    } catch (error) {
      console.error('Error loading prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index][field] = value
    setMedications(updated)
  }

  const createPrescription = async () => {
    if (!selectedPatient) {
      alert('Veuillez sélectionner un patient')
      return
    }

    const validMedications = medications.filter(m => m.name && m.dosage)
    if (validMedications.length === 0) {
      alert('Veuillez ajouter au moins un médicament')
      return
    }

    try {
      const patient = patients.find(p => p.id === selectedPatient)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/prescriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            patientId: selectedPatient,
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorName: user?.name,
            doctorSpecialty: user?.specialty,
            medications: validMedications,
            notes,
            date: new Date().toISOString()
          })
        }
      )

      if (response.ok) {
        alert('Ordonnance créée avec succès')
        setMedications([{ name: '', dosage: '', frequency: '', duration: '' }])
        setNotes('')
        loadPrescriptions()
      }
    } catch (error) {
      console.error('Error creating prescription:', error)
      alert('Erreur lors de la création de l\'ordonnance')
    }
  }

  const generatePDF = async (prescription: any) => {
    // Create professional prescription image
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1100
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load and draw logo
    const logoImg = new Image()
    logoImg.crossOrigin = 'anonymous'
    logoImg.src = logo
    
    await new Promise((resolve) => {
      logoImg.onload = () => {
        ctx.drawImage(logoImg, 650, 30, 120, 120)
        resolve(true)
      }
      logoImg.onerror = () => resolve(false)
    })

    // Header - Doctor info
    ctx.fillStyle = '#1e40af'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Dr ${prescription.doctorName}`, 50, 60)
    
    ctx.fillStyle = '#374151'
    ctx.font = '18px Arial'
    ctx.fillText(prescription.doctorSpecialty, 50, 90)
    
    ctx.font = '14px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('Alger', 50, 115)
    ctx.fillText('Tél : 0555265120', 50, 135)
    ctx.fillText(`N° Ordre : 00122017`, 50, 155)

    // Title
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 36px Arial'
    ctx.fillText('Ordonnance', 300, 220)

    // Line separator
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 240)
    ctx.lineTo(750, 240)
    ctx.stroke()

    // Date and Patient info
    const dateStr = new Date(prescription.date).toLocaleDateString('fr-FR')
    ctx.fillStyle = '#374151'
    ctx.font = '14px Arial'
    ctx.fillText(`Faite le : ${dateStr}`, 50, 280)
    
    ctx.fillText(`Patient(e) : ${prescription.patientName}`, 400, 280)

    // Get patient age from patients list
    const patient = patients.find(p => p.id === prescription.patientId)
    const age = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : ''
    if (age) {
      ctx.fillText(`Âge : ${age} ans`, 400, 300)
    }

    // Medications
    let yPos = 350
    ctx.fillStyle = '#000000'
    ctx.font = '16px Arial'
    
    prescription.medications.forEach((med: Medication, index: number) => {
      // Box for each medication
      ctx.strokeStyle = '#d1d5db'
      ctx.strokeRect(50, yPos - 20, 700, 100)
      
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(`Qte: 1`, 680, yPos)
      
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`${med.name.toUpperCase()}`, 60, yPos)
      
      ctx.font = '13px Arial'
      ctx.fillStyle = '#374151'
      const dosageText = `${med.dosage} - ${med.frequency}`
      ctx.fillText(dosageText, 60, yPos + 25)
      ctx.fillText(`Durée : ${med.duration}`, 60, yPos + 50)
      
      yPos += 120
    })

    // Notes
    if (prescription.notes) {
      yPos += 20
      ctx.fillStyle = '#1e40af'
      ctx.font = 'bold 14px Arial'
      ctx.fillText('Notes :', 50, yPos)
      
      ctx.fillStyle = '#374151'
      ctx.font = '13px Arial'
      const words = prescription.notes.split(' ')
      let line = ''
      yPos += 20
      
      words.forEach((word: string) => {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > 680) {
          ctx.fillText(line, 50, yPos)
          line = word + ' '
          yPos += 20
        } else {
          line = testLine
        }
      })
      ctx.fillText(line, 50, yPos)
    }

    // Barcode placeholder
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    for (let i = 0; i < 40; i++) {
      const x = 50 + (i * 3)
      const height = Math.random() > 0.5 ? 40 : 50
      ctx.fillRect(x, 950, 2, height)
    }
    
    ctx.fillStyle = '#374151'
    ctx.font = '12px Arial'
    ctx.fillText('0291-672', 180, 1010)

    // Signature
    ctx.fillStyle = '#1e40af'
    ctx.font = 'italic 14px Arial'
    ctx.fillText(`Signature électronique: Dr. ${prescription.doctorName}`, 450, 1050)

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ordonnance_${prescription.patientName}_${new Date(prescription.date).toISOString().split('T')[0]}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Gestion des ordonnances</h1>
        <p className="text-gray-600">Création et gestion des prescriptions médicales</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle ordonnance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Médicaments</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {medications.map((med, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du médicament</Label>
                    <Input
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      placeholder="Ex: Metformine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posologie</Label>
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="Ex: 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fréquence</Label>
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="Ex: 2 fois par jour"
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Durée</Label>
                      <Input
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="Ex: 30 jours"
                      />
                    </div>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Notes et recommandations</Label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions supplémentaires, contre-indications, etc."
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={createPrescription} className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Créer l'ordonnance
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <div className="space-y-4">
          <h2 className="text-gray-900">Ordonnances précédentes</h2>
          
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Chargement...
              </CardContent>
            </Card>
          ) : prescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                Aucune ordonnance pour ce patient
              </CardContent>
            </Card>
          ) : (
            prescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>{new Date(prescription.date).toLocaleDateString('fr-FR')}</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(prescription)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Patient: </span>
                      <span className="text-gray-900">{prescription.patientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Médecin: </span>
                      <span className="text-gray-900">{prescription.doctorName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Médicaments prescrits:</div>
                    {prescription.medications.map((med: Medication, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="text-gray-900">{med.name} - {med.dosage}</div>
                        <div className="text-gray-600">{med.frequency} pendant {med.duration}</div>
                      </div>
                    ))}
                  </div>

                  {prescription.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <div className="text-gray-600 mb-1">Notes:</div>
                      <div className="text-gray-900">{prescription.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
