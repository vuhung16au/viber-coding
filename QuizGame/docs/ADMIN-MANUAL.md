# Administrator Manual

This manual provides detailed instructions for system administrators of the QuizGame platform. It covers system administration tasks, user management procedures, and dashboard analytics interpretation.

## Table of Contents

- [Administrative Access](#administrative-access)
- [System Configuration](#system-configuration)
- [User Management](#user-management)
- [Content Management](#content-management)
- [Dashboard and Analytics](#dashboard-and-analytics)
- [System Maintenance](#system-maintenance)
- [Security Management](#security-management)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Administrative Access

### Obtaining Admin Rights

Admin rights are granted by an existing administrator. To request admin access:

1. Create a regular user account
2. Contact an existing administrator to upgrade your account
3. Alternatively, the first user created in a new instance is automatically granted admin rights

### Admin Login Procedure

1. Navigate to the login page at `/login`
2. Enter your admin credentials
3. Enable two-factor authentication (if configured)
4. You'll be redirected to the admin dashboard at `/admin/dashboard`

### Admin Interface Navigation

The admin interface includes:

- **Left Sidebar**: Main navigation menu
- **Top Bar**: Quick actions, notifications, and user profile
- **Main Content Area**: Context-specific information and controls
- **Footer**: System version and support links

![Admin Interface Layout](/public/images/docs/admin-interface.png)

## System Configuration

### General Settings

Access general settings at **Admin → Settings → General**

1. **Site Configuration**
   - Site Name: The name displayed in browser tabs and email communications
   - Site Logo: Upload a custom logo (recommended size: 200x50px)
   - Favicon: Upload a custom favicon (must be .ico format)
   - Default Language: Set the default language for new users

2. **Registration Settings**
   - Allow New Registrations: Toggle user registration on/off
   - Email Verification Required: Require email verification before login
   - Default User Role: Set the default role for new registrations
   - Permitted Email Domains: Restrict registration to specific domains

3. **Interface Settings**
   - Color Scheme: Primary, secondary, and accent colors
   - Home Page Layout: Configure which widgets appear on the home page
   - Default Theme: Light or dark mode
   - Show Announcements: Toggle system announcements

### Firebase Configuration

Access Firebase settings at **Admin → Settings → Integrations → Firebase**

1. **Firebase Project Settings**
   - Project ID: The Firebase project identifier
   - API Key: Firebase Web API key
   - Auth Domain: Firebase authentication domain
   - Storage Bucket: Firebase storage bucket name

2. **Security Rules**
   - View and edit Firestore security rules
   - View and edit Storage security rules
   - Define custom claim mapping for user roles

### Email Configuration

Access email settings at **Admin → Settings → Email**

1. **SMTP Settings**
   - SMTP Host: Mail server hostname
   - SMTP Port: Mail server port (typically 587 for TLS)
   - SMTP Username: Authentication username
   - SMTP Password: Authentication password
   - From Address: Default sender email address
   - From Name: Default sender name

2. **Email Templates**
   - Welcome Email: Edit the template for new user welcome emails
   - Password Reset: Edit the template for password reset emails
   - Verification Email: Edit the template for email verification
   - Quiz Invitation: Edit the template for quiz invitations

### Performance Settings

Access performance settings at **Admin → Settings → Performance**

1. **Caching Configuration**
   - Cache Duration: How long to cache static content (in seconds)
   - Query Cache Size: Maximum size of query cache (in MB)
   - Clear Cache: Button to manually clear all caches

2. **Rate Limiting**
   - API Rate Limit: Maximum API calls per minute per user
   - Failed Login Limit: Number of failed logins before temporary lockout
   - Quiz Submission Limit: Maximum quiz submissions per minute

## User Management

### User Listing and Search

Access user management at **Admin → Users**

1. **Viewing Users**
   - All users are displayed in a paginated table
   - Columns show username, email, role, status, and registration date
   - Click on a user row to view their detailed profile

2. **Searching and Filtering**
   - Search by username, email, or ID
   - Filter by role (Student, Teacher, Admin)
   - Filter by status (Active, Inactive, Suspended)
   - Filter by registration date range

![User Management Interface](/public/images/docs/admin-user-management.png)

### User Profile Management

1. **Viewing User Profiles**
   - Click on a user in the user list to view their profile
   - Profile shows personal information, activity history, and settings

2. **Editing User Information**
   - Click "Edit" on a user profile
   - Modify user details (name, contact information, etc.)
   - Click "Save Changes"

3. **Changing User Roles**
   - Click "Edit Role" on a user profile
   - Select the new role from the dropdown
   - Click "Save Changes"
   - Note: There must always be at least one admin user in the system

### User Actions

1. **Suspending/Reactivating Users**
   - Click "Suspend User" on a user profile to temporarily disable access
   - Click "Reactivate User" to restore access
   - Suspended users cannot log in but their data remains intact

2. **Deleting Users**
   - Click "Delete User" on a user profile
   - Confirm deletion in the popup dialog
   - Optional: Choose whether to delete user content or reassign it

3. **Password Management**
   - Click "Reset Password" on a user profile
   - System will send a password reset link to the user's email
   - Admins cannot see user passwords but can force a reset

4. **Impersonation**
   - Click "Impersonate User" to view the site as that user
   - A banner will indicate you are in impersonation mode
   - Click "Exit Impersonation" to return to admin view
   - Note: All actions while impersonating are logged

### Bulk User Operations

1. **Importing Users**
   - Go to **Admin → Users → Import**
   - Download the template CSV file
   - Fill in user details following the template format
   - Upload the completed CSV
   - Review the preview and confirm import

2. **Exporting Users**
   - Go to **Admin → Users → Export**
   - Select fields to include in the export
   - Choose export format (CSV or XLSX)
   - Click "Generate Export"
   - Download the exported file

3. **Bulk Actions**
   - Select multiple users using checkboxes
   - Click "Bulk Actions" dropdown
   - Choose action: Change Role, Suspend, Reactivate, or Delete
   - Confirm action in the popup dialog

## Content Management

### Quiz Management

Access quiz management at **Admin → Content → Quizzes**

1. **Browsing Quizzes**
   - View all quizzes in a paginated table
   - Filter by category, author, or status
   - Search by title or description

2. **Quiz Moderation**
   - Review quizzes flagged by users
   - Approve or reject reported quizzes
   - Edit problematic quiz content directly

3. **Featured Quizzes**
   - Mark high-quality quizzes as "Featured" to highlight them
   - Arrange the order of featured quizzes
   - Set expiration dates for featured status

### Category Management

Access category management at **Admin → Content → Categories**

1. **Creating Categories**
   - Click "Add Category"
   - Enter category name, description, and select an icon
   - Optionally, select a parent category for hierarchical structure
   - Click "Create Category"

2. **Editing Categories**
   - Click on a category in the list
   - Modify category details
   - Click "Save Changes"

3. **Reordering Categories**
   - Drag and drop categories to change their display order
   - Click "Save Order" to confirm changes

4. **Deleting Categories**
   - Click the delete icon next to a category
   - Confirm deletion in the popup dialog
   - Choose whether to delete associated quizzes or reassign them

### Static Content Management

Access static content at **Admin → Content → Pages**

1. **Editing Static Pages**
   - Select a page from the list (About, Privacy Policy, Terms of Service, etc.)
   - Use the rich text editor to modify content
   - Preview changes before publishing
   - Click "Publish" to make changes live

2. **Managing Blog Posts**
   - Go to **Admin → Content → Blog**
   - Create, edit, or delete blog posts
   - Schedule posts for future publication
   - Manage blog categories and tags

## Dashboard and Analytics

### Admin Dashboard Overview

The admin dashboard at **Admin → Dashboard** provides a high-level view of system activity and performance.

![Admin Dashboard Overview](/public/images/docs/admin-dashboard-overview.png)

1. **Key Metrics**
   - Total users and growth rate
   - Total quizzes and creation rate
   - Quiz attempts and completion rate
   - Active users (daily, weekly, monthly)

2. **Real-time Activity**
   - Current active users
   - Recent registrations
   - Recent quiz submissions
   - System events and errors

3. **System Health**
   - Database status and performance
   - Storage usage
   - API response times
   - Authentication service status

### User Analytics

Access user analytics at **Admin → Analytics → Users**

1. **User Growth**
   - New registrations over time (daily, weekly, monthly)
   - User retention and churn rates
   - Registration source attribution

2. **User Engagement**
   - Active users over time
   - Average session duration
   - Session frequency per user
   - Feature usage breakdown

3. **User Demographics**
   - Geographic distribution
   - Device and browser statistics
   - Language preferences
   - Role distribution

### Content Analytics

Access content analytics at **Admin → Analytics → Content**

1. **Quiz Performance**
   - Most popular quizzes
   - Highest rated quizzes
   - Most challenging quizzes (lowest completion rate)
   - Quiz creation trends

2. **Category Performance**
   - Most popular categories
   - Category engagement rates
   - Category growth over time

3. **Content Engagement**
   - Average time spent per quiz
   - Question difficulty analysis
   - Abandonment rate analysis

### Performance Analytics

Access performance analytics at **Admin → Analytics → System**

1. **System Performance**
   - Page load times
   - API response times
   - Error rates
   - Resource utilization

2. **Database Performance**
   - Query performance
   - Document reads/writes
   - Index efficiency
   - Storage utilization

3. **Cost Analytics**
   - Firebase usage and costs
   - Bandwidth consumption
   - Storage growth projections

### Custom Reports

Access custom reporting at **Admin → Analytics → Reports**

1. **Creating Custom Reports**
   - Click "New Report"
   - Select metrics and dimensions
   - Configure filters and date ranges
   - Save report configuration

2. **Scheduled Reports**
   - Configure reports to run automatically
   - Set delivery frequency (daily, weekly, monthly)
   - Add email recipients
   - Configure report format (PDF, XLSX)

## System Maintenance

### Scheduled Maintenance

1. **Planning Maintenance Windows**
   - Schedule maintenance during low-traffic periods
   - Announce maintenance window to users in advance
   - Prepare maintenance mode page

2. **Enabling Maintenance Mode**
   - Go to **Admin → Settings → Maintenance**
   - Toggle "Maintenance Mode" switch
   - Set custom maintenance message
   - Specify expected duration
   - Click "Start Maintenance"

3. **Performing Updates**
   - Follow deployment procedures in the development documentation
   - Test updates in staging environment before production
   - Monitor system during and after updates

### Database Maintenance

1. **Optimizing Database**
   - Review slow query logs at **Admin → Logs → Database**
   - Optimize indexes based on query patterns
   - Schedule regular database cleanup jobs

2. **Data Pruning**
   - Configure automatic data retention policies
   - Archive old quiz attempts and logs
   - Clean up temporary files and abandoned uploads

3. **Firebase Management**
   - Monitor Firestore usage and quotas
   - Optimize Firebase security rules
   - Manage Firebase storage buckets

### Monitoring and Alerts

1. **System Monitoring**
   - Review system status at **Admin → Monitoring**
   - Set up alert thresholds for key metrics
   - Configure notification channels (email, SMS, webhook)

2. **Error Tracking**
   - Review error logs at **Admin → Logs → Errors**
   - Analyze error patterns and trends
   - Escalate recurring or critical errors to development team

3. **Performance Monitoring**
   - Monitor page load times and API response times
   - Set performance budgets and alerts
   - Track client-side and server-side performance

## Security Management

### Authentication Security

1. **Password Policies**
   - Configure password requirements at **Admin → Settings → Security**
   - Set minimum length, complexity requirements
   - Configure password expiration and history policies

2. **Two-Factor Authentication**
   - Enable/disable two-factor authentication
   - Make 2FA mandatory for admins and/or all users
   - Configure backup recovery codes

3. **Session Management**
   - Set session timeout duration
   - Configure maximum concurrent sessions
   - Force logout of all sessions for specific users

### Access Control

1. **Role Management**
   - Configure role permissions at **Admin → Settings → Roles**
   - Create custom roles with specific permission sets
   - Assign roles to users individually or in bulk

2. **API Access**
   - Manage API keys at **Admin → Settings → API**
   - Set rate limits and IP restrictions
   - Monitor API usage and unauthorized access attempts

3. **IP Restrictions**
   - Configure IP whitelisting for admin access
   - Review and manage blocked IP addresses
   - Set up geo-restriction rules

### Security Monitoring

1. **Audit Logs**
   - Review security events at **Admin → Logs → Audit**
   - Track admin actions and permission changes
   - Monitor sensitive data access

2. **Threat Detection**
   - Review suspicious activity at **Admin → Security → Threats**
   - Analyze login patterns and anomalies
   - Monitor for brute force attempts and vulnerabilities

3. **Compliance Reporting**
   - Generate security compliance reports
   - Track data access for GDPR and other regulations
   - Document security incidents and responses

## Backup and Recovery

### Data Backup

1. **Manual Backups**
   - Initiate manual backup at **Admin → Maintenance → Backup**
   - Select data to include in backup
   - Download backup file or store in cloud storage

2. **Automated Backups**
   - Configure backup schedule at **Admin → Settings → Backup**
   - Set retention period for automated backups
   - Configure storage location for backup files

3. **Backup Verification**
   - Test backup integrity
   - Perform test restorations periodically
   - Document backup verification procedures

### Data Recovery

1. **Full System Recovery**
   - Access recovery tools at **Admin → Maintenance → Recovery**
   - Upload backup file
   - Review and confirm recovery operation
   - Monitor recovery progress

2. **Selective Data Recovery**
   - Choose specific data to restore
   - Select point-in-time for data restoration
   - Preview data before committing restoration

3. **Disaster Recovery**
   - Follow disaster recovery plan from documentation
   - Coordinate with development team for major recoveries
   - Document recovery process and outcomes

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Issues**
   - Reset Firebase Authentication using admin console
   - Clear browser cookies and local storage
   - Verify Firebase configuration in app settings

2. **Database Connection Issues**
   - Check Firebase console for service disruptions
   - Verify network connectivity to Firebase services
   - Review Firebase security rules for permission issues

3. **Performance Problems**
   - Check resource utilization in Firebase console
   - Review recent deployments for regressions
   - Analyze slow queries and optimize database access

### Diagnostic Tools

1. **System Logs**
   - Access detailed logs at **Admin → Logs**
   - Filter logs by severity, component, or time range
   - Export logs for further analysis

2. **Network Diagnostics**
   - Test API endpoints at **Admin → Tools → API Test**
   - Check Firebase connectivity
   - Verify DNS configuration

3. **User Issue Diagnosis**
   - View session replay for specific users (if enabled)
   - Check user-specific error logs
   - Use impersonation feature to reproduce issues

### Getting Support

1. **Internal Resources**
   - Review the developer documentation
   - Check internal knowledge base for known issues
   - Consult with development team for complex issues

2. **External Support**
   - Open support tickets with Firebase for service issues
   - Contact Next.js support for framework-related problems
   - Engage with community forums for general guidance

3. **Escalation Process**
   - Document the issue thoroughly
   - Gather relevant logs, screenshots, and steps to reproduce
   - Follow the escalation matrix in the development documentation

## Appendix

### Admin Command Reference

| Command | Function | Access Level |
|---------|----------|-------------|
| `flushCache()` | Clear system cache | Super Admin |
| `resetUserPassword(userId)` | Force password reset | Admin |
| `exportData(collection, format)` | Export collection data | Admin |
| `updateSecurityRules()` | Update Firebase rules | Super Admin |
| `toggleMaintenanceMode(status)` | Enable/disable maintenance | Admin |

### System Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Max users per account | Unlimited | Subject to Firebase pricing tier |
| Max questions per quiz | 100 | Can be adjusted in settings |
| Max file upload size | 10 MB | Configurable in Firebase storage rules |
| API rate limit | 100 req/min | Per user, configurable |
| Concurrent quiz takers | 10,000 | Standard tier limit |

### Glossary

| Term | Definition |
|------|------------|
| Firebase | Google's mobile and web application development platform |
| Firestore | NoSQL document database used by the application |
| Quiz Author | User who creates and manages quizzes |
| Quiz Attempt | Record of a user taking a quiz |
| JWT | JSON Web Token used for authentication |
| 2FA | Two-Factor Authentication |
