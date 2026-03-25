export type UserRole = 'super_admin' | 'admin' | 'developer' | 'client' | 'viewer';
export type ClientStatus = 'active' | 'suspended' | 'inactive';
export type DomainStatus = 'active' | 'expired' | 'pending' | 'suspended' | 'deleted';
export type ServerStatus = 'active' | 'maintenance' | 'suspended' | 'terminated';
export type ServerType = 'shared' | 'vps' | 'dedicated' | 'cloud';
export type WebsiteStatus = 'active' | 'maintenance' | 'suspended' | 'archived';
export type WebsiteType = 'wordpress' | 'spa' | 'custom' | 'mobile_app' | 'static' | 'ecommerce';
export type Environment = 'development' | 'staging' | 'production';
export type ProviderType = 'registrar' | 'hosting' | 'cdn' | 'ssl' | 'other';
export type BillingCycle = 'monthly' | 'yearly' | '2years' | '3years' | '5years' | 'one_time';
export type Severity = 'info' | 'warning' | 'critical';
export type NotificationType = 'domain_expiry' | 'ssl_expiry' | 'server_billing' | 'website_billing' | 'backup_failed' | 'server_down' | 'resource_limit' | 'security_alert' | 'other';
export type IncidentType = 'malware' | 'hack' | 'ddos' | 'data_breach' | 'unauthorized_access' | 'other';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Client {
  id: number;
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string;
  status: ClientStatus;
  notes: string;
  created_at: string;
}

export interface ServiceProvider {
  id: number;
  provider_name: string;
  provider_type: ProviderType;
  website_url: string;
  support_email: string;
  notes: string;
  created_at: string;
}

export interface Domain {
  id: number;
  domain_name: string;
  tld: string;
  status: DomainStatus;
  registrar_id: number | null;
  client_id: number | null;
  registration_date: string;
  expiry_date: string;
  auto_renew: boolean;
  renewal_notification_days: number;
  whois_privacy: boolean;
  nameservers: string;
  created_at: string;
}

export interface Server {
  id: number;
  server_name: string;
  provider_id: number | null;
  server_type: ServerType;
  ip_address: string;
  location: string;
  operating_system: string;
  control_panel: string;
  cpu_cores: number;
  ram_gb: number;
  storage_gb: number;
  bandwidth_gb: number;
  status: ServerStatus;
  created_at: string;
}

export interface Website {
  id: number;
  website_name: string;
  domain_id: number | null;
  client_id: number | null;
  server_account_id: number | null;
  website_type: WebsiteType;
  framework: string;
  environment: Environment;
  website_url: string;
  admin_url: string;
  status: WebsiteStatus;
  description: string;
  created_at: string;
}

export interface Notification {
  id: number;
  notification_type: NotificationType;
  entity_type: string;
  entity_id: number;
  title: string;
  message: string;
  severity: Severity;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action_type: string;
  entity_type: string;
  entity_name: string;
  description: string;
  created_at: string;
}

export interface ServerMonitoring {
  id: number;
  server_id: number;
  cpu_usage: number;
  ram_usage: number;
  storage_usage: number;
  bandwidth_usage: number;
  uptime_percentage: number;
  response_time_ms: number;
  recorded_at: string;
}

export interface DomainCost {
  id: number;
  domain_id: number;
  cost_amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  purchase_date: string;
  next_billing_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
}

export interface WhoisHistory {
  id: number;
  domain_id: number;
  registrant_name: string;
  registrant_email: string;
  registrant_organization: string;
  admin_contact: string;
  tech_contact: string;
  captured_at: string;
}

export interface ServerAccount {
  id: number;
  server_id: number;
  client_id: number | null;
  username: string;
  account_type: 'cpanel' | 'plesk' | 'custom' | 'root';
  disk_usage_mb: number;
  disk_limit_mb: number;
  bandwidth_usage_mb: number;
  bandwidth_limit_mb: number;
  email_accounts: number;
  databases: number;
  addon_domains: number;
  status: 'active' | 'suspended' | 'terminated';
  created_at: string;
}

export interface ServerCost {
  id: number;
  server_id: number;
  cost_amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
}

export interface SSLCertificate {
  id: number;
  website_id: number;
  provider_id: number | null;
  domain_name: string;
  issuer: string;
  type: 'free' | 'dv' | 'ov' | 'ev' | 'wildcard';
  issued_date: string;
  expiry_date: string;
  auto_renew: boolean;
  status: 'active' | 'expired' | 'revoked' | 'pending';
}

export interface WebsiteCost {
  id: number;
  website_id: number;
  description: string;
  cost_amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  created_at: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AccessLevel = 'root' | 'admin' | 'user' | 'ftp_only';
export type CloudflareSSLMode = 'off' | 'flexible' | 'full' | 'strict';
export type CloudflareCacheLevel = 'aggressive' | 'basic' | 'simplified';
export type CloudflareSecurityLevel = 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack';
export type CampaignType = 'search' | 'display' | 'video' | 'shopping' | 'app' | 'smart' | 'performance_max';
export type CampaignStatus = 'enabled' | 'paused' | 'removed';
export type PropertyType = 'domain' | 'url_prefix';
export type VerificationMethod = 'html_file' | 'html_tag' | 'google_analytics' | 'google_tag_manager' | 'dns';
export type ContainerType = 'web' | 'amp' | 'android' | 'ios' | 'server';
export type AnalyticsVersion = 'ua' | 'ga4';
export type RepositoryType = 'github' | 'gitlab' | 'bitbucket' | 'other';
export type PermissionLevel = 'view' | 'edit' | 'admin' | 'owner';
export type SentVia = 'in_app' | 'email' | 'sms' | 'all';
export type ActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import';
export type MaintenanceType = 'update' | 'backup' | 'security_scan' | 'performance_check' | 'other';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type MaintenanceLogStatus = 'success' | 'failed' | 'partial' | 'skipped';
export type UptimeStatus = 'up' | 'down' | 'degraded';
export type DocumentType = 'contract' | 'invoice' | 'receipt' | 'certificate' | 'backup' | 'report' | 'other';
export type SettingType = 'string' | 'number' | 'boolean' | 'json';
export type CredentialType = 'admin' | 'ftp' | 'database' | 'api' | 'ssh' | 'other';
export type WebsiteCostType = 'hosting' | 'maintenance' | 'license' | 'plugin' | 'theme' | 'other';
export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface SecurityIncident {
  id: number;
  entity_type: string;
  entity_id: number;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detected_at: string;
  resolved_at: string | null;
  description: string;
  actions_taken: string;
  reported_by: number | null;
  assigned_to: number | null;
  created_at: string;
}

export interface WebsiteCredential {
  id: number;
  website_id: number;
  credential_type: CredentialType;
  username: string;
  access_url: string;
  additional_info: string;
  notes: string;
  created_at: string;
}

export interface CloudflareAccount {
  id: number;
  account_name: string;
  account_email: string;
  account_id: string;
  status: AccountStatus;
  notes: string;
  created_at: string;
}

export interface CloudflareDomain {
  id: number;
  domain_id: number;
  cloudflare_account_id: number;
  zone_id: string;
  nameservers: string;
  ssl_mode: CloudflareSSLMode;
  cache_level: CloudflareCacheLevel;
  security_level: CloudflareSecurityLevel;
  is_active: boolean;
  activated_at: string;
  created_at: string;
}

export interface GoogleAdsAccount {
  id: number;
  account_name: string;
  account_email: string;
  customer_id: string;
  status: AccountStatus;
  notes: string;
  created_at: string;
}

export interface GoogleAdsCampaign {
  id: number;
  google_ads_account_id: number;
  website_id: number | null;
  domain_id: number | null;
  campaign_name: string;
  campaign_id: string;
  campaign_type: CampaignType;
  budget_amount: number;
  currency: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
}

export interface GoogleSearchConsoleAccount {
  id: number;
  account_name: string;
  account_email: string;
  status: AccountStatus;
  notes: string;
  created_at: string;
}

export interface GoogleSearchConsoleProperty {
  id: number;
  gsc_account_id: number;
  website_id: number | null;
  domain_id: number | null;
  property_url: string;
  property_type: PropertyType;
  verification_method: VerificationMethod;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface GoogleTagManagerAccount {
  id: number;
  account_name: string;
  account_email: string;
  account_id: string;
  status: AccountStatus;
  notes: string;
  created_at: string;
}

export interface GoogleTagManagerContainer {
  id: number;
  gtm_account_id: number;
  website_id: number | null;
  container_name: string;
  container_id: string;
  container_public_id: string;
  container_type: ContainerType;
  tags_count: number;
  triggers_count: number;
  variables_count: number;
  is_active: boolean;
  created_at: string;
}

export interface GoogleAnalyticsAccount {
  id: number;
  account_name: string;
  account_email: string;
  account_id: string;
  property_id: string;
  measurement_id: string;
  analytics_version: AnalyticsVersion;
  status: AccountStatus;
  notes: string;
  created_at: string;
}

export interface Repository {
  id: number;
  website_id: number | null;
  repository_type: RepositoryType;
  repository_url: string;
  repository_name: string;
  branch_name: string;
  is_private: boolean;
  last_commit_hash: string;
  last_commit_date: string;
  notes: string;
  created_at: string;
}

export interface Tag {
  id: number;
  tag_name: string;
  tag_color: string;
  description: string;
  created_at: string;
}

export interface EntityTag {
  id: number;
  tag_id: number;
  entity_type: string;
  entity_id: number;
  created_at: string;
}

export interface Document {
  id: number;
  entity_type: string;
  entity_id: number;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size_kb: number;
  mime_type: string;
  uploaded_by: number | null;
  description: string;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: number;
  entity_type: string;
  entity_id: number;
  maintenance_type: MaintenanceType;
  schedule_frequency: ScheduleFrequency;
  schedule_time: string;
  schedule_day_of_week: number | null;
  schedule_day_of_month: number | null;
  last_run_date: string | null;
  next_run_date: string;
  is_active: boolean;
  notes: string;
  created_at: string;
}

export interface MaintenanceLog {
  id: number;
  schedule_id: number | null;
  entity_type: string;
  entity_id: number;
  maintenance_type: MaintenanceType;
  status: MaintenanceLogStatus;
  performed_by: number | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  details: string;
  error_message: string;
  created_at: string;
}

export interface UptimeCheck {
  id: number;
  website_id: number;
  check_url: string;
  check_interval_minutes: number;
  timeout_seconds: number;
  expected_status_code: number;
  is_active: boolean;
  last_check_at: string;
  last_status: UptimeStatus;
  created_at: string;
}

export interface UptimeLog {
  id: number;
  uptime_check_id: number;
  status: UptimeStatus;
  response_time_ms: number;
  status_code: number;
  error_message: string;
  checked_at: string;
}

export interface NotificationSetting {
  id: number;
  user_id: number;
  notification_type: NotificationType;
  days_before: number;
  notify_via_email: boolean;
  notify_via_sms: boolean;
  notify_in_app: boolean;
  is_enabled: boolean;
}

export interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: SettingType;
  description: string;
  is_public: boolean;
  updated_by: number | null;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface UserPermission {
  id: number;
  user_id: number;
  entity_type: string;
  entity_id: number | null;
  permission_level: PermissionLevel;
  granted_at: string;
  granted_by: number | null;
}
