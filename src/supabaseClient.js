import { createClient } from '@supabase/supabase-js' // Changed -client to -js

const supabaseUrl = 'https://sdtsjgkciemtgwxfdumg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdHNqZ2tjaWVtdGd3eGZkdW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjU3NjgsImV4cCI6MjA4MjUwMTc2OH0.8FJ4hyu8o-m1AUrvSiwz0xrc1kQg3NPng26X-c6du8s'

export const supabase = createClient(supabaseUrl, supabaseKey)