// ============================================================
// COACHPRO — Client Supabase (src/supabase.js)
// Remplacez les valeurs YOUR_... par vos vraies clés Supabase
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔑 Remplacez ces deux valeurs par celles de votre projet Supabase
// Supabase > Settings > API > Project URL & anon key
const SUPABASE_URL = 'https://jjythzsnubqevzjzrzio.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeXRoenNudWJxZXZ6anpyemlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTg3MDksImV4cCI6MjA5MDQzNDcwOX0.oINviaV_LTZEoOOlRLYU2V2yeFTQhdUHjjRdaHyu5mo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================================
// AUTH
// ============================================================

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

// ============================================================
// TEAMS
// ============================================================

export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createTeam({ name, category, season }) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('teams')
    .insert({ name, category, season, coach_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTeam(teamId, updates) {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// PLAYERS
// ============================================================

export async function getPlayers(teamId) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('jersey_number', { ascending: true })
  if (error) throw error
  return data
}

export async function createPlayer(teamId, player) {
  const { data, error } = await supabase
    .from('players')
    .insert({ ...player, team_id: teamId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlayer(playerId, updates) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(playerId) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)
  if (error) throw error
}

// ============================================================
// SESSIONS
// ============================================================

export async function getSessions(teamId, limit = 20) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('team_id', teamId)
    .order('scheduled_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function createSession(teamId, session) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...session, team_id: teamId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSession(sessionId, updates) {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// ATTENDANCE
// ============================================================

export async function getAttendance(sessionId) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, players(full_name, position, jersey_number)')
    .eq('session_id', sessionId)
  if (error) throw error
  return data
}

export async function saveAttendance(sessionId, records) {
  // records = [{ player_id, status, rating, coach_note }]
  const rows = records.map(r => ({ ...r, session_id: sessionId }))
  const { data, error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'session_id,player_id' })
    .select()
  if (error) throw error
  return data
}

// ============================================================
// PAYMENTS
// ============================================================

export async function getPayments(teamId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, players(full_name)')
    .eq('team_id', teamId)
    .order('due_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createPayment(teamId, payment) {
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...payment, team_id: teamId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markPaymentPaid(paymentId) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// MESSAGES
// ============================================================

export async function getMessages(teamId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, players(full_name)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function sendMessage(teamId, { content, recipientPlayerId = null, isGroup = false }) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      team_id: teamId,
      sender_id: user.id,
      recipient_player_id: recipientPlayerId,
      is_group: isGroup,
      content
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// EVENTS (calendrier)
// ============================================================

export async function getEvents(teamId, year, month) {
  const from = `${year}-${String(month+1).padStart(2,'0')}-01`
  const to = `${year}-${String(month+1).padStart(2,'0')}-31`
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .gte('event_date', from)
    .lte('event_date', to)
  if (error) throw error
  return data
}

export async function createEvent(teamId, event) {
  const { data, error } = await supabase
    .from('events')
    .insert({ ...event, team_id: teamId })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// REALTIME (messages en temps réel)
// ============================================================

export function subscribeToMessages(teamId, callback) {
  return supabase
    .channel('messages:' + teamId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `team_id=eq.${teamId}`
    }, payload => callback(payload.new))
    .subscribe()
}

export function subscribeToAttendance(sessionId, callback) {
  return supabase
    .channel('attendance:' + sessionId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'attendance',
      filter: `session_id=eq.${sessionId}`
    }, payload => callback(payload))
    .subscribe()
}
