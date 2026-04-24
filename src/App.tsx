import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const NOMBRES = [
  'Administrador',
'Adriana Rodriguez Benito',
'Alex Perea',
'Aleyda Peña',
'Alvaro Leonardo Garzon',
'Alvaro Vasquez Latorre',
'Andrea Avila',
'Andres Alexander Pinzon',
'Angel Javier medina',
'Ariel Gil',
'Blanca Cecilia Hernandez',
'Brayan Cardozo',
'Carlos Alberto Navarro',
'Carlos Pinzon',
'Carlos Roberto Fonseca',
'Cesar Agusto Caballero',
'Claudio Duque',
'Dahian Andrea Martinez',
'Daniel Puentes',
'Diana Caterine Tache',
'Diego David Arciniegas',
'Doris Cañon',
'Edgar David Zabaleta',
'Edgar Lemus',
'Edgar Nemesio Torres',
'Edgar Orlando Duarte',
'Edwar Alfonso Guzman',
'Edison Enoc Rojas',
'Edwin Alexander Gonzalez',
'Edwin Mauricio Beltran',
'Erick Edison Gomez',
'Favio Narvaez',
'Fidel Ramiro Gutierrez',
'Fredy Andres de salvador',
'Giovanny Zamora',
'Hernan David Mendoza',
'Heyner Hernan Rodriguez',
'Humberto Ricaurte Camargo',
'Janeth Rosalba Rincon',
'Jeraldyn Marcela Jiménez López',
'Jesus Fernando Contreras',
'Jhon Cabezas',
'Jhony Mejia',
'Joan Alexander Romero',
'Johan Jimenez',
'Johslein Darío Largo Palau',
'Jorge Bahamon',
'Jorge Caina',
'Jorge Enrique Chaparro',
'Jorge Libardo Villamil',
'Jorge Luis Mojica',
'Jorge Mauricio Vega',
'Jose Agustin Godoy',
'Jose Alberto Burgos',
'Jose Fernando Moreno',
'Juan Gabriel Gutierrez',
'Julio Cesar Supelano',
'July Marcela Castellanos',
'Kevin Danilo Forero Bejarano',
'Laura Katerine Meneses',
'Leidi Niyreth Leon Torres',
'Leonardo leguizamón Chaparro',
'Luz Miriam Cruz',
'Luz Miryam Rodriguez',
'Maria Claudia Gelvez',
'Martha Isabel Bustos',
'Miguel Eduardo Diaz',
'Naira Dina Velasco',
'Nelson Fernando Cardona',
'Orlando Galindo Garzón',
'Orlando Mican Silva',
'Oscar Heli Gonzalez',
'Oscar Ivan Gomez',
'Rafael Pizarro',
'Roberto Iregui',
'Robinson Castiblanco',
'Ruben Dario Pineda',
'Samuel Enrique Merchán',
'Sandra Espinosa',
'Sandra Rocio Angarita',
'Victor Gutierrez',
'Vilma Ruth Casaguas',
'Walter Contreras Ibagón',
'William Javier Gomez',
'Wilmar Alexander Parra',
'Wilmer Eduardo Galvis',
'Yenny del Carmen Palacios',
'Yeison Alberto Romero',
'Yury Gonzalez',
'Leandro Cardenas'
]

const MAX_PDF_SIZE = 20 * 1024 * 1024   // 20 MB
const MAX_EXCEL_SIZE = 10 * 1024 * 1024 // 10 MB

async function esPDFValido(file: File): Promise<boolean> {
  if (file.size > MAX_PDF_SIZE) return false
  const buf = await file.slice(0, 4).arrayBuffer()
  const b = new Uint8Array(buf)
  return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 // %PDF
}

async function esExcelValido(file: File): Promise<boolean> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xls', 'xlsx'].includes(ext ?? '')) return false
  if (file.size > MAX_EXCEL_SIZE) return false
  const buf = await file.slice(0, 4).arrayBuffer()
  const b = new Uint8Array(buf)
  const esXlsx = b[0] === 0x50 && b[1] === 0x4B && b[2] === 0x03 && b[3] === 0x04
  const esXls  = b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0
  return esXlsx || esXls
}

function sanitizarTrimestre(valor: string): string {
  // Solo permite letras (con tildes), números, guiones, guion bajo y espacios
  return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\-_ ]/g, '').slice(0, 50).trim()
}

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
function ListaFichas() {
  const [fichas, setFichas] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [eliminando, setEliminando] = useState<string>('')

  useEffect(() => {
    cargarFichas()
  }, [])

  async function cargarFichas() {
    const { data, error } = await supabase.storage
      .from('fichas')
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
    if (!error) setFichas(data || [])
  }

  async function eliminarFicha(nombre: string) {
    if (!confirm(`¿Seguro que quieres eliminar la ficha "${nombre}"?`)) return
    setEliminando(nombre)
    await supabase.storage.from('fichas').remove([nombre])
    await cargarFichas()
    setEliminando('')
  }

  const fichasFiltradas = fichas.filter(f =>
    f.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>📋 Fichas subidas</h3>

      {/* Buscador */}
      <input
        type="text"
        placeholder="🔍 Buscar por número de ficha..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ ...s.input, marginBottom: '0.75rem' }}
      />

      {fichas.length === 0 && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No hay fichas subidas aún.</p>
      )}

      {fichasFiltradas.length === 0 && fichas.length > 0 && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No se encontró ninguna ficha.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {fichasFiltradas.map(ficha => (
          <div key={ficha.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.6rem 0.75rem', backgroundColor: '#f8f9ff',
            borderRadius: '0.5rem', border: '1px solid #e0e7ff'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#333' }}>
           📄 {ficha.name.replace(/\.(xls|xlsx)$/i, '')}
           </span>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button
           onClick={() => {
           const { data } = supabase.storage.from('fichas').getPublicUrl(ficha.name)
            window.open(data.publicUrl, '_blank')
    }}
    style={{
      backgroundColor: '#4f46e5', color: 'white',
      border: 'none', padding: '0.3rem 0.6rem',
      borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem'
    }}>
    ⬇️
  </button>
  <button
    onClick={() => eliminarFicha(ficha.name)}
    style={{
      backgroundColor: '#ef4444', color: 'white',
      border: 'none', padding: '0.3rem 0.6rem',
      borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem'
    }}>
    {eliminando === ficha.name ? '...' : '✕'}
  </button>
</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BuscadorFichasInstructor() {
  const [fichas, setFichas] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    supabase.storage
      .from('fichas')
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
      .then(({ data, error }) => { if (!error) setFichas(data || []) })
  }, [])

  const fichasFiltradas = fichas.filter(f =>
    f.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 0.75rem 0', color: '#1a1a2e' }}>📋 Descargar listado de ficha</h3>
      <input
        type="text"
        placeholder="🔍 Buscar por número de ficha..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ ...s.input, marginBottom: '0.75rem' }}
      />
      {fichas.length === 0 && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No hay fichas disponibles aún.</p>
      )}
      {fichasFiltradas.length === 0 && fichas.length > 0 && (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>No se encontró ninguna ficha.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {fichasFiltradas.map(ficha => (
          <div key={ficha.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.6rem 0.75rem', backgroundColor: '#f8f9ff',
            borderRadius: '0.5rem', border: '1px solid #e0e7ff'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#333' }}>
              📄 {ficha.name.replace(/\.(xls|xlsx)$/i, '')}
            </span>
            <button
              onClick={() => {
                const { data } = supabase.storage.from('fichas').getPublicUrl(ficha.name)
                window.open(data.publicUrl, '_blank')
              }}
              style={{
                backgroundColor: '#4f46e5', color: 'white',
                border: 'none', padding: '0.3rem 0.7rem',
                borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem'
              }}>
              ⬇️ Descargar
            </button>
          </div>
        ))}
      </div>
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
  const [excelFiles, setExcelFiles] = useState<File[]>([])
  const [subiendoZip, setSubiendoZip] = useState(false)
  const [mensajeZip, setMensajeZip] = useState('')
  const [errorZip, setErrorZip] = useState('')
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('horarios').select('created_at').order('created_at', { ascending: false }).limit(1).single()
      .then(({ data }) => {
        if (data?.created_at) {
          // Fuerza interpretacion UTC: Supabase a veces omite el sufijo de zona horaria
          const raw: string = data.created_at
          const isoUtc = raw.replace(' ', 'T').replace(/(\+00|Z)?$/, 'Z').replace('ZZ', 'Z')
          const utc = new Date(isoUtc)
          const bogota = new Date(utc.getTime() - 5 * 60 * 60 * 1000)
          const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
          const dia = String(bogota.getUTCDate()).padStart(2, '0')
          const mes = meses[bogota.getUTCMonth()]
          const anio = bogota.getUTCFullYear()
          const h = bogota.getUTCHours()
          const min = String(bogota.getUTCMinutes()).padStart(2, '0')
          const ampm = h >= 12 ? 'p. m.' : 'a. m.'
          const h12 = h % 12 || 12
          setUltimaActualizacion(`${dia} de ${mes} de ${anio}, ${h12}:${min} ${ampm}`)
        }
      })

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

    const trimestreLimpio = sanitizarTrimestre(trimestreAdmin)
    if (!trimestreLimpio) return setErrorAdmin('El nombre del trimestre contiene caracteres no permitidos')

    if (!await esPDFValido(pdfFile))
      return setErrorAdmin('El archivo no es un PDF válido o supera los 20 MB')

    setSubiendo(true)

    try {
      const nombreArchivo = `${trimestreLimpio}.pdf`
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
          trimestre: trimestreLimpio
        }, { onConflict: 'nombre_profesor,trimestre' })

        guardados++
      }

      setMensajeAdmin(`✅ ${guardados} horarios guardados correctamente`)
    } catch (err: any) {
      setErrorAdmin('Error: ' + err.message)
    }
    setSubiendo(false)
  }
  async function subirFichas() {
  setErrorZip(''); setMensajeZip('')
  if (excelFiles.length === 0) return setErrorZip('Selecciona al menos un archivo Excel')
  setSubiendoZip(true)

  let subidos = 0
  let errores = 0

  for (const archivo of excelFiles) {
    if (!await esExcelValido(archivo)) {
      errores++
      continue
    }

    const { error } = await supabase.storage
      .from('fichas')
      .upload(archivo.name, archivo, {
        upsert: true,
        contentType: 'application/vnd.ms-excel'
      })

    if (error) {
      console.error(`Error subiendo ${archivo.name}:`, error)
      errores++
    } else {
      subidos++
    }
  }

  setMensajeZip(`✅ ${subidos} fichas subidas${errores > 0 ? ` (${errores} errores)` : ''}`)
  setSubiendoZip(false)
}


  if (loading) return <div style={s.center}><p>Cargando...</p></div>

  if (!session) return (
    <div style={s.center}>
      {ultimaActualizacion && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#fffbeb', border: '1px solid #f59e0b',
          borderRadius: '0.5rem', padding: '0.5rem 1rem',
          fontSize: '0.82rem', color: '#92400e', whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          📅 Última actualización de horarios: <strong>{ultimaActualizacion}</strong>
        </div>
      )}
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

            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #eee' }} />
             <ListaFichas />
             <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #eee' }} />
            <h3>📁 Subir fichas Excel</h3>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              Selecciona uno o varios archivos Excel. El número de ficha se tomará del nombre de cada archivo.
            </p>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="file" accept=".xls,.xlsx" multiple
            onChange={e => setExcelFiles(Array.from(e.target.files || []))} style={s.input} />
           {mensajeZip && <p style={{ color: 'green' }}>{mensajeZip}</p>}
            {errorZip && <p style={{ color: 'red' }}>{errorZip}</p>}
           <button style={s.boton} onClick={subirFichas}>
            {subiendoZip ? 'Subiendo fichas...' : '📦 Subir fichas'}
            </button>
           </div>
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
        <BuscadorFichasInstructor />
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