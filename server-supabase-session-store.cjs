// Supabase Session Storage Module
// This replaces in-memory session storage with database storage

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client
let supabase;

function initializeSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials for session storage');
      throw new Error('Supabase credentials not configured');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase session storage initialized');
  }
  return supabase;
}

// Session storage functions
async function createSession(userId, tokens) {
  try {
    initializeSupabase();

    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        user_email: userId,
        tokens: tokens,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    console.log(`Session created for user: ${userId}`);
    return sessionId;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
}

async function getSession(sessionId) {
  try {
    if (!sessionId) return null;

    initializeSupabase();

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error retrieving session:', error);
      return null;
    }

    // Check if session has expired
    if (data && new Date(data.expires_at) < new Date()) {
      await deleteSession(sessionId);
      return null;
    }

    return data
      ? {
          userId: data.user_email,
          tokens: data.tokens,
          userInfo: data.user_info,
          createdAt: new Date(data.created_at).getTime(),
        }
      : null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

async function updateSession(sessionId, updates) {
  try {
    initializeSupabase();

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update session:', error);
    throw error;
  }
}

async function deleteSession(sessionId) {
  try {
    if (!sessionId) return;

    initializeSupabase();

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
    }
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

// Clean up expired sessions
async function cleanupExpiredSessions() {
  try {
    initializeSupabase();

    const { error } = await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired sessions:', error);
    } else {
      console.log('Expired sessions cleaned up');
    }
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

// Run cleanup every hour
if (process.env.NODE_ENV === 'production') {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  cleanupExpiredSessions,
};
