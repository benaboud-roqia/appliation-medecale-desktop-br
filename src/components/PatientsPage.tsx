import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Users, Plus, Search, Calendar, Phone, Mail, FileText } from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string
  email: string
  medicalHistory: string
  diagnosis: string
  createdAt: string
}

export const PatientsPage: React.FC<{ onSelectPatient: (patient: Patient) => void }> = ({ onSelectPatient }) => {
  const { accessToken } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    medicalHistory: '',
    diagnosis: ''
  })

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    const filtered = patients.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPatients(filtered)
  }, [searchTerm, patients])

  const loadPatients = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/patients`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(newPatient)
      })

      if (response.ok) {
        await loadPatients()
        setIsDialogOpen(false)
        setNewPatient({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          phone: '',
          email: '',
          medicalHistory: '',
          diagnosis: ''
        })
      }
    } catch (error) {
      console.error('Error creating patient:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chargement des patients...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Gestion des patients</h1>
          <p className="text-gray-600">{patients.length} patient(s) enregistré(s)</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnostic principal</Label>
                <Input
                  id="diagnosis"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  placeholder="Ex: Diabète de type 2, Neuropathie diabétique..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Antécédents médicaux</Label>
                <textarea
                  id="medicalHistory"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  placeholder="Historique médical, allergies, traitements en cours..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer le patient</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Rechercher un patient par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectPatient(patient)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{patient.firstName} {patient.lastName}</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {patient.email}
                </div>
                {patient.diagnosis && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    {patient.diagnosis}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
