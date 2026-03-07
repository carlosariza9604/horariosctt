import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ugcavtjxvpcigotwhxkx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY2F2dGp4dnBjaWdvdHdoeGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDIxOTAsImV4cCI6MjA4ODQ3ODE5MH0.GjPLPdQgK8f0YnYiUED0ECNf5nMdUa59inBxnZl9D6I'
export const supabase = createClient(supabaseUrl, supabaseKey)