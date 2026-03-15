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
  const [fichas, setFichas] = useState<string[]>([])

  useEffect(() => {
    async function renderizar() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

        const response = await fetch(pdfUrl)
        const arrayBuffer = await response.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const paginaPDF = await pdf.getPage(pagina)

        // Renderizar imagen
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

        // Extraer texto y buscar números de ficha de 7 dígitos
        const content = await paginaPDF.getTextContent()
        const texto = content.items.map((item: any) => item.str).join(' ')
        const matches = texto.match(/\b\d{7}\b/g) || []
        const unicas = [...new Set(matches)] as string[]
        setFichas(unicas)

        setCargando(false)
      } catch (err) {
        console.error(err)
        setCargando(false)
      }
    }
    renderizar()
  }, [pdfUrl, pagina])

  async function descargarFicha(numeroFicha: string) {
    // Busca el archivo en Storage con extensión .xls o .xlsx
    const extensiones = ['.xls', '.xlsx']
    for (const ext of extensiones) {
      const nombre = `${numeroFicha}${ext}`
      const { data } = supabase.storage.from('fichas').getPublicUrl(nombre)
      const response = await fetch(data.publicUrl, { method: 'HEAD' })
      if (response.ok) {
        window.open(data.publicUrl, '_blank')
        return
      }
    }
    alert(`No se encontró el archivo de la ficha ${numeroFicha}`)
  }

  if (cargando) return <p style={{ textAlign: 'center', padding: '2rem' }}>⏳ Cargando horario...</p>
  if (!imagenUrl) return <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error al cargar horario</p>

  return (
    <div>
      {/* Botones de zoom */}
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

      {/* Imagen del horario */}
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

      {/* Fichas encontradas */}
      {fichas.length > 0 && (
        <div style={{ marginTop: '1rem', backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', color: '#333' }}>
            📋 Fichas en tu horario:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {fichas.map(ficha => (
              <button
                key={ficha}
                onClick={() => descargarFicha(ficha)}
                style={{
                  backgroundColor: '#4f46e5', color: 'white',
                  border: 'none', padding: '0.5rem 1rem',
                  borderRadius: '0.5rem', cursor: 'pointer',
                  fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                ⬇️ Ficha {ficha}
              </button>
            ))}
          </div>
        </div>
      )}
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