import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, canAccess, canAccessEntity } from '@/lib/permissions';
import { websiteRepository } from '@/lib/db/repositories';

/**
 * Returns the WordPress login URL.
 * Priority:
 * 1. adminUrl used directly — this is the custom login URL (e.g. /ingo21, /wp-admin/)
 * 2. Fallback: derive wp-login.php from websiteUrl
 */
function getWpLoginUrl(adminUrl: string | null | undefined, websiteUrl: string | null | undefined): string | null {
  // adminUrl IS the login URL (custom slug or standard wp-admin)
  if (adminUrl && adminUrl.startsWith('http')) {
    return adminUrl;
  }

  // Fallback: derive standard wp-login.php from website root
  if (websiteUrl) {
    try {
      const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : 'https://' + websiteUrl);
      return `${url.origin}/wp-login.php`;
    } catch {}
  }

  return null;
}

/**
 * GET /api/websites/[id]/wp-autologin
 * Returns an HTML page that auto-submits a WordPress login form.
 * The form posts directly from the browser to the WordPress site — credentials never pass through this server.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check
  const user = await getUserFromRequest(req);
  if (!user) {
    return new NextResponse(errorHtml('Not authenticated. Please log in to the dashboard first.'), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!canAccess(user, 'website', 'view')) {
    return new NextResponse(errorHtml('You do not have permission to access this website.'), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return new NextResponse(errorHtml('Invalid website ID.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!canAccessEntity(user, 'website', id, 'view')) {
    return new NextResponse(errorHtml('Access denied to this website.'), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const website = await websiteRepository.findByIdWithRelations(id);
  if (!website) {
    return new NextResponse(errorHtml('Website not found.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if ((website as any).websiteType !== 'wordpress') {
    return new NextResponse(errorHtml(`This website is of type "${(website as any).websiteType}", not WordPress.`), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const adminCreds = (website as any).credentials?.find((c: any) => c.credentialType === 'admin');
  if (!adminCreds?.username || !adminCreds?.passwordEncrypted) {
    return new NextResponse(errorHtml('No admin credentials stored for this website.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const loginUrl = getWpLoginUrl((website as any).adminUrl, (website as any).websiteUrl);
  if (!loginUrl) {
    return new NextResponse(errorHtml('Could not determine the WordPress login URL. Please add an Admin URL.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const username = adminCreds.username;
  const password = adminCreds.passwordEncrypted;
  const siteName = (website as any).websiteName || loginUrl;

  const html = buildAutoLoginHtml(loginUrl, username, password, siteName);

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Prevent caching of sensitive login pages
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildAutoLoginHtml(loginUrl: string, username: string, password: string, siteName: string): string {
  const safeLoginUrl = escapeHtml(loginUrl);
  const safeUsername = escapeHtml(username);
  const safePassword = escapeHtml(password);
  const safeSiteName = escapeHtml(siteName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Logging in to ${safeSiteName}…</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a; color: #e2e8f0;
      display: flex; align-items: center; justify-content: center; min-height: 100vh;
    }
    .card {
      background: #1e293b; border: 1px solid #334155; border-radius: 16px;
      padding: 40px 48px; text-align: center; max-width: 420px; width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.5);
    }
    .wp-icon {
      width: 56px; height: 56px; background: #2563eb; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
    }
    h1 { font-size: 1.25rem; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
    p  { font-size: 0.875rem; color: #94a3b8; margin-bottom: 24px; line-height: 1.6; }
    .site { color: #60a5fa; font-weight: 500; }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #334155; border-top-color: #3b82f6;
      border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .progress { height: 4px; background: #1e3a5f; border-radius: 2px; overflow: hidden; margin-bottom: 0; }
    .progress-bar {
      height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa);
      border-radius: 2px; width: 0%; transition: width 0.5s ease;
    }
    .status { font-size: 0.72rem; color: #64748b; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="wp-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </div>
    <h1>Logging in to WordPress</h1>
    <p>Connecting to <span class="site">${safeSiteName}</span>…</p>
    <div class="spinner"></div>
    <div class="progress"><div class="progress-bar" id="bar"></div></div>
    <p class="status" id="status-text">Preparing session…</p>
  </div>

  <!-- Form posts directly from browser to WordPress — credentials never go through our server -->
  <form id="wp-login-form" method="POST" action="${safeLoginUrl}" style="display:none">
    <input type="hidden" name="log"         value="${safeUsername}" />
    <input type="hidden" name="pwd"         value="${safePassword}" />
    <input type="hidden" name="rememberme"  value="forever" />
    <input type="hidden" name="redirect_to" value="/wp-admin/" />
    <input type="hidden" name="wp-submit"   value="Log+In" />
  </form>

  <script>
    var bar    = document.getElementById('bar');
    var status = document.getElementById('status-text');
    var form   = document.getElementById('wp-login-form');

    bar.style.width = '60%';
    status.textContent = 'Submitting credentials…';

    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        bar.style.width = '100%';
        form.submit();
      }, 500);
    });
  </script>
</body>
</html>`;
}

function errorHtml(message: string): string {
  const safeMsg = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Login Error</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a; color: #e2e8f0;
      display: flex; align-items: center; justify-content: center; min-height: 100vh;
    }
    .card {
      background: #1e293b; border: 1px solid #ef4444; border-radius: 16px;
      padding: 40px 48px; text-align: center; max-width: 420px; width: 90%;
    }
    .icon { font-size: 2.5rem; margin-bottom: 16px; }
    h1 { color: #ef4444; font-size: 1.1rem; margin-bottom: 12px; }
    p  { color: #94a3b8; font-size: 0.875rem; line-height: 1.6; }
    a  { color: #60a5fa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Login Failed</h1>
    <p>${safeMsg}</p>
    <p style="margin-top:16px"><a href="javascript:window.close()">Close this tab</a></p>
  </div>
</body>
</html>`;
}
