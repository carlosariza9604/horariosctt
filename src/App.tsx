import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ugcavtjxvpcigotwhxkx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY2F2dGp4dnBjaWdvdHdoeGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDIxOTAsImV4cCI6MjA4ODQ3ODE5MH0.GjPLPdQgK8f0YnYiUED0ECNf5nMdUa59inBxnZl9D6I'
)

const NOMBRES = [
  'Administrador',
  'Alexander Alzamora', 'Alvaro Jiménez', 'Ana Barreto',
  'Angélica Cárdenas', 'Carlos Carreño', 'Cesar Rivera',
  'Claudia Roncancio', 'Claudia Sánchez', 'Diego Díaz',
  'Diego Nicolas Hortua', 'Dilan Triana', 'Edgar Garzón',
  'Edilberto Tovar', 'Eduardo Camargo', 'Fabián Martínez',
  'Felipe Medina', 'German Silva', 'Giovanny Mayorga',
  'Gustavo Guevara', 'Henry Vásquez', 'Hugo Ávila',
  'Humberto Chaparro', 'Iván Murillo', 'Jaider Mercado',
  'Jairo Betancourt', 'Jairo Jiménez', 'Jairo López',
  'Jeisson Andres Rodriguez', 'Jhon Castañeda', 'Jhon Meza',
  'Jhon Peña', 'Jorge Vicente Guzmán', 'Jose Alfredo Segura',
  'Jose Fernando Oliveros', 'Jose Luis Franco', 'Juan de Dios Fuentes',
  'Kevin Castañeda', 'Laura Gómez', 'Laura Pulido',
  'Lina Toro', 'Luis Ernesto Muñoz', 'Luis Miguel Huérfano',
  'Luis Rojas', 'Marcela Rodríguez', 'Marco Fidel Rivas',
  'Mario Remolina', 'Mauricio Garzón', 'Mauricio Rojas',
  'Nelson Robayo', 'Nubia Cortés', 'Omar Parrado',
  'Oscar Chaves', 'Paola Chaves', 'Pedro Rojas',
  'Rafael Blanco', 'Raúl Daza', 'René Bedoya',
  'Ricardo Rodríguez', 'Rodrigo Bautista', 'Rodrigo Huertas',
  'Rover Abdel', 'Santiago Rodríguez', 'Saul Cujaban',
  'Tatiana Mesa', 'Wilman Yesid Farfan', 'Wilmer Naranjo',
  'Wilson Parra', 'Yenny Buitrago', 'Yonhy Villamizar',
  'Yudy Romero', 'Zahira Franco', 'Zayra Paola Caballero'
]

function nombreAEmail(nombre: string) {
  return nombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.') + '@horarios.app'
}

function PaginaPDF({ pdfUrl, pagina }: { pdfUrl: string, pagina: number }) {
  const [imagenUrl, setImagenUrl] = useState<string>('')
  const [cargando, setCargando] = useState(true)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    async function renderizar() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

        const response = await fetch(pdfUrl)
        const arrayBuffer = await response.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const paginaPDF = await pdf.getPage(pagina)

        const viewport = paginaPDF.getViewport({ scale: 2.5 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const task = paginaPDF.render({
          canvasContext: ctx,
          viewport: viewport
        } as any)
        await task.promise

        setImagenUrl(canvas.toDataURL('image/png'))
        setCargando(false)
      } catch (err) {
        console.error(err)
        setCargando(false)
      }
    }
    renderizar()
  }, [pdfUrl, pagina])

  if (cargando) return <p style={{ textAlign: 'center', padding: '2rem' }}>⏳ Cargando horario...</p>
  if (!imagenUrl) return <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error al cargar horario</p>

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
          style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', borderRadius: '0.5rem', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' }}>
          ➖
        </button>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}
          style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', borderRadius: '0.5rem', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' }}>
          ➕
        </button>
        <button onClick={() => setZoom(1)}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '0.5rem', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' }}>
          Reset
        </button>
      </div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <img
          src={imagenUrl}
          alt="Horario"
          style={{
            width: `${zoom * 100}%`,
            minWidth: '300px',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'block'
          }}
        />
      </div>
    </div>
  )
}
function ListaHorarios() {
  const [lista, setLista] = useState<any[]>([])
  const [eliminando, setEliminando] = useState<string>('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    // Obtiene los trimestres únicos que hay en la tabla horarios
    const { data } = await supabase
      .from('horarios')
      .select('trimestre')
      .order('trimestre', { ascending: false })

    // Filtra para no repetir trimestres
    const unicos = [...new Set(data?.map((h: any) => h.trimestre) || [])]
    setLista(unicos)
  }

  async function eliminar(trimestre: string) {
    if (!confirm(`¿Seguro que quieres eliminar el trimestre "${trimestre}"?`)) return
    setEliminando(trimestre)

    // Elimina todos los horarios de ese trimestre en la tabla
    await supabase.from('horarios').delete().eq('trimestre', trimestre)

    // Elimina el PDF del storage
    await supabase.storage.from('horarios').remove([`${trimestre}.pdf`])

    await cargar()
    setEliminando('')
  }

  if (lista.length === 0) return <p style={{ color: '#999', fontSize: '0.9rem' }}>No hay horarios subidos aún.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      {lista.map((trimestre: string) => (
        <div key={trimestre} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem', backgroundColor: '#f8f9ff',
          borderRadius: '0.5rem', border: '1px solid #e0e7ff'
        }}>
          <span style={{ fontSize: '0.95rem', color: '#333' }}>📅 {trimestre}</span>
          <button
            onClick={() => eliminar(trimestre)}
            style={{
              backgroundColor: '#ef4444', color: 'white',
              border: 'none', padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem'
            }}>
            {eliminando === trimestre ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      ))}
    </div>
  )
} 
export default function App() {
  const [session, setSession] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [horarios, setHorarios] = useState<any[]>([])
  const [trimestre, setTrimestre] = useState('')
  const [loading, setLoading] = useState(true)
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [trimestreAdmin, setTrimestreAdmin] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [mensajeAdmin, setMensajeAdmin] = useState('')
  const [errorAdmin, setErrorAdmin] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session)
      if (session) cargarPerfil(session.user.id)
      else setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session)
      if (session) cargarPerfil(session.user.id)
      else setLoading(false)
    })
  }, [])

  async function cargarPerfil(userId: string) {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', userId).single()
    setPerfil(data)
    if (data) cargarHorarios(data.nombre)
    setLoading(false)
  }

  async function cargarHorarios(nombreProfe: string) {
    const { data } = await supabase
      .from('horarios').select('*')
      .eq('nombre_profesor', nombreProfe)
      .order('created_at', { ascending: false })
    setHorarios(data || [])
    if (data && data.length > 0) setTrimestre(data[0].trimestre)
  }

  async function registrarse() {
    setError(''); setMensaje('')
    if (!nombre) return setError('Selecciona tu nombre')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    const email = nombreAEmail(nombre)
    const { data, error: errAuth } = await supabase.auth.signUp({ email, password })
    if (errAuth) return setError('Error: ' + errAuth.message)
    if (data?.user) {
      await supabase.from('profiles').insert({ id: data.user.id, nombre, rol: 'profesor' })
    }
    setMensaje('✅ Registro exitoso, ahora inicia sesión')
    setModo('login')
  }

  async function iniciarSesion() {
    setError('')
    if (!nombre) return setError('Selecciona tu nombre')
    const email = nombreAEmail(nombre)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Nombre o contraseña incorrectos')
  }

  async function procesarPDF() {
    setErrorAdmin(''); setMensajeAdmin('')
    if (!pdfFile) return setErrorAdmin('Selecciona un archivo PDF')
    if (!trimestreAdmin) return setErrorAdmin('Escribe el nombre del trimestre')
    setSubiendo(true)

    try {
      const nombreArchivo = `${trimestreAdmin}.pdf`
      const { error: errStorage } = await supabase.storage
        .from('horarios')
        .upload(nombreArchivo, pdfFile, { upsert: true })
      if (errStorage) {
        setErrorAdmin('Error subiendo PDF: ' + errStorage.message)
        setSubiendo(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('horarios')
        .getPublicUrl(nombreArchivo)
      const pdfUrl = urlData.publicUrl

      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let guardados = 0

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const textos = content.items
          .map((item: any) => item.str?.trim())
          .filter((t: string) => t)
        const nombreProfe = textos[1]?.trim()
        if (!nombreProfe || nombreProfe === 'Institución predefinida') continue

        await supabase.from('horarios').upsert({
          nombre_profesor: nombreProfe,
          contenido: pdfUrl,
          pagina: i,
          trimestre: trimestreAdmin
        }, { onConflict: 'nombre_profesor,trimestre' })

        guardados++
      }

      setMensajeAdmin(`✅ ${guardados} horarios guardados correctamente`)
    } catch (err: any) {
      setErrorAdmin('Error: ' + err.message)
    }
    setSubiendo(false)
  }

  if (loading) return <div style={s.center}><p>Cargando...</p></div>

  if (!session) return (
    <div style={s.center}>
      <div style={s.card}>
       <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
           SENA
             </p>
              <p style={{ 
              margin: 0, 
              fontSize: '1rem', 
              color: '#16a34a', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
               textAlign: 'center'
}}>
  Centro de Tecnologías del Transporte
</p>
</div>
<h2 style={s.titulo}>📅 Horarios</h2>
<p style={s.subtitulo}>{modo === 'login' ? 'Inicia sesión' : 'Regístrate'}</p>
       
        <select style={s.input} value={nombre} onChange={e => setNombre(e.target.value)}>
          <option value="">-- Selecciona tu nombre --</option>
          {NOMBRES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <input style={s.input} type="password" placeholder="Contraseña"
          value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={s.error}>{error}</p>}
        {mensaje && <p style={s.exito}>{mensaje}</p>}
        <button style={s.boton} onClick={modo === 'login' ? iniciarSesion : registrarse}>
          {modo === 'login' ? 'Ingresar' : 'Registrarse'}
        </button>
        <p style={s.link} onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); setMensaje('') }}>
          {modo === 'login' ? '¿Primera vez? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </div>
    </div>
  )

  if (perfil?.rol === 'admin') return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.headerTitulo}>👑 Panel Admin</h2>
          <p style={s.headerSub}>Gestión de horarios</p>
        </div>
        <button style={s.botonCerrar} onClick={() => supabase.auth.signOut()}>Salir</button>
      </div>
      <div style={s.content}>
        <div style={s.card2}>
          <h3>🗑️ Horarios subidos</h3><ListaHorarios />
          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
          <h3>📄 Subir PDF de horarios</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Nombre del trimestre (ej: 2025-Trimestre-1)"
              value={trimestreAdmin} onChange={e => setTrimestreAdmin(e.target.value)} style={s.input} />
            <input type="file" accept=".pdf"
              onChange={e => setPdfFile(e.target.files?.[0] || null)} style={s.input} />
            {mensajeAdmin && <p style={{ color: 'green' }}>{mensajeAdmin}</p>}
            {errorAdmin && <p style={{ color: 'red' }}>{errorAdmin}</p>}
            <button style={s.boton} onClick={procesarPDF}>
              {subiendo ? 'Procesando...' : '📤 Subir y procesar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const horarioActual = horarios.find(h => h.trimestre === trimestre)

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.headerTitulo}>📅 Mi Horario</h2>
          <p style={s.headerSub}>Bienvenido, {perfil?.nombre}</p>
        </div>
        <button style={s.botonCerrar} onClick={() => supabase.auth.signOut()}>Salir</button>
      </div>
      <div style={s.content}>
        {horarios.length === 0 ? (
          <div style={s.vacio}>
            <p>📭 Aún no hay horarios cargados.</p>
            <p>El administrador debe subir el PDF primero.</p>
          </div>
        ) : (
          <>
            <div style={s.selectorBox}>
              <label style={s.label}>Trimestre:</label>
              <select style={s.select} value={trimestre} onChange={e => setTrimestre(e.target.value)}>
                {horarios.map(h => <option key={h.trimestre} value={h.trimestre}>{h.trimestre}</option>)}
              </select>
            </div>
            {horarioActual && (
              <PaginaPDF
                pdfUrl={horarioActual.contenido}
                pagina={horarioActual.pagina}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

const s: any = {
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  page: { minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#4f46e5', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitulo: { margin: 0, fontSize: '1.2rem' },
  headerSub: { margin: 0, fontSize: '0.85rem', opacity: 0.85 },
  botonCerrar: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' },
  content: { padding: '1rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' },
  card2: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  titulo: { textAlign: 'center', margin: 0, color: '#1a1a2e' },
  subtitulo: { textAlign: 'center', margin: 0, color: '#666', fontSize: '0.9rem' },
  input: { padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  boton: { padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#16a34a', color: 'white', border: 'none', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'red', fontSize: '0.85rem', margin: 0 },
  exito: { color: 'green', fontSize: '0.85rem', margin: 0 },
  link: { textAlign: 'center', color: '#4f46e5', cursor: 'pointer', fontSize: '0.85rem' },
  vacio: { textAlign: 'center', color: '#666', marginTop: '3rem' },
  selectorBox: { marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  label: { fontWeight: 'bold', color: '#333' },
  select: { padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem' },
}