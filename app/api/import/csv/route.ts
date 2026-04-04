import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { getUserFromRequest, canAccess } from '@/lib/permissions';
import prisma from '@/lib/prisma';

/**
 * CSV Import Helper Functions
 */

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function extractDomain(url: string): string | null {
  try {
    let cleaned = url.trim();
    if (!cleaned) return null;
    if (!cleaned.startsWith('http')) cleaned = 'https://' + cleaned;
    const u = new URL(cleaned);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function extractTLD(domain: string): string {
  const parts = domain.split('.');
  return parts.length > 1 ? '.' + parts.slice(1).join('.') : '.com';
}

function normalizeStatus(online: string): 'active' | 'maintenance' | 'suspended' | 'archived' {
  const val = (online || '').toLowerCase().trim();
  if (val === 'online') return 'active';
  if (val === 'offline') return 'suspended';
  return 'active';
}

function normalizeHosting(hosting: string): string {
  const val = (hosting || '').toLowerCase().trim();
  if (val.includes('hostinger')) return 'Hostinger';
  if (val.includes('racknerd')) return 'Racknerd';
  if (val.includes('hetzner')) return 'Hetzner';
  if (val.includes('digital ocean')) return 'DigitalOcean';
  return hosting.trim();
}

function detectWebsiteType(adminUrl: string, notes: string): 'wordpress' | 'spa' | 'custom' | 'static' {
  const combined = (adminUrl + ' ' + notes).toLowerCase();
  if (combined.includes('برمجية') || combined.includes('برمجة') || combined.includes('laravel') || combined.includes('vue js')) return 'custom';
  if (combined.includes('html website') || combined.includes('html') || combined.includes('فارغ')) return 'static';
  if (combined.includes('wp-admin') || combined.includes('go21') || combined.includes('wordpress')) return 'wordpress';
  if (adminUrl && adminUrl.trim() !== '') return 'wordpress';
  return 'custom';
}

interface ParsedSite {
  rowIndex: number;
  websiteUrl: string;
  adminUrl: string;
  username: string;
  email: string;
  password: string;
  vi: string;
  wf: string;
  hd: string;
  updatePlugin: string;
  lastBackup: string;
  scan: string;
  uptime: string;
  online: string;
  hosting: string;
  account: string;
  ipServer: string;
  cloudflare: string;
  notes: string;
  zoho: string;
  domain: string | null;
  websiteType: string;
  status: string;
}

function parseCSVContent(content: string): ParsedSite[] {
  // Handle multiline quoted fields by joining lines that are inside quotes
  const lines: string[] = [];
  const rawLines = content.split('\n');
  let currentLine = '';
  let quoteCount = 0;

  for (const rawLine of rawLines) {
    const lineQuotes = (rawLine.match(/"/g) || []).length;
    quoteCount += lineQuotes;

    if (currentLine) {
      currentLine += '\n' + rawLine;
    } else {
      currentLine = rawLine;
    }

    if (quoteCount % 2 === 0) {
      lines.push(currentLine);
      currentLine = '';
      quoteCount = 0;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Skip header
  const dataLines = lines.slice(1);
  const sites: ParsedSite[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 2) continue;

    const websiteUrl = (fields[0] || '').trim();
    if (!websiteUrl || !websiteUrl.includes('.')) continue;

    const domain = extractDomain(websiteUrl);
    const adminUrl = (fields[1] || '').trim();
    const notes = (fields[17] || '').trim();

    sites.push({
      rowIndex: i + 2,
      websiteUrl,
      adminUrl,
      username: (fields[2] || '').trim(),
      email: (fields[3] || '').trim(),
      password: (fields[4] || '').trim(),
      vi: (fields[5] || '').trim(),
      wf: (fields[6] || '').trim(),
      hd: (fields[7] || '').trim(),
      updatePlugin: (fields[8] || '').trim(),
      lastBackup: (fields[9] || '').trim(),
      scan: (fields[10] || '').trim(),
      uptime: (fields[11] || '').trim(),
      online: (fields[12] || '').trim(),
      hosting: (fields[13] || '').trim(),
      account: (fields[14] || '').trim(),
      ipServer: (fields[15] || '').trim(),
      cloudflare: (fields[16] || '').trim(),
      notes,
      zoho: (fields[18] || '').trim(),
      domain,
      websiteType: detectWebsiteType(adminUrl, notes),
      status: normalizeStatus(fields[12] || ''),
    });
  }

  return sites;
}

/**
 * POST /api/import/csv/preview
 * Parse CSV and return preview data
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return ApiResponseHelper.unauthorized('Not authenticated');
  }
  if (!canAccess(user, 'website', 'edit')) {
    return ApiResponseHelper.unauthorized('Permission denied');
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const action = formData.get('action') as string;

  if (!file) {
    return ApiResponseHelper.error('No file uploaded', 400);
  }

  const content = await file.text();
  const sites = parseCSVContent(content);

  if (action === 'preview') {
    // Analyze and return preview data
    const providers = new Set<string>();
    const servers = new Map<string, { ip: string; hosting: string; accounts: Set<string> }>();
    const cloudflareEmails = new Set<string>();
    const domains = new Set<string>();

    for (const site of sites) {
      if (site.hosting) providers.add(normalizeHosting(site.hosting));
      if (site.ipServer) {
        const key = site.ipServer;
        if (!servers.has(key)) {
          servers.set(key, { ip: key, hosting: normalizeHosting(site.hosting), accounts: new Set() });
        }
        if (site.account) servers.get(key)!.accounts.add(site.account);
      }
      if (site.cloudflare && site.cloudflare.includes('@')) cloudflareEmails.add(site.cloudflare);
      if (site.domain) domains.add(site.domain);
    }

    return ApiResponseHelper.success({
      totalSites: sites.length,
      sites: sites.map(s => ({
        rowIndex: s.rowIndex,
        websiteUrl: s.websiteUrl,
        domain: s.domain,
        adminUrl: s.adminUrl,
        username: s.username,
        websiteType: s.websiteType,
        status: s.status,
        hosting: s.hosting,
        ipServer: s.ipServer,
        cloudflare: s.cloudflare,
        online: s.online,
        notes: s.notes,
      })),
      summary: {
        providers: Array.from(providers),
        servers: Array.from(servers.entries()).map(([ip, data]) => ({
          ip,
          hosting: data.hosting,
          accountCount: data.accounts.size,
        })),
        cloudflareAccounts: Array.from(cloudflareEmails),
        domainsCount: domains.size,
        websiteTypes: sites.reduce((acc, s) => {
          acc[s.websiteType] = (acc[s.websiteType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        statusCounts: sites.reduce((acc, s) => {
          acc[s.status] = (acc[s.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  }

  // action === 'import' - Perform the actual import
  const results = {
    providers: 0,
    servers: 0,
    serverAccounts: 0,
    cloudflareAccounts: 0,
    domains: 0,
    websites: 0,
    credentials: 0,
    errors: [] as { row: number; url: string; error: string }[],
    skipped: [] as { row: number; url: string; reason: string }[],
  };

  // Step 1: Create Service Providers
  const providerMap = new Map<string, number>();
  const uniqueProviders = new Set<string>();
  for (const site of sites) {
    if (site.hosting) uniqueProviders.add(normalizeHosting(site.hosting));
  }

  for (const providerName of Array.from(uniqueProviders)) {
    if (!providerName) continue;
    try {
      const existing = await prisma.serviceProvider.findFirst({
        where: { providerName: { equals: providerName, mode: 'insensitive' } },
      });
      if (existing) {
        providerMap.set(providerName, existing.id);
      } else {
        const created = await prisma.serviceProvider.create({
          data: { providerName, providerType: 'hosting' },
        });
        providerMap.set(providerName, created.id);
        results.providers++;
      }
    } catch (e: any) {
      console.error(`Error creating provider ${providerName}:`, e.message);
    }
  }

  // Step 2: Create Servers (grouped by IP)
  const serverMap = new Map<string, number>();
  const serversByIP = new Map<string, { ip: string; hosting: string }>();
  for (const site of sites) {
    if (site.ipServer && !serversByIP.has(site.ipServer)) {
      serversByIP.set(site.ipServer, { ip: site.ipServer, hosting: normalizeHosting(site.hosting) });
    }
  }

  for (const [ip, data] of Array.from(serversByIP)) {
    try {
      const existing = await prisma.server.findFirst({ where: { ipAddress: ip } });
      if (existing) {
        serverMap.set(ip, existing.id);
      } else {
        const providerId = providerMap.get(data.hosting);
        const created = await prisma.server.create({
          data: {
            serverName: `${data.hosting || 'Unknown'} - ${ip}`,
            serverType: 'shared',
            ipAddress: ip,
            status: 'active',
            ...(providerId ? { provider: { connect: { id: providerId } } } : {}),
          },
        });
        serverMap.set(ip, created.id);
        results.servers++;
      }
    } catch (e: any) {
      console.error(`Error creating server ${ip}:`, e.message);
    }
  }

  // Step 3: Create Server Accounts (grouped by server + account name)
  const serverAccountMap = new Map<string, number>();
  const accountKeys = new Map<string, { serverId: number; accountName: string }>();
  for (const site of sites) {
    if (site.account && site.ipServer && serverMap.has(site.ipServer)) {
      const key = `${site.ipServer}::${site.account}`;
      if (!accountKeys.has(key)) {
        accountKeys.set(key, { serverId: serverMap.get(site.ipServer)!, accountName: site.account });
      }
    }
  }

  for (const [key, data] of Array.from(accountKeys)) {
    try {
      const existing = await prisma.serverAccount.findFirst({
        where: { serverId: data.serverId, username: data.accountName },
      });
      if (existing) {
        serverAccountMap.set(key, existing.id);
      } else {
        const created = await prisma.serverAccount.create({
          data: {
            server: { connect: { id: data.serverId } },
            accountName: data.accountName,
            username: data.accountName,
            accessLevel: 'user',
          },
        });
        serverAccountMap.set(key, created.id);
        results.serverAccounts++;
      }
    } catch (e: any) {
      console.error(`Error creating server account ${key}:`, e.message);
    }
  }

  // Step 4: Create Cloudflare Accounts
  const cloudflareMap = new Map<string, number>();
  const uniqueCF = new Set<string>();
  for (const site of sites) {
    if (site.cloudflare && site.cloudflare.includes('@')) uniqueCF.add(site.cloudflare);
  }

  for (const email of Array.from(uniqueCF)) {
    try {
      const existing = await prisma.cloudflareAccount.findFirst({
        where: { accountEmail: { equals: email, mode: 'insensitive' } },
      });
      if (existing) {
        cloudflareMap.set(email, existing.id);
      } else {
        const created = await prisma.cloudflareAccount.create({
          data: {
            accountName: email.split('@')[0],
            accountEmail: email,
            status: 'active',
          },
        });
        cloudflareMap.set(email, created.id);
        results.cloudflareAccounts++;
      }
    } catch (e: any) {
      console.error(`Error creating cloudflare account ${email}:`, e.message);
    }
  }

  // Step 5 & 6: Create Domains and Websites
  const processedDomains = new Map<string, number>();

  for (const site of sites) {
    try {
      if (!site.domain) {
        results.skipped.push({ row: site.rowIndex, url: site.websiteUrl, reason: 'Could not extract domain' });
        continue;
      }

      // Create or get domain
      let domainId: number | null = null;
      if (!processedDomains.has(site.domain)) {
        const existingDomain = await prisma.domain.findFirst({
          where: { domainName: { equals: site.domain, mode: 'insensitive' } },
        });
        if (existingDomain) {
          domainId = existingDomain.id;
          processedDomains.set(site.domain, existingDomain.id);
        } else {
          try {
            const createdDomain = await prisma.domain.create({
              data: {
                domainName: site.domain,
                tld: extractTLD(site.domain),
                status: site.status === 'active' ? 'active' : 'suspended',
                ...(site.cloudflare && cloudflareMap.has(site.cloudflare)
                  ? { cloudflareAccount: { connect: { id: cloudflareMap.get(site.cloudflare)! } } }
                  : {}),
              },
            });
            domainId = createdDomain.id;
            processedDomains.set(site.domain, createdDomain.id);
            results.domains++;
          } catch (e: any) {
            if (e.code === 'P2002') {
              const found = await prisma.domain.findFirst({
                where: { domainName: site.domain },
              });
              if (found) {
                domainId = found.id;
                processedDomains.set(site.domain, found.id);
              }
            } else {
              throw e;
            }
          }
        }
      } else {
        domainId = processedDomains.get(site.domain)!;
      }

      // Build maintenance notes
      const maintenanceNotes: string[] = [];
      if (site.vi) maintenanceNotes.push(`VI: ${site.vi}`);
      if (site.wf) maintenanceNotes.push(`WF: ${site.wf}`);
      if (site.hd) maintenanceNotes.push(`HD: ${site.hd}`);
      if (site.updatePlugin) maintenanceNotes.push(`Update Plugin: ${site.updatePlugin}`);
      if (site.lastBackup) maintenanceNotes.push(`Last Backup: ${site.lastBackup}`);
      if (site.scan) maintenanceNotes.push(`Scan: ${site.scan}`);
      if (site.zoho) maintenanceNotes.push(`Zoho: ${site.zoho}`);

      const combinedNotes = [
        site.notes,
        maintenanceNotes.length > 0 ? maintenanceNotes.join(' | ') : '',
      ].filter(Boolean).join('\n');

      // Determine website name from URL path or domain
      const urlPath = (() => {
        try {
          let cleaned = site.websiteUrl;
          if (!cleaned.startsWith('http')) cleaned = 'https://' + cleaned;
          const u = new URL(cleaned);
          const path = u.pathname.replace(/\/$/, '').split('/').filter(Boolean);
          if (path.length > 0) return `${site.domain}/${path.join('/')}`;
          return site.domain;
        } catch { return site.domain; }
      })();

      // Check for existing website with same URL
      const existingWebsite = await prisma.website.findFirst({
        where: { websiteUrl: { equals: site.websiteUrl, mode: 'insensitive' } },
      });

      if (existingWebsite) {
        results.skipped.push({ row: site.rowIndex, url: site.websiteUrl, reason: 'Website already exists' });
        continue;
      }

      // Check if domain already linked to another website - use domainId only for the "main" site
      const domainLinked = await prisma.website.findFirst({ where: { domainId } });
      const useDomainId = domainLinked ? null : domainId;

      // Resolve server references
      const serverId = site.ipServer ? serverMap.get(site.ipServer) : undefined;
      const accountKey = site.ipServer && site.account ? `${site.ipServer}::${site.account}` : null;
      const serverAccountId = accountKey ? serverAccountMap.get(accountKey) : undefined;

      // Create website
      const websiteData: any = {
        websiteName: urlPath || site.domain || site.websiteUrl,
        websiteType: site.websiteType,
        environment: 'production',
        websiteUrl: site.websiteUrl,
        adminUrl: site.adminUrl && site.adminUrl !== 'برمجية' && site.adminUrl !== 'برمجة'
          && !site.adminUrl.includes('html website') && !site.adminUrl.includes('لا يحتاج')
          && !site.adminUrl.includes('فارغ') && !site.adminUrl.includes('مبرمج')
          ? site.adminUrl : null,
        status: site.status,
        notes: combinedNotes || null,
      };

      if (useDomainId) websiteData.domain = { connect: { id: useDomainId } };
      if (serverId) websiteData.server = { connect: { id: serverId } };
      if (serverAccountId) websiteData.serverAccount = { connect: { id: serverAccountId } };

      const website = await prisma.website.create({ data: websiteData });
      results.websites++;

      // Step 7: Create credentials
      if (site.username || site.password || site.email) {
        // Skip non-login admin URLs
        const isValidLogin = site.username &&
          site.username !== 'برمجية' &&
          site.username !== 'برمجة' &&
          site.username !== 'مبرمج';

        if (isValidLogin || site.password) {
          try {
            await prisma.websiteCredential.create({
              data: {
                website: { connect: { id: website.id } },
                credentialType: 'admin',
                username: isValidLogin ? site.username : null,
                passwordEncrypted: site.password || null,
                accessUrl: websiteData.adminUrl || null,
                additionalInfo: site.email || null,
                notes: site.email ? `Email: ${site.email}` : null,
              },
            });
            results.credentials++;
          } catch (e: any) {
            console.error(`Error creating credentials for ${site.websiteUrl}:`, e.message);
          }
        }
      }
    } catch (e: any) {
      results.errors.push({
        row: site.rowIndex,
        url: site.websiteUrl,
        error: e.message || 'Unknown error',
      });
    }
  }

  return ApiResponseHelper.success({
    message: 'Import completed',
    results,
  });
});
