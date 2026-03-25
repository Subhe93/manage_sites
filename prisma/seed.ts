import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.$transaction([
    prisma.uptimeLog.deleteMany(),
    prisma.uptimeCheck.deleteMany(),
    prisma.securityIncident.deleteMany(),
    prisma.maintenanceLogs.deleteMany(),
    prisma.maintenanceSchedule.deleteMany(),
    prisma.document.deleteMany(),
    prisma.entityTag.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.notificationSettings.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.userPermission.deleteMany(),
    prisma.repository.deleteMany(),
    prisma.googleAnalyticsAccount.deleteMany(),
    prisma.googleTagManagerContainer.deleteMany(),
    prisma.googleTagManagerAccount.deleteMany(),
    prisma.googleSearchConsoleProperty.deleteMany(),
    prisma.googleSearchConsoleAccount.deleteMany(),
    prisma.googleAdsCampaign.deleteMany(),
    prisma.googleAdsAccount.deleteMany(),
    prisma.cloudflareDomain.deleteMany(),
    prisma.cloudflareAccount.deleteMany(),
    prisma.websiteCost.deleteMany(),
    prisma.websiteCredential.deleteMany(),
    prisma.customFieldValue.deleteMany(),
    prisma.customFieldDefinition.deleteMany(),
    prisma.website.deleteMany(),
    prisma.serverMonitoring.deleteMany(),
    prisma.serverCost.deleteMany(),
    prisma.serverAccount.deleteMany(),
    prisma.server.deleteMany(),
    prisma.whoisHistory.deleteMany(),
    prisma.domainCost.deleteMany(),
    prisma.domain.deleteMany(),
    prisma.serviceProvider.deleteMany(),
    prisma.client.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.systemSettings.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('✅ Data cleared successfully');

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      passwordHash: hashedPassword,
      fullName: 'Super Admin',
      role: 'super_admin',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });

  const developer = await prisma.user.create({
    data: {
      username: 'developer',
      email: 'developer@example.com',
      passwordHash: hashedPassword,
      fullName: 'Developer User',
      role: 'developer',
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // Create Service Providers
  console.log('🏢 Creating service providers...');
  const namecheap = await prisma.serviceProvider.create({
    data: {
      providerName: 'Namecheap',
      providerType: 'registrar',
      websiteUrl: 'https://www.namecheap.com',
      supportEmail: 'support@namecheap.com',
    },
  });

  const digitalOcean = await prisma.serviceProvider.create({
    data: {
      providerName: 'DigitalOcean',
      providerType: 'hosting',
      websiteUrl: 'https://www.digitalocean.com',
      supportEmail: 'support@digitalocean.com',
    },
  });

  const cloudflare = await prisma.serviceProvider.create({
    data: {
      providerName: 'Cloudflare',
      providerType: 'cdn',
      websiteUrl: 'https://www.cloudflare.com',
      supportEmail: 'support@cloudflare.com',
    },
  });

  console.log('✅ Service providers created');

  // Create Clients
  console.log('👥 Creating clients...');
  const client1 = await prisma.client.create({
    data: {
      clientName: 'Tech Solutions Ltd',
      companyName: 'Tech Solutions Limited',
      email: 'contact@techsolutions.com',
      phone: '+966501234567',
      country: 'Saudi Arabia',
      status: 'active',
      createdBy: admin.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      clientName: 'Digital Marketing Co',
      companyName: 'Digital Marketing Company',
      email: 'info@digitalmarketing.com',
      phone: '+966509876543',
      country: 'United Arab Emirates',
      status: 'active',
      createdBy: admin.id,
    },
  });

  console.log('✅ Clients created');

  // Create Domains
  console.log('🌐 Creating domains...');
  const domain1 = await prisma.domain.create({
    data: {
      domainName: 'techsolutions.com',
      tld: '.com',
      status: 'active',
      registrarId: namecheap.id,
      clientId: client1.id,
      registrationDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15'),
      autoRenew: true,
      renewalNotificationDays: 30,
      whoisPrivacy: true,
      nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com',
    },
  });

  const domain2 = await prisma.domain.create({
    data: {
      domainName: 'digitalmarketing.com',
      tld: '.com',
      status: 'active',
      registrarId: namecheap.id,
      clientId: client2.id,
      registrationDate: new Date('2023-06-01'),
      expiryDate: new Date('2025-06-01'),
      autoRenew: true,
      renewalNotificationDays: 45,
      whoisPrivacy: true,
    },
  });

  console.log('✅ Domains created');

  // Create Domain Costs
  console.log('💰 Creating domain costs...');
  await prisma.domainCost.create({
    data: {
      domainId: domain1.id,
      costAmount: 12.99,
      currency: 'USD',
      billingCycle: 'yearly',
      purchaseDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2025-01-15'),
      paymentMethod: 'Credit Card',
    },
  });

  await prisma.domainCost.create({
    data: {
      domainId: domain2.id,
      costAmount: 24.99,
      currency: 'USD',
      billingCycle: 'two_years',
      purchaseDate: new Date('2023-06-01'),
      nextBillingDate: new Date('2025-06-01'),
      paymentMethod: 'PayPal',
    },
  });

  console.log('✅ Domain costs created');

  // Create Servers
  console.log('🖥️  Creating servers...');
  const server1 = await prisma.server.create({
    data: {
      serverName: 'Production Server 1',
      providerId: digitalOcean.id,
      serverType: 'vps',
      ipAddress: '192.168.1.100',
      location: 'Frankfurt - Germany',
      operatingSystem: 'Ubuntu 22.04 LTS',
      controlPanel: 'cpanel',
      controlPanelUrl: 'https://server1.example.com:2083',
      cpuCores: 4,
      ramGb: 8,
      storageGb: 160,
      bandwidthGb: 5000,
      status: 'active',
    },
  });

  const server2 = await prisma.server.create({
    data: {
      serverName: 'Development Server',
      providerId: digitalOcean.id,
      serverType: 'cloud',
      ipAddress: '192.168.1.101',
      location: 'New York - USA',
      operatingSystem: 'Ubuntu 22.04 LTS',
      controlPanel: 'none',
      cpuCores: 2,
      ramGb: 4,
      storageGb: 80,
      bandwidthGb: 2000,
      status: 'active',
    },
  });

  console.log('✅ Servers created');

  // Create Server Accounts
  console.log('🔐 Creating server accounts...');
  const serverAccount1 = await prisma.serverAccount.create({
    data: {
      serverId: server1.id,
      accountName: 'main_account',
      username: 'root',
      passwordEncrypted: 'encrypted_password_here',
      accessLevel: 'root',
      controlPanelUrl: 'https://server1.example.com:2083',
      sshPort: 22,
      ftpPort: 21,
    },
  });

  const serverAccount2 = await prisma.serverAccount.create({
    data: {
      serverId: server2.id,
      accountName: 'dev_account',
      username: 'developer',
      passwordEncrypted: 'encrypted_password_here',
      accessLevel: 'admin',
      sshPort: 22,
      ftpPort: 21,
    },
  });

  console.log('✅ Server accounts created');

  // Create Server Costs
  console.log('💵 Creating server costs...');
  await prisma.serverCost.create({
    data: {
      serverId: server1.id,
      costAmount: 50.0,
      currency: 'USD',
      billingCycle: 'monthly',
      activationDate: new Date('2024-01-01'),
      nextBillingDate: new Date('2024-04-01'),
      autoRenew: true,
      paymentMethod: 'Credit Card',
    },
  });

  await prisma.serverCost.create({
    data: {
      serverId: server2.id,
      costAmount: 25.0,
      currency: 'USD',
      billingCycle: 'monthly',
      activationDate: new Date('2024-01-01'),
      nextBillingDate: new Date('2024-04-01'),
      autoRenew: true,
      paymentMethod: 'PayPal',
    },
  });

  console.log('✅ Server costs created');

  // Create Websites
  console.log('🌍 Creating websites...');
  const website1 = await prisma.website.create({
    data: {
      websiteName: 'Tech Solutions Main Site',
      domainId: domain1.id,
      clientId: client1.id,
      serverAccountId: serverAccount1.id,
      websiteType: 'wordpress',
      framework: 'WordPress 6.4',
      environment: 'production',
      websiteUrl: 'https://www.techsolutions.com',
      adminUrl: 'https://www.techsolutions.com/wp-admin',
      databaseName: 'techsolutions_db',
      databaseType: 'MySQL 8.0',
      status: 'active',
      description: 'Main corporate website',
    },
  });

  const website2 = await prisma.website.create({
    data: {
      websiteName: 'Digital Marketing Portal',
      domainId: domain2.id,
      clientId: client2.id,
      serverAccountId: serverAccount1.id,
      websiteType: 'custom',
      framework: 'Next.js 14',
      environment: 'production',
      websiteUrl: 'https://www.digitalmarketing.com',
      apiEndpoint: 'https://api.digitalmarketing.com',
      databaseName: 'digitalmarketing_db',
      databaseType: 'PostgreSQL 15',
      status: 'active',
      description: 'Marketing automation platform',
    },
  });

  console.log('✅ Websites created');

  // Create Website Credentials
  console.log('🔑 Creating website credentials...');
  await prisma.websiteCredential.create({
    data: {
      websiteId: website1.id,
      credentialType: 'admin',
      username: 'admin',
      passwordEncrypted: 'encrypted_wp_password',
      accessUrl: 'https://www.techsolutions.com/wp-admin',
    },
  });

  await prisma.websiteCredential.create({
    data: {
      websiteId: website1.id,
      credentialType: 'database',
      username: 'db_user',
      passwordEncrypted: 'encrypted_db_password',
      additionalInfo: '{"host": "localhost", "port": 3306}',
    },
  });

  console.log('✅ Website credentials created');

  // Create Website Costs
  console.log('💳 Creating website costs...');
  await prisma.websiteCost.create({
    data: {
      websiteId: website1.id,
      costAmount: 99.0,
      currency: 'USD',
      billingCycle: 'yearly',
      costType: 'maintenance',
      startDate: new Date('2024-01-01'),
      nextBillingDate: new Date('2025-01-01'),
      autoRenew: true,
    },
  });

  await prisma.websiteCost.create({
    data: {
      websiteId: website2.id,
      costAmount: 199.0,
      currency: 'USD',
      billingCycle: 'monthly',
      costType: 'hosting',
      startDate: new Date('2024-01-01'),
      nextBillingDate: new Date('2024-04-01'),
      autoRenew: true,
    },
  });

  console.log('✅ Website costs created');

  // Create Cloudflare Accounts
  console.log('☁️  Creating Cloudflare accounts...');
  const cfAccount = await prisma.cloudflareAccount.create({
    data: {
      accountName: 'Main Cloudflare Account',
      accountEmail: 'admin@example.com',
      accountId: 'CF123456',
      apiKeyEncrypted: 'encrypted_api_key',
      apiTokenEncrypted: 'encrypted_api_token',
      status: 'active',
    },
  });

  console.log('✅ Cloudflare accounts created');

  // Create Cloudflare Domains
  console.log('🔗 Creating Cloudflare domains...');
  await prisma.cloudflareDomain.create({
    data: {
      domainId: domain1.id,
      cloudflareAccountId: cfAccount.id,
      zoneId: 'abc123def456',
      nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com',
      sslMode: 'full',
      cacheLevel: 'aggressive',
      securityLevel: 'medium',
      isActive: true,
    },
  });

  console.log('✅ Cloudflare domains created');

  // Create Google Ads Account
  console.log('📢 Creating Google Ads accounts...');
  const googleAdsAccount = await prisma.googleAdsAccount.create({
    data: {
      accountName: 'Main Ads Account',
      accountEmail: 'ads@example.com',
      customerId: '123-456-7890',
      status: 'active',
    },
  });

  // Create Google Ads Campaign
  await prisma.googleAdsCampaign.create({
    data: {
      googleAdsAccountId: googleAdsAccount.id,
      websiteId: website1.id,
      domainId: domain1.id,
      campaignName: 'Summer Sale 2024',
      campaignId: '12345678',
      campaignType: 'search',
      budgetAmount: 1000.0,
      currency: 'USD',
      status: 'enabled',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
    },
  });

  console.log('✅ Google Ads created');

  // Create Tags
  console.log('🏷️  Creating tags...');
  const productionTag = await prisma.tag.create({
    data: {
      tagName: 'Production',
      tagColor: '#FF5733',
      description: 'Production websites',
    },
  });

  const developmentTag = await prisma.tag.create({
    data: {
      tagName: 'Development',
      tagColor: '#33FF57',
      description: 'Development websites',
    },
  });

  const criticalTag = await prisma.tag.create({
    data: {
      tagName: 'Critical',
      tagColor: '#FF3333',
      description: 'Critical infrastructure',
    },
  });

  console.log('✅ Tags created');

  // Create Entity Tags
  console.log('🔖 Creating entity tags...');
  await prisma.entityTag.createMany({
    data: [
      { tagId: productionTag.id, entityType: 'website', entityId: website1.id },
      { tagId: criticalTag.id, entityType: 'website', entityId: website1.id },
      { tagId: productionTag.id, entityType: 'domain', entityId: domain1.id },
      { tagId: developmentTag.id, entityType: 'server', entityId: server2.id },
    ],
  });

  console.log('✅ Entity tags created');

  // Create Repositories
  console.log('📦 Creating repositories...');
  await prisma.repository.create({
    data: {
      websiteId: website2.id,
      repositoryType: 'github',
      repositoryUrl: 'https://github.com/company/digitalmarketing',
      repositoryName: 'digitalmarketing',
      branchName: 'main',
      accessTokenEncrypted: 'encrypted_token',
      isPrivate: true,
      lastCommitHash: 'abc123def456',
      lastCommitDate: new Date('2024-03-20'),
    },
  });

  console.log('✅ Repositories created');

  // Create Uptime Checks
  console.log('⏱️  Creating uptime checks...');
  const uptimeCheck1 = await prisma.uptimeCheck.create({
    data: {
      websiteId: website1.id,
      checkUrl: 'https://www.techsolutions.com',
      checkIntervalMinutes: 5,
      timeoutSeconds: 30,
      expectedStatusCode: 200,
      isActive: true,
      lastStatus: 'up',
    },
  });

  const uptimeCheck2 = await prisma.uptimeCheck.create({
    data: {
      websiteId: website2.id,
      checkUrl: 'https://www.digitalmarketing.com',
      checkIntervalMinutes: 5,
      timeoutSeconds: 30,
      expectedStatusCode: 200,
      isActive: true,
      lastStatus: 'up',
    },
  });

  console.log('✅ Uptime checks created');

  // Create Uptime Logs
  console.log('📊 Creating uptime logs...');
  await prisma.uptimeLog.createMany({
    data: [
      {
        uptimeCheckId: uptimeCheck1.id,
        status: 'up',
        responseTimeMs: 250,
        statusCode: 200,
        checkedAt: new Date(),
      },
      {
        uptimeCheckId: uptimeCheck2.id,
        status: 'up',
        responseTimeMs: 180,
        statusCode: 200,
        checkedAt: new Date(),
      },
    ],
  });

  console.log('✅ Uptime logs created');

  // Create Notifications
  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        notificationType: 'domain_expiry',
        entityType: 'domain',
        entityId: domain1.id,
        title: 'Domain Expiring Soon',
        message: 'Your domain techsolutions.com will expire in 30 days',
        severity: 'warning',
        isRead: false,
        sentToUserId: admin.id,
        sentVia: 'all',
      },
      {
        notificationType: 'server_billing',
        entityType: 'server',
        entityId: server1.id,
        title: 'Server Payment Due',
        message: 'Server payment is due in 5 days',
        severity: 'info',
        isRead: false,
        sentToUserId: admin.id,
        sentVia: 'email',
      },
    ],
  });

  console.log('✅ Notifications created');

  // Create Notification Settings
  console.log('⚙️  Creating notification settings...');
  await prisma.notificationSettings.createMany({
    data: [
      {
        userId: admin.id,
        notificationType: 'domain_expiry',
        daysBefore: 30,
        notifyViaEmail: true,
        notifyViaSms: false,
        notifyInApp: true,
        isEnabled: true,
      },
      {
        userId: admin.id,
        notificationType: 'server_billing',
        daysBefore: 7,
        notifyViaEmail: true,
        notifyViaSms: false,
        notifyInApp: true,
        isEnabled: true,
      },
    ],
  });

  console.log('✅ Notification settings created');

  // Create Activity Logs
  console.log('📝 Creating activity logs...');
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        actionType: 'create',
        entityType: 'domain',
        entityId: domain1.id,
        entityName: 'techsolutions.com',
        description: 'Created new domain',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: developer.id,
        actionType: 'update',
        entityType: 'website',
        entityId: website1.id,
        entityName: 'Tech Solutions Main Site',
        description: 'Updated website settings',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
      },
    ],
  });

  console.log('✅ Activity logs created');

  // Create User Permissions
  console.log('🔒 Creating user permissions...');
  await prisma.userPermission.createMany({
    data: [
      {
        userId: admin.id,
        entityType: 'all',
        permissionLevel: 'admin',
        grantedBy: superAdmin.id,
      },
      {
        userId: developer.id,
        entityType: 'website',
        entityId: website1.id,
        permissionLevel: 'edit',
        grantedBy: admin.id,
      },
    ],
  });

  console.log('✅ User permissions created');

  // Create System Settings
  console.log('⚙️  Creating system settings...');
  await prisma.systemSettings.createMany({
    data: [
      {
        settingKey: 'app_name',
        settingValue: 'Domain Manager Pro',
        settingType: 'string',
        description: 'Application name',
        isPublic: true,
        updatedBy: superAdmin.id,
      },
      {
        settingKey: 'default_currency',
        settingValue: 'USD',
        settingType: 'string',
        description: 'Default currency for costs',
        isPublic: true,
        updatedBy: superAdmin.id,
      },
      {
        settingKey: 'domain_expiry_notification_days',
        settingValue: '30',
        settingType: 'number',
        description: 'Days before domain expiry to send notification',
        isPublic: false,
        updatedBy: superAdmin.id,
      },
      {
        settingKey: 'enable_uptime_monitoring',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable uptime monitoring feature',
        isPublic: false,
        updatedBy: superAdmin.id,
      },
    ],
  });

  console.log('✅ System settings created');

  // Create API Keys
  console.log('🔑 Creating API keys...');
  await prisma.apiKey.create({
    data: {
      userId: admin.id,
      keyName: 'Production API Key',
      apiKey: 'sk_live_' + Math.random().toString(36).substring(2, 15),
      permissions: '{"read": true, "write": true}',
      isActive: true,
    },
  });

  console.log('✅ API keys created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
