import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// ============ AUTH ROUTES ============

app.post('/make-server-1cc3a412/signup', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { email, password, name, specialty } = await c.req.json()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, specialty },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log(`Signup error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Store user profile in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      specialty,
      createdAt: new Date().toISOString()
    })

    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log(`Signup server error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ============ PATIENT ROUTES ============

app.get('/make-server-1cc3a412/patients', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patients = await kv.getByPrefix(`patient:${user.id}:`)
    return c.json({ patients })
  } catch (error) {
    console.log(`Get patients error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.post('/make-server-1cc3a412/patients', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patientData = await c.req.json()
    const patientId = crypto.randomUUID()
    
    const patient = {
      id: patientId,
      doctorId: user.id,
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await kv.set(`patient:${user.id}:${patientId}`, patient)
    return c.json({ success: true, patient })
  } catch (error) {
    console.log(`Create patient error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.put('/make-server-1cc3a412/patients/:id', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patientId = c.req.param('id')
    const updates = await c.req.json()
    
    const existingPatient = await kv.get(`patient:${user.id}:${patientId}`)
    if (!existingPatient) {
      return c.json({ error: 'Patient not found' }, 404)
    }

    const updatedPatient = {
      ...existingPatient,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await kv.set(`patient:${user.id}:${patientId}`, updatedPatient)
    return c.json({ success: true, patient: updatedPatient })
  } catch (error) {
    console.log(`Update patient error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.delete('/make-server-1cc3a412/patients/:id', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patientId = c.req.param('id')
    await kv.del(`patient:${user.id}:${patientId}`)
    
    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete patient error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ============ MEASUREMENTS ROUTES ============

app.post('/make-server-1cc3a412/measurements', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const measurementData = await c.req.json()
    const measurementId = crypto.randomUUID()
    
    const measurement = {
      id: measurementId,
      doctorId: user.id,
      ...measurementData,
      timestamp: new Date().toISOString()
    }

    await kv.set(`measurement:${measurementData.patientId}:${measurementId}`, measurement)
    return c.json({ success: true, measurement })
  } catch (error) {
    console.log(`Create measurement error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.get('/make-server-1cc3a412/measurements/:patientId', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patientId = c.req.param('patientId')
    const measurements = await kv.getByPrefix(`measurement:${patientId}:`)
    
    return c.json({ measurements })
  } catch (error) {
    console.log(`Get measurements error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ============ PRESCRIPTIONS ROUTES ============

app.post('/make-server-1cc3a412/prescriptions', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const prescriptionData = await c.req.json()
    const prescriptionId = crypto.randomUUID()
    
    const prescription = {
      id: prescriptionId,
      doctorId: user.id,
      ...prescriptionData,
      createdAt: new Date().toISOString()
    }

    await kv.set(`prescription:${prescriptionData.patientId}:${prescriptionId}`, prescription)
    return c.json({ success: true, prescription })
  } catch (error) {
    console.log(`Create prescription error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.get('/make-server-1cc3a412/prescriptions/:patientId', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patientId = c.req.param('patientId')
    const prescriptions = await kv.getByPrefix(`prescription:${patientId}:`)
    
    return c.json({ prescriptions })
  } catch (error) {
    console.log(`Get prescriptions error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ============ AI ANALYSIS ROUTES ============

app.post('/make-server-1cc3a412/ai-analysis', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { patientId, measurements } = await c.req.json()
    
    // Simulated AI Analysis
    const avgPressure = measurements.reduce((acc: number, m: any) => acc + m.pressure, 0) / measurements.length
    const avgTemp = measurements.reduce((acc: number, m: any) => acc + m.temperature, 0) / measurements.length
    const avgEMG = measurements.reduce((acc: number, m: any) => acc + m.emg, 0) / measurements.length
    
    let risk = 'faible'
    let diagnosis = 'Normal'
    let confidence = 0.95
    
    if (avgPressure < 50 || avgTemp < 30 || avgEMG < 20) {
      risk = 'élevé'
      diagnosis = 'Neuropathie diabétique suspectée'
      confidence = 0.87
    } else if (avgPressure < 70 || avgTemp < 32 || avgEMG < 40) {
      risk = 'modéré'
      diagnosis = 'Signes précoces possibles'
      confidence = 0.78
    }
    
    const analysisId = crypto.randomUUID()
    const analysis = {
      id: analysisId,
      patientId,
      doctorId: user.id,
      risk,
      diagnosis,
      confidence,
      metrics: {
        avgPressure,
        avgTemperature: avgTemp,
        avgEMG
      },
      recommendations: risk === 'élevé' 
        ? ['Consultation spécialisée recommandée', 'Surveillance accrue nécessaire', 'Tests complémentaires à envisager']
        : risk === 'modéré'
        ? ['Surveillance régulière', 'Réévaluation dans 1 mois']
        : ['Continuer le suivi habituel'],
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`ai-analysis:${patientId}:${analysisId}`, analysis)
    
    return c.json({ success: true, analysis })
  } catch (error) {
    console.log(`AI analysis error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.get('/make-server-1cc3a412/ai-analysis/:patientId', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const patientId = c.req.param('patientId')
    const analyses = await kv.getByPrefix(`ai-analysis:${patientId}:`)
    
    return c.json({ analyses })
  } catch (error) {
    console.log(`Get AI analyses error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ============ ALERTS ROUTES ============

app.post('/make-server-1cc3a412/alerts', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const alertData = await c.req.json()
    const alertId = crypto.randomUUID()
    
    const alert = {
      id: alertId,
      doctorId: user.id,
      ...alertData,
      createdAt: new Date().toISOString(),
      read: false
    }

    await kv.set(`alert:${user.id}:${alertId}`, alert)
    return c.json({ success: true, alert })
  } catch (error) {
    console.log(`Create alert error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.get('/make-server-1cc3a412/alerts', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const alerts = await kv.getByPrefix(`alert:${user.id}:`)
    return c.json({ alerts })
  } catch (error) {
    console.log(`Get alerts error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.put('/make-server-1cc3a412/alerts/:id/read', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const alertId = c.req.param('id')
    const alert = await kv.get(`alert:${user.id}:${alertId}`)
    
    if (!alert) {
      return c.json({ error: 'Alert not found' }, 404)
    }

    const updatedAlert = { ...alert, read: true }
    await kv.set(`alert:${user.id}:${alertId}`, updatedAlert)
    
    return c.json({ success: true, alert: updatedAlert })
  } catch (error) {
    console.log(`Mark alert as read error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ============ SETTINGS ROUTES ============

app.get('/make-server-1cc3a412/settings', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const settings = await kv.get(`settings:${user.id}`) || {
      theme: 'light',
      gloveConnectionMode: 'bluetooth',
      measurementFrequency: 1000,
      alertThresholds: {
        pressure: 50,
        temperature: 30,
        emg: 20
      }
    }
    
    return c.json({ settings })
  } catch (error) {
    console.log(`Get settings error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

app.put('/make-server-1cc3a412/settings', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const newSettings = await c.req.json()
    await kv.set(`settings:${user.id}`, newSettings)
    
    return c.json({ success: true, settings: newSettings })
  } catch (error) {
    console.log(`Update settings error: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

Deno.serve(app.fetch)
