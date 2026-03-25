import {
  type Client,
  type Domain,
  type DomainCost,
  type WhoisHistory,
  type Server,
  type ServerAccount,
  type ServerCost,
  type SSLCertificate,
  type WebsiteCost,
  type Website,
  type Notification,
  type ActivityLog,
  type ServerMonitoring,
  type ServiceProvider,
  type SecurityIncident,
  type CloudflareAccount,
  type CloudflareDomain,
  type GoogleAdsAccount,
  type GoogleAdsCampaign,
  type GoogleSearchConsoleAccount,
  type GoogleSearchConsoleProperty,
  type GoogleTagManagerAccount,
  type GoogleTagManagerContainer,
  type GoogleAnalyticsAccount,
  type Repository,
  type Tag,
  type EntityTag,
  type Document,
  type MaintenanceSchedule,
  type MaintenanceLog,
  type UptimeCheck,
  type UptimeLog,
  type NotificationSetting,
  type SystemSetting,
  type User,
  type UserPermission,
  type WebsiteCredential,
} from './types';

export const mockClients: Client[] = [
  { id: 1, client_name: 'Ahmed Ali', company_name: 'Tech Solutions Ltd', email: 'ahmed@techsolutions.com', phone: '+966512345678', country: 'Saudi Arabia', status: 'active', notes: '', created_at: '2024-01-15' },
  { id: 2, client_name: 'Sara Khan', company_name: 'Digital Wave Agency', email: 'sara@digitalwave.io', phone: '+971501234567', country: 'UAE', status: 'active', notes: '', created_at: '2024-02-20' },
  { id: 3, client_name: 'Mohammed Hassan', company_name: 'Green Fields Co', email: 'mh@greenfields.sa', phone: '+966551234567', country: 'Saudi Arabia', status: 'active', notes: '', created_at: '2024-03-10' },
  { id: 4, client_name: 'Fatima Al-Rashid', company_name: 'CloudFirst Inc', email: 'fatima@cloudfirst.com', phone: '+962791234567', country: 'Jordan', status: 'suspended', notes: 'Payment overdue', created_at: '2024-04-05' },
  { id: 5, client_name: 'Omar Youssef', company_name: 'DataSync Corp', email: 'omar@datasync.net', phone: '+201012345678', country: 'Egypt', status: 'active', notes: '', created_at: '2024-05-12' },
  { id: 6, client_name: 'Layla Ibrahim', company_name: 'WebCraft Studios', email: 'layla@webcraft.co', phone: '+966541234567', country: 'Saudi Arabia', status: 'inactive', notes: 'Contract ended', created_at: '2023-11-20' },
];

export const mockProviders: ServiceProvider[] = [
  { id: 1, provider_name: 'Namecheap', provider_type: 'registrar', website_url: 'https://www.namecheap.com', support_email: 'support@namecheap.com', notes: '', created_at: '2024-01-01' },
  { id: 2, provider_name: 'Hetzner', provider_type: 'hosting', website_url: 'https://www.hetzner.com', support_email: 'support@hetzner.com', notes: '', created_at: '2024-01-01' },
  { id: 3, provider_name: 'Cloudflare', provider_type: 'cdn', website_url: 'https://www.cloudflare.com', support_email: 'support@cloudflare.com', notes: '', created_at: '2024-01-01' },
  { id: 4, provider_name: "Let's Encrypt", provider_type: 'ssl', website_url: 'https://letsencrypt.org', support_email: '', notes: '', created_at: '2024-01-01' },
  { id: 5, provider_name: 'GoDaddy', provider_type: 'registrar', website_url: 'https://www.godaddy.com', support_email: 'support@godaddy.com', notes: '', created_at: '2024-01-01' },
  { id: 6, provider_name: 'DigitalOcean', provider_type: 'hosting', website_url: 'https://www.digitalocean.com', support_email: 'support@digitalocean.com', notes: '', created_at: '2024-01-01' },
];

export const mockDomains: Domain[] = [
  { id: 1, domain_name: 'techsolutions.com', tld: '.com', status: 'active', registrar_id: 1, client_id: 1, registration_date: '2023-01-15', expiry_date: '2026-01-15', auto_renew: true, renewal_notification_days: 30, whois_privacy: true, nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', created_at: '2023-01-15' },
  { id: 2, domain_name: 'digitalwave.io', tld: '.io', status: 'active', registrar_id: 1, client_id: 2, registration_date: '2024-02-20', expiry_date: '2025-02-20', auto_renew: true, renewal_notification_days: 30, whois_privacy: true, nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', created_at: '2024-02-20' },
  { id: 3, domain_name: 'greenfields.sa', tld: '.sa', status: 'active', registrar_id: 5, client_id: 3, registration_date: '2024-03-10', expiry_date: '2025-03-10', auto_renew: false, renewal_notification_days: 60, whois_privacy: false, nameservers: 'ns1.hetzner.com, ns2.hetzner.com', created_at: '2024-03-10' },
  { id: 4, domain_name: 'cloudfirst.com', tld: '.com', status: 'expired', registrar_id: 5, client_id: 4, registration_date: '2023-04-05', expiry_date: '2024-04-05', auto_renew: false, renewal_notification_days: 30, whois_privacy: true, nameservers: '', created_at: '2023-04-05' },
  { id: 5, domain_name: 'datasync.net', tld: '.net', status: 'active', registrar_id: 1, client_id: 5, registration_date: '2024-05-12', expiry_date: '2025-05-12', auto_renew: true, renewal_notification_days: 30, whois_privacy: true, nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', created_at: '2024-05-12' },
  { id: 6, domain_name: 'webcraft.co', tld: '.co', status: 'active', registrar_id: 1, client_id: 6, registration_date: '2023-11-20', expiry_date: '2025-11-20', auto_renew: true, renewal_notification_days: 30, whois_privacy: true, nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', created_at: '2023-11-20' },
  { id: 7, domain_name: 'techsolutions.sa', tld: '.sa', status: 'active', registrar_id: 5, client_id: 1, registration_date: '2024-06-01', expiry_date: '2025-06-01', auto_renew: true, renewal_notification_days: 30, whois_privacy: false, nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', created_at: '2024-06-01' },
  { id: 8, domain_name: 'datasync-app.com', tld: '.com', status: 'pending', registrar_id: 1, client_id: 5, registration_date: '2024-12-01', expiry_date: '2025-12-01', auto_renew: true, renewal_notification_days: 30, whois_privacy: true, nameservers: '', created_at: '2024-12-01' },
];

export const mockServers: Server[] = [
  { id: 1, server_name: 'Production Server 1', provider_id: 2, server_type: 'dedicated', ip_address: '185.199.108.100', location: 'Frankfurt, Germany', operating_system: 'Ubuntu 22.04 LTS', control_panel: 'cpanel', cpu_cores: 8, ram_gb: 32, storage_gb: 1000, bandwidth_gb: 5000, status: 'active', created_at: '2024-01-01' },
  { id: 2, server_name: 'Staging Server', provider_id: 6, server_type: 'vps', ip_address: '164.90.150.22', location: 'Amsterdam, Netherlands', operating_system: 'Ubuntu 22.04 LTS', control_panel: 'plesk', cpu_cores: 4, ram_gb: 8, storage_gb: 250, bandwidth_gb: 2000, status: 'active', created_at: '2024-02-15' },
  { id: 3, server_name: 'Cloud Server - ME', provider_id: 2, server_type: 'cloud', ip_address: '95.216.200.44', location: 'Helsinki, Finland', operating_system: 'Debian 12', control_panel: 'none', cpu_cores: 16, ram_gb: 64, storage_gb: 2000, bandwidth_gb: 10000, status: 'active', created_at: '2024-03-20' },
  { id: 4, server_name: 'Backup Server', provider_id: 2, server_type: 'vps', ip_address: '116.203.55.10', location: 'Nuremberg, Germany', operating_system: 'Ubuntu 20.04 LTS', control_panel: 'none', cpu_cores: 2, ram_gb: 4, storage_gb: 500, bandwidth_gb: 1000, status: 'active', created_at: '2024-04-10' },
  { id: 5, server_name: 'Legacy Server', provider_id: 6, server_type: 'shared', ip_address: '192.168.1.100', location: 'New York, USA', operating_system: 'CentOS 7', control_panel: 'cpanel', cpu_cores: 2, ram_gb: 4, storage_gb: 100, bandwidth_gb: 500, status: 'maintenance', created_at: '2023-06-15' },
];

export const mockWebsites: Website[] = [
  { id: 1, website_name: 'Tech Solutions Portal', domain_id: 1, client_id: 1, server_account_id: 1, website_type: 'wordpress', framework: 'WordPress 6.4', environment: 'production', website_url: 'https://www.techsolutions.com', admin_url: 'https://www.techsolutions.com/wp-admin', status: 'active', description: 'Corporate website', created_at: '2024-01-20' },
  { id: 2, website_name: 'Digital Wave Platform', domain_id: 2, client_id: 2, server_account_id: 1, website_type: 'spa', framework: 'Next.js 14', environment: 'production', website_url: 'https://www.digitalwave.io', admin_url: 'https://admin.digitalwave.io', status: 'active', description: 'SaaS platform', created_at: '2024-02-25' },
  { id: 3, website_name: 'Green Fields Store', domain_id: 3, client_id: 3, server_account_id: 2, website_type: 'ecommerce', framework: 'WooCommerce', environment: 'production', website_url: 'https://www.greenfields.sa', admin_url: 'https://www.greenfields.sa/wp-admin', status: 'active', description: 'E-commerce store', created_at: '2024-03-15' },
  { id: 4, website_name: 'CloudFirst Dashboard', domain_id: 4, client_id: 4, server_account_id: 3, website_type: 'custom', framework: 'Laravel 10', environment: 'production', website_url: 'https://www.cloudfirst.com', admin_url: 'https://www.cloudfirst.com/admin', status: 'suspended', description: 'Client dashboard', created_at: '2024-04-10' },
  { id: 5, website_name: 'DataSync API', domain_id: 5, client_id: 5, server_account_id: 3, website_type: 'custom', framework: 'Express.js', environment: 'production', website_url: 'https://api.datasync.net', admin_url: '', status: 'active', description: 'REST API service', created_at: '2024-05-15' },
  { id: 6, website_name: 'WebCraft Portfolio', domain_id: 6, client_id: 6, server_account_id: 1, website_type: 'static', framework: 'Astro', environment: 'production', website_url: 'https://www.webcraft.co', admin_url: '', status: 'active', description: 'Portfolio site', created_at: '2024-06-01' },
  { id: 7, website_name: 'Tech Solutions SA', domain_id: 7, client_id: 1, server_account_id: 2, website_type: 'wordpress', framework: 'WordPress 6.4', environment: 'production', website_url: 'https://www.techsolutions.sa', admin_url: 'https://www.techsolutions.sa/wp-admin', status: 'active', description: 'Arabic corporate site', created_at: '2024-06-10' },
  { id: 8, website_name: 'DataSync Staging', domain_id: 8, client_id: 5, server_account_id: 2, website_type: 'custom', framework: 'Express.js', environment: 'staging', website_url: 'https://staging.datasync-app.com', admin_url: '', status: 'maintenance', description: 'Staging environment', created_at: '2024-12-05' },
];

export const mockNotifications: Notification[] = [
  { id: 1, notification_type: 'domain_expiry', entity_type: 'domain', entity_id: 2, title: 'Domain Expiring Soon', message: 'digitalwave.io will expire in 28 days', severity: 'warning', is_read: false, created_at: '2025-01-23' },
  { id: 2, notification_type: 'server_down', entity_type: 'server', entity_id: 5, title: 'Server Unreachable', message: 'Legacy Server has been down for 15 minutes', severity: 'critical', is_read: false, created_at: '2025-01-22' },
  { id: 3, notification_type: 'ssl_expiry', entity_type: 'domain', entity_id: 3, title: 'SSL Certificate Expiring', message: 'SSL for greenfields.sa expires in 7 days', severity: 'critical', is_read: false, created_at: '2025-01-21' },
  { id: 4, notification_type: 'backup_failed', entity_type: 'server', entity_id: 4, title: 'Backup Failed', message: 'Nightly backup failed for Backup Server', severity: 'warning', is_read: true, created_at: '2025-01-20' },
  { id: 5, notification_type: 'security_alert', entity_type: 'website', entity_id: 1, title: 'Suspicious Login Attempt', message: 'Multiple failed login attempts detected on Tech Solutions Portal', severity: 'warning', is_read: false, created_at: '2025-01-19' },
  { id: 6, notification_type: 'resource_limit', entity_type: 'server', entity_id: 3, title: 'High CPU Usage', message: 'Cloud Server - ME CPU usage exceeded 90%', severity: 'warning', is_read: true, created_at: '2025-01-18' },
  { id: 7, notification_type: 'domain_expiry', entity_type: 'domain', entity_id: 3, title: 'Domain Expiring Soon', message: 'greenfields.sa will expire in 45 days', severity: 'info', is_read: true, created_at: '2025-01-15' },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 1, user_id: 1, action_type: 'update', entity_type: 'server', entity_name: 'Production Server 1', description: 'Updated server configuration', created_at: '2025-01-23T14:30:00' },
  { id: 2, user_id: 1, action_type: 'create', entity_type: 'domain', entity_name: 'datasync-app.com', description: 'Registered new domain', created_at: '2025-01-23T12:15:00' },
  { id: 3, user_id: 2, action_type: 'update', entity_type: 'website', entity_name: 'Digital Wave Platform', description: 'Deployed version 2.4.1', created_at: '2025-01-22T16:45:00' },
  { id: 4, user_id: 1, action_type: 'delete', entity_type: 'backup', entity_name: 'backup_20250120.tar.gz', description: 'Removed old backup file', created_at: '2025-01-22T09:00:00' },
  { id: 5, user_id: 3, action_type: 'create', entity_type: 'client', entity_name: 'Omar Youssef', description: 'Added new client', created_at: '2025-01-21T11:30:00' },
  { id: 6, user_id: 1, action_type: 'update', entity_type: 'domain', entity_name: 'techsolutions.com', description: 'Updated nameservers', created_at: '2025-01-20T15:20:00' },
  { id: 7, user_id: 2, action_type: 'login', entity_type: 'user', entity_name: 'sara_khan', description: 'User logged in', created_at: '2025-01-20T08:00:00' },
  { id: 8, user_id: 1, action_type: 'update', entity_type: 'ssl', entity_name: 'greenfields.sa', description: 'Renewed SSL certificate', created_at: '2025-01-19T13:45:00' },
];

export const mockServerMonitoring: ServerMonitoring[] = [
  { id: 1, server_id: 1, cpu_usage: 45.5, ram_usage: 68.2, storage_usage: 52.0, bandwidth_usage: 1250.5, uptime_percentage: 99.98, response_time_ms: 120, recorded_at: '2025-01-23T15:00:00' },
  { id: 2, server_id: 2, cpu_usage: 22.1, ram_usage: 55.8, storage_usage: 38.5, bandwidth_usage: 450.2, uptime_percentage: 99.95, response_time_ms: 85, recorded_at: '2025-01-23T15:00:00' },
  { id: 3, server_id: 3, cpu_usage: 78.3, ram_usage: 82.1, storage_usage: 61.2, bandwidth_usage: 3200.8, uptime_percentage: 99.99, response_time_ms: 45, recorded_at: '2025-01-23T15:00:00' },
  { id: 4, server_id: 4, cpu_usage: 12.4, ram_usage: 35.6, storage_usage: 72.8, bandwidth_usage: 120.3, uptime_percentage: 99.90, response_time_ms: 200, recorded_at: '2025-01-23T15:00:00' },
  { id: 5, server_id: 5, cpu_usage: 0, ram_usage: 0, storage_usage: 85.1, bandwidth_usage: 0, uptime_percentage: 95.50, response_time_ms: 0, recorded_at: '2025-01-23T15:00:00' },
];

export const mockServerAccounts: ServerAccount[] = [
  { id: 1, server_id: 1, client_id: 1, username: 'techsol', account_type: 'cpanel', disk_usage_mb: 12500, disk_limit_mb: 50000, bandwidth_usage_mb: 85000, bandwidth_limit_mb: 500000, email_accounts: 15, databases: 4, addon_domains: 2, status: 'active', created_at: '2024-01-20' },
  { id: 2, server_id: 1, client_id: 2, username: 'digwave', account_type: 'cpanel', disk_usage_mb: 8200, disk_limit_mb: 30000, bandwidth_usage_mb: 120000, bandwidth_limit_mb: 300000, email_accounts: 8, databases: 2, addon_domains: 1, status: 'active', created_at: '2024-02-25' },
  { id: 3, server_id: 1, client_id: 6, username: 'webcrft', account_type: 'cpanel', disk_usage_mb: 3400, disk_limit_mb: 20000, bandwidth_usage_mb: 25000, bandwidth_limit_mb: 200000, email_accounts: 3, databases: 1, addon_domains: 0, status: 'active', created_at: '2024-06-01' },
  { id: 4, server_id: 2, client_id: 3, username: 'grfield', account_type: 'plesk', disk_usage_mb: 18900, disk_limit_mb: 40000, bandwidth_usage_mb: 95000, bandwidth_limit_mb: 400000, email_accounts: 12, databases: 3, addon_domains: 1, status: 'active', created_at: '2024-03-15' },
  { id: 5, server_id: 2, client_id: 1, username: 'techsa', account_type: 'plesk', disk_usage_mb: 6800, disk_limit_mb: 25000, bandwidth_usage_mb: 45000, bandwidth_limit_mb: 250000, email_accounts: 5, databases: 2, addon_domains: 0, status: 'active', created_at: '2024-06-10' },
  { id: 6, server_id: 2, client_id: 5, username: 'datasync', account_type: 'plesk', disk_usage_mb: 4200, disk_limit_mb: 20000, bandwidth_usage_mb: 30000, bandwidth_limit_mb: 200000, email_accounts: 2, databases: 2, addon_domains: 0, status: 'active', created_at: '2024-12-05' },
  { id: 7, server_id: 3, client_id: 4, username: 'cloudf', account_type: 'custom', disk_usage_mb: 22000, disk_limit_mb: 100000, bandwidth_usage_mb: 180000, bandwidth_limit_mb: 1000000, email_accounts: 0, databases: 5, addon_domains: 0, status: 'suspended', created_at: '2024-04-10' },
  { id: 8, server_id: 3, client_id: 5, username: 'datsapi', account_type: 'custom', disk_usage_mb: 15600, disk_limit_mb: 80000, bandwidth_usage_mb: 250000, bandwidth_limit_mb: 800000, email_accounts: 0, databases: 8, addon_domains: 0, status: 'active', created_at: '2024-05-15' },
];

export const mockServerCosts: ServerCost[] = [
  { id: 1, server_id: 1, cost_amount: 89.00, currency: 'EUR', billing_cycle: 'monthly', next_billing_date: '2025-02-01', payment_method: 'Credit Card', notes: 'Hetzner dedicated AX41', created_at: '2024-01-01' },
  { id: 2, server_id: 2, cost_amount: 24.00, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-02-15', payment_method: 'Credit Card', notes: 'DigitalOcean Droplet 4GB', created_at: '2024-02-15' },
  { id: 3, server_id: 3, cost_amount: 149.00, currency: 'EUR', billing_cycle: 'monthly', next_billing_date: '2025-02-20', payment_method: 'PayPal', notes: 'Hetzner Cloud CCX33', created_at: '2024-03-20' },
  { id: 4, server_id: 4, cost_amount: 29.00, currency: 'EUR', billing_cycle: 'monthly', next_billing_date: '2025-02-10', payment_method: 'Credit Card', notes: 'Hetzner CX31 backup storage', created_at: '2024-04-10' },
  { id: 5, server_id: 5, cost_amount: 12.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-02-15', payment_method: 'PayPal', notes: 'DigitalOcean shared hosting - legacy', created_at: '2023-06-15' },
];

export const mockDomainCosts: DomainCost[] = [
  { id: 1, domain_id: 1, cost_amount: 12.99, currency: 'USD', billing_cycle: 'yearly', purchase_date: '2023-01-15', next_billing_date: '2026-01-15', payment_method: 'Credit Card', notes: '', created_at: '2023-01-15' },
  { id: 2, domain_id: 2, cost_amount: 39.99, currency: 'USD', billing_cycle: 'yearly', purchase_date: '2024-02-20', next_billing_date: '2025-02-20', payment_method: 'PayPal', notes: '', created_at: '2024-02-20' },
  { id: 3, domain_id: 3, cost_amount: 85.00, currency: 'SAR', billing_cycle: 'yearly', purchase_date: '2024-03-10', next_billing_date: '2025-03-10', payment_method: 'Bank Transfer', notes: 'Saudi NIC registration', created_at: '2024-03-10' },
  { id: 4, domain_id: 4, cost_amount: 10.99, currency: 'USD', billing_cycle: 'yearly', purchase_date: '2023-04-05', next_billing_date: '2024-04-05', payment_method: 'Credit Card', notes: 'Expired - not renewed', created_at: '2023-04-05' },
  { id: 5, domain_id: 5, cost_amount: 14.99, currency: 'USD', billing_cycle: 'yearly', purchase_date: '2024-05-12', next_billing_date: '2025-05-12', payment_method: 'Credit Card', notes: '', created_at: '2024-05-12' },
  { id: 6, domain_id: 6, cost_amount: 25.99, currency: 'USD', billing_cycle: 'yearly', purchase_date: '2023-11-20', next_billing_date: '2025-11-20', payment_method: 'PayPal', notes: '', created_at: '2023-11-20' },
  { id: 7, domain_id: 7, cost_amount: 85.00, currency: 'SAR', billing_cycle: 'yearly', purchase_date: '2024-06-01', next_billing_date: '2025-06-01', payment_method: 'Bank Transfer', notes: '', created_at: '2024-06-01' },
  { id: 8, domain_id: 8, cost_amount: 12.99, currency: 'USD', billing_cycle: 'yearly', purchase_date: '2024-12-01', next_billing_date: '2025-12-01', payment_method: 'Credit Card', notes: '', created_at: '2024-12-01' },
];

export const mockWhoisHistory: WhoisHistory[] = [
  { id: 1, domain_id: 1, registrant_name: 'Ahmed Ali', registrant_email: 'ahmed@techsolutions.com', registrant_organization: 'Tech Solutions Ltd', admin_contact: 'Ahmed Ali', tech_contact: 'IT Department', captured_at: '2025-01-15' },
  { id: 2, domain_id: 2, registrant_name: 'Sara Khan', registrant_email: 'sara@digitalwave.io', registrant_organization: 'Digital Wave Agency', admin_contact: 'Sara Khan', tech_contact: 'Sara Khan', captured_at: '2025-01-10' },
  { id: 3, domain_id: 3, registrant_name: 'Mohammed Hassan', registrant_email: 'mh@greenfields.sa', registrant_organization: 'Green Fields Co', admin_contact: 'Mohammed Hassan', tech_contact: 'Tech Team', captured_at: '2025-01-08' },
  { id: 4, domain_id: 5, registrant_name: 'Omar Youssef', registrant_email: 'omar@datasync.net', registrant_organization: 'DataSync Corp', admin_contact: 'Omar Youssef', tech_contact: 'DevOps Team', captured_at: '2025-01-05' },
];

export const mockSSLCertificates: SSLCertificate[] = [
  { id: 1, website_id: 1, provider_id: 4, domain_name: 'techsolutions.com', issuer: "Let's Encrypt", type: 'free', issued_date: '2024-10-15', expiry_date: '2025-04-15', auto_renew: true, status: 'active' },
  { id: 2, website_id: 2, provider_id: 3, domain_name: 'digitalwave.io', issuer: 'Cloudflare', type: 'free', issued_date: '2024-11-01', expiry_date: '2025-05-01', auto_renew: true, status: 'active' },
  { id: 3, website_id: 3, provider_id: 4, domain_name: 'greenfields.sa', issuer: "Let's Encrypt", type: 'free', issued_date: '2024-12-20', expiry_date: '2025-01-28', auto_renew: true, status: 'active' },
  { id: 4, website_id: 4, provider_id: 4, domain_name: 'cloudfirst.com', issuer: "Let's Encrypt", type: 'free', issued_date: '2024-06-01', expiry_date: '2024-12-01', auto_renew: false, status: 'expired' },
  { id: 5, website_id: 5, provider_id: 3, domain_name: 'datasync.net', issuer: 'Cloudflare', type: 'wildcard', issued_date: '2024-09-10', expiry_date: '2025-09-10', auto_renew: true, status: 'active' },
  { id: 6, website_id: 6, provider_id: 3, domain_name: 'webcraft.co', issuer: 'Cloudflare', type: 'free', issued_date: '2024-08-15', expiry_date: '2025-08-15', auto_renew: true, status: 'active' },
  { id: 7, website_id: 7, provider_id: 4, domain_name: 'techsolutions.sa', issuer: "Let's Encrypt", type: 'free', issued_date: '2024-11-20', expiry_date: '2025-05-20', auto_renew: true, status: 'active' },
];

export const mockWebsiteCosts: WebsiteCost[] = [
  { id: 1, website_id: 1, description: 'WordPress theme license', cost_amount: 59.00, currency: 'USD', billing_cycle: 'yearly', next_billing_date: '2025-06-15', created_at: '2024-01-20' },
  { id: 2, website_id: 1, description: 'WP plugins bundle', cost_amount: 199.00, currency: 'USD', billing_cycle: 'yearly', next_billing_date: '2025-06-15', created_at: '2024-01-20' },
  { id: 3, website_id: 2, description: 'Vercel Pro plan', cost_amount: 20.00, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-02-25', created_at: '2024-02-25' },
  { id: 4, website_id: 3, description: 'WooCommerce extensions', cost_amount: 299.00, currency: 'USD', billing_cycle: 'yearly', next_billing_date: '2025-03-15', created_at: '2024-03-15' },
  { id: 5, website_id: 5, description: 'API monitoring (Datadog)', cost_amount: 31.00, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-02-15', created_at: '2024-05-15' },
  { id: 6, website_id: 7, description: 'WordPress theme license', cost_amount: 59.00, currency: 'USD', billing_cycle: 'yearly', next_billing_date: '2025-07-10', created_at: '2024-06-10' },
];

export const dashboardStats = {
  totalDomains: mockDomains.length,
  activeDomains: mockDomains.filter(d => d.status === 'active').length,
  expiringDomains: 3,
  totalServers: mockServers.length,
  activeServers: mockServers.filter(s => s.status === 'active').length,
  totalWebsites: mockWebsites.length,
  activeWebsites: mockWebsites.filter(w => w.status === 'active').length,
  totalClients: mockClients.length,
  activeClients: mockClients.filter(c => c.status === 'active').length,
  monthlyRevenue: 12450,
  openIncidents: 2,
  uptimeAverage: 99.06,
};

export const mockUsers: User[] = [
  { id: 1, username: 'admin123', email: 'ahmed@techsolutions.com', full_name: 'Ahmed Ali', role: 'super_admin', is_active: true, last_login: '2025-01-23T14:30:00', created_at: '2024-01-01' },
  { id: 2, username: 'sara_dev', email: 'sara@digitalwave.io', full_name: 'Sara Khan', role: 'developer', is_active: true, last_login: '2025-01-22T16:45:00', created_at: '2024-02-01' },
  { id: 3, username: 'mohammed_h', email: 'mh@greenfields.sa', full_name: 'Mohammed Hassan', role: 'admin', is_active: true, last_login: '2025-01-21T11:30:00', created_at: '2024-03-01' },
  { id: 4, username: 'fatima_r', email: 'fatima@cloudfirst.com', full_name: 'Fatima Al-Rashid', role: 'client', is_active: false, last_login: '2024-12-15T09:00:00', created_at: '2024-04-01' },
  { id: 5, username: 'omar_y', email: 'omar@datasync.net', full_name: 'Omar Youssef', role: 'developer', is_active: true, last_login: '2025-01-23T10:00:00', created_at: '2024-05-01' },
];

export const mockWebsiteCredentials: WebsiteCredential[] = [
  { id: 1, website_id: 1, credential_type: 'admin', username: 'admin', access_url: 'https://www.techsolutions.com/wp-admin', additional_info: '', notes: 'Main WP admin', created_at: '2024-01-20' },
  { id: 2, website_id: 1, credential_type: 'ftp', username: 'techsol_ftp', access_url: 'ftp://185.199.108.100', additional_info: '', notes: '', created_at: '2024-01-20' },
  { id: 3, website_id: 2, credential_type: 'admin', username: 'sara@digitalwave.io', access_url: 'https://admin.digitalwave.io', additional_info: '', notes: '', created_at: '2024-02-25' },
  { id: 4, website_id: 3, credential_type: 'admin', username: 'admin', access_url: 'https://www.greenfields.sa/wp-admin', additional_info: '', notes: 'WooCommerce admin', created_at: '2024-03-15' },
  { id: 5, website_id: 3, credential_type: 'database', username: 'grfield_db', access_url: 'https://164.90.150.22:8443/phpMyAdmin', additional_info: '', notes: '', created_at: '2024-03-15' },
  { id: 6, website_id: 5, credential_type: 'api', username: 'datasync_api_key', access_url: 'https://api.datasync.net/v2', additional_info: '', notes: 'API key for external integrations', created_at: '2024-05-15' },
];

export const mockSecurityIncidents: SecurityIncident[] = [
  { id: 1, entity_type: 'website', entity_id: 1, incident_type: 'unauthorized_access', severity: 'medium', status: 'investigating', detected_at: '2025-01-19T08:30:00', resolved_at: null, description: 'Multiple failed login attempts detected from suspicious IPs', actions_taken: 'Blocked IP range, enabled 2FA', reported_by: 1, assigned_to: 2, created_at: '2025-01-19' },
  { id: 2, entity_type: 'website', entity_id: 3, incident_type: 'malware', severity: 'high', status: 'resolved', detected_at: '2025-01-10T14:00:00', resolved_at: '2025-01-11T10:00:00', description: 'Malicious script injected into payment page', actions_taken: 'Cleaned infected files, updated all plugins, patched vulnerability', reported_by: 3, assigned_to: 2, created_at: '2025-01-10' },
  { id: 3, entity_type: 'server', entity_id: 3, incident_type: 'ddos', severity: 'critical', status: 'resolved', detected_at: '2025-01-05T02:15:00', resolved_at: '2025-01-05T04:30:00', description: 'DDoS attack targeting Cloud Server - ME', actions_taken: 'Activated Cloudflare Under Attack mode, rate limiting applied', reported_by: 1, assigned_to: 5, created_at: '2025-01-05' },
  { id: 4, entity_type: 'website', entity_id: 4, incident_type: 'data_breach', severity: 'critical', status: 'closed', detected_at: '2024-12-20T11:00:00', resolved_at: '2024-12-22T16:00:00', description: 'Potential data exposure due to misconfigured API endpoint', actions_taken: 'API endpoint secured, affected users notified, audit completed', reported_by: 5, assigned_to: 1, created_at: '2024-12-20' },
  { id: 5, entity_type: 'server', entity_id: 5, incident_type: 'unauthorized_access', severity: 'low', status: 'open', detected_at: '2025-01-22T16:00:00', resolved_at: null, description: 'Unusual SSH login pattern on Legacy Server', actions_taken: '', reported_by: 1, assigned_to: null, created_at: '2025-01-22' },
];

export const mockCloudflareAccounts: CloudflareAccount[] = [
  { id: 1, account_name: 'Main Cloudflare Account', account_email: 'admin@techsolutions.com', account_id: 'cf_acc_abc123def456', status: 'active', notes: 'Primary CF account for all domains', created_at: '2024-01-01' },
  { id: 2, account_name: 'Client Projects CF', account_email: 'projects@techsolutions.com', account_id: 'cf_acc_xyz789ghi012', status: 'active', notes: 'Separate account for client projects', created_at: '2024-06-01' },
];

export const mockCloudflareDomains: CloudflareDomain[] = [
  { id: 1, domain_id: 1, cloudflare_account_id: 1, zone_id: 'zone_ts_com_001', nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', ssl_mode: 'full', cache_level: 'aggressive', security_level: 'medium', is_active: true, activated_at: '2023-01-20', created_at: '2023-01-20' },
  { id: 2, domain_id: 2, cloudflare_account_id: 1, zone_id: 'zone_dw_io_002', nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', ssl_mode: 'strict', cache_level: 'aggressive', security_level: 'high', is_active: true, activated_at: '2024-02-22', created_at: '2024-02-22' },
  { id: 3, domain_id: 5, cloudflare_account_id: 2, zone_id: 'zone_ds_net_003', nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', ssl_mode: 'strict', cache_level: 'basic', security_level: 'medium', is_active: true, activated_at: '2024-05-14', created_at: '2024-05-14' },
  { id: 4, domain_id: 6, cloudflare_account_id: 1, zone_id: 'zone_wc_co_004', nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', ssl_mode: 'full', cache_level: 'aggressive', security_level: 'low', is_active: true, activated_at: '2023-11-22', created_at: '2023-11-22' },
  { id: 5, domain_id: 7, cloudflare_account_id: 1, zone_id: 'zone_ts_sa_005', nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com', ssl_mode: 'full', cache_level: 'basic', security_level: 'medium', is_active: true, activated_at: '2024-06-03', created_at: '2024-06-03' },
];

export const mockGoogleAdsAccounts: GoogleAdsAccount[] = [
  { id: 1, account_name: 'Tech Solutions Ads', account_email: 'ads@techsolutions.com', customer_id: '123-456-7890', status: 'active', notes: '', created_at: '2024-02-01' },
  { id: 2, account_name: 'Green Fields Ads', account_email: 'ads@greenfields.sa', customer_id: '234-567-8901', status: 'active', notes: '', created_at: '2024-04-01' },
];

export const mockGoogleAdsCampaigns: GoogleAdsCampaign[] = [
  { id: 1, google_ads_account_id: 1, website_id: 1, domain_id: 1, campaign_name: 'Tech Solutions Brand', campaign_id: 'camp_12345678', campaign_type: 'search', budget_amount: 1500, currency: 'USD', status: 'enabled', start_date: '2024-03-01', end_date: '', notes: '', created_at: '2024-03-01' },
  { id: 2, google_ads_account_id: 1, website_id: 7, domain_id: 7, campaign_name: 'Tech Solutions SA Local', campaign_id: 'camp_23456789', campaign_type: 'performance_max', budget_amount: 2000, currency: 'SAR', status: 'enabled', start_date: '2024-07-01', end_date: '', notes: '', created_at: '2024-07-01' },
  { id: 3, google_ads_account_id: 2, website_id: 3, domain_id: 3, campaign_name: 'Green Fields Summer Sale', campaign_id: 'camp_34567890', campaign_type: 'shopping', budget_amount: 3000, currency: 'SAR', status: 'paused', start_date: '2024-06-01', end_date: '2024-09-30', notes: 'Seasonal campaign', created_at: '2024-06-01' },
  { id: 4, google_ads_account_id: 2, website_id: 3, domain_id: 3, campaign_name: 'Green Fields Display', campaign_id: 'camp_45678901', campaign_type: 'display', budget_amount: 500, currency: 'SAR', status: 'enabled', start_date: '2024-08-01', end_date: '', notes: '', created_at: '2024-08-01' },
];

export const mockGoogleSearchConsoleAccounts: GoogleSearchConsoleAccount[] = [
  { id: 1, account_name: 'Main GSC Account', account_email: 'webmaster@techsolutions.com', status: 'active', notes: '', created_at: '2024-01-15' },
];

export const mockGoogleSearchConsoleProperties: GoogleSearchConsoleProperty[] = [
  { id: 1, gsc_account_id: 1, website_id: 1, domain_id: 1, property_url: 'https://www.techsolutions.com', property_type: 'url_prefix', verification_method: 'html_tag', is_verified: true, verified_at: '2024-01-20', created_at: '2024-01-20' },
  { id: 2, gsc_account_id: 1, website_id: 2, domain_id: 2, property_url: 'https://www.digitalwave.io', property_type: 'url_prefix', verification_method: 'dns', is_verified: true, verified_at: '2024-02-28', created_at: '2024-02-25' },
  { id: 3, gsc_account_id: 1, website_id: 3, domain_id: 3, property_url: 'sc-domain:greenfields.sa', property_type: 'domain', verification_method: 'dns', is_verified: true, verified_at: '2024-03-18', created_at: '2024-03-15' },
  { id: 4, gsc_account_id: 1, website_id: 7, domain_id: 7, property_url: 'https://www.techsolutions.sa', property_type: 'url_prefix', verification_method: 'google_analytics', is_verified: false, verified_at: null, created_at: '2024-06-15' },
];

export const mockGoogleTagManagerAccounts: GoogleTagManagerAccount[] = [
  { id: 1, account_name: 'Tech Solutions GTM', account_email: 'gtm@techsolutions.com', account_id: 'GTM-ACC-001', status: 'active', notes: '', created_at: '2024-01-15' },
];

export const mockGoogleTagManagerContainers: GoogleTagManagerContainer[] = [
  { id: 1, gtm_account_id: 1, website_id: 1, container_name: 'Tech Solutions Web', container_id: '12345678', container_public_id: 'GTM-ABCDEF1', container_type: 'web', tags_count: 12, triggers_count: 8, variables_count: 15, is_active: true, created_at: '2024-01-20' },
  { id: 2, gtm_account_id: 1, website_id: 3, container_name: 'Green Fields Store', container_id: '23456789', container_public_id: 'GTM-BCDEFG2', container_type: 'web', tags_count: 18, triggers_count: 12, variables_count: 20, is_active: true, created_at: '2024-03-15' },
  { id: 3, gtm_account_id: 1, website_id: 7, container_name: 'Tech Solutions SA', container_id: '34567890', container_public_id: 'GTM-CDEFGH3', container_type: 'web', tags_count: 8, triggers_count: 5, variables_count: 10, is_active: true, created_at: '2024-06-10' },
  { id: 4, gtm_account_id: 1, website_id: 2, container_name: 'Digital Wave Server', container_id: '45678901', container_public_id: 'GTM-DEFGHI4', container_type: 'server', tags_count: 5, triggers_count: 3, variables_count: 8, is_active: false, created_at: '2024-09-01' },
];

export const mockGoogleAnalyticsAccounts: GoogleAnalyticsAccount[] = [
  { id: 1, account_name: 'Tech Solutions Analytics', account_email: 'analytics@techsolutions.com', account_id: '12345678', property_id: '', measurement_id: 'G-ABCDEFG123', analytics_version: 'ga4', status: 'active', notes: '', created_at: '2024-01-15' },
  { id: 2, account_name: 'Green Fields Analytics', account_email: 'analytics@greenfields.sa', account_id: '23456789', property_id: '', measurement_id: 'G-HIJKLMN456', analytics_version: 'ga4', status: 'active', notes: '', created_at: '2024-03-15' },
  { id: 3, account_name: 'Digital Wave Legacy', account_email: 'analytics@digitalwave.io', account_id: '34567890', property_id: 'UA-34567890-1', measurement_id: '', analytics_version: 'ua', status: 'inactive', notes: 'Migrated to GA4', created_at: '2023-06-01' },
];

export const mockRepositories: Repository[] = [
  { id: 1, website_id: 2, repository_type: 'github', repository_url: 'https://github.com/digitalwave/platform', repository_name: 'platform', branch_name: 'main', is_private: true, last_commit_hash: 'a1b2c3d4e5f6', last_commit_date: '2025-01-22', notes: '', created_at: '2024-02-25' },
  { id: 2, website_id: 5, repository_type: 'github', repository_url: 'https://github.com/datasync/api', repository_name: 'api', branch_name: 'main', is_private: true, last_commit_hash: 'f6e5d4c3b2a1', last_commit_date: '2025-01-23', notes: '', created_at: '2024-05-15' },
  { id: 3, website_id: 8, repository_type: 'github', repository_url: 'https://github.com/datasync/api', repository_name: 'api', branch_name: 'develop', is_private: true, last_commit_hash: 'b2c3d4e5f6a1', last_commit_date: '2025-01-23', notes: 'Staging branch', created_at: '2024-12-05' },
  { id: 4, website_id: 6, repository_type: 'gitlab', repository_url: 'https://gitlab.com/webcraft/portfolio', repository_name: 'portfolio', branch_name: 'main', is_private: false, last_commit_hash: 'c3d4e5f6a1b2', last_commit_date: '2024-12-15', notes: '', created_at: '2024-06-01' },
  { id: 5, website_id: 1, repository_type: 'bitbucket', repository_url: 'https://bitbucket.org/techsol/wordpress-theme', repository_name: 'wordpress-theme', branch_name: 'production', is_private: true, last_commit_hash: 'd4e5f6a1b2c3', last_commit_date: '2025-01-10', notes: 'Custom theme repository', created_at: '2024-01-20' },
];

export const mockTags: Tag[] = [
  { id: 1, tag_name: 'Production', tag_color: '#22c55e', description: 'Production environments', created_at: '2024-01-01' },
  { id: 2, tag_name: 'Staging', tag_color: '#f59e0b', description: 'Staging environments', created_at: '2024-01-01' },
  { id: 3, tag_name: 'Critical', tag_color: '#ef4444', description: 'Critical infrastructure', created_at: '2024-01-01' },
  { id: 4, tag_name: 'WordPress', tag_color: '#3b82f6', description: 'WordPress sites', created_at: '2024-01-01' },
  { id: 5, tag_name: 'E-commerce', tag_color: '#8b5cf6', description: 'E-commerce websites', created_at: '2024-01-01' },
  { id: 6, tag_name: 'API', tag_color: '#06b6d4', description: 'API services', created_at: '2024-01-01' },
  { id: 7, tag_name: 'Saudi Arabia', tag_color: '#10b981', description: 'Saudi Arabia based', created_at: '2024-03-01' },
  { id: 8, tag_name: 'High Priority', tag_color: '#f97316', description: 'High priority items', created_at: '2024-01-01' },
];

export const mockEntityTags: EntityTag[] = [
  { id: 1, tag_id: 1, entity_type: 'website', entity_id: 1, created_at: '2024-01-20' },
  { id: 2, tag_id: 4, entity_type: 'website', entity_id: 1, created_at: '2024-01-20' },
  { id: 3, tag_id: 1, entity_type: 'website', entity_id: 2, created_at: '2024-02-25' },
  { id: 4, tag_id: 5, entity_type: 'website', entity_id: 3, created_at: '2024-03-15' },
  { id: 5, tag_id: 1, entity_type: 'server', entity_id: 1, created_at: '2024-01-01' },
  { id: 6, tag_id: 3, entity_type: 'server', entity_id: 1, created_at: '2024-01-01' },
  { id: 7, tag_id: 2, entity_type: 'server', entity_id: 2, created_at: '2024-02-15' },
  { id: 8, tag_id: 7, entity_type: 'client', entity_id: 1, created_at: '2024-01-15' },
  { id: 9, tag_id: 7, entity_type: 'client', entity_id: 3, created_at: '2024-03-10' },
  { id: 10, tag_id: 6, entity_type: 'website', entity_id: 5, created_at: '2024-05-15' },
  { id: 11, tag_id: 8, entity_type: 'domain', entity_id: 2, created_at: '2025-01-01' },
  { id: 12, tag_id: 8, entity_type: 'domain', entity_id: 3, created_at: '2025-01-01' },
];

export const mockDocuments: Document[] = [
  { id: 1, entity_type: 'client', entity_id: 1, document_type: 'contract', file_name: 'tech_solutions_contract_2024.pdf', file_path: '/documents/contracts/tech_solutions_contract_2024.pdf', file_size_kb: 2048, mime_type: 'application/pdf', uploaded_by: 1, description: 'Annual service contract', created_at: '2024-01-15' },
  { id: 2, entity_type: 'client', entity_id: 2, document_type: 'contract', file_name: 'digital_wave_agreement.pdf', file_path: '/documents/contracts/digital_wave_agreement.pdf', file_size_kb: 1536, mime_type: 'application/pdf', uploaded_by: 1, description: 'Service level agreement', created_at: '2024-02-20' },
  { id: 3, entity_type: 'domain', entity_id: 1, document_type: 'certificate', file_name: 'techsolutions_ssl_cert.pem', file_path: '/documents/certificates/techsolutions_ssl_cert.pem', file_size_kb: 4, mime_type: 'application/x-pem-file', uploaded_by: 1, description: 'SSL certificate file', created_at: '2024-10-15' },
  { id: 4, entity_type: 'server', entity_id: 1, document_type: 'report', file_name: 'server1_audit_jan2025.pdf', file_path: '/documents/reports/server1_audit_jan2025.pdf', file_size_kb: 3072, mime_type: 'application/pdf', uploaded_by: 2, description: 'Monthly server audit report', created_at: '2025-01-15' },
  { id: 5, entity_type: 'client', entity_id: 3, document_type: 'invoice', file_name: 'greenfields_inv_jan2025.pdf', file_path: '/documents/invoices/greenfields_inv_jan2025.pdf', file_size_kb: 512, mime_type: 'application/pdf', uploaded_by: 1, description: 'January 2025 invoice', created_at: '2025-01-01' },
  { id: 6, entity_type: 'website', entity_id: 3, document_type: 'backup', file_name: 'greenfields_backup_20250120.tar.gz', file_path: '/documents/backups/greenfields_backup_20250120.tar.gz', file_size_kb: 524288, mime_type: 'application/gzip', uploaded_by: null, description: 'Full site backup', created_at: '2025-01-20' },
  { id: 7, entity_type: 'other', entity_id: 0, document_type: 'other', file_name: 'infrastructure_overview.xlsx', file_path: '/documents/other/infrastructure_overview.xlsx', file_size_kb: 256, mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploaded_by: 1, description: 'Infrastructure overview spreadsheet', created_at: '2024-12-01' },
];

export const mockMaintenanceSchedules: MaintenanceSchedule[] = [
  { id: 1, entity_type: 'server', entity_id: 1, maintenance_type: 'backup', schedule_frequency: 'daily', schedule_time: '02:00', schedule_day_of_week: null, schedule_day_of_month: null, last_run_date: '2025-01-23T02:00:00', next_run_date: '2025-01-24T02:00:00', is_active: true, notes: 'Nightly full backup', created_at: '2024-01-01' },
  { id: 2, entity_type: 'server', entity_id: 2, maintenance_type: 'backup', schedule_frequency: 'daily', schedule_time: '03:00', schedule_day_of_week: null, schedule_day_of_month: null, last_run_date: '2025-01-23T03:00:00', next_run_date: '2025-01-24T03:00:00', is_active: true, notes: '', created_at: '2024-02-15' },
  { id: 3, entity_type: 'website', entity_id: 1, maintenance_type: 'update', schedule_frequency: 'weekly', schedule_time: '04:00', schedule_day_of_week: 3, schedule_day_of_month: null, last_run_date: '2025-01-22T04:00:00', next_run_date: '2025-01-29T04:00:00', is_active: true, notes: 'WordPress core & plugin updates', created_at: '2024-01-20' },
  { id: 4, entity_type: 'website', entity_id: 3, maintenance_type: 'security_scan', schedule_frequency: 'weekly', schedule_time: '05:00', schedule_day_of_week: 1, schedule_day_of_month: null, last_run_date: '2025-01-20T05:00:00', next_run_date: '2025-01-27T05:00:00', is_active: true, notes: 'WooCommerce security scan', created_at: '2024-03-15' },
  { id: 5, entity_type: 'server', entity_id: 3, maintenance_type: 'performance_check', schedule_frequency: 'monthly', schedule_time: '06:00', schedule_day_of_week: null, schedule_day_of_month: 1, last_run_date: '2025-01-01T06:00:00', next_run_date: '2025-02-01T06:00:00', is_active: true, notes: 'Monthly performance review', created_at: '2024-03-20' },
  { id: 6, entity_type: 'server', entity_id: 4, maintenance_type: 'backup', schedule_frequency: 'daily', schedule_time: '01:00', schedule_day_of_week: null, schedule_day_of_month: null, last_run_date: null, next_run_date: '2025-01-24T01:00:00', is_active: false, notes: 'Disabled - backup failures', created_at: '2024-04-10' },
];

export const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: 1, schedule_id: 1, entity_type: 'server', entity_id: 1, maintenance_type: 'backup', status: 'success', performed_by: null, start_time: '2025-01-23T02:00:00', end_time: '2025-01-23T02:35:00', duration_minutes: 35, details: 'Full backup completed - 48.2 GB', error_message: '', created_at: '2025-01-23' },
  { id: 2, schedule_id: 2, entity_type: 'server', entity_id: 2, maintenance_type: 'backup', status: 'success', performed_by: null, start_time: '2025-01-23T03:00:00', end_time: '2025-01-23T03:18:00', duration_minutes: 18, details: 'Full backup completed - 22.1 GB', error_message: '', created_at: '2025-01-23' },
  { id: 3, schedule_id: 3, entity_type: 'website', entity_id: 1, maintenance_type: 'update', status: 'success', performed_by: null, start_time: '2025-01-22T04:00:00', end_time: '2025-01-22T04:12:00', duration_minutes: 12, details: 'Updated WordPress to 6.4.3, 5 plugins updated', error_message: '', created_at: '2025-01-22' },
  { id: 4, schedule_id: 4, entity_type: 'website', entity_id: 3, maintenance_type: 'security_scan', status: 'success', performed_by: null, start_time: '2025-01-20T05:00:00', end_time: '2025-01-20T05:08:00', duration_minutes: 8, details: 'No vulnerabilities found', error_message: '', created_at: '2025-01-20' },
  { id: 5, schedule_id: 6, entity_type: 'server', entity_id: 4, maintenance_type: 'backup', status: 'failed', performed_by: null, start_time: '2025-01-20T01:00:00', end_time: '2025-01-20T01:05:00', duration_minutes: 5, details: '', error_message: 'Disk space insufficient on backup target', created_at: '2025-01-20' },
  { id: 6, schedule_id: null, entity_type: 'server', entity_id: 1, maintenance_type: 'update', status: 'success', performed_by: 1, start_time: '2025-01-18T10:00:00', end_time: '2025-01-18T10:45:00', duration_minutes: 45, details: 'OS security patches applied', error_message: '', created_at: '2025-01-18' },
  { id: 7, schedule_id: 5, entity_type: 'server', entity_id: 3, maintenance_type: 'performance_check', status: 'success', performed_by: null, start_time: '2025-01-01T06:00:00', end_time: '2025-01-01T06:22:00', duration_minutes: 22, details: 'All metrics within normal range', error_message: '', created_at: '2025-01-01' },
];

export const mockUptimeChecks: UptimeCheck[] = [
  { id: 1, website_id: 1, check_url: 'https://www.techsolutions.com', check_interval_minutes: 5, timeout_seconds: 30, expected_status_code: 200, is_active: true, last_check_at: '2025-01-23T15:05:00', last_status: 'up', created_at: '2024-01-20' },
  { id: 2, website_id: 2, check_url: 'https://www.digitalwave.io', check_interval_minutes: 5, timeout_seconds: 30, expected_status_code: 200, is_active: true, last_check_at: '2025-01-23T15:05:00', last_status: 'up', created_at: '2024-02-25' },
  { id: 3, website_id: 3, check_url: 'https://www.greenfields.sa', check_interval_minutes: 3, timeout_seconds: 30, expected_status_code: 200, is_active: true, last_check_at: '2025-01-23T15:03:00', last_status: 'up', created_at: '2024-03-15' },
  { id: 4, website_id: 5, check_url: 'https://api.datasync.net/health', check_interval_minutes: 1, timeout_seconds: 10, expected_status_code: 200, is_active: true, last_check_at: '2025-01-23T15:01:00', last_status: 'up', created_at: '2024-05-15' },
  { id: 5, website_id: 4, check_url: 'https://www.cloudfirst.com', check_interval_minutes: 5, timeout_seconds: 30, expected_status_code: 200, is_active: false, last_check_at: '2024-12-01T10:00:00', last_status: 'down', created_at: '2024-04-10' },
  { id: 6, website_id: 6, check_url: 'https://www.webcraft.co', check_interval_minutes: 10, timeout_seconds: 30, expected_status_code: 200, is_active: true, last_check_at: '2025-01-23T15:00:00', last_status: 'up', created_at: '2024-06-01' },
  { id: 7, website_id: 7, check_url: 'https://www.techsolutions.sa', check_interval_minutes: 5, timeout_seconds: 30, expected_status_code: 200, is_active: true, last_check_at: '2025-01-23T15:05:00', last_status: 'degraded', created_at: '2024-06-10' },
];

export const mockUptimeLogs: UptimeLog[] = [
  { id: 1, uptime_check_id: 1, status: 'up', response_time_ms: 120, status_code: 200, error_message: '', checked_at: '2025-01-23T15:05:00' },
  { id: 2, uptime_check_id: 2, status: 'up', response_time_ms: 85, status_code: 200, error_message: '', checked_at: '2025-01-23T15:05:00' },
  { id: 3, uptime_check_id: 3, status: 'up', response_time_ms: 210, status_code: 200, error_message: '', checked_at: '2025-01-23T15:03:00' },
  { id: 4, uptime_check_id: 4, status: 'up', response_time_ms: 45, status_code: 200, error_message: '', checked_at: '2025-01-23T15:01:00' },
  { id: 5, uptime_check_id: 5, status: 'down', response_time_ms: 0, status_code: 0, error_message: 'Connection timed out', checked_at: '2024-12-01T10:00:00' },
  { id: 6, uptime_check_id: 7, status: 'degraded', response_time_ms: 2800, status_code: 200, error_message: '', checked_at: '2025-01-23T15:05:00' },
  { id: 7, uptime_check_id: 6, status: 'up', response_time_ms: 150, status_code: 200, error_message: '', checked_at: '2025-01-23T15:00:00' },
];

export const mockNotificationSettings: NotificationSetting[] = [
  { id: 1, user_id: 1, notification_type: 'domain_expiry', days_before: 30, notify_via_email: true, notify_via_sms: false, notify_in_app: true, is_enabled: true },
  { id: 2, user_id: 1, notification_type: 'ssl_expiry', days_before: 14, notify_via_email: true, notify_via_sms: false, notify_in_app: true, is_enabled: true },
  { id: 3, user_id: 1, notification_type: 'server_billing', days_before: 7, notify_via_email: true, notify_via_sms: false, notify_in_app: true, is_enabled: true },
  { id: 4, user_id: 1, notification_type: 'website_billing', days_before: 7, notify_via_email: true, notify_via_sms: false, notify_in_app: true, is_enabled: true },
  { id: 5, user_id: 1, notification_type: 'backup_failed', days_before: 0, notify_via_email: true, notify_via_sms: true, notify_in_app: true, is_enabled: true },
  { id: 6, user_id: 1, notification_type: 'server_down', days_before: 0, notify_via_email: true, notify_via_sms: true, notify_in_app: true, is_enabled: true },
  { id: 7, user_id: 1, notification_type: 'security_alert', days_before: 0, notify_via_email: true, notify_via_sms: true, notify_in_app: true, is_enabled: true },
  { id: 8, user_id: 1, notification_type: 'resource_limit', days_before: 0, notify_via_email: false, notify_via_sms: false, notify_in_app: true, is_enabled: true },
];

export const mockSystemSettings: SystemSetting[] = [
  { id: 1, setting_key: 'app_name', setting_value: 'DomainManager Pro', setting_type: 'string', description: 'Application display name', is_public: true, updated_by: 1, created_at: '2024-01-01' },
  { id: 2, setting_key: 'company_name', setting_value: 'Tech Solutions Ltd', setting_type: 'string', description: 'Company name', is_public: true, updated_by: 1, created_at: '2024-01-01' },
  { id: 3, setting_key: 'default_currency', setting_value: 'USD', setting_type: 'string', description: 'Default currency for billing', is_public: false, updated_by: 1, created_at: '2024-01-01' },
  { id: 4, setting_key: 'timezone', setting_value: 'Asia/Riyadh', setting_type: 'string', description: 'Default timezone', is_public: false, updated_by: 1, created_at: '2024-01-01' },
  { id: 5, setting_key: 'domain_expiry_warning_days', setting_value: '30', setting_type: 'number', description: 'Days before domain expiry to show warning', is_public: false, updated_by: 1, created_at: '2024-01-01' },
  { id: 6, setting_key: 'enable_email_notifications', setting_value: 'true', setting_type: 'boolean', description: 'Enable email notifications', is_public: false, updated_by: 1, created_at: '2024-01-01' },
  { id: 7, setting_key: 'backup_retention_days', setting_value: '30', setting_type: 'number', description: 'Number of days to retain backups', is_public: false, updated_by: 1, created_at: '2024-01-01' },
  { id: 8, setting_key: 'max_login_attempts', setting_value: '5', setting_type: 'number', description: 'Maximum login attempts before lockout', is_public: false, updated_by: 1, created_at: '2024-01-01' },
];

export const mockUserPermissions: UserPermission[] = [
  { id: 1, user_id: 1, entity_type: 'all', entity_id: null, permission_level: 'owner', granted_at: '2024-01-01', granted_by: null },
  { id: 2, user_id: 2, entity_type: 'website', entity_id: 2, permission_level: 'admin', granted_at: '2024-02-25', granted_by: 1 },
  { id: 3, user_id: 2, entity_type: 'server', entity_id: 1, permission_level: 'edit', granted_at: '2024-02-25', granted_by: 1 },
  { id: 4, user_id: 2, entity_type: 'server', entity_id: 2, permission_level: 'edit', granted_at: '2024-02-25', granted_by: 1 },
  { id: 5, user_id: 3, entity_type: 'client', entity_id: 3, permission_level: 'admin', granted_at: '2024-03-10', granted_by: 1 },
  { id: 6, user_id: 3, entity_type: 'domain', entity_id: 3, permission_level: 'admin', granted_at: '2024-03-10', granted_by: 1 },
  { id: 7, user_id: 3, entity_type: 'website', entity_id: 3, permission_level: 'admin', granted_at: '2024-03-10', granted_by: 1 },
  { id: 8, user_id: 4, entity_type: 'client', entity_id: 4, permission_level: 'view', granted_at: '2024-04-05', granted_by: 1 },
  { id: 9, user_id: 5, entity_type: 'website', entity_id: 5, permission_level: 'admin', granted_at: '2024-05-15', granted_by: 1 },
  { id: 10, user_id: 5, entity_type: 'website', entity_id: 8, permission_level: 'admin', granted_at: '2024-12-05', granted_by: 1 },
  { id: 11, user_id: 5, entity_type: 'server', entity_id: 3, permission_level: 'edit', granted_at: '2024-05-15', granted_by: 1 },
];
