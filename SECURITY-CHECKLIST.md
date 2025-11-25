# 🔒 Security Hardening Checklist for ChatPDF Production

## **Critical Security Tasks - Complete Before Going Live**

### **1. Environment Variables & Secrets Management**

#### ✅ **Secure Environment Variables**
- [ ] Replace all default passwords with strong, unique passwords (32+ characters)
- [ ] Use a secure secret management system (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Rotate all API keys and tokens
- [ ] Ensure `BETTER_AUTH_SECRET` is cryptographically secure (64+ characters)
- [ ] Remove any hardcoded secrets from code
- [ ] Set up separate environments for dev/staging/production

#### ✅ **API Key Security**
```bash
# Generate secure secrets
openssl rand -base64 32  # For BETTER_AUTH_SECRET
openssl rand -base64 64  # For additional secrets
```

### **2. Database Security**

#### ✅ **PostgreSQL Hardening**
- [ ] Create dedicated database user with minimal privileges
- [ ] Enable SSL/TLS for database connections
- [ ] Restrict database access to application IPs only
- [ ] Regular security updates for PostgreSQL
- [ ] Enable audit logging
- [ ] Set up automated backups with encryption

```sql
-- Create restricted user
CREATE USER chatpdf_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE chatpdf_production TO chatpdf_app;
GRANT USAGE ON SCHEMA public TO chatpdf_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO chatpdf_app;
```

### **3. Authentication & Authorization**

#### ✅ **OAuth Security**
- [ ] Configure OAuth apps with correct redirect URIs
- [ ] Use HTTPS-only redirect URIs
- [ ] Implement proper scope limitations
- [ ] Set up OAuth app monitoring
- [ ] Regular OAuth credential rotation

#### ✅ **Session Security**
- [ ] Implement secure session management
- [ ] Set appropriate session timeouts
- [ ] Use secure cookie flags
- [ ] Implement CSRF protection
- [ ] Rate limiting on auth endpoints

### **4. Network Security**

#### ✅ **SSL/TLS Configuration**
- [ ] Obtain valid SSL certificates (Let's Encrypt or commercial)
- [ ] Configure strong cipher suites
- [ ] Enable HSTS headers
- [ ] Implement certificate pinning
- [ ] Set up automatic certificate renewal

#### ✅ **Firewall & Network Rules**
```bash
# Example iptables rules
iptables -A INPUT -p tcp --dport 22 -j ACCEPT    # SSH
iptables -A INPUT -p tcp --dport 80 -j ACCEPT    # HTTP
iptables -A INPUT -p tcp --dport 443 -j ACCEPT   # HTTPS
iptables -A INPUT -j DROP                        # Drop all other traffic
```

### **5. Application Security**

#### ✅ **Input Validation & Sanitization**
- [ ] Validate all user inputs
- [ ] Sanitize file uploads
- [ ] Implement file type restrictions
- [ ] Set file size limits
- [ ] Scan uploaded files for malware

#### ✅ **Rate Limiting**
```javascript
// Production rate limiting configuration
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit file uploads
  message: 'Too many file uploads from this IP',
});
```

### **6. Infrastructure Security**

#### ✅ **Docker Security**
- [ ] Use non-root users in containers
- [ ] Implement resource limits
- [ ] Regular base image updates
- [ ] Container vulnerability scanning
- [ ] Secure container registries

```dockerfile
# Security best practices in Dockerfile
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser
WORKDIR /app
```

#### ✅ **Server Hardening**
- [ ] Disable unnecessary services
- [ ] Configure fail2ban for intrusion prevention
- [ ] Set up log monitoring
- [ ] Regular security updates
- [ ] Implement backup verification

### **7. API Security**

#### ✅ **API Endpoint Protection**
- [ ] Authentication on all protected routes
- [ ] Input validation and sanitization
- [ ] Output encoding
- [ ] CORS configuration
- [ ] API versioning
- [ ] Request/response logging

```javascript
// Security middleware
app.use(helmet()); // Security headers
app.use(cors(corsConfig)); // CORS protection
app.use(rateLimit); // Rate limiting
app.use(validator); // Input validation
```

### **8. File Security**

#### ✅ **File Upload Security**
- [ ] Restrict file types to PDF only
- [ ] Virus scanning for uploaded files
- [ ] File size limits (50MB max)
- [ ] Secure file storage (S3 with encryption)
- [ ] Regular cleanup of temporary files

```javascript
// Secure file upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});
```

### **9. Monitoring & Incident Response**

#### ✅ **Security Monitoring**
- [ ] Set up intrusion detection system
- [ ] Monitor failed login attempts
- [ ] Track unusual API usage patterns
- [ ] Set up security alerts
- [ ] Regular security audits

#### ✅ **Logging & Auditing**
- [ ] Comprehensive application logging
- [ ] Security event logging
- [ ] Log retention policies
- [ ] Log integrity protection
- [ ] Centralized log management

### **10. Third-Party Security**

#### ✅ **Dependency Management**
- [ ] Regular dependency updates
- [ ] Vulnerability scanning (npm audit)
- [ ] Pin dependency versions
- [ ] Monitor security advisories
- [ ] Use only trusted packages

```bash
# Security scanning commands
npm audit --audit-level high
docker scan your-image:tag
```

### **11. Compliance & Privacy**

#### ✅ **Data Protection**
- [ ] Implement data encryption at rest
- [ ] Encrypt data in transit
- [ ] User data anonymization options
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies

#### ✅ **Privacy Controls**
- [ ] User data export functionality
- [ ] Data deletion capabilities
- [ ] Privacy policy implementation
- [ ] Cookie consent management
- [ ] Audit trail for data access

### **12. Backup & Recovery**

#### ✅ **Backup Security**
- [ ] Encrypted backups
- [ ] Secure backup storage
- [ ] Regular backup testing
- [ ] Offsite backup storage
- [ ] Backup access controls

### **13. Regular Security Tasks**

#### ✅ **Ongoing Security Maintenance**
- [ ] Weekly security updates
- [ ] Monthly vulnerability scans
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Security team training

### **Emergency Response Plan**

#### ✅ **Incident Response**
- [ ] Document incident response procedures
- [ ] Emergency contact information
- [ ] Backup restoration procedures
- [ ] Communication templates
- [ ] Post-incident review process

---

## **Security Testing Commands**

```bash
# Test SSL configuration
nmap --script ssl-enum-ciphers -p 443 yourdomain.com

# Test for common vulnerabilities
nikto -h https://yourdomain.com

# Check security headers
curl -I https://yourdomain.com

# Test rate limiting
ab -n 1000 -c 10 https://yourdomain.com/api/

# Check CORS configuration
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://yourdomain.com/api/
```

---

## **Critical Pre-Launch Security Review**

Before going live, ensure ALL items in this checklist are completed:

1. [ ] All default credentials changed
2. [ ] SSL certificates properly configured
3. [ ] All security headers implemented
4. [ ] Rate limiting configured
5. [ ] File upload restrictions in place
6. [ ] Database access restricted
7. [ ] Monitoring and alerting configured
8. [ ] Backup and recovery tested
9. [ ] Incident response plan documented
10. [ ] Security team sign-off obtained

**Remember: Security is an ongoing process, not a one-time setup!**






