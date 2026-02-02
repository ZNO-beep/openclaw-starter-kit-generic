// Authentication detection helpers
//
// Purpose: detect common auth flows and provide consistent hooks for HITL.

function detectAuthContext(url) {
  const u = (url || '').toLowerCase();

  // Google OAuth
  if (u.includes('accounts.google.com') || u.includes('oauth2') && u.includes('google')) {
    return { kind: 'google_oauth' };
  }

  // Generic OAuth indicators
  if (u.includes('/oauth') || u.includes('oauth2') || u.includes('sso')) {
    return { kind: 'oauth_or_sso' };
  }

  return { kind: 'unknown' };
}

module.exports = { detectAuthContext };
