import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// COURSES & CONTENT
// ============================================================

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export async function getYears(courseId: string) {
  const { data, error } = await supabase
    .from('years')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export async function getSemesters(yearId: string) {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('year_id', yearId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export async function getSubjects(semesterId: string) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('semester_id', semesterId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export async function getUnits(subjectId: string) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('display_order')
  
  if (error) throw error
  return data
}

export async function getTopics(unitId: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('unit_id', unitId)
    .eq('is_published', true)
    .order('display_order')
  
  if (error) throw error
  return data
}

export async function getTopic(topicId: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()
  
  if (error) throw error
  return data
}

// ============================================================
// USER & AUTH
// ============================================================

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
  
  if (error) throw error
  return data
}

// ============================================================
// BOOKMARKS
// ============================================================

export async function addBookmark(userId: string, topicId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ user_id: userId, topic_id: topicId }])
  
  if (error) throw error
  return data
}

export async function removeBookmark(userId: string, topicId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('topic_id', topicId)
  
  if (error) throw error
}

export async function getUserBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('topic_id, topics(*)')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

// ============================================================
// RATINGS
// ============================================================

export async function addRating(userId: string, topicId: string, rating: number) {
  const { data, error } = await supabase
    .from('ratings')
    .upsert([{ user_id: userId, topic_id: topicId, rating }])
  
  if (error) throw error
  return data
}

export async function getTopicRating(topicId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('topic_id', topicId)
  
  if (error) throw error
  
  if (!data || data.length === 0) return 0
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return parseFloat(avg.toFixed(2))
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function checkSubscription(userId: string) {
  try {
    const sub = await getUserSubscription(userId)
    return !!sub
  } catch {
    return false
  }
}

// ============================================================
// SEARCH
// ============================================================

export async function searchTopics(query: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*, units(name, subjects(name))')
    .textSearch('title', query)
    .eq('is_published', true)
  
  if (error) throw error
  return data
}
