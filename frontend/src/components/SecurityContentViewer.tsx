import { useState, useEffect } from 'react'
import { Key, UserCheck, Lock, Shield, Eye, Server, Cloud, KeyRound, FileCheck, X, type LucideIcon } from 'lucide-react'

interface SecurityCard {
  id: number
  title: string
  icon: LucideIcon
  color: string
  bgColor: string
}

const cards: SecurityCard[] = [
  {
    id: 1,
    title: 'Authentication',
    icon: Key,
    color: '#3B82F6', // Blue
    bgColor: '#DBEAFE', // Light blue background
  },
  {
    id: 2,
    title: 'Authorization',
    icon: UserCheck,
    color: '#10B981', // Green
    bgColor: '#D1FAE5', // Light green background
  },
  {
    id: 3,
    title: 'Privacy & Encryption',
    icon: Lock,
    color: '#8B5CF6', // Purple
    bgColor: '#EDE9FE', // Light purple background
  },
  {
    id: 4,
    title: 'Segregation',
    icon: Shield,
    color: '#F59E0B', // Amber
    bgColor: '#FEF3C7', // Light amber background
  },
  {
    id: 5,
    title: 'Access Management',
    icon: Eye,
    color: '#EF4444', // Red
    bgColor: '#FEE2E2', // Light red background
  },
  {
    id: 6,
    title: 'Platform Management',
    icon: Server,
    color: '#06B6D4', // Cyan
    bgColor: '#CFFAFE', // Light cyan background
  },
  {
    id: 7,
    title: 'SaaS Security Services',
    icon: Cloud,
    color: '#6366F1', // Indigo
    bgColor: '#E0E7FF', // Light indigo background
  },
  {
    id: 8,
    title: 'SaaS BCP, Logs, Incidents',
    icon: KeyRound,
    color: '#14B8A6', // Teal
    bgColor: '#CCFBF1', // Light teal background
  },
  {
    id: 9,
    title: 'Compliance and Risk Management',
    icon: FileCheck,
    color: '#F97316', // Orange
    bgColor: '#FFEDD5', // Light orange background
  },
]

const securityCategories = [
  { id: 1, name: 'Application Security' },
  { id: 2, name: 'Infrastructure Security' },
  { id: 3, name: 'SaaS Security' },
]

// HTML5 Security Architecture Diagram Content
const SecurityArchitectureHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Security Architecture</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }
        
        .container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        svg {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
        }
        
        .label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 30px;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: bold;
            font-size: 16pt;
            color: #283054;
            z-index: 1000;
            text-align: center;
            line-height: 1.6;
            white-space: normal;
        }
        
        .tooltip {
            position: absolute;
            background: white;
            border: 2px solid #ff0000;
            border-radius: 4px;
            padding: 12px;
            max-width: 450px;
            font-size: 14pt;
            line-height: 1.5;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 2000;
            display: none;
            pointer-events: none;
            word-wrap: break-word;
            white-space: pre-wrap;
        }
        
        .tooltip.show {
            display: block;
        }
        
        .tooltip-title {
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 8px;
            color: #283054;
        }
        
        .tooltip-description {
            color: #333;
            font-size: 14pt;
        }
        
        .tooltip-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 14pt;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .tooltip-button:hover {
            background: #cc0000;
        }
        
        .clickable {
            cursor: pointer;
        }
        
        text {
            font-family: Arial, sans-serif;
            font-size: 14pt;
            fill: #000;
        }
        
        .title-text {
            font-size: 14pt;
            font-weight: bold;
        }
        
        .small-text {
            font-size: 14pt;
        }
        
        .temenos-box {
            fill: #d3d3d3;
            stroke: #3B82F6;
            stroke-width: 3;
        }
        
        .grey-box {
            fill: #9ca3af;
            stroke: #000;
            stroke-width: 2;
        }
        
        .purple-box {
            fill: #9333ea;
            stroke: #000;
            stroke-width: 2;
        }
        
        .entry-bar {
            fill: #3b82f6;
            stroke: #000;
            stroke-width: 2;
        }
        
        .entry-item-grey {
            fill: #9ca3af;
            stroke: #000;
            stroke-width: 2;
        }
        
        .line-red {
            stroke: #ff0000;
            stroke-width: 2;
            fill: none;
        }
        
        .line-dotted {
            stroke: #ff0000;
            stroke-width: 2;
            stroke-dasharray: 5,5;
            fill: none;
        }
        
        .text-white {
            fill: #fff;
        }
        
        .text-black {
            fill: #000;
        }
        
        .db-cylinder {
            fill: #10b981;
            stroke: #000;
            stroke-width: 2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="label">
            Here is the Temenos Security Architecture<br>
            <span style="font-size: 14pt; font-weight: normal;">click on elements to get more details</span>
        </div>
        <div id="tooltip" class="tooltip">
            <div class="tooltip-title" id="tooltip-title"></div>
            <div class="tooltip-description" id="tooltip-description"></div>
        </div>
        <svg viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet">
            <!-- Entry Points Bar (Left Vertical) - TLS 1.2 Container -->
            <rect id="tls-entry-points" x="50" y="200" width="80" height="400" class="entry-bar clickable" rx="5"/>
            <text x="90" y="230" text-anchor="middle" class="text-white title-text">TLS 1.2</text>
            
            <!-- User Interface (Grey) - Positioned between TLS 1.2 and Temenos Software -->
            <rect x="155" y="270" width="120" height="50" class="grey-box"/>
            <text x="215" y="290" text-anchor="middle" class="text-white">User</text>
            <text x="215" y="310" text-anchor="middle" class="text-white">Interface</text>
            
            <!-- APIs (Grey) - Positioned between TLS 1.2 and Temenos Software -->
            <rect x="155" y="340" width="120" height="40" class="grey-box"/>
            <text x="215" y="365" text-anchor="middle" class="text-white">APIs</text>
            
            <!-- Events (Grey) - Positioned between TLS 1.2 and Temenos Software -->
            <rect x="155" y="400" width="120" height="40" class="grey-box"/>
            <text x="215" y="425" text-anchor="middle" class="text-white">Events</text>
            
            <!-- Temenos Software (Central Light Grey Block with Blue Border) -->
            <rect x="290" y="150" width="500" height="500" class="temenos-box" rx="5"/>
            <text x="540" y="180" text-anchor="middle" class="text-black title-text" style="font-size: 14pt; font-weight: bold;">Temenos software</text>
            
            <!-- Authentication Box -->
            <rect id="authentication-box" x="340" y="220" width="180" height="120" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="430" y="245" text-anchor="middle" class="text-white title-text">Authentication</text>
            <text x="430" y="270" text-anchor="middle" class="text-white small-text">oAuth 2.0</text>
            <text x="430" y="290" text-anchor="middle" class="text-white small-text">OpenID Connect</text>
            <text x="430" y="310" text-anchor="middle" class="text-white small-text">JWT, SAML</text>
            
            <!-- Authorization Box -->
            <rect id="authorization-box" x="560" y="220" width="180" height="120" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="650" y="245" text-anchor="middle" class="text-white title-text">Authorization</text>
            <text x="650" y="270" text-anchor="middle" class="text-white small-text">RBAC, ABAC</text>
            
            <!-- Audit Box -->
            <rect id="audit-box" x="440" y="360" width="100" height="50" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="490" y="385" text-anchor="middle" class="text-white">Audit</text>
            
            <!-- DB Box - Green Cylinder outside Temenos Software, close to lower border -->
            <!-- Cylinder shape: ellipse on top, rectangle in middle, ellipse on bottom -->
            <ellipse cx="150" cy="700" rx="60" ry="15" class="db-cylinder"/>
            <rect x="90" y="700" width="120" height="100" class="db-cylinder"/>
            <ellipse cx="150" cy="800" rx="60" ry="15" class="db-cylinder"/>
            <text x="150" y="745" text-anchor="middle" class="text-white title-text">DB</text>
            <text x="220" y="825" text-anchor="start" class="text-black small-text" style="font-weight: bold;">Transparent Data Encryption TDE</text>
            
            <!-- Temenos Vault Box -->
            <rect id="temenos-vault" x="640" y="570" width="150" height="80" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="715" y="595" text-anchor="middle" class="text-white title-text">Temenos</text>
            <text x="715" y="615" text-anchor="middle" class="text-white title-text">Vault</text>
            
            <!-- Externalized authorization Box - Moved 40px right -->
            <rect id="externalized-auth" x="640" y="450" width="140" height="110" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="710" y="485" text-anchor="middle" class="text-white small-text">Externalized</text>
            <text x="710" y="505" text-anchor="middle" class="text-white small-text">authorization</text>
            <text x="710" y="520" text-anchor="middle" class="text-white small-text">(XACML)</text>
            
            <!-- Bank's IAM (Purple Box) -->
            <rect id="bank-iam" x="800" y="150" width="200" height="120" class="purple-box clickable" rx="5"/>
            <text x="900" y="180" text-anchor="middle" class="text-white title-text">Bank's identity</text>
            <text x="900" y="205" text-anchor="middle" class="text-white title-text">access</text>
            <text x="900" y="230" text-anchor="middle" class="text-white title-text">management</text>
            <text x="900" y="255" text-anchor="middle" class="text-white small-text">(IAM)</text>
            
            <!-- Secrets management (Purple Box) -->
            <rect id="secrets-management" x="1050" y="220" width="180" height="100" class="purple-box clickable" rx="5"/>
            <text x="1140" y="250" text-anchor="middle" class="text-white title-text">Secrets</text>
            <text x="1140" y="275" text-anchor="middle" class="text-white title-text">management</text>
            
            <!-- Key management (Purple Box) -->
            <rect id="key-management" x="1050" y="360" width="180" height="100" class="purple-box clickable" rx="5"/>
            <text x="1140" y="390" text-anchor="middle" class="text-white title-text">Key</text>
            <text x="1140" y="415" text-anchor="middle" class="text-white title-text">management</text>
            
            <!-- Certificate Management (Purple Box) -->
            <rect id="certificate-management" x="1050" y="500" width="180" height="100" class="purple-box clickable" rx="5"/>
            <text x="1140" y="530" text-anchor="middle" class="text-white title-text">Certificate</text>
            <text x="1140" y="555" text-anchor="middle" class="text-white title-text">Management</text>
            
            <!-- Data Encryption (Purple Box) - Centered horizontally with DB, 30px below DB -->
            <rect id="data-encryption" x="50" y="830" width="200" height="80" class="purple-box clickable" rx="5"/>
            <text x="150" y="860" text-anchor="middle" class="text-white title-text">Data Encryption</text>
            <text x="150" y="885" text-anchor="middle" class="text-white small-text">(Data-at-rest,</text>
            <text x="150" y="900" text-anchor="middle" class="text-white small-text">in transit)</text>
            
            <!-- Lines - All Red, connecting to borders -->
            
            <!-- TLS 1.2 to User Interface -->
            <line x1="130" y1="295" x2="155" y2="295" class="line-red"/>
            
            <!-- TLS 1.2 to APIs -->
            <line x1="130" y1="360" x2="155" y2="360" class="line-red"/>
            
            <!-- TLS 1.2 to Events -->
            <line x1="130" y1="420" x2="155" y2="420" class="line-red"/>
            
            <!-- User Interface to Temenos Software -->
            <line x1="275" y1="295" x2="290" y2="280" class="line-red"/>
            
            <!-- APIs to Temenos Software -->
            <line x1="275" y1="360" x2="290" y2="350" class="line-red"/>
            
            <!-- Events to Temenos Software -->
            <line x1="275" y1="400" x2="290" y2="400" class="line-red"/>
            
            <!-- Authentication to Authorization (role) -->
            <line x1="520" y1="280" x2="560" y2="280" class="line-red"/>
            <text x="540" y="275" text-anchor="middle" class="text-black small-text">role</text>
            
            <!-- Bank's IAM to Authentication -->
            <line x1="800" y1="210" x2="430" y2="220" class="line-red"/>
            
            <!-- Authorization to Externalized authorization -->
            <line x1="650" y1="340" x2="710" y2="450" class="line-red"/>
            
            <!-- DB top center to TLS bottom center -->
            <line x1="150" y1="685" x2="90" y2="600" class="line-red"/>
            
            <!-- DB top center to Temenos Software bottom center -->
            <line x1="150" y1="685" x2="540" y2="650" class="line-red"/>
            
            <!-- DB to Data Encryption -->
            <line x1="150" y1="800" x2="150" y2="830" class="line-red"/>
            
            <!-- Externalized authorization to Secrets management -->
            <line x1="780" y1="505" x2="1050" y2="270" class="line-red"/>
            
            <!-- Externalized authorization to Key management -->
            <line x1="780" y1="505" x2="1050" y2="410" class="line-red"/>
            
            <!-- Externalized authorization to Certificate Management -->
            <line x1="780" y1="505" x2="1050" y2="550" class="line-red"/>
            
            <!-- Temenos Vault to Secrets management -->
            <line x1="790" y1="610" x2="1050" y2="270" class="line-red"/>
            
            <!-- Temenos Vault to Key management -->
            <line x1="790" y1="610" x2="1050" y2="410" class="line-red"/>
            
            <!-- Temenos Vault to Certificate Management -->
            <line x1="790" y1="610" x2="1050" y2="550" class="line-red"/>
        </svg>
        <button class="tooltip-button" onclick="window.parent.postMessage({type: 'showDetailedExplanation'}, '*')">Move to Detailed Explanation</button>
    </div>
    
    <script>
        // Tooltip Configuration
        const tooltips = [
            {
                id: "key-management",
                title: "Key Management",
                description: "The system checks for file integrity upon upload and download using checksums and cryptographic hashing methods. SSH keys and certificates are stored in Azure Key Vault to ensure secure key management practices.",
                position: "right"
            },
            {
                id: "secrets-management",
                title: "Secrets Management",
                description: "Secrets management depends on stack deployment and requirements. Runtime secrets can be held within Hashicorp Vault, and minimum privilege should be used around key issuance, with audit logging of issued secrets. Good practice dictates that all runtime secrets are rotated at each deploy, and Cryptographic keys are rotated every 3 months, or whenever required by the organization. For Azure deployment, Temenos recommend using Azure Key Vault - Azure Key Vault: Azure Key Vault is a secure and centralized key management service that helps you safeguard cryptographic keys, certificates, and secrets used by cloud applications and services. Azure Key Vault is a cloud service that provides secure storage of keys for encrypting data. Multiple keys, and multiple versions of the same key, can be kept in the Azure Key Vault. Cryptographic keys in Azure Key Vault are represented as JSON Web Key (JWK) objects.",
                position: "right"
            },
            {
                id: "temenos-vault",
                title: "Temenos Vault",
                description: "Users should be able to create and store the application Certificates into the Vault (Azure Key vault). Applications should be able to retrieve the Certificates from the vault (Azure Key vault) and use it on the fly without any storing mechanism. Temenos Vault APIs should be created to support the above requirements to interact with the Vault (Azure Key vault). Temenos Vault – provides common framework for our products to integrate with underlaying platform Secrets services. Temenos Vault provides a facade that can be used by products and can be configured to point to the relevant Vault implementation based on the deployment environment. As well as this it can be used by the SaaS platform for provisioning the secrets, keys, and certificates for product or for the platform. We will support Azure Key Vault, AWS Secret, Key and Certificate Manager as well as Hashicorp Vault for On Premise solutions.",
                position: "bottom"
            },
            {
                id: "externalized-auth",
                title: "Externalized Authorization",
                description: "Temenos solution supports the externalized mechanism based on SAML 2.0, OIDC/ JSON Web Token (JWT) for authentication.  OAuth is an open standard authorization protocol. It enables your account information to be obtained by third-party services. Without exposing user credentials, OAuth provides an access token and a refresh token for third-party services.",
                position: "bottom"
            },
            {
                id: "data-encryption",
                title: "Data Encryption",
                description: "Temenos uses a range of security controls to protect data at rest, at use and in transit.  One of these mechanisms is Transparent Data Encryption (TDE) which provides real-time encryption and decryption of the database, associated backups, and transaction log files at rest. TDE protects data and log files, using AES (256-bit encryption) encryption algorithms. Temenos can offer encryption today via eXate as part of the Temenos Exchange ecosystem.  (requiring a dedicated discussion and license with eXate company).",
                position: "top"
            },
            {
                id: "certificate-management",
                title: "Certificate Management",
                description: "Certificates management (DigiCert used) procedures for Temenos SaaS\\n\\nTemenos renews the certificates annually for the Temenos cloud hosted environments for clients. During deployment of application, we leverage Temenos managed domain for App deployment and secure it with our SSL certificates for Application endpoint. These certificates are renewed every year.",
                position: "right"
            },
            {
                id: "bank-iam",
                title: "Bank's Identity and Access Management",
                description: "For authentication, Temenos solution makes use of Bank's Identity and Access Management (IaM) solution like Active Directory. The bank's individual employees are authenticated at Active Directory. Temenos comes pre-integrated with KeyCloak. KeyCloak will become the defacto IaM system for Temenos applications. It acts as the identity broker for redirecting authentication requests to the Bank managed IaM solution.",
                position: "left"
            },
            {
                id: "authentication-box",
                title: "Authentication",
                description: "In Temenos solution, authentication is primarily managed through Keycloak, an open-source identity and access management system. The process involves several key steps:\\n\\n1. Integration with Identity Management: Temenos applications are integrated with the bank's Identity and Access Management (IAM) solutions, such as Active Directory. Keycloak acts as an identity broker, redirecting authentication requests to the bank's IAM system.\\n\\n2. User Authentication: When a user attempts to log in, they are authenticated via the bank's IAM. Upon successful authentication, the IAM generates a JSON Web Token (JWT) for authorization.\\n\\n3. Token Exchange: The application exchanges the authorization code for an ID Token and a refresh token. The ID Token contains user information, while the access token allows access to resources.",
                position: "top"
            },
            {
                id: "authorization-box",
                title: "Authorization",
                description: "Temenos has embedded internal mechanism, native to the solution. The internal mechanism provides sufficient and granular access management to all applications as well as role/group facilities. The Temenos Security Management System (SMS) provides role-based access limits and full transaction and user activity audit. Each user has their own profile within the SMS which contains full user details and security settings to control the user's access within the system. SMS managing the access control, executing the following steps: Checks each user activity against the profile to determine validity; unacceptable actions are prevented and recorded (User Profile), Validates each contract against conditions, such as limits and exchange rate tolerance bands, before it is accepted (User Authority), Make specific data inaccessible to specified users or user groups based on conditions (Data Security).",
                position: "top"
            },
            {
                id: "audit-box",
                title: "Audit",
                description: "Temenos provides a full audit and logging across the entire business and technical landscape which can be utilized to track important security related events. The audit trails are stored as part of each data record and include details of the change made, by whom and when. Optionally it can include a delivery reference and IP address. Auditing is done both for users who use the solution directly or via APIs.\\n\\nAuditing includes: User activity auditing includes details of; Applications accessed, ID of transactions executed, Time connected, No. of operations executed etc. Application activity auditing includes details of; ID of new transactions, Inputter and Authorizer,  Security violation reports store details of unauthorised access attempts including who accessed the system, when and the target application",
                position: "top"
            },
            {
                id: "tls-entry-points",
                title: "TLS 1.2 Entry Points Container",
                description: "Within Temenos solution, data in transit security is implemented through a structured approach that includes the following steps:\\n\\n1. Encryption Protocols: All data transmitted over networks is secured using TLS 1.2, ensuring that data is encrypted during transmission to protect against interception.\\n\\n2. Secure File Transfers: For file transfers, protocols such as SFTP and FTPS are utilized, ensuring that files are encrypted during transit. Additionally, SSH encryption standards are applied for secure connections.\\n\\n3. Logging and Monitoring: All data transfers and user actions are logged for auditing purposes. This includes monitoring for unauthorized access attempts and ensuring compliance with security policies.",
                position: "right"
            }
        ];
        
        const tooltip = document.getElementById('tooltip');
        const tooltipTitle = document.getElementById('tooltip-title');
        const tooltipDescription = document.getElementById('tooltip-description');
        
        function showTooltip(config, element) {
            tooltipTitle.textContent = config.title;
            tooltipDescription.textContent = config.description;
            tooltip.classList.add('show');
            
            setTimeout(function() {
                const rect = element.getBoundingClientRect();
                const containerRect = document.querySelector('.container').getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                let left, top;
                
                switch(config.position) {
                    case 'right':
                        left = rect.right + 15;
                        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                        break;
                    case 'left':
                        left = rect.left - tooltipRect.width - 15;
                        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                        break;
                    case 'top':
                        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                        top = rect.top - tooltipRect.height - 15;
                        break;
                    case 'bottom':
                    default:
                        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                        top = rect.bottom + 15;
                        break;
                }
                
                // Ensure tooltip stays within container bounds
                if (left < containerRect.left) {
                    left = containerRect.left + 10;
                }
                if (left + tooltipRect.width > containerRect.right) {
                    left = containerRect.right - tooltipRect.width - 10;
                }
                if (top < containerRect.top) {
                    top = containerRect.top + 10;
                }
                if (top + tooltipRect.height > containerRect.bottom - 80) {
                    top = containerRect.bottom - tooltipRect.height - 90;
                }
                
                tooltip.style.left = (left - containerRect.left) + 'px';
                tooltip.style.top = (top - containerRect.top) + 'px';
            }, 10);
        }
        
        function hideTooltip() {
            tooltip.classList.remove('show');
        }
        
        // Attach click handlers to all elements with tooltips
        tooltips.forEach(function(config) {
            const element = document.getElementById(config.id);
            if (element) {
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (tooltip.classList.contains('show') && tooltipTitle.textContent === config.title) {
                        hideTooltip();
                    } else {
                        showTooltip(config, element);
                    }
                });
            }
        });
        
        // Hide tooltip when clicking outside
        document.addEventListener('click', function(e) {
            const target = e.target;
            const isTooltipElement = tooltips.some(function(config) {
                const element = document.getElementById(config.id);
                return element && element.contains(target);
            });
            const isTooltipBox = tooltip && tooltip.contains(target);
            if (!isTooltipElement && !isTooltipBox) {
                hideTooltip();
            }
        });
    </script>
</body>
</html>`

// HTML5 Temenos Authentication Diagram Content
const TemenosAuthenticationHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Authentication</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }
        
        .container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 12px 24px;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: bold;
            font-size: 18px;
            color: #283054;
            z-index: 1000;
            text-align: center;
        }
        
        .text-section {
            display: flex;
            justify-content: space-between;
            padding: 80px 40px 20px 40px;
            margin-bottom: 20px;
        }
        
        .bank-staff-auth {
            flex: 1;
            padding-right: 40px;
        }
        
        .customer-auth {
            flex: 1;
            padding-left: 40px;
        }
        
        .text-section h3 {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 12px;
            color: #ff0000;
        }
        
        .text-section ul {
            list-style-type: disc;
            padding-left: 20px;
            font-size: 14pt;
            line-height: 1.6;
            color: #333;
        }
        
        .text-section li {
            margin-bottom: 8px;
        }
        
        .diagram-container {
            flex: 1;
            position: relative;
            overflow: hidden;
        }
        
        svg {
            width: 100%;
            height: 100%;
        }
        
        text {
            font-family: Arial, sans-serif;
            font-size: 12px;
            fill: #000;
        }
        
        .title-text {
            font-size: 14px;
            font-weight: bold;
        }
        
        .title-text-11pt {
            font-size: 14pt;
            font-weight: bold;
        }
        
        .small-text-14pt {
            font-size: 14pt;
        }
        
        .small-text {
            font-size: 14px;
        }
        
        .light-blue-box {
            fill: #ADD8E6;
            stroke: #000;
            stroke-width: 2;
        }
        
        .dark-blue-box {
            fill: #1E3A8A;
            stroke: #000;
            stroke-width: 2;
        }
        
        .purple-box {
            fill: #9333ea;
            stroke: #000;
            stroke-width: 2;
        }
        
        .teal-box {
            fill: #14B8A6;
            stroke: #000;
            stroke-width: 2;
        }
        
        .teal-container {
            fill: #0D9488;
            stroke: #000;
            stroke-width: 2;
        }
        
        .arrow-red {
            stroke: #ff0000;
            stroke-width: 2.5;
            fill: none;
            marker-end: url(#arrowhead-red);
        }
        
        .text-white {
            fill: #fff;
        }
        
        .text-black {
            fill: #000;
        }
        
        .db-cylinder {
            fill: #10b981;
            stroke: #000;
            stroke-width: 2;
        }
        
        .clickable {
            cursor: pointer;
        }
        
        .tooltip {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: white;
            border-top: 2px solid #ff0000;
            border-radius: 0;
            padding: 15px;
            font-size: 16px;
            line-height: 1.5;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
            z-index: 2000;
            display: none;
            max-height: 300px;
            overflow-y: auto;
            word-wrap: break-word;
            white-space: pre-wrap;
            text-align: left;
        }
        
        .tooltip.show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .tooltip-title {
            display: none;
        }
        
        .tooltip-description {
            color: #333;
            font-size: 16px;
            text-align: left;
            line-height: 1;
            margin: 0;
            padding: 0;
        }
        
        .tooltip-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #283054;
            z-index: 2001;
        }
        
        .tooltip-close:hover {
            color: #ff0000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-label">Here is the Temenos Authentication</div>
        <div id="tooltip" class="tooltip">
            <button class="tooltip-close" id="tooltip-close">&times;</button>
            <div class="tooltip-title" id="tooltip-title"></div>
            <div class="tooltip-description" id="tooltip-description"></div>
        </div>
        
        <!-- Text Sections -->
        <div class="text-section">
            <div class="bank-staff-auth">
                <h3>Bank Staff Authentication</h3>
                <ul>
                    <li>User Identity and authentication are externalized, utilizing Single Sign-On (SSO) with enterprise Identity Management (IdM) systems, specifically mentioning "Azure Entra ID" as an example.</li>
                    <li>User identity and trust are established through a "security token oAuth 2.0 JWT".</li>
                    <li>All product integration and validation are handled with "KeyCloak IdM".</li>
                </ul>
            </div>
            <div class="customer-auth">
                <h3>Customer Authentication</h3>
                <ul>
                    <li>Based on the open standards "OIDC" (OpenID Connect) and "JWT" (JSON Web Token), integrated with "Temenos Digital".</li>
                    <li>"SCA Authentication partner" is the preferred approach for compliance with "PSD2" (Payment Services Directive 2) and open banking regulatory requirements.</li>
                    <li>"HID, Uniken" are identified as exchange partners for "Temenos Digital SCA integration & certification".</li>
                </ul>
            </div>
        </div>
        
        <!-- Diagram Container -->
        <div class="diagram-container">
            <svg viewBox="0 0 1400 600" preserveAspectRatio="xMidYMid meet">
                <!-- Arrow marker definition -->
                <defs>
                    <marker id="arrowhead-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#ff0000" />
                    </marker>
                </defs>
                
                <!-- UI Configuration of Users, Roles, SSO etc. (Light Blue Box) -->
                <rect id="ui-configuration" x="50" y="100" width="200" height="80" class="light-blue-box clickable" rx="5"/>
                <text x="150" y="130" text-anchor="middle" class="text-black title-text-11pt">UI Configuration of</text>
                <text x="150" y="150" text-anchor="middle" class="text-black title-text-11pt">Users, Roles, SSO etc.</text>
                
                <!-- Keycloak / External IdM (Dark Blue Box) -->
                <rect id="keycloak" x="50" y="220" width="200" height="100" class="dark-blue-box clickable" rx="5"/>
                <text x="150" y="250" text-anchor="middle" class="text-white title-text-11pt">Keycloak /</text>
                <text x="150" y="275" text-anchor="middle" class="text-white title-text-11pt">External IdM</text>
                
                <!-- DB Cylinder (Green) - Outside Keycloak, close to lower border (Keycloak lower border is at y=320) -->
                <ellipse cx="220" cy="340" rx="40" ry="12" class="db-cylinder"/>
                <rect x="180" y="340" width="80" height="60" class="db-cylinder"/>
                <ellipse cx="220" cy="400" rx="40" ry="12" class="db-cylinder"/>
                <text x="220" y="375" text-anchor="middle" class="text-white title-text">DB</text>
                
                <!-- Authentication Service (Purple Box) -->
                <rect id="authentication-service" x="350" y="220" width="220" height="100" class="purple-box clickable" rx="5"/>
                <text x="460" y="250" text-anchor="middle" class="text-white title-text-11pt">Authentication Service</text>
                <text x="460" y="275" text-anchor="middle" class="text-white small-text-14pt">SAML / OIDC / Federated</text>
                
                <!-- Temenos Application (Dark Blue Box) -->
                <rect id="temenos-application" x="650" y="220" width="200" height="100" class="dark-blue-box clickable" rx="5"/>
                <text x="750" y="260" text-anchor="middle" class="text-white title-text-11pt">Temenos</text>
                <text x="750" y="285" text-anchor="middle" class="text-white title-text-11pt">Application</text>
                
                <!-- Temenos Security (Teal Container) -->
                <rect id="temenos-security" x="950" y="180" width="300" height="180" class="teal-container clickable" rx="5"/>
                <text x="1100" y="210" text-anchor="middle" class="text-white title-text-11pt">Temenos Security</text>
                
                <!-- Auth Filter (Teal Box inside Temenos Security) -->
                <rect x="970" y="230" width="260" height="50" class="teal-box" rx="5"/>
                <text x="1100" y="260" text-anchor="middle" class="text-white title-text">Auth Filter</text>
                
                <!-- Security Token Validation (Teal Box inside Temenos Security) -->
                <rect x="970" y="300" width="260" height="50" class="teal-box" rx="5"/>
                <text x="1100" y="325" text-anchor="middle" class="text-white small-text">Security Token Validation</text>
                <text x="1100" y="340" text-anchor="middle" class="text-white small-text">SAML / OIDC / FS</text>
                
                <!-- Arrows - All Red, connecting to borders -->
                
                <!-- UI Configuration to Keycloak (from bottom border to top border) -->
                <line x1="150" y1="180" x2="150" y2="220" class="arrow-red"/>
                
                <!-- Keycloak to Authentication Service (from right border to left border) -->
                <line x1="250" y1="270" x2="350" y2="270" class="arrow-red"/>
                <text x="300" y="205" text-anchor="middle" class="text-black small-text">Identity &amp; Attributes</text>
                
                <!-- Authentication Service to Temenos Application (from right border to left border) -->
                <line x1="570" y1="270" x2="650" y2="270" class="arrow-red"/>
                <text x="610" y="205" text-anchor="middle" class="text-black small-text">Security Token</text>
                
                <!-- Temenos Application to Auth Filter (from right border to left border of Temenos Security container) -->
                <line x1="850" y1="270" x2="950" y2="255" class="arrow-red"/>
                <text x="900" y="200" text-anchor="middle" class="text-black small-text">Security Token</text>
                
                <!-- Auth Filter to Security Token Validation (from bottom border to top border) -->
                <line x1="1100" y1="280" x2="1100" y2="300" class="arrow-red"/>
                
                <!-- Security Token Validation back to Temenos Application (from left border of Temenos Security to right border of Temenos Application) -->
                <line x1="950" y1="325" x2="850" y2="270" class="arrow-red"/>
                <text x="900" y="240" text-anchor="middle" class="text-black small-text">Identity &amp; Attributes</text>
            </svg>
        </div>
    </div>
    
    <script>
        // Tooltip Configuration
        const tooltips = [
            {
                id: 'ui-configuration',
                title: 'UI Configuration of Users, Roles',
                description: 'Temenos UI Explorer application redirects a user\\'s browser from the application to the Keycloak authentication server where they enter their credentials. This redirection is important because users are completely isolated from applications and applications never see a user\\'s credentials.\\n\\nIdentity token or assertion (for SAML protocol) is cryptographically signed.\\n\\nThese tokens can have identity information like username, address, email, and other profile data.\\n\\nTemenos Security Management System (SMS) based on Role Based Access in which the ability to access or perform action is tied to the permission granted. The internal mechanism provides sufficient and granular access management to all applications as well as role/group facilities. When a user attempts to log in, they are authenticated via the bank\\'s IAM. Upon successful authentication, the IAM generates a JSON Web Token (JWT) for authorization. The application exchanges the authorization code for an ID Token and a refresh token. The ID Token contains user information, while the access token allows access to resources.',
                position: 'bottom'
            },
            {
                id: 'keycloak',
                title: 'Keycloak',
                description: 'Temenos solutions use Keycloak, an open-source Identity and Access Management (IAM) tool, to manage authentication. Keycloak enables Single Sign-On (SSO) based on federated security, letting users log in once to access multiple applications seamlessly.\\n\\nKeycloak integrates with the bank\\'s existing Identity Provider (IdP), like Entra ID (AD), which manages users and passwords. This integration uses standard protocols such as SAML 2.0 or OpenID Connect. Keycloak acts here as an identity broker, redirecting authentication requests to Banks\\' preferred IAM. After successful authentication, Bank\\' IAM issues JSON Web Tokens (JWTs) that carry user identity and role information, which the solution uses to enforce authorization based on assigned permissions.',
                position: 'right'
            },
            {
                id: 'authentication-service',
                title: 'Authentication Service',
                description: '1. User Identity, authentication externalised and SSO with enterprise IAM e.g.,\\n\\n2. Entra ID Establish user identity and trust through security token oAuth 2.0 JWT,\\n\\n3. All products integrate and validate with KeyCloak IaM',
                position: 'bottom'
            },
            {
                id: 'temenos-application',
                title: 'Temenos Application',
                description: 'User activities, including successful and failed login attempts, are logged. Session IDs do not contain sensitive data and are invalidated upon logout.',
                position: 'top'
            },
            {
                id: 'temenos-security',
                title: 'Temenos Security',
                description: 'Choosing between OpenID Connect and SAML is not just a matter of using a newer protocol (OIDC) instead of the older more mature protocol (SAML). In most cases Keycloak recommends using OIDC. SAML 2.0 tends to be a bit more verbose than OIDC. Beyond verbosity of exchanged data, OIDC was designed to work with the web while SAML2.0 was retrofitted to work on top of the web.',
                position: 'left'
            }
        ];
        
        const tooltip = document.getElementById('tooltip');
        const tooltipTitle = document.getElementById('tooltip-title');
        const tooltipDescription = document.getElementById('tooltip-description');
        const tooltipClose = document.getElementById('tooltip-close');
        
        function showTooltip(config, element) {
            if (!tooltip || !tooltipTitle || !tooltipDescription) {
                console.error('Tooltip elements not found');
                return;
            }
            
            tooltipTitle.textContent = config.title;
            tooltipDescription.textContent = config.description.replace(/\\\\n/g, '\\n');
            
            // Position tooltip at bottom with full width
            tooltip.style.position = 'fixed';
            tooltip.style.bottom = '0';
            tooltip.style.left = '0';
            tooltip.style.width = '100%';
            tooltip.style.right = '0';
            tooltip.style.top = 'auto';
            
            // Show tooltip
            tooltip.style.display = 'block';
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.classList.add('show');
        }
        
        function hideTooltip() {
            if (tooltip) {
                tooltip.classList.remove('show');
                tooltip.style.display = 'none';
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            }
        }
        
        // Attach click handlers to all elements with tooltips
        tooltips.forEach(function(config) {
            const element = document.getElementById(config.id);
            if (element) {
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isSameTooltip = tooltip && tooltip.classList.contains('show') && tooltipTitle && tooltipTitle.textContent === config.title;
                    if (isSameTooltip) {
                        hideTooltip();
                    } else {
                        showTooltip(config, element);
                    }
                });
            }
        });
        
        // Close tooltip handler
        if (tooltipClose) {
            tooltipClose.addEventListener('click', function(e) {
                e.stopPropagation();
                hideTooltip();
            });
        }
        
        // Hide tooltip when clicking outside
        document.addEventListener('click', function(e) {
            if (!tooltip.contains(e.target) && !e.target.classList.contains('clickable')) {
                hideTooltip();
            }
        });
    </script>
</body>
</html>`

// HTML5 Authorization Diagram Content
const TemenosAuthorizationHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Authorization - Role Based Access</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }
        
        .container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            padding: 60px 40px 40px 120px;
            gap: 80px;
            align-items: flex-start;
        }
        
        .left-section {
            flex: 0 0 45%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .right-section {
            flex: 0 0 45%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-top: 30px;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
        }
        
        /* Left Section Styles */
        .icon-group {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .icon-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }
        
        .flow-box {
            border: 3px solid #9333ea;
            background: white;
            padding: 15px 25px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            color: #9333ea;
            min-width: 150px;
            text-align: center;
        }
        
        .arrow-label {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin: 5px 0;
        }
        
        .arrow-examples {
            font-size: 12px;
            color: #333;
            margin-left: 10px;
        }
        
        .list-section {
            margin-top: 30px;
        }
        
        .list-title {
            font-weight: bold;
            font-size: 14px;
            color: #000;
            margin-bottom: 10px;
        }
        
        .list-items {
            font-size: 13px;
            color: #333;
            line-height: 1.8;
        }
        
        /* Right Section Styles */
        .example-label {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
        }
        
        .hierarchy-block {
            background: #1e3a8a;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            margin-bottom: 15px;
            min-width: 400px;
            position: relative;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .hierarchy-block::before {
            content: '';
            position: absolute;
            left: -25px;
            top: 0;
            bottom: -15px;
            width: 3px;
            background: #6b7280;
        }
        
        .hierarchy-block:first-child::before {
            display: none;
        }
        
        .hierarchy-block:not(:last-child)::after {
            content: '';
            position: absolute;
            left: -25px;
            bottom: -15px;
            width: 3px;
            height: 15px;
            background: #6b7280;
        }
        
        .padlock-icon {
            font-size: 24px;
            color: #6b7280;
        }
        
        .block-title {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 8px;
        }
        
        .block-examples {
            font-size: 13px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .block-icon {
            font-size: 20px;
            color: #6b7280;
            margin-left: auto;
        }
        
        /* Tooltip Styles */
        .tooltip {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: white;
            border-top: 2px solid #ff0000;
            border-radius: 0;
            padding: 15px;
            font-size: 16px;
            line-height: 1.5;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
            z-index: 2000;
            display: none;
            max-height: 300px;
            overflow-y: auto;
            word-wrap: break-word;
            white-space: pre-wrap;
            text-align: left;
        }
        
        .tooltip.show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .tooltip-title {
            display: none;
        }
        
        .tooltip-description {
            color: #333;
            font-size: 16px;
            line-height: 1;
            white-space: pre-line;
            text-align: left;
            margin: 0;
            padding: 0;
        }
        
        .tooltip-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #283054;
            z-index: 2001;
        }
        
        .tooltip-close:hover {
            color: #ff0000;
        }
        
        .clickable {
            cursor: pointer;
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }
        
        .action-button:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>
    <div class="title-label">Role Based Access</div>
    <div class="container">
        <!-- Left Section: Role-Based Access Model -->
        <div class="left-section">
            <!-- Flow Diagram and Bottom Lists Container -->
            <div style="display: flex; align-items: flex-start; gap: 30px; margin-top: 90px;">
                <!-- Bottom Lists -->
                <div class="list-section" style="margin-top: 0;">
                    <div class="list-title">User Groups:</div>
                    <div class="list-items">
                        Back-office Team,<br>
                        Front office team<br>
                        Audit Group.
                    </div>
                    
                    <div class="list-title" style="margin-top: 20px;">Actual users with profiles:</div>
                    <div class="list-items">
                        John Doe
                    </div>
                    
                    <div class="list-title" style="margin-top: 20px;">Role Based Access:</div>
                    <div class="list-items">
                        Payments Operator,<br>
                        Check Issuer,<br>
                        Wire Room Authorizer,<br>
                        Account Executive
                    </div>
                </div>
                
                <!-- Vertical Purple Line -->
                <div style="width: 4px; background-color: #9333ea; align-self: stretch; flex-shrink: 0;"></div>
                
                <!-- Flow Diagram -->
                <div style="position: relative;">
                    <!-- User Group Box with Icon -->
                    <div style="display: flex; align-items: center; gap: 40px; margin-bottom: 20px;">
                        <div class="icon-circle">👥</div>
                        <div class="flow-box">User Group</div>
                    </div>
                    
                    <!-- Arrow to User -->
                    <div style="margin-left: 30px; margin-bottom: 10px;">
                        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 15px solid #000; margin-bottom: 5px;"></div>
                        <div class="arrow-label">Properties</div>
                        <div class="arrow-examples">
                            Start Date/Time<br>
                            End Date/Time
                        </div>
                    </div>
                    
                    <!-- User Box with Icon -->
                    <div style="display: flex; align-items: center; gap: 40px; margin-bottom: 20px;">
                        <div class="icon-circle">👤</div>
                        <div id="user-box" class="flow-box clickable" style="background: #ff0000; color: white;">User</div>
                    </div>
                    
                    <!-- Arrow to Role -->
                    <div style="margin-left: 30px; margin-bottom: 10px;">
                        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 15px solid #000; margin-bottom: 5px;"></div>
                        <div class="arrow-label">Access</div>
                        <div class="arrow-examples">
                            Belongs to US Entity,<br>
                            Can process Payments,<br>
                            Only Checks,<br>
                            Authorize Checks,<br>
                            Edit Ben. Account #
                        </div>
                    </div>
                    
                    <!-- Role Box with Icon -->
                    <div style="display: flex; align-items: center; gap: 40px;">
                        <div class="icon-circle">🔒</div>
                        <div id="role-box" class="flow-box clickable">Role</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Section: Hierarchical System Components -->
        <div id="right-section" class="right-section clickable">
            <div class="example-label">Example</div>
            
            <!-- ENTITY Block -->
            <div class="hierarchy-block">
                <span class="padlock-icon">🔒</span>
                <div style="flex: 1;">
                    <div class="block-title">ENTITY (Company)</div>
                    <div class="block-examples">
                        <span>Entity A</span>
                        <span>Entity B</span>
                    </div>
                </div>
                <span class="block-icon">🏢</span>
            </div>
            
            <!-- PRODUCT Block -->
            <div class="hierarchy-block">
                <span class="padlock-icon">🔒</span>
                <div style="flex: 1;">
                    <div class="block-title">PRODUCT (Module)</div>
                    <div class="block-examples">
                        <span>Payments</span>
                        <span>Forex</span>
                    </div>
                </div>
                <span class="block-icon">⊞</span>
            </div>
            
            <!-- SUB-PRODUCT Block -->
            <div class="hierarchy-block">
                <span class="padlock-icon">🔒</span>
                <div style="flex: 1;">
                    <div class="block-title">SUB-PRODUCT (Application)</div>
                    <div class="block-examples">
                        <span>ACH, Wires, Checks, Swift</span>
                        <span>Forex, Spot</span>
                    </div>
                </div>
                <span class="block-icon">🔍</span>
            </div>
            
            <!-- ACTIVITY Block -->
            <div class="hierarchy-block">
                <span class="padlock-icon">🔒</span>
                <div style="flex: 1;">
                    <div class="block-title">ACTIVITY (Function)</div>
                    <div class="block-examples" style="flex-direction: column; gap: 5px;">
                        <div>
                            <span>Create, Amend, View,</span><br>
                            <span>First Level Approval,</span><br>
                            <span>Second Level Approval</span>
                        </div>
                        <div>
                            <span>Creator, Authorizer,</span><br>
                            <span>Manager, Reviewer</span>
                        </div>
                    </div>
                </div>
                <span class="block-icon">👆</span>
            </div>
            
            <!-- DATA Block -->
            <div class="hierarchy-block">
                <span class="padlock-icon">🔒</span>
                <div style="flex: 1;">
                    <div class="block-title">DATA (Fields)</div>
                    <div class="block-examples">
                        <span>Payment Amount, Beneficiary</span>
                    </div>
                </div>
                <span class="block-icon">📄</span>
            </div>
        </div>
    </div>
    
    <!-- Tooltip Element -->
    <div id="tooltip" class="tooltip">
        <button class="tooltip-close" id="tooltip-close">&times;</button>
        <div class="tooltip-title" id="tooltip-title"></div>
        <div class="tooltip-description" id="tooltip-description"></div>
    </div>
    
    <script>
        // Tooltip Configuration
        const tooltips = [
            {
                id: 'right-section',
                title: 'Right Section',
                description: 'Access rights are defined and managed centrally by Bank\\' administrators, allowing precise control over what users can view or do within the system. At the core, user roles determine access permissions, which can be configured to cover multiple levels including:\\n\\n1. Organization or business unit level (e.g., company or branch level), enabling Bank to restrict access to data and functions relevant only to specific legal entities or subsidiaries.\\n\\n2. Application or module level, controlling which banking products or services a user can access.\\n\\n3. Screen and menu levels, allowing fine-grained control over user interface elements and navigation options.\\n\\n4. Functional level, specifying allowed actions such as input, authorization, viewing, or deletion.\\n\\n5. Data element or field level, enabling restrictions on specific data fields or values, for example limiting transaction amounts or excluding certain account types',
                position: 'right'
            },
            {
                id: 'user-box',
                title: 'User',
                description: 'Each user profile contains a unique user identifier, password, language, and conditions.\\n\\nUser roles and permissions are managed within the solution, with role-based access control (RBAC) ensuring that users access only the data and functions authorized for their specific roles. After successful authentication, user identity and permissions are propagated via tokens, enabling consistent enforcement of access rights across all components and services. This identity propagation supports granular authorization at multiple levels, including company, application, API, screen, and field levels.',
                position: 'right'
            },
            {
                id: 'role-box',
                title: 'Role',
                description: 'So, permissions and rights are assigned to roles rather than directly to users.\\n\\nThus, a single role for the whole group of users who perform the same task.\\n\\nThis is mapped to the organizational structure so that the users can be assigned with a different role if they physically change their roles in the organization.',
                position: 'right'
            }
        ];
        
        const tooltip = document.getElementById('tooltip');
        const tooltipTitle = document.getElementById('tooltip-title');
        const tooltipDescription = document.getElementById('tooltip-description');
        const tooltipClose = document.getElementById('tooltip-close');
        
        function showTooltip(config, element) {
            if (!tooltip || !tooltipTitle || !tooltipDescription) {
                console.error('Tooltip elements not found');
                return;
            }
            
            tooltipTitle.textContent = config.title;
            tooltipDescription.textContent = config.description.replace(/\\\\n/g, '\\n');
            
            // Position tooltip at bottom with full width
            tooltip.style.position = 'fixed';
            tooltip.style.bottom = '0';
            tooltip.style.left = '0';
            tooltip.style.width = '100%';
            tooltip.style.right = '0';
            tooltip.style.top = 'auto';
            
            // Show tooltip
            tooltip.style.display = 'block';
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.classList.add('show');
        }
        
        function hideTooltip() {
            if (tooltip) {
                tooltip.classList.remove('show');
                tooltip.style.display = 'none';
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            }
        }
        
        // Attach click handlers to all elements with tooltips
        tooltips.forEach(function(config) {
            const element = document.getElementById(config.id);
            if (element) {
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isSameTooltip = tooltip && tooltip.classList.contains('show') && tooltipTitle && tooltipTitle.textContent === config.title;
                    if (isSameTooltip) {
                        hideTooltip();
                    } else {
                        showTooltip(config, element);
                    }
                });
            }
        });
        
        // Close tooltip handler
        if (tooltipClose) {
            tooltipClose.addEventListener('click', function(e) {
                e.stopPropagation();
                hideTooltip();
            });
        }
        
        // Hide tooltip when clicking outside
        document.addEventListener('click', function(e) {
            const target = e.target;
            const isTooltipElement = tooltips.some(function(config) {
                const element = document.getElementById(config.id);
                return element && element.contains(target);
            });
            const isTooltipBox = tooltip && tooltip.contains(target);
            if (!isTooltipElement && !isTooltipBox) {
                hideTooltip();
            }
        });
    </script>
    
    <!-- Action Button -->
    <button class="action-button" onclick="window.parent.postMessage({type: 'showUserManagement'}, '*')">Move to User Management Explanation</button>
</body>
</html>`

const UserManagementHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
        }
        
        .container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            padding: 80px 40px 40px 40px;
            gap: 40px;
            align-items: flex-start;
        }
        
        .left-section {
            flex: 0 0 35%;
            display: flex;
            flex-direction: column;
            gap: 20px;
            position: relative;
            font-size: 16pt;
        }
        
        .right-section {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .explanation-box {
            background: #f0f0f0;
            border: 2px solid #333;
            border-radius: 5px;
            padding: 12px 15px;
            font-size: 13px;
            line-height: 1.6;
            color: #000;
            position: relative;
        }
        
        .arrow-line {
            position: absolute;
            right: -30px;
            width: 30px;
            height: 2px;
            background: #000;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .arrow-head {
            position: absolute;
            right: -35px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid #000;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
        }
        
        .form-container {
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 20px;
        }
        
        .tabs {
            display: flex;
            gap: 0;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        
        .tab {
            padding: 10px 20px;
            background: #e0e0e0;
            border: 1px solid #ccc;
            border-bottom: none;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
        }
        
        .tab.active {
            background: #fff;
            border-bottom: 2px solid #fff;
            margin-bottom: -2px;
        }
        
        .tab-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .check-icon {
            width: 24px;
            height: 24px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            align-items: center;
        }
        
        .form-label {
            min-width: 140px;
            font-size: 13px;
            font-weight: bold;
            color: #000;
        }
        
        .form-input {
            flex: 1;
            padding: 6px 10px;
            border: 1px solid #999;
            border-radius: 3px;
            font-size: 13px;
        }
        
        .form-input-small {
            width: 100px;
            padding: 6px 10px;
            border: 1px solid #999;
            border-radius: 3px;
            font-size: 13px;
        }
        
        .radio-group {
            display: flex;
            gap: 15px;
        }
        
        .radio-option {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .dropdown {
            padding: 6px 10px;
            border: 1px solid #999;
            border-radius: 3px;
            font-size: 13px;
            background: white;
        }
        
        .icon-button {
            width: 24px;
            height: 24px;
            border: 1px solid #999;
            border-radius: 3px;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
        }
        
        .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            margin-top: 15px;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="title-label">User Management main points</div>
    <div class="container">
        <!-- Left Section: Explanatory Text Boxes -->
        <div class="left-section">
            <!-- Explanation Box 1: User Identification -->
            <div class="explanation-box" style="margin-top: 60px; background: #00BFFF;">
                <div>Sign-on name</div>
                <div>Is the user a bank employee (e.g., internal)</div>
                <div>Language</div>
                <div>Company the user can access</div>
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
            </div>
            
            <!-- Explanation Box 2: User Validity Period -->
            <div class="explanation-box" style="margin-top: 140px; background: #C9D9E2;">
                <div>Validity of the User</div>
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
            </div>
            
            <!-- Explanation Box 3: Daily Work Duration -->
            <div class="explanation-box" style="margin-top: 60px; background: #CCFF00;">
                <div>Duration for which the user can work in CBS (e.g., or all 7 days)</div>
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
            </div>
            
            <!-- Explanation Box 4: Application and Function Access -->
            <div class="explanation-box" style="margin-top: 100px; background: #F4C430;">
                <div>Give access to applications, company wise</div>
                <div>and operations allowed (e.g., authorize)</div>
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
            </div>
            
            <!-- Explanation Box 5: Specific Day and Time Access -->
            <div class="explanation-box" style="margin-top: 100px; background: #f0f8ff;">
                <div>Specific time of access for certain days</div>
                <div>1 – Mon , 2 – Tue and so on</div>
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
            </div>
        </div>
        
        <!-- Right Section: Form -->
        <div class="right-section">
            <div class="form-container">
                <!-- Tabs -->
                <div class="tabs">
                    <div class="tab active">USER</div>
                    <div class="tab">INPUTTER</div>
                </div>
                
                <!-- Tab Header with Check Icon -->
                <div class="tab-header">
                    <div></div>
                    <div class="check-icon">✓</div>
                </div>
                
                <!-- Form Fields -->
                <!-- User Identification Section -->
                <div class="form-group">
                    <div class="form-row">
                        <div class="form-label">User Name</div>
                        <input type="text" class="form-input" value="INPUTTER">
                    </div>
                    <div class="form-row">
                        <div class="form-label">Sign On Name</div>
                        <input type="text" class="form-input" value="INPUTT">
                    </div>
                    <div class="form-row">
                        <div class="form-label">Classification</div>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" name="classification" id="ext" value="Ext">
                                <label for="ext">Ext</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" name="classification" id="int" value="Int" checked>
                                <label for="int">Int</label>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-label">Language</div>
                        <input type="text" class="form-input-small" value="1">
                        <select class="dropdown">
                            <option>English</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-label">Company.1</div>
                        <input type="text" class="form-input" value="GB0010001">
                        <div style="margin-left: 10px;">Model Bank</div>
                        <div class="icon-button">+</div>
                    </div>
                </div>
                
                <!-- User Validity Period Section -->
                <div class="section-title">User Validity Period</div>
                <div class="form-group">
                    <div class="form-row">
                        <div class="form-label">Start Date</div>
                        <input type="text" class="form-input" value="09 OCT 2018">
                        <div class="icon-button">📅</div>
                    </div>
                    <div class="form-row">
                        <div class="form-label">End Date</div>
                        <input type="text" class="form-input" value="31 DEC 2099">
                        <div class="icon-button">📅</div>
                    </div>
                </div>
                
                <!-- Daily Work Duration Section -->
                <div class="section-title">Daily Work Duration</div>
                <div class="form-group">
                    <div class="form-row">
                        <div class="form-label">Start Time.1</div>
                        <input type="text" class="form-input-small" value="0">
                    </div>
                    <div class="form-row">
                        <div class="form-label">End Time.1</div>
                        <input type="text" class="form-input-small" value="2400">
                    </div>
                </div>
                
                <!-- Application and Function Access Section -->
                <div class="section-title">Application and Function Access</div>
                <div class="form-group">
                    <div class="form-row">
                        <div class="form-label">Company Restr.1</div>
                        <input type="text" class="form-input" value="ALL">
                    </div>
                    <div class="form-row">
                        <div class="form-label">User Group.1</div>
                        <input type="text" class="form-input" value="ALL.PG">
                    </div>
                    <div class="form-row">
                        <div class="form-label">Version.1</div>
                        <input type="text" class="form-input" value="">
                    </div>
                    <div class="form-row">
                        <div class="form-label">Function Allowed.1</div>
                        <input type="text" class="form-input" value="A2BCDEFHILPRSV">
                    </div>
                </div>
                
                <!-- Specific Day and Time Access Section -->
                <div class="section-title">Specific Day and Time Access</div>
                <div class="form-group">
                    <div class="form-row">
                        <div class="form-label">Allowed Days.1</div>
                        <input type="text" class="form-input-small" value="1">
                    </div>
                    <div class="form-row">
                        <div class="form-label">Day St Time.1</div>
                        <input type="text" class="form-input-small" value="1000">
                    </div>
                    <div class="form-row">
                        <div class="form-label">Day End Time.1</div>
                        <input type="text" class="form-input-small" value="2000">
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

// eXate HTML Content
const eXateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>eXate Solution</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: white;
            width: 100vw;
            height: 100vh;
            overflow: auto;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        .header-label {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #283054;
            margin-bottom: 30px;
            padding: 10px;
            width: 100%;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            min-height: 600px;
        }
        
        .diagram-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 40px 20px;
            position: relative;
            min-height: 400px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        
        .temenos-core {
            background-color: #007BA7;
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            width: 180px;
            height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            line-height: 1.4;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .exate-jdbc {
            background-color: #E0F2F7;
            border: 2px solid #B0D4E0;
            border-radius: 8px;
            padding: 20px;
            width: 220px;
            height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .exate-logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #87CEEB, #9370DB, #FFB6C1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: white;
            margin-bottom: 15px;
        }
        
        .jdbc-text {
            font-size: 18px;
            font-weight: bold;
            color: #283054;
            margin-top: 10px;
        }
        
        .protected-storage {
            background-color: #8A2BE2;
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            width: 180px;
            height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            line-height: 1.4;
            position: relative;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .protected-storage::before {
            content: '';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-bottom: 15px solid #8A2BE2;
        }
        
        .data-flow {
            position: absolute;
            height: 50px;
            display: flex;
            align-items: center;
            font-size: 14px;
            font-weight: bold;
            color: #283054;
            background-color: #D0E0F0;
            border: 2px solid #283054;
            border-radius: 4px;
            padding: 8px 12px;
            white-space: nowrap;
        }
        
        .data-flow-top {
            top: 180px;
        }
        
        .data-flow-bottom {
            bottom: 180px;
        }
        
        .data-flow-1 {
            left: 200px;
            width: 180px;
        }
        
        .data-flow-2 {
            right: 200px;
            width: 180px;
        }
        
        .data-flow-3 {
            right: 200px;
            width: 180px;
        }
        
        .data-flow-4 {
            left: 200px;
            width: 180px;
        }
        
        .encrypted-text {
            color: #ff0000;
            text-decoration: underline;
            text-decoration-style: dotted;
        }
        
        .arrow {
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
        }
        
        .arrow-right {
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-left: 15px solid #000;
        }
        
        .arrow-left {
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 15px solid #000;
        }
        
        .arrow-up {
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 15px solid #000;
        }
        
        .arrow-1 {
            left: 380px;
            top: 205px;
        }
        
        .arrow-2 {
            right: 380px;
            top: 205px;
        }
        
        .arrow-3 {
            right: 380px;
            bottom: 205px;
        }
        
        .arrow-4 {
            left: 380px;
            bottom: 205px;
        }
        
        .arrow-5 {
            position: absolute;
            left: calc(50% - 200px);
            top: 50%;
            transform: translateY(-50%);
        }
        
        .arrow-6 {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 320px;
        }
        
        .supporting-components {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 30px;
            margin-top: -60px;
            padding: 0;
            padding-left: 20px;
            position: relative;
        }
        
        .metadata-management {
            background-color: #E0F2F7;
            border: 2px solid #B0D4E0;
            border-radius: 8px;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metadata-logo {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #87CEEB, #9370DB, #FFB6C1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
            flex-shrink: 0;
        }
        
        .metadata-text {
            font-size: 16px;
            font-weight: bold;
            color: #283054;
        }
        
        .datagator {
            background-color: white;
            border: 2px solid #283054;
            border-radius: 8px;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .datagator-logo {
            width: 40px;
            height: 40px;
            background-color: #283054;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
            flex-shrink: 0;
        }
        
        .datagator-text {
            display: flex;
            flex-direction: column;
        }
        
        .datagator-name {
            font-size: 18px;
            font-weight: bold;
            color: #283054;
        }
        
        .datagator-subtitle {
            font-size: 12px;
            color: #666;
        }
        
        .connecting-line {
            height: 2px;
            background-color: #ff0000;
            flex: 0 0 30px;
            align-self: center;
        }
        
        .benefits-section {
            margin-top: 50px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
        }
        
        .benefits-title {
            font-size: 20px;
            font-weight: bold;
            color: #283054;
            margin-bottom: 15px;
        }
        
        .benefits-list {
            list-style: none;
            padding-left: 0;
        }
        
        .benefits-list li {
            font-size: 16px;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        .benefits-list li::before {
            content: '• ';
            font-weight: bold;
            color: #283054;
            margin-right: 8px;
        }
        
        .benefits-list li ul {
            list-style: none;
            padding-left: 30px;
            margin-top: 5px;
        }
        
        .benefits-list li ul li::before {
            content: '• ';
            font-weight: bold;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header-label">eXate (Temenos Exchange) solution for field encryption data at rest</div>
    
    <div class="main-container">
        <div class="diagram-container">
            <!-- Temenos Banking Core -->
            <div class="temenos-core">
                Temenos<br>Banking<br>Core
            </div>
            
            <!-- Data Flow 1: John Smith (top, left to right) -->
            <div class="data-flow data-flow-top data-flow-1">
                1. John Smith
            </div>
            <div class="arrow arrow-right arrow-1"></div>
            
            <!-- eXate JDBC encryption -->
            <div class="exate-jdbc">
                <div class="exate-logo">e</div>
                <div class="jdbc-text">JDBC encryption</div>
            </div>
            
            <!-- Data Flow 2: XY ZI %yusHUhndn98 (top, right) -->
            <div class="data-flow data-flow-top data-flow-2">
                3. XY ZI <span class="encrypted-text">%yusHUhndn98</span>
            </div>
            <div class="arrow arrow-right arrow-2"></div>
            
            <!-- Protected storage -->
            <div class="protected-storage">
                Protected<br>storage
            </div>
            
            <!-- Data Flow 3: XY ZI %yusHUhndn98 (bottom, right) -->
            <div class="data-flow data-flow-bottom data-flow-3">
                2. XY ZI <span class="encrypted-text">%yusHUhndn98</span>
            </div>
            <div class="arrow arrow-left arrow-3"></div>
            
            <!-- Data Flow 4: John Smith (bottom, left) -->
            <div class="data-flow data-flow-bottom data-flow-4">
                4. John Smith
            </div>
            <div class="arrow arrow-left arrow-4"></div>
        </div>
        
        <!-- Supporting Components -->
        <div class="supporting-components">
            <div class="metadata-management">
                <div class="metadata-logo">e</div>
                <div class="metadata-text">Metadata Management</div>
            </div>
            
            <div class="connecting-line"></div>
            <div class="arrow arrow-right arrow-5"></div>
            
            <div class="datagator">
                <div class="datagator-logo">A</div>
                <div class="datagator-text">
                    <div class="datagator-name">datagator</div>
                    <div class="datagator-subtitle">an exate company</div>
                </div>
            </div>
        </div>
        
        <!-- Arrow from datagator to JDBC -->
        <div class="arrow arrow-up arrow-6"></div>
        
        <!-- Benefits Section -->
        <div class="benefits-section">
            <div class="benefits-title">Benefits For Banks:</div>
            <ul class="benefits-list">
                <li>Additional layer of security for PII (Personally Identifiable Information) and other regulated sensitive data.
                    <ul>
                        <li>For data-at-rest</li>
                    </ul>
                </li>
                <li>Data Protection compliance is more easily auditable and reportable</li>
            </ul>
        </div>
    </div>
</body>
</html>`

// Privacy & Encryption HTML Content
const PrivacyEncryptionHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy & Encryption</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            width: 100vw;
            height: 100vh;
            overflow: auto;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        .header-label {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #283054;
            margin-bottom: 25px;
            padding: 10px;
            width: 100%;
        }
        
        .intro-statements {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 30px;
            padding: 0 20px;
        }
        
        .intro-statement {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
        }
        
        .main-container {
            display: flex;
            flex: 1;
            gap: 0;
            min-height: 0;
            position: relative;
        }
        
        .divider {
            width: 2px;
            background-color: #000;
            flex-shrink: 0;
        }
        
        .section {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 0 20px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 12px;
        }
        
        .section-description {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .arrow-container {
            display: flex;
            justify-content: center;
            margin-bottom: 15px;
        }
        
        .arrow {
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 25px solid #8B5CF6;
        }
        
        .content-box {
            background: #B0E0E6;
            border: 2px solid #87CEEB;
            border-radius: 6px;
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-height: 150px;
        }
        
        .content-item {
            font-size: 14px;
            color: #333;
            line-height: 1.5;
        }
        
        .exate-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #EF4444;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            transition: background-color 0.3s ease;
        }
        
        .exate-button:hover {
            background-color: #DC2626;
        }
        
        .tooltip {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: white;
            border-top: 2px solid #ff0000;
            border-radius: 0;
            padding: 15px;
            font-size: 16px;
            line-height: 1.5;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
            z-index: 2000;
            display: none;
            max-height: 300px;
            overflow-y: auto;
            word-wrap: break-word;
            white-space: pre-wrap;
            text-align: left;
        }
        
        .tooltip.show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .tooltip-title {
            display: none;
        }
        
        .tooltip-description {
            color: #333;
            font-size: 16px;
            text-align: left;
            line-height: 1;
            margin: 0;
            padding: 0;
        }
        
        .tooltip-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #283054;
            z-index: 2001;
        }
        
        .tooltip-close:hover {
            color: #ff0000;
        }
        
        .section {
            cursor: pointer;
        }
        
        .section:hover {
            opacity: 0.9;
        }
        
        @media (max-width: 768px) {
            .main-container {
                flex-direction: column;
            }
            
            .divider {
                width: 100%;
                height: 2px;
                margin: 20px 0;
            }
            
            .section {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header-label">Temenos Privacy & Encryption</div>
    
    <div class="intro-statements">
        <div class="intro-statement">
            1. All components storing data (as a permanent data store or transitory, e.g., Cloud Storage, Event Hub, virtual disks) must support encryption at the block level
        </div>
        <div class="intro-statement">
            2. Encryption in transit - TLS for all traffic (e.g., PostgreSQL, Azure SQL), or encrypted protocol (e.g., SSH)
        </div>
        <div class="intro-statement">
            3. Encrypt data using supplementary encryption, e.g., TLS1.2, SSH, AES256, IPSEC and DLP usage
        </div>
    </div>
    
    <div class="main-container">
        <!-- Left Section: Data in Transit -->
        <div id="left-section" class="section">
            <div class="section-title">Data in Transit</div>
            <div class="section-description">
                Data that is traversing a network or temporarily residing in computer memory to be read or updated.
            </div>
            <div class="arrow-container">
                <div class="arrow"></div>
            </div>
            <div class="content-box">
                <div class="content-item">HTTPS (TLS 1.2)</div>
                <div class="content-item">SMBv3 / SFTP / FTPS</div>
                <div class="content-item">Data Loss Prevention</div>
            </div>
        </div>
        
        <!-- Vertical Divider -->
        <div class="divider"></div>
        
        <!-- Right Section: Data at Rest -->
        <div id="right-section" class="section">
            <div class="section-title">Data at Rest</div>
            <div class="section-description">
                Inactive data stored physically in databases, data warehouses, spreadsheets, archives, tapes, off-site backups, etc...
            </div>
            <div class="arrow-container">
                <div class="arrow"></div>
            </div>
            <div class="content-box">
                <div class="content-item">Transparent Data Encryption for Databases</div>
                <div class="content-item">Database audit monitoring</div>
                <div class="content-item">Block level encryption in storage, queues</div>
                <div class="content-item">Data Loss Prevention</div>
            </div>
        </div>
    </div>
    
    <button class="exate-button" onclick="window.parent.postMessage({type: 'showExate'}, '*');">eXate (Temenos Exchange) solution</button>
    
    <div id="tooltip" class="tooltip">
        <button class="tooltip-close" id="tooltip-close">&times;</button>
        <div class="tooltip-title" id="tooltip-title"></div>
        <div class="tooltip-description" id="tooltip-description"></div>
    </div>
    
    <script>
        // Tooltip Configuration
        const tooltips = [
            {
                id: "left-section",
                title: "Left Section",
                description: "Data in Transit: \\n\\nFor data in transit, all communications are secured using modern Transport Layer Security (TLS) protocols, specifically TLS 1.2.\\n\\nAPI communications are encrypted end-to-end, leveraging partner-supported encryption mechanisms to maintain data security during exchanges. File transfers, including SFTP services, use SSH encryption standards and secure key management practices. Connections to web applications and APIs are exclusively over HTTPS.\\n\\nSecure Access: Access to interfaces that are not classified as public is subject to additional access controls. Public interfaces have to be protected by Web Application Firewalls (WAF) and Denial of Service (DoS) protection (done for Temenos SaaS.\\n\\nSecure File Transfers: For file transfers, protocols such as SFTP and FTPS are utilised, ensuring that files are encrypted during transit. Additionally, SSH encryption standards are applied for secure connections.\\n\\nLogging and Monitoring: All data transfers and user actions are logged for auditing purposes. This includes monitoring for unauthorised access attempts and ensuring compliance with security policies.",
                position: "right"
            },
            {
                id: "right-section",
                title: "Right Section",
                description: "Data at Rest: \\n\\nFor data at rest, encryption is applied comprehensively across storage layers. \\n\\n1. Databases utilise Transparent Data Encryption (TDE) with AES 256-bit encryption algorithms. TDE performs real-time I/O encryption and decryption of the data at the page level. Each page is decrypted when it's read into memory and then encrypted before being written to disk. \\n\\n2. TDE encrypts the entire database, including logs and backups, protecting data on disks and during backups.\\n\\n3. Storage devices, including disk volumes and containers, benefit from full disk encryption and block-level encryption.",
                position: "left"
            }
        ];
        
        const tooltip = document.getElementById('tooltip');
        const tooltipTitle = document.getElementById('tooltip-title');
        const tooltipDescription = document.getElementById('tooltip-description');
        const tooltipClose = document.getElementById('tooltip-close');
        
        function showTooltip(config, element) {
            if (!tooltip || !tooltipTitle || !tooltipDescription) {
                console.error('Tooltip elements not found');
                return;
            }
            
            tooltipTitle.textContent = config.title;
            tooltipDescription.textContent = config.description.replace(/\\\\n/g, '\\n');
            
            // Position tooltip at bottom with full width
            tooltip.style.position = 'fixed';
            tooltip.style.bottom = '0';
            tooltip.style.left = '0';
            tooltip.style.width = '100%';
            tooltip.style.right = '0';
            tooltip.style.top = 'auto';
            
            // Show tooltip
            tooltip.style.display = 'block';
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.classList.add('show');
        }
        
        function hideTooltip() {
            if (tooltip) {
                tooltip.classList.remove('show');
                tooltip.style.display = 'none';
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            }
        }
        
        function initializeTooltips() {
            tooltips.forEach(function(config) {
                const element = document.getElementById(config.id);
                if (element) {
                    element.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const isSameTooltip = tooltip && tooltip.classList.contains('show') && tooltipTitle && tooltipTitle.textContent === config.title;
                        if (isSameTooltip) {
                            hideTooltip();
                        } else {
                            showTooltip(config, element);
                        }
                    });
                }
            });
            
            // Close tooltip handler
            if (tooltipClose) {
                tooltipClose.addEventListener('click', function(e) {
                    e.stopPropagation();
                    hideTooltip();
                });
            }
            
            // Hide tooltip when clicking outside
            document.addEventListener('click', function(e) {
                const target = e.target;
                const isTooltipElement = tooltips.some(function(config) {
                    const element = document.getElementById(config.id);
                    return element && element.contains(target);
                });
                const isTooltipBox = tooltip && tooltip.contains(target);
                if (!isTooltipElement && !isTooltipBox) {
                    hideTooltip();
                }
            });
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeTooltips);
        } else {
            initializeTooltips();
        }
    </script>
</body>
</html>`

// Platform Management HTML Content
const PlatformManagementHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: white;
            width: 100vw;
            height: 100vh;
            overflow: auto;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        .header-label {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #283054;
            margin-bottom: 30px;
            padding: 10px;
            width: 100%;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            min-height: 600px;
        }
        
        .stacks-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 40px;
            flex: 1;
            padding: 20px;
            position: relative;
        }
        
        .left-stack {
            display: flex;
            flex-direction: column;
            gap: 15px;
            flex: 1;
            max-width: 400px;
            border: 3px solid red;
            padding: 10px;
            border-radius: 8px;
        }
        
        .layer {
            padding: 20px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            color: white;
            text-align: left;
            position: relative;
            min-height: 60px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .layer-secure-dev {
            background-color: #9370DB;
        }
        
        .layer-auth {
            background-color: #87CEEB;
            color: #26619C;
        }
        
        .layer-access {
            background-color: #DF73FF;
            color: #26619C;
        }
        
        .layer-privacy {
            background-color: #4682B4;
        }
        
        .layer-monitoring {
            background-color: #9370DB;
        }
        
        .layer-application {
            background-color: #20B2AA;
            color: black;
            font-size: 20px;
        }
        
        .layer-label-right {
            position: absolute;
            right: 20px;
            font-size: 14px;
            font-weight: normal;
        }
        
        .plus-sign {
            font-size: 48px;
            font-weight: bold;
            color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            position: absolute;
            z-index: 10;
        }
        
        .plus-1 {
            left: calc(50% - 30px);
            top: 280px;
        }
        
        .plus-3 {
            left: calc(50% - 30px);
            bottom: 200px;
        }
        
        .right-stack {
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex: 1;
            max-width: 500px;
            border: 3px solid red;
            padding: 10px;
            border-radius: 8px;
            position: relative;
        }
        
        .right-section {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .right-box {
            padding: 20px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            color: white;
            text-align: center;
            background-color: #283054;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .right-box-cloud {
            background-color: #20B2AA;
            color: black;
            font-size: 20px;
        }
        
        .right-section-top {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .right-section-middle {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .right-section-top .right-box {
            background-color: #DF73FF;
            color: #26619C;
        }
        
        .right-section-middle .right-box {
            background-color: #DF73FF;
            color: #26619C;
        }
        
        .assurance-layer {
            background-color: #20B2AA;
            padding: 20px;
            border-radius: 8px;
            margin-top: -10px;
            color: white;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .assurance-items {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
            font-size: 14px;
            font-weight: normal;
        }
        
        .assurance-item {
            padding: 5px 10px;
            font-size: 16px;
        }
        
        .saas-button {
            position: absolute;
            bottom: -80px;
            right: 0;
            background-color: red;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .saas-button:hover {
            background-color: #cc0000;
        }
        
        @media (max-width: 1024px) {
            .stacks-container {
                flex-direction: column;
            }
            
            .plus-sign {
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="header-label">Temenos SaaS Platform Management</div>
    
    <div class="main-container">
        <div class="stacks-container">
            <!-- Left Stack: Application Security Layers -->
            <div class="left-stack">
                <div class="layer layer-application">
                    Application
                </div>
                
                <div class="layer layer-secure-dev">
                    Secure<br>Development<br>Lifecycle
                    <span class="layer-label-right">SAST, SCA, DAST<br>Container security<br>OSL</span>
                </div>
                
                <div class="layer layer-auth">
                    Authentication
                    <span class="layer-label-right">OpenID Connect, SAML 2.0</span>
                </div>
                
                <div class="layer layer-access">
                    Access Control
                    <span class="layer-label-right">RBAC</span>
                </div>
                
                <div class="layer layer-privacy">
                    Privacy
                    <span class="layer-label-right">TLS TDE</span>
                </div>
                
                <div class="layer layer-monitoring">
                    Monitoring
                    <span class="layer-label-right">Logs Meters Traces</span>
                </div>
            </div>
            
            <!-- Plus Signs -->
            <div class="plus-sign plus-1">+</div>
            <div class="plus-sign plus-3">+</div>
            
            <!-- Right Stack: Cloud Infrastructure & Security -->
            <div class="right-stack">
                <!-- Top Section -->
                <div class="right-section">
                    <div class="right-box right-box-cloud">Cloud Infrastructure</div>
                </div>
                
                <!-- Middle Section -->
                <div class="right-section right-section-top">
                    <div class="right-box">Cloud Native Security</div>
                    <div class="right-box">Platform Security</div>
                    <div class="right-box">Encryption data at-rest/in-transit</div>
                    <div class="right-box">Security Patches/Updates</div>
                </div>
                
                <!-- Bottom Section -->
                <div class="right-section right-section-middle">
                    <div class="right-box">Secure Operations & Processes</div>
                    <div class="right-box">Infrastructure / Cloud Monitoring</div>
                </div>
                
                <!-- SaaS Defence-in-Depth Button -->
                <button class="saas-button" onclick="window.parent.postMessage({type: 'showSaaSDefenceDepth'}, '*');">SaaS Defence-in-Depth</button>
            </div>
        </div>
        
        <!-- Assurance Layer -->
        <div class="assurance-layer">
            Internal & External Assurance
            <div class="assurance-items">
                <div class="assurance-item">Penetration Testing</div>
                <div class="assurance-item">Vulnerability Management</div>
                <div class="assurance-item">Client Audits and Testing</div>
                <div class="assurance-item">SOC Audits</div>
                <div class="assurance-item">Internal Audit</div>
                <div class="assurance-item">Process</div>
            </div>
        </div>
    </div>
</body>
</html>`

// SaaS Defence-in-Depth HTML Content
const SaaSDefenceDepthHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Defence-in-Depth</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: white;
            width: 100vw;
            height: 100vh;
            overflow: auto;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        .header-label {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #283054;
            margin-bottom: 30px;
            padding: 10px;
            width: 100%;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 40px;
            padding: 20px;
            position: relative;
            min-height: 600px;
        }
        
        .layers-section {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            min-height: 500px;
            margin-left: 0px;
        }
        
        .concentric-circles {
            position: relative;
            width: 500px;
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #722F37;
        }
        
        .circle {
            position: absolute;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px solid red;
        }
        
        .circle-dot {
            position: absolute;
            width: 3px;
            height: 3px;
            background-color: red;
            border-radius: 50%;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .circle-1 {
            width: 500px;
            height: 500px;
            background-color: #B0E0E6;
            z-index: 1;
        }
        
        .circle-2 {
            width: 400px;
            height: 400px;
            background-color: #20B2AA;
            z-index: 2;
            transform: translateY(50px);
        }
        
        .circle-3 {
            width: 300px;
            height: 300px;
            background-color: #9370DB;
            z-index: 3;
            transform: translateY(100px);
        }
        
        .circle-4 {
            width: 200px;
            height: 200px;
            background-color: #4682B4;
            z-index: 4;
            transform: translateY(150px);
        }
        
        .circle-5 {
            width: 120px;
            height: 120px;
            background-color: #C7D5E0;
            z-index: 5;
            transform: translateY(190px);
        }
        
        .circle-label {
            font-weight: bold;
            font-size: 14px;
            text-align: center;
            color: #722F37;
            margin-top: 10px;
        }
        
        .circle-1 .circle-label {
            transform: translateY(-210px);
        }
        
        .circle-2 .circle-label {
            transform: translateY(-160px);
        }
        
        .circle-3 .circle-label {
            transform: translateY(-100px);
        }
        
        .circle-4 .circle-label {
            transform: translateY(-65px);
        }
        
        .circle-5 .circle-label {
            color: #722F37;
            font-size: 12px;
        }
        
        .data-label {
            font-size: 12px;
            color: white;
            margin-top: 5px;
        }
        
        .labels-section {
            flex: 0 0 300px;
            display: flex;
            flex-direction: column;
            gap: 40px;
            padding: 20px;
            justify-content: center;
        }
        
        .label-item {
            font-size: 14px;
            color: #283054;
            padding: 8px;
            background-color: #f5f5f5;
            border-radius: 4px;
            text-align: left;
        }
        
        .labels-section .label-item:first-child {
            font-weight: bold;
        }
        
        .risk-section {
            flex: 0 0 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 20px;
            transform: rotate(180deg);
        }
        
        .risk-cone {
            width: 80px;
            height: 400px;
            position: relative;
            margin-bottom: 10px;
        }
        
        .risk-cone-gradient {
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, #B0E0E6 0%, #20B2AA 25%, #9370DB 50%, #4682B4 75%, #283054 100%);
            clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        }
        
        .risk-arrow {
            position: absolute;
            right: -30px;
            top: 50%;
            transform: translateY(-50%) rotate(180deg);
            font-size: 24px;
            color: red;
        }
        
        .risk-label {
            font-size: 20px;
            font-weight: bold;
            color: red;
            text-align: center;
            margin-top: 10px;
            transform: rotate(180deg);
        }
        
        .tooltip-container {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: white;
            border-top: 2px solid red;
            padding: 15px;
            z-index: 1000;
            display: none;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .tooltip-container.show {
            display: block;
        }
        
        .tooltip-title {
            display: none;
        }
        
        .tooltip-description {
            font-size: 16px;
            color: #283054;
            text-align: left;
            line-height: 1;
            margin: 0;
            padding: 0;
        }
        
        .tooltip-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #283054;
        }
        
        .clickable-element {
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="header-label">SaaS Defence-in-Depth</div>
    
    <div class="main-container">
        <!-- Concentric Circles Section -->
        <div class="layers-section">
            <div class="concentric-circles clickable-element" id="concentric-circles-element">
                <!-- Circle 1: Administrative Controls -->
                <div class="circle circle-1">
                    <div class="circle-dot"></div>
                    <div class="circle-label">Administrative Controls</div>
                </div>
                
                <!-- Circle 2: Physical Controls -->
                <div class="circle circle-2">
                    <div class="circle-dot"></div>
                    <div class="circle-label">Physical Controls</div>
                </div>
                
                <!-- Circle 3: Operational Controls -->
                <div class="circle circle-3">
                    <div class="circle-dot"></div>
                    <div class="circle-label">Operational Controls</div>
                </div>
                
                <!-- Circle 4: Technical Controls -->
                <div class="circle circle-4">
                    <div class="circle-dot"></div>
                    <div class="circle-label">Technical Controls</div>
                </div>
                
                <!-- Circle 5: SaaS Infrastructure & Client Data -->
                <div class="circle circle-5">
                    <div class="circle-dot"></div>
                    <div class="circle-label">SaaS Infrastructure & Client Data</div>
                </div>
            </div>
        </div>
        
        <!-- Labels Section -->
        <div class="labels-section">
            <div class="label-item">EXAMPLES</div>
            <div class="label-item">Background checks, vetting</div>
            <div class="label-item">'Clean' Rooms, Smart Cards, CCTV, Guards</div>
            <div class="label-item">Deny by Default, Privileged Identity & Access Mgmt.</div>
            <div class="label-item">Private Networks, Isolation, WAFs, anti-DDOS, DLP</div>
            <div class="label-item">Database Encryption</div>
        </div>
        
        <!-- Residual Risk Reduction Section -->
        <div class="risk-section clickable-element" id="residual-risk-element">
            <div class="risk-cone">
                <div class="risk-cone-gradient"></div>
                <div class="risk-arrow">↓</div>
            </div>
            <div class="risk-label">Residual risk reduction</div>
        </div>
    </div>
    
    <!-- Tooltip Container -->
    <div class="tooltip-container" id="tooltip-container">
        <button class="tooltip-close" id="tooltip-close">&times;</button>
        <div class="tooltip-title" id="tooltip-title"></div>
        <div class="tooltip-description" id="tooltip-description"></div>
    </div>
    
    <script>
        (function() {
            const TooltipConfig = function(title, description, position) {
                this.title = title;
                this.description = description;
                this.position = position;
            };
            
            const tooltips = [
                new TooltipConfig(
                    'Concentric Circles',
                    'We implement our security controls in a defence in depth security model. This avoids the reliance on a single control and compensates if one should fail. Each of these layers could go into more detail but this "Onion" model helps illustrate the key concepts. Zero Trust works on the principle that nothing should be trusted and should always be verified. Within this idea there are several technologies and best practices that make up a Zero Trust approach. Here are a few of the main principles: * Least-privilege access, which means only allowing access to the information each individual needs. This limits the ability of malware to jump from one system to another and reduces the chances of internal data exfiltration. * Micro-segmentation divides up a network into separate segments with different access credentials. This increases the means of protection and keeps bad actors from running rampant through the network even if one segment is breached. * Data usage controls limit what people can do with data once they are given access. Increasingly, this is done dynamically, such as revoking permission to copy already-downloaded data off.',
                    'bottom'
                ),
                new TooltipConfig(
                    'Residual Risk',
                    'Results in material reduction in overall risk. 1. Reducing the likelihood of possible compromise 2. By reducing the available attack surface that can be exploited So, to mitigate this risk, Temenos has adopted the Zero Trust approach which takes away access from anyone and everyone until the network can be certain who you are. Then, continuously monitors the user and system activities and potentially revokes permissions to copy that data elsewhere',
                    'bottom'
                )
            ];
            
            const tooltipContainer = document.getElementById('tooltip-container');
            const tooltipTitle = document.getElementById('tooltip-title');
            const tooltipDescription = document.getElementById('tooltip-description');
            const tooltipClose = document.getElementById('tooltip-close');
            
            function showTooltip(config) {
                if (tooltipTitle && tooltipDescription && tooltipContainer) {
                    tooltipTitle.textContent = config.title;
                    tooltipDescription.textContent = config.description;
                    tooltipContainer.classList.add('show');
                }
            }
            
            function hideTooltip() {
                if (tooltipContainer) {
                    tooltipContainer.classList.remove('show');
                }
            }
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initTooltips);
            } else {
                initTooltips();
            }
            
            function initTooltips() {
                // Add click handlers
                const concentricCirclesElement = document.getElementById('concentric-circles-element');
                if (concentricCirclesElement) {
                    concentricCirclesElement.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showTooltip(tooltips[0]);
                    });
                }
                
                const residualRiskElement = document.getElementById('residual-risk-element');
                if (residualRiskElement) {
                    residualRiskElement.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showTooltip(tooltips[1]);
                    });
                }
                
                // Close tooltip handler
                if (tooltipClose) {
                    tooltipClose.addEventListener('click', function(e) {
                        e.stopPropagation();
                        hideTooltip();
                    });
                }
                
                // Close tooltip when clicking outside
                document.addEventListener('click', function(e) {
                    if (tooltipContainer && tooltipContainer.classList.contains('show')) {
                        const target = e.target;
                        if (!tooltipContainer.contains(target) && 
                            !concentricCirclesElement?.contains(target) && 
                            !residualRiskElement?.contains(target)) {
                            hideTooltip();
                        }
                    }
                });
            }
        })();
    </script>
</body>
</html>`

// SaaS Cloud Segregation HTML Content
const SaaSCloudSegregationHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS Cloud Segregation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }
        
        .container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            padding: 80px 40px 40px 40px;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .columns-container {
            display: flex;
            justify-content: space-around;
            align-items: flex-start;
            gap: 30px;
            flex: 1;
            padding: 20px 0;
        }
        
        .column {
            flex: 1;
            border: 3px solid #9333ea;
            border-radius: 12px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #ffffff;
            min-height: 500px;
            max-width: 400px;
        }
        
        .icon-container {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .icon-cloud {
            width: 80px;
            height: 60px;
            background: transparent;
            border: 3px solid #333;
            border-radius: 50px 50px 0 0;
            position: relative;
        }
        
        .icon-cloud::before {
            content: '';
            position: absolute;
            width: 50px;
            height: 50px;
            background: transparent;
            border: 3px solid #333;
            border-radius: 50px;
            top: -25px;
            left: 10px;
        }
        
        .icon-cloud::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 40px;
            background: transparent;
            border: 3px solid #333;
            border-radius: 50px;
            top: -20px;
            right: 10px;
        }
        
        .icon-network {
            width: 80px;
            height: 80px;
            position: relative;
        }
        
        .network-node {
            position: absolute;
            width: 20px;
            height: 20px;
            background: #333;
            border-radius: 50%;
        }
        
        .network-node-1 {
            top: 0;
            left: 30px;
        }
        
        .network-node-2 {
            top: 20px;
            left: 10px;
        }
        
        .network-node-3 {
            top: 20px;
            right: 10px;
        }
        
        .network-node-4 {
            top: 40px;
            left: 20px;
        }
        
        .network-node-5 {
            top: 40px;
            right: 20px;
        }
        
        .network-node-6 {
            bottom: 0;
            left: 30px;
        }
        
        .network-line {
            position: absolute;
            background: #333;
            height: 2px;
        }
        
        .network-line-1 {
            width: 30px;
            top: 10px;
            left: 30px;
            transform: rotate(25deg);
        }
        
        .network-line-2 {
            width: 30px;
            top: 10px;
            right: 30px;
            transform: rotate(-25deg);
        }
        
        .network-line-3 {
            width: 25px;
            top: 30px;
            left: 20px;
            transform: rotate(45deg);
        }
        
        .network-line-4 {
            width: 25px;
            top: 30px;
            right: 20px;
            transform: rotate(-45deg);
        }
        
        .network-line-5 {
            width: 20px;
            top: 50px;
            left: 30px;
        }
        
        .icon-database {
            width: 60px;
            height: 80px;
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .database-cylinder {
            width: 60px;
            height: 20px;
            background: #333;
            border-radius: 10px 10px 0 0;
            position: relative;
        }
        
        .database-cylinder::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 0;
            width: 60px;
            height: 15px;
            background: #333;
            border-radius: 0 0 10px 10px;
        }
        
        .title-box {
            background: #14B8A6;
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 20px;
            text-align: center;
            width: 100%;
        }
        
        .main-statement {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 20px;
            text-align: left;
            width: 100%;
        }
        
        .examples-list {
            list-style-type: disc;
            padding-left: 25px;
            font-size: 14px;
            color: #333;
            line-height: 1.8;
            width: 100%;
            text-align: left;
        }
        
        .examples-list li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-label">Temenos SaaS Cloud Segregation</div>
        
        <div class="columns-container">
            <!-- Column 1: Cloud Subscription -->
            <div class="column">
                <div class="icon-container">
                    <div class="icon-cloud"></div>
                </div>
                <div class="title-box">Cloud Subscription</div>
                <div class="main-statement">
                    Different cloud subscriptions within the Temenos Cloud EA can be used to segregate data:
                </div>
                <ul class="examples-list">
                    <li>Internal Temenos activities from Client services</li>
                    <li>Separation of client services for different access control</li>
                </ul>
            </div>
            
            <!-- Column 2: Network -->
            <div class="column">
                <div class="icon-container">
                    <div class="icon-network">
                        <div class="network-node network-node-1"></div>
                        <div class="network-node network-node-2"></div>
                        <div class="network-node network-node-3"></div>
                        <div class="network-node network-node-4"></div>
                        <div class="network-node network-node-5"></div>
                        <div class="network-node network-node-6"></div>
                        <div class="network-line network-line-1"></div>
                        <div class="network-line network-line-2"></div>
                        <div class="network-line network-line-3"></div>
                        <div class="network-line network-line-4"></div>
                        <div class="network-line network-line-5"></div>
                    </div>
                </div>
                <div class="title-box">Network</div>
                <div class="main-statement">
                    Virtual networks and subnets can be used to segregate data with NSG defining access controls between subnets:
                </div>
                <ul class="examples-list">
                    <li>Production and non-production services</li>
                    <li>Network tiers - DMZ, Application and Data tiers</li>
                    <li>Public and private channels</li>
                </ul>
            </div>
            
            <!-- Column 3: Database -->
            <div class="column">
                <div class="icon-container">
                    <div class="icon-database">
                        <div class="database-cylinder"></div>
                        <div class="database-cylinder"></div>
                        <div class="database-cylinder"></div>
                    </div>
                </div>
                <div class="title-box">Database</div>
                <div class="main-statement">
                    Database segregation can be used to segregate data.
                </div>
                <ul class="examples-list">
                    <li>Different data stores for different environments</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`

// SaaS Access Data HTML Content
const SaaSAccessDataHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS Access Data</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-content {
            flex: 1;
            padding: 80px 60px 120px 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .main-point {
            margin-bottom: 40px;
        }
        
        .main-point-title {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
            padding-left: 30px;
            position: relative;
        }
        
        .main-point-title::before {
            content: '•';
            position: absolute;
            left: 0;
            font-size: 24px;
            color: #000;
        }
        
        .sub-point {
            font-size: 16px;
            color: #333;
            padding-left: 50px;
            margin-top: 10px;
        }
        
        .sub-point .temenos-red {
            color: #000;
            text-decoration: underline;
            text-decoration-style: dotted;
            text-decoration-color: #ff0000;
            text-underline-offset: 3px;
        }
        
        .separator-line {
            width: 100%;
            height: 2px;
            background: #14B8A6;
            margin: 30px 0;
        }
        
        .footer-bar {
            background: #14B8A6;
            color: #ffffff;
            padding: 20px 40px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
        }
        
        .footer-bar .temenos-red {
            text-decoration: underline;
            text-decoration-style: dotted;
            text-decoration-color: #ff0000;
            text-underline-offset: 3px;
        }
        
        .action-button {
            position: absolute;
            bottom: 80px;
            right: 20px;
            background: #ff0000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 1001;
        }
        
        .action-button:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos SaaS Access Data</div>
    
    <div class="main-content">
        <div class="main-point">
            <div class="main-point-title">Application (Transact, Wealth, Digital, etc.)</div>
            <div class="sub-point">Client Controls the access</div>
        </div>
        
        <div class="separator-line"></div>
        
        <div class="main-point">
            <div class="main-point-title">Infrastructure (DB, Network Connections, API Gateway etc.)</div>
            <div class="sub-point"><span class="temenos-red">Temenos</span> Access and Identity Management (Cloud command centre, NOC and SOC)</div>
        </div>
    </div>
    
    <div class="footer-bar">
        NO ONE IN <span class="temenos-red">TEMENOS</span> HAS ACCESS TO CLIENT DATA BY DEFAULT
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showSaaSAccessData'}, '*');">SaaS Data Access Control</button>
</body>
</html>`

// SaaS Data Access Control HTML Content
const SaaSDataAccessControlHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS Data Access Control</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .section-1 {
            background: #ADD8E6;
            padding: 60px 40px 30px 40px;
            flex: 0 0 auto;
        }
        
        .section-1-title {
            font-size: 20px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .section-1-content {
            display: flex;
            gap: 40px;
            justify-content: space-around;
        }
        
        .section-1-left,
        .section-1-right {
            flex: 1;
        }
        
        .section-1-left p {
            font-size: 16px;
            color: #000;
            margin-bottom: 15px;
        }
        
        .section-1-bullets {
            list-style-type: disc;
            padding-left: 25px;
            font-size: 16px;
            color: #000;
            line-height: 1.8;
        }
        
        .section-1-bullets li {
            margin-bottom: 8px;
        }
        
        .section-2 {
            background: #E6D9FF;
            padding: 30px 40px 100px 40px;
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            position: relative;
        }
        
        .section-2-title {
            font-size: 20px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .section-2-bullets {
            list-style-type: disc;
            padding-left: 25px;
            font-size: 16px;
            color: #000;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        
        .section-2-bullets li {
            margin-bottom: 10px;
        }
        
        .workflow-container {
            position: relative;
            width: 100%;
            height: 400px;
            margin-top: 20px;
            margin-bottom: 40px;
        }
        
        .workflow-box {
            position: absolute;
            background: #1E3A8A;
            color: #ffffff;
            padding: 15px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            min-width: 150px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .workflow-box-1 {
            top: 0;
            left: 50px;
        }
        
        .workflow-box-2 {
            top: 120px;
            left: 50px;
        }
        
        .workflow-box-3 {
            top: 240px;
            left: 50px;
        }
        
        .workflow-box-4 {
            top: 240px;
            left: 350px;
        }
        
        .workflow-box-5 {
            top: 120px;
            left: 350px;
        }
        
        .workflow-box-6 {
            top: 0;
            left: 350px;
        }
        
        .workflow-box-7 {
            top: 0;
            left: 650px;
        }
        
        .workflow-arrow {
            position: absolute;
            stroke: #9333ea;
            stroke-width: 3;
            fill: none;
            marker-end: url(#arrowhead-purple);
        }
        
        .audit-label {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 100px;
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 1001;
        }
        
        .action-button:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos SaaS Data Access Control</div>
    
    <!-- Section 1: 24x7 Cloud Command Centre -->
    <div class="section-1">
        <div class="section-1-title">24x7 Cloud Command Centre</div>
        <div class="section-1-content">
            <div class="section-1-left">
                <p>Real-time monitoring to provide:</p>
                <ul class="section-1-bullets">
                    <li>Infrastructure Support;</li>
                    <li>Application Support;</li>
                </ul>
            </div>
            <div class="section-1-right">
                <ul class="section-1-bullets">
                    <li>Operation and management of performance tools.</li>
                    <li>Collection and reporting of performance & availability events and trends;</li>
                    <li>Responding to performance incidents</li>
                </ul>
            </div>
        </div>
    </div>
    
    <!-- Section 2: Privileged Identity Management (PIM) -->
    <div class="section-2">
        <div class="section-2-title">Privileged Identity Management (PIM)</div>
        <ul class="section-2-bullets">
            <li>Leveraged for infra support users requiring higher privilege login for support and management</li>
            <li>Access Control is governed by the Cloud Security Team.</li>
            <li>Default no access to client data, least privilege policy.</li>
            <li>All access requests tracked in Temenos Service Desk.</li>
            <li>Infrastructure access is time restricted based on a specific business justification</li>
            <li>Daily reports from the Temenos Service Desk Ticketing System for monitoring</li>
            <li>Access is subject to the following approval workflow* :</li>
        </ul>
        
        <div class="workflow-container">
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
                <defs>
                    <marker id="arrowhead-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#9333ea" />
                    </marker>
                </defs>
                
                <!-- Arrow from workflow-box-1 to workflow-box-2 (bottom center to top center) -->
                <line x1="125" y1="50" x2="125" y2="120" stroke="#9333ea" stroke-width="4" fill="none" marker-end="url(#arrowhead-purple)" />
                
                <!-- Arrow from workflow-box-2 to workflow-box-3 (bottom center to top center) -->
                <line x1="125" y1="170" x2="125" y2="240" stroke="#9333ea" stroke-width="4" fill="none" marker-end="url(#arrowhead-purple)" />
                
                <!-- Arrow from workflow-box-3 to workflow-box-4 (right center to left center) -->
                <line x1="200" y1="265" x2="350" y2="265" stroke="#9333ea" stroke-width="4" fill="none" marker-end="url(#arrowhead-purple)" />
                
                <!-- Arrow from workflow-box-4 to workflow-box-5 (top center to bottom center) -->
                <line x1="425" y1="240" x2="425" y2="170" stroke="#9333ea" stroke-width="4" fill="none" marker-end="url(#arrowhead-purple)" />
                
                <!-- Arrow from workflow-box-5 to workflow-box-6 (top center to bottom center) -->
                <line x1="425" y1="120" x2="425" y2="50" stroke="#9333ea" stroke-width="4" fill="none" marker-end="url(#arrowhead-purple)" />
                
                <!-- Arrow from workflow-box-6 to workflow-box-7 (right center to left center) -->
                <line x1="500" y1="25" x2="650" y2="25" stroke="#9333ea" stroke-width="4" fill="none" marker-end="url(#arrowhead-purple)" />
            </svg>
            
            <div class="workflow-box workflow-box-1" style="z-index: 2;">Access Requested</div>
            <div class="workflow-box workflow-box-2" style="z-index: 2;">Cloud Review</div>
            <div class="workflow-box workflow-box-3" style="z-index: 2;">Security Review</div>
            <div class="workflow-box workflow-box-4" style="z-index: 2;">Entitlement Granted</div>
            <div class="workflow-box workflow-box-5" style="z-index: 2;">Role Activated</div>
            <div class="workflow-box workflow-box-6" style="z-index: 2;">Work Commences</div>
            <div class="workflow-box workflow-box-7" style="z-index: 2;">Role Expires / Deactivated</div>
        </div>
        
        <div class="audit-label">*As audited under SOC2, CAIQ</div>
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showPAM'}, '*');">Privileged Access Management PAM</button>
</body>
</html>`

// SaaS PAM HTML Content
const SaaSPAMHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS Privileged Access Management (PAM)</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 80px 40px 100px 40px;
            gap: 20px;
        }
        
        .left-section {
            flex: 1;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .left-section .bullet-list {
            max-width: 100%;
        }
        
        .bullet-list {
            list-style-type: disc;
            padding-left: 25px;
            font-size: 16px;
            color: #000;
            line-height: 2;
        }
        
        .bullet-list li {
            margin-bottom: 15px;
        }
        
        .right-section {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            width: 100%;
        }
        
        .concentric-circles {
            position: relative;
            width: 800px;
            height: 400px;
        }
        
        .circle {
            position: absolute;
            border-radius: 50%;
            border: 3px solid #000;
        }
        
        .circle-1 {
            width: 400px;
            height: 400px;
            top: 0;
            left: 0;
            background: #14B8A6;
            border-color: #000;
        }
        
        .circle-2 {
            width: 320px;
            height: 320px;
            top: 40px;
            left: 40px;
            background: #1E3A8A;
            border-color: #000;
        }
        
        .circle-3 {
            width: 240px;
            height: 240px;
            top: 80px;
            left: 80px;
            background: #14B8A6;
            border-color: #000;
        }
        
        .circle-4 {
            width: 160px;
            height: 160px;
            top: 120px;
            left: 120px;
            background: #1E3A8A;
            border-color: #000;
        }
        
        .circle-5 {
            width: 80px;
            height: 80px;
            top: 160px;
            left: 160px;
            background: #ffffff;
            border-color: #000;
        }
        
        .center-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #ffffff;
            border-radius: 50%;
            top: 196px;
            left: 196px;
            z-index: 10;
        }
        
        .circle-label {
            position: absolute;
            font-size: 16px;
            color: #8B00FF;
            font-weight: bold;
        }
        
        .circle-label-1 {
            left: 420px;
            top: 180px;
        }
        
        .circle-label-2 {
            left: 420px;
            top: 140px;
        }
        
        .circle-label-3 {
            left: 420px;
            top: 100px;
            font-weight: bold;
        }
        
        .circle-label-4 {
            left: 420px;
            top: 60px;
        }
        
        .circle-label-5 {
            left: 420px;
            top: 20px;
        }
        
        .connecting-line {
            position: absolute;
            stroke: #000;
            stroke-width: 2;
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 1001;
        }
        
        .action-button:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos SaaS Privileged Access Management (PAM)</div>
    
    <div class="main-container">
        <!-- Left Section: Bullet Points -->
        <div class="left-section">
            <ul class="bullet-list">
                <li>PAMS for support users with higher privileges</li>
                <li>Strict access control and network boundary to SaaS service components</li>
                <li>Operational access to client environments and infrastructure controlled via PIM/PAM using Azure Entra and MFA authentication</li>
                <li>Administrative access controlled via Delinea / CyberArk platform from Temenos Cloud Operations</li>
                <li>All users' sessions are recorded and auditable</li>
                <li>All production cloud infrastructure is security monitored by the SOC</li>
                <li>Monitored Data Loss Prevention on all endpoints within Temenos</li>
            </ul>
        </div>
        
        <!-- Right Section: Concentric Circles -->
        <div class="right-section">
            <div class="concentric-circles">
                <svg width="800" height="400" style="position: absolute; top: 0; left: 0; z-index: 1;">
                    <!-- Connecting lines from circles to labels -->
                    <line x1="400" y1="200" x2="420" y2="200" stroke="#ff0000" stroke-width="2" />
                    <line x1="320" y1="160" x2="420" y2="160" stroke="#ff0000" stroke-width="2" />
                    <line x1="240" y1="120" x2="420" y2="120" stroke="#ff0000" stroke-width="2" />
                    <line x1="160" y1="80" x2="420" y2="80" stroke="#ff0000" stroke-width="2" />
                    <line x1="200" y1="200" x2="420" y2="40" stroke="#ff0000" stroke-width="2" />
                </svg>
                
                <div class="circle circle-1"></div>
                <div class="circle circle-2"></div>
                <div class="circle circle-3"></div>
                <div class="circle circle-4"></div>
                <div class="circle circle-5"></div>
                <div class="center-dot"></div>
                
                <div class="circle-label circle-label-1">SaaS Environment</div>
                <div class="circle-label circle-label-2">Azure Sentinel Security Monitoring</div>
                <div class="circle-label circle-label-3">Privileged Access Management</div>
                <div class="circle-label circle-label-4">Privileged Identity Management</div>
                <div class="circle-label circle-label-5">Temenos Cloud Operations</div>
            </div>
        </div>
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showProtectCriticalAssets'}, '*');">Protect Critical Assets</button>
</body>
</html>`

// Protect Assets HTML Content
const ProtectAssetsHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Protect Assets</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-container {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 2px;
            padding: 80px 20px 20px 20px;
            background: #000;
        }
        
        .section {
            background: #ffffff;
            padding: 20px;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .section-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .section-number {
            font-size: 24px;
            font-weight: bold;
            margin-right: 15px;
            min-width: 30px;
        }
        
        .section-description {
            font-size: 16px;
            color: #000;
            line-height: 1;
            flex: 1;
        }
        
        .section-measures {
            list-style-type: disc;
            padding-left: 45px;
            font-size: 14px;
            color: #000;
            line-height: 1;
        }
        
        .section-measures li {
            margin-bottom: 0;
        }
        
        .section-1 {
            border-left: 4px solid #ff0000;
        }
        
        .section-1 .section-number {
            color: #ff0000;
        }
        
        .section-2 {
            border-left: 4px solid #ff8c00;
        }
        
        .section-2 .section-number {
            color: #ff8c00;
        }
        
        .section-content-wrapper {
            margin-top: auto;
        }
        
        .section-3 {
            border-left: 4px solid #ffd700;
        }
        
        .section-3 .section-header {
            margin-bottom: 0;
        }
        
        .section-3 .section-measures {
            margin-top: 0;
        }
        
        .section-3 .section-number {
            color: #ffd700;
        }
        
        .section-4 {
            border-left: 4px solid #1E3A8A;
        }
        
        .section-4 .section-header {
            margin-bottom: 0;
        }
        
        .section-4 .section-measures {
            margin-top: 0;
        }
        
        .section-4 .section-number {
            color: #1E3A8A;
        }
        
        .concentric-circles-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
        }
        
        .concentric-circles {
            position: relative;
            width: 200px;
            height: 200px;
        }
        
        .circle {
            position: absolute;
            border-radius: 50%;
            border: 2px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .circle-1 {
            width: 53px;
            height: 53px;
            top: 73px;
            left: 73px;
            background: #ff0000;
        }
        
        .circle-2 {
            width: 93px;
            height: 93px;
            top: 53px;
            left: 53px;
            background: #ff8c00;
        }
        
        .circle-3 {
            width: 133px;
            height: 133px;
            top: 33px;
            left: 33px;
            background: #ffd700;
        }
        
        .circle-4 {
            width: 200px;
            height: 200px;
            top: 0;
            left: 0;
            background: #1E3A8A;
        }
        
        .circle-number {
            position: absolute;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
        }
        
        .circle-1 .circle-number {
            bottom: 5px;
            left: 5px;
        }
        
        .circle-2 .circle-number {
            bottom: 10px;
            left: 10px;
        }
        
        .circle-3 .circle-number {
            bottom: 15px;
            left: 15px;
        }
        
        .circle-4 .circle-number {
            bottom: 25px;
            left: 25px;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos Protect Assets</div>
    
    <div class="main-container">
        <!-- Section 1: Client data -->
        <div class="section section-1">
            <div class="section-header">
                <div class="section-number">1</div>
                <div class="section-description">Access is strictly limited, audited, lifecycle managed, and encrypted.</div>
            </div>
            <ul class="section-measures">
                <li>Data scrambling present in Temenos Products</li>
                <li>TDE implemented for Hyperscaler DB</li>
                <li>Options include leveraging third-party integration (exate)</li>
            </ul>
        </div>
        
        <!-- Section 2: Compute Infrastructure -->
        <div class="section section-2">
            <div class="section-header">
                <div class="section-number">2</div>
                <div class="section-description">Built to secure standards, vulnerabilities minimized, access restricted.</div>
            </div>
            <ul class="section-measures">
                <li>Minimizing privileges in Cloud Operations</li>
                <li>Preventing Public Exposure of Services</li>
                <li>Logging Standards to improve incident detection/response</li>
            </ul>
        </div>
        
        <!-- Section 3: Cloud Operations -->
        <div class="section section-3">
            <div class="section-content-wrapper">
                <div class="section-header">
                    <div class="section-number">3</div>
                    <div class="section-description">Safe operating environment, mature processes, highly available.</div>
                </div>
                <ul class="section-measures">
                    <li>Cloud Operations networks segregated from Corporate</li>
                    <li>Standard operating procedures in place</li>
                    <li>Enhancing Cloud Operations Processes</li>
                </ul>
            </div>
        </div>
        
        <!-- Section 4: Temenos Corporate IT -->
        <div class="section section-4">
            <div class="section-content-wrapper">
                <div class="section-header">
                    <div class="section-number">4</div>
                    <div class="section-description">Safe development to protect integrity of product and operations.</div>
                </div>
                <ul class="section-measures">
                    <li>Last-generation authentication standards</li>
                    <li>Network and servers centrally managed</li>
                    <li>Consistent approach to security controls, change management, patching or monitoring</li>
                </ul>
            </div>
        </div>
        
        <!-- Concentric Circles Graphic -->
        <div class="concentric-circles-container">
            <div class="concentric-circles">
                <div class="circle circle-4">
                    <div class="circle-number">4</div>
                </div>
                <div class="circle circle-3">
                    <div class="circle-number">3</div>
                </div>
                <div class="circle circle-2">
                    <div class="circle-number">2</div>
                </div>
                <div class="circle circle-1">
                    <div class="circle-number">1</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

// Product Security Uniform HTML Content
const ProductSecurityUniformHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Product Security Uniform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            padding: 80px 40px 100px 40px;
            gap: 40px;
            height: 100%;
        }
        
        .left-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding-right: 20px;
        }
        
        .bullet-list {
            list-style: none;
            padding: 0;
        }
        
        .bullet-list li {
            position: relative;
            padding-left: 30px;
            margin-bottom: 25px;
            font-size: 16px;
            color: #1a1a1a;
            line-height: 1.5;
        }
        
        .bullet-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #1a1a1a;
            font-size: 20px;
            font-weight: bold;
        }
        
        .red-underline {
            text-decoration: underline;
            text-decoration-style: dotted;
            text-decoration-color: #ff0000;
            text-underline-offset: 3px;
        }
        
        .right-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            padding-left: 20px;
        }
        
        .documents-container {
            position: relative;
            width: 100%;
            max-width: 500px;
            height: 600px;
        }
        
        .document-cover {
            position: absolute;
            width: 400px;
            height: 550px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        
        .document-cover-top {
            right: 0;
            top: 0;
            z-index: 2;
        }
        
        .document-cover-bottom {
            left: 0;
            bottom: 0;
            z-index: 1;
        }
        
        .blue-shape {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60%;
            height: 70%;
            background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
            clip-path: polygon(0 100%, 0 40%, 100% 0, 100% 100%);
        }
        
        .document-content {
            position: relative;
            z-index: 10;
            padding: 40px 30px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .temenos-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 14px;
            color: #1a1a1a;
            font-weight: normal;
            text-transform: lowercase;
        }
        
        .document-title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 15px;
            margin-top: 40px;
        }
        
        .document-subtitle {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        
        .document-date {
            font-size: 14px;
            color: #1a1a1a;
            margin-bottom: auto;
        }
        
        .document-disclaimer {
            position: absolute;
            bottom: 15px;
            right: 20px;
            font-size: 8px;
            color: #ffffff;
            line-height: 1.2;
            max-width: 200px;
            text-align: right;
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos Product Security Uniform</div>
    
    <div class="main-container">
        <!-- Left Section: Text Content -->
        <div class="left-section">
            <ul class="bullet-list">
                <li>Fostering transparency and clarity in <span class="red-underline">Temenos</span>' client interactions.</li>
                <li>Serve as the foundation for understanding the services provided, obligations, and rights of both parties involved.</li>
                <li>Provide a clear and consistent guidance and structure for all interactions would have with <span class="red-underline">Temenos</span>.</li>
                <li>With <span class="red-underline">standardized</span> terms, the Bank can confidently navigate <span class="red-underline">Temenos</span> services, knowing exactly what to expect and easily understanding <span class="red-underline">Temenos</span> policies.</li>
            </ul>
        </div>
        
        <!-- Right Section: Document Covers -->
        <div class="right-section">
            <div class="documents-container">
                <!-- Bottom Document Cover (Left) -->
                <div class="document-cover document-cover-bottom">
                    <div class="blue-shape"></div>
                    <div class="document-content">
                        <div class="temenos-logo">temenos</div>
                        <div class="document-title">Temenos Cloud Services</div>
                        <div class="document-subtitle">Security Uniform Terms</div>
                        <div class="document-date">31 March 2024</div>
                        <div class="document-disclaimer">
                            Information in this document is subject to change without notice.<br>
                            © 2024 Temenos Headquarters SA - all rights reserved.<br>
                            TEMENOS Security Uniform Terms v1.0
                        </div>
                    </div>
                </div>
                
                <!-- Top Document Cover (Right) -->
                <div class="document-cover document-cover-top">
                    <div class="blue-shape"></div>
                    <div class="document-content">
                        <div class="temenos-logo">temenos</div>
                        <div class="document-title">Temenos Cloud Services</div>
                        <div class="document-subtitle">Business Continuity Uniform Terms</div>
                        <div class="document-date">31 March 2024</div>
                        <div class="document-disclaimer">
                            Information in this document is subject to change without notice.<br>
                            © 2024 Temenos Headquarters SA - all rights reserved.<br>
                            TEMENOS Business Continuity Uniform Terms v1.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showSecurityEventsFeed'}, '*');">Security Events Feed</button>
</body>
</html>`

// Security Event Feed HTML Content
const SecurityEventFeedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Product Security Uniform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .diagram-container {
            flex: 1;
            padding: 80px 40px 100px 40px;
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .temenos-cloud {
            position: absolute;
            left: 40px;
            top: 50%;
            transform: translateY(-50%);
            width: 250px;
            height: 500px;
            border: 4px solid #9333ea;
            border-radius: 8px;
            background: #ffffff;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .temenos-cloud-label {
            font-size: 16px;
            font-weight: bold;
            color: #9333ea;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .cloud-layer {
            width: 100%;
            height: 60px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #1a1a1a;
        }
        
        .azure-services {
            position: absolute;
            left: 350px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        
        .azure-service-box {
            width: 280px;
            height: 80px;
            background: #b3d9ff;
            border: 2px solid #4a90e2;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #1a1a1a;
            text-align: center;
            padding: 10px;
        }
        
        .azure-monitor {
            position: absolute;
            left: 680px;
            top: 50%;
            transform: translateY(-50%);
            width: 100px;
            height: 100px;
        }
        
        .monitor-gauge {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                from 0deg,
                #22c55e 0deg 120deg,
                #eab308 120deg 240deg,
                #f97316 240deg 360deg
            );
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .monitor-needle {
            position: absolute;
            width: 3px;
            height: 35px;
            background: #1a1a1a;
            transform-origin: bottom center;
            transform: rotate(45deg);
            bottom: 50%;
            left: 50%;
            margin-left: -1.5px;
        }
        
        .monitor-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            font-weight: bold;
            color: #1a1a1a;
            white-space: nowrap;
        }
        
        .event-hub {
            position: absolute;
            left: 820px;
            top: 50%;
            transform: translateY(-50%);
            width: 200px;
            height: 80px;
            background: #1e3a8a;
            border: 2px solid #1e40af;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #ffffff;
            text-align: center;
            padding: 10px;
        }
        
        .soc-box {
            width: 250px;
            height: 100px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            gap: 8px;
        }
        
        .temenos-soc {
            position: absolute;
            left: 650px;
            bottom: 80px;
            background: #b3d9ff;
            border: 2px solid #4a90e2;
        }
        
        .client-soc {
            position: absolute;
            right: 40px;
            bottom: 80px;
            background: #6b21a8;
            border: 2px solid #7c3aed;
            color: #ffffff;
        }
        
        .soc-label {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        }
        
        .soc-subtitle {
            font-size: 12px;
            text-align: center;
            margin-top: 5px;
        }
        
        .people-icon {
            width: 40px;
            height: 30px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 4px;
            margin-top: 5px;
        }
        
        .person {
            width: 12px;
            height: 20px;
            background: #1a1a1a;
            border-radius: 6px 6px 0 0;
        }
        
        .client-soc .person {
            background: #ffffff;
        }
        
        .arrow-purple {
            stroke: #9333ea;
            stroke-width: 4;
            fill: none;
            marker-end: url(#arrowhead-purple);
        }
        
        .arrow-teal {
            stroke: #14b8a6;
            stroke-width: 4;
            fill: none;
            marker-end: url(#arrowhead-teal);
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:hover {
            background: #cc0000;
        }
        
        .tooltip {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background: #ffffff;
            border: 2px solid #ff0000;
            border-radius: 0;
            padding: 15px 20px;
            font-size: 16px;
            color: #000;
            z-index: 10000;
            max-height: 40vh;
            overflow-y: auto;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
            display: none;
            margin: 0 !important;
            top: auto !important;
            box-sizing: border-box;
            min-height: fit-content;
        }
        
        .tooltip-title {
            display: none;
        }
        
        .tooltip-description {
            line-height: 1;
            margin: 0;
            padding: 0;
            text-align: left;
            font-size: 16px;
            white-space: pre-line;
        }
        
        .tooltip-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff0000;
            color: #ffffff;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        
        .tooltip-close:hover {
            background: #cc0000;
        }
        
        .clickable {
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos Product Security Uniform</div>
    
    <div class="diagram-container">
        <!-- SVG for arrows -->
        <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
            <defs>
                <marker id="arrowhead-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#9333ea" />
                </marker>
                <marker id="arrowhead-teal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#14b8a6" />
                </marker>
            </defs>
            
            <!-- Arrow from Temenos Cloud to Azure Log Analytics -->
            <line x1="290" y1="180" x2="350" y2="180" class="arrow-purple" />
            
            <!-- Arrow from Temenos Cloud to Azure Security Center -->
            <line x1="290" y1="300" x2="350" y2="300" class="arrow-purple" />
            
            <!-- Arrow from Azure Log Analytics to Azure Security Center -->
            <line x1="420" y1="210" x2="420" y2="240" class="arrow-purple" />
            
            <!-- Arrow from Azure Security Center to Azure Sentinel -->
            <line x1="420" y1="320" x2="420" y2="450" class="arrow-purple" />
            
            <!-- Arrow from Azure Sentinel to Temenos SOC -->
            <line x1="730" y1="570" x2="500" y2="530" class="arrow-purple" />
            
            <!-- Arrow from Azure Monitor to Event Hub -->
            <line x1="730" y1="350" x2="820" y2="350" class="arrow-teal" />
            
            <!-- Arrow from Event Hub to Client SOC -->
            <line x1="920" y1="440" x2="1100" y2="570" class="arrow-teal" />
        </svg>
        
        <!-- Temenos Cloud Environment -->
        <div class="temenos-cloud">
            <div class="temenos-cloud-label">Temenos Cloud Environment</div>
            <div class="cloud-layer">Tooling</div>
            <div class="cloud-layer">Applications</div>
            <div class="cloud-layer">Middleware</div>
            <div class="cloud-layer">Database</div>
            <div class="cloud-layer">Operating System</div>
            <div class="cloud-layer">Azure Fabric</div>
        </div>
        
        <!-- Azure Services -->
        <div class="azure-services">
            <div class="azure-service-box" style="margin-top: -100px;">Azure Log Analytics</div>
            <div class="azure-service-box">Azure Security Center</div>
            <div class="azure-service-box clickable" style="margin-top: 100px;" data-tooltip-id="azure-sentinel">Security Incident / Events Management<br>Azure Sentinel (SIEM)</div>
        </div>
        
        <!-- Azure Monitor -->
        <div class="azure-monitor">
            <div class="monitor-gauge">
                <div class="monitor-needle"></div>
            </div>
            <div class="monitor-label">Azure Monitor</div>
        </div>
        
        <!-- Event Hub -->
        <div class="event-hub">Event Hub</div>
        
        <!-- Temenos SOC -->
        <div class="soc-box temenos-soc clickable" data-tooltip-id="temenos-soc">
            <div class="soc-label">Temenos SOC</div>
            <div class="people-icon">
                <div class="person"></div>
                <div class="person"></div>
                <div class="person"></div>
            </div>
        </div>
        
        <!-- Client SOC -->
        <div class="soc-box client-soc">
            <div class="soc-label">Client SOC</div>
            <div class="soc-subtitle">(Splunk and IBM QRadar)</div>
            <div class="people-icon">
                <div class="person"></div>
                <div class="person"></div>
                <div class="person"></div>
            </div>
        </div>
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showNetworkSecurityServices'}, '*');">Network Security Services</button>
    
    <!-- Tooltip -->
    <div id="tooltip" class="tooltip">
        <button class="tooltip-close" onclick="hideTooltip()">×</button>
        <div class="tooltip-title"></div>
        <div class="tooltip-description"></div>
    </div>
    
    <script>
        const tooltips = [
            {
                title: 'Temenos SOC',
                description: '+ SOC \\n\\n24x7 Security Operation Centre where the main responsibilities include: \\n\\n1. Monitoring and detecting anomalies due to either of the following: Violation of information security policy; Threats and attacks to the information landscape from within and outside the organization; Correlation of potential threats across cyber space with vulnerabilities within Temenos environments such that mitigations and appropriate responses can be put in place;\\n\\n2. Operation and management of security tools.\\n\\n3. Collecting, correlating and utilizing cyber threat intelligence data from different sources \\n\\n4. Collection and reporting of security events\\n\\n5. Responding to security incidents\\n\\n+ NOC\\n\\n24x7 Network Operation Centre where the main responsibilities include: \\n\\n1. Real user monitoring \\n\\n2. Patching of all infrastructure, platform and application components\\n\\n3. Capacity management \\n\\n4. IT Service Continuity testing \\n\\n5. Network management, including configuration of firewall, and traffic management\\n\\n6. Real-time monitoring to provide :  1. Application Support;  2. Infrastructure Support; \\n\\n7. Operation and management of performance tools.\\n\\n8. Collection and reporting of performance & availability events and trends;',
                position: 'bottom'
            },
            {
                title: 'Azure Sentinel (SIEM)',
                description: 'SIEM. Used Azure Sentinel\\'s built-in Insecure Protocol Workbook to discover the use of insecure services and protocols. The Security Operations Centre operate a Security Incident and Event Management platform (SIEM) that collects a subsection of logs which are used to detect patterns, look for known malicious activities and signatures, etc.​ Alerts are correlated to gain a big picture understanding of a potential attack or incident.​\\n\\nTemenos provides a SaaS Event Hub service that enables customers to access their application security logs in real time. This service works by collecting logs from the SaaS environment and pushing them into an Event Hub, which the customer can then integrate with their own monitoring or observability tools (e.g., Splunk, Azure Monitor, ELK Stack).\\n\\nThis capability ensures that customers maintain visibility and control over their operational data in production to support their monitoring needs of compliance, troubleshooting and performance.\\n\\nThis service is optional.\\n\\nForwarding logs to local central log repository is done automatically in real time.\\n\\nSecurity logs are reviewed on a daily, weekly and monthly basis as part of security operations activities. All exceptions and anomalies are analyzed and promptly escalated as per the security incident escalation process.',
                position: 'bottom'
            }
        ];
        
        function showTooltip(tooltipId) {
            const tooltip = document.getElementById('tooltip');
            const tooltipDescription = tooltip ? tooltip.querySelector('.tooltip-description') : null;
            
            let config;
            
            if (tooltipId === 'temenos-soc') {
                config = tooltips[0];
            } else if (tooltipId === 'azure-sentinel') {
                config = tooltips[1];
            }
            
            if (config && tooltip && tooltipDescription) {
                tooltipDescription.textContent = config.description.replace(/\\\\n/g, '\\n');
                tooltip.style.display = 'block';
                tooltip.style.position = 'fixed';
                tooltip.style.bottom = '0';
                tooltip.style.left = '0';
                tooltip.style.right = '0';
                tooltip.style.width = '100%';
                tooltip.style.top = 'auto';
                tooltip.style.margin = '0';
            }
        }
        
        function hideTooltip() {
            const tooltip = document.getElementById('tooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        }
        
        // Add click handlers
        document.addEventListener('DOMContentLoaded', function() {
            const clickableElements = document.querySelectorAll('.clickable');
            clickableElements.forEach(function(element) {
                element.addEventListener('click', function() {
                    const tooltipId = this.getAttribute('data-tooltip-id');
                    if (tooltipId) {
                        showTooltip(tooltipId);
                    }
                });
            });
        });
    </script>
</body>
</html>`

// Network Security HTML Content
const NetworkHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS Network Security</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 80px 40px 100px 40px;
            gap: 40px;
        }
        
        .service-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 350px;
        }
        
        .service-icon {
            width: 120px;
            height: 120px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .icon-firewall {
            width: 100px;
            height: 100px;
            position: relative;
        }
        
        .icon-firewall-cloud {
            width: 80px;
            height: 60px;
            background: #4a90e2;
            border-radius: 50px 50px 0 0;
            position: absolute;
            top: 0;
            left: 10px;
        }
        
        .icon-firewall-wall {
            width: 100px;
            height: 30px;
            background: #ff0000;
            position: absolute;
            bottom: 0;
            left: 0;
            border-radius: 4px;
        }
        
        .icon-waf {
            width: 100px;
            height: 100px;
            position: relative;
        }
        
        .icon-waf-globe {
            width: 70px;
            height: 70px;
            border: 4px solid #4a90e2;
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 15px;
        }
        
        .icon-waf-wall {
            width: 100px;
            height: 30px;
            background: #ff0000;
            position: absolute;
            bottom: 0;
            left: 0;
            border-radius: 4px;
        }
        
        .icon-ddos {
            width: 80px;
            height: 80px;
            background: #22c55e;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            position: relative;
        }
        
        .service-name {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .azure-service-box {
            width: 100%;
            background: #9333ea;
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
        }
        
        .description-box {
            width: 100%;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 20px;
            min-height: 150px;
        }
        
        .description-list {
            list-style: none;
            padding: 0;
        }
        
        .description-list li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 12px;
            font-size: 14px;
            color: #1a1a1a;
            line-height: 1.5;
        }
        
        .description-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #1a1a1a;
            font-size: 16px;
            font-weight: bold;
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos SaaS Network Security</div>
    
    <div class="main-container">
        <!-- Column 1: Network Firewall -->
        <div class="service-column">
            <div class="service-icon">
                <div class="icon-firewall">
                    <div class="icon-firewall-cloud"></div>
                    <div class="icon-firewall-wall"></div>
                </div>
            </div>
            <div class="service-name">Network Firewall</div>
            <div class="azure-service-box">Azure Firewall</div>
            <div class="description-box">
                <ul class="description-list">
                    <li>Create firewall rules that provide fine-grained control over network traffic and easily deploy firewall security across multiple VNets.</li>
                    <li>Automatically scales to cover cloud infrastructure</li>
                </ul>
            </div>
        </div>
        
        <!-- Column 2: WAF -->
        <div class="service-column">
            <div class="service-icon">
                <div class="icon-waf">
                    <div class="icon-waf-globe"></div>
                    <div class="icon-waf-wall"></div>
                </div>
            </div>
            <div class="service-name">WAF</div>
            <div class="azure-service-box">Azure WAF</div>
            <div class="description-box">
                <ul class="description-list">
                    <li>Managed WAF solution which protects against common web exploits and bots that can affect availability, compromise security, or consume excessive resources.</li>
                </ul>
            </div>
        </div>
        
        <!-- Column 3: Anti DDoS -->
        <div class="service-column">
            <div class="service-icon">
                <div class="icon-ddos"></div>
            </div>
            <div class="service-name">Anti DDoS</div>
            <div class="azure-service-box">Azure Basic Anti DDoS</div>
            <div class="description-box">
                <ul class="description-list">
                    <li>Provides protection against Distributed Denial of Service (DDoS) attacks on Azure infrastructure.</li>
                </ul>
            </div>
        </div>
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showTemenosSaaSAntiDDoS'}, '*');">Temenos SaaS antiDDoS</button>
</body>
</html>`

// DDoS HTML Content
const DDoSHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS anti-DDoS</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 100px 40px 100px 40px;
            gap: 20px;
            position: relative;
        }
        
        .flow-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 220px;
            position: relative;
        }
        
        .header-box {
            width: 100%;
            background: #b3d9ff;
            color: #1e3a8a;
            padding: 15px 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            text-align: center;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .header-icon {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .header-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            text-align: center;
            line-height: 1.2;
        }
        
        .content-box {
            width: 100%;
            background: #9333ea;
            color: #ffffff;
            padding: 20px 15px;
            border-radius: 6px;
            min-height: 200px;
            position: relative;
        }
        
        .content-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .content-list li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 10px;
            font-size: 15px;
            color: #ffffff;
            line-height: 1.4;
            text-align: left;
        }
        
        .content-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
        }
        
        .flow-arrow {
            position: absolute;
            right: -15px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 20px solid #1e3a8a;
            z-index: 10;
        }
        
        .flow-arrow::after {
            content: '';
            position: absolute;
            left: -30px;
            top: 50%;
            transform: translateY(-50%);
            width: 30px;
            height: 2px;
            background: #1e3a8a;
        }
        
        .action-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #ff0000;
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:hover {
            background: #cc0000;
        }
        
        /* Icon Styles */
        .icon-shield-people {
            width: 50px;
            height: 50px;
            position: relative;
        }
        
        .icon-shield {
            width: 50px;
            height: 50px;
            border: 3px solid #1e3a8a;
            border-radius: 50% 50% 50% 0;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .icon-person {
            width: 12px;
            height: 18px;
            background: #1e3a8a;
            border-radius: 6px 6px 0 0;
            position: absolute;
            bottom: 8px;
        }
        
        .icon-person-1 {
            left: 12px;
        }
        
        .icon-person-2 {
            right: 12px;
        }
        
        .icon-magnifying-glass {
            width: 50px;
            height: 50px;
            position: relative;
        }
        
        .icon-glass-circle {
            width: 30px;
            height: 30px;
            border: 3px solid #1e3a8a;
            border-radius: 50%;
            position: absolute;
            top: 5px;
            left: 5px;
            z-index: 2;
        }
        
        .icon-glass-handle {
            width: 12px;
            height: 3px;
            background: #1e3a8a;
            position: absolute;
            top: 20px;
            right: 5px;
            transform: rotate(45deg);
            z-index: 2;
        }
        
        .icon-people-group {
            width: 50px;
            height: 50px;
            position: absolute;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 4px;
            top: 0;
            left: 0;
            z-index: 1;
        }
        
        .icon-person-small {
            width: 10px;
            height: 15px;
            background: #1e3a8a;
            border-radius: 5px 5px 0 0;
        }
        
        .icon-document-pin {
            width: 50px;
            height: 50px;
            position: relative;
        }
        
        .icon-doc {
            width: 30px;
            height: 35px;
            background: #1e3a8a;
            border-radius: 2px;
            position: absolute;
            top: 5px;
            left: 10px;
        }
        
        .icon-pin {
            width: 12px;
            height: 12px;
            background: #1e3a8a;
            border-radius: 50% 50% 50% 0;
            position: absolute;
            top: 0;
            right: 8px;
            transform: rotate(-45deg);
        }
        
        .icon-document-pencil {
            width: 50px;
            height: 50px;
            position: relative;
        }
        
        .icon-doc-2 {
            width: 30px;
            height: 35px;
            background: #1e3a8a;
            border-radius: 2px;
            position: absolute;
            top: 5px;
            left: 10px;
        }
        
        .icon-pencil {
            width: 2px;
            height: 15px;
            background: #1e3a8a;
            position: absolute;
            top: 8px;
            right: 12px;
            transform: rotate(45deg);
        }
        
        .icon-pencil::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -2px;
            width: 0;
            height: 0;
            border-left: 3px solid transparent;
            border-right: 3px solid transparent;
            border-bottom: 6px solid #1e3a8a;
        }
        
        .icon-lightbulb-wrench {
            width: 50px;
            height: 50px;
            position: relative;
        }
        
        .icon-lightbulb {
            width: 25px;
            height: 30px;
            background: #1e3a8a;
            border-radius: 50% 50% 0 0;
            position: absolute;
            top: 5px;
            left: 12px;
        }
        
        .icon-lightbulb::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 3px;
            background: #1e3a8a;
        }
        
        .icon-wrench {
            width: 20px;
            height: 3px;
            background: #1e3a8a;
            position: absolute;
            bottom: 10px;
            right: 8px;
            transform: rotate(45deg);
        }
        
        .icon-wrench::before {
            content: '';
            position: absolute;
            left: -3px;
            top: -3px;
            width: 8px;
            height: 8px;
            border: 2px solid #1e3a8a;
            border-radius: 50%;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos SaaS anti-DDoS</div>
    
    <div class="main-container">
        <!-- Column 1: Global Scale Mitigation -->
        <div class="flow-column">
            <div class="header-box">
                <div class="header-icon">
                    <div class="icon-shield-people">
                        <div class="icon-shield"></div>
                        <div class="icon-person icon-person-1"></div>
                        <div class="icon-person icon-person-2"></div>
                    </div>
                </div>
                <div class="header-title">Global Scale Mitigation</div>
            </div>
            <div class="content-box">
                <ul class="content-list">
                    <li>Utilizes Microsoft's global network infrastructure to mitigate DDoS attacks.</li>
                    <li>Ensures minimal latency and optimal performance for applications.</li>
                </ul>
            </div>
            <div class="flow-arrow"></div>
        </div>
        
        <!-- Column 2: Adaptive Threat Intelligence -->
        <div class="flow-column">
            <div class="header-box">
                <div class="header-icon">
                    <div class="icon-magnifying-glass">
                        <div class="icon-glass-circle"></div>
                        <div class="icon-glass-handle"></div>
                        <div class="icon-people-group">
                            <div class="icon-person-small"></div>
                            <div class="icon-person-small"></div>
                            <div class="icon-person-small"></div>
                        </div>
                    </div>
                </div>
                <div class="header-title">Adaptive Threat Intelligence</div>
            </div>
            <div class="content-box">
                <ul class="content-list">
                    <li>Dynamic detection and mitigation based on real-time threat intelligence.</li>
                    <li>Constantly updated DDoS attack patterns and techniques.</li>
                </ul>
            </div>
            <div class="flow-arrow"></div>
        </div>
        
        <!-- Column 3: Application Layer Protection -->
        <div class="flow-column">
            <div class="header-box">
                <div class="header-icon">
                    <div class="icon-document-pin">
                        <div class="icon-doc"></div>
                        <div class="icon-pin"></div>
                    </div>
                </div>
                <div class="header-title">Application Layer Protection</div>
            </div>
            <div class="content-box">
                <ul class="content-list">
                    <li>Guards against application layer attacks, ensuring the availability and performance of critical services.</li>
                    <li>Mitigates HTTP/S, DNS, and other application layer attack vectors.</li>
                </ul>
            </div>
            <div class="flow-arrow"></div>
        </div>
        
        <!-- Column 4: Azure Monitor Integration -->
        <div class="flow-column">
            <div class="header-box">
                <div class="header-icon">
                    <div class="icon-document-pencil">
                        <div class="icon-doc-2"></div>
                        <div class="icon-pencil"></div>
                    </div>
                </div>
                <div class="header-title">Azure Monitor Integration</div>
            </div>
            <div class="content-box">
                <ul class="content-list">
                    <li>Seamlessly integrates with Azure Monitor for visibility into DDoS attack trends and insights.</li>
                    <li>Enables proactive threat management.</li>
                </ul>
            </div>
            <div class="flow-arrow"></div>
        </div>
        
        <!-- Column 5: Fine-tuned Protection -->
        <div class="flow-column">
            <div class="header-box">
                <div class="header-icon">
                    <div class="icon-lightbulb-wrench">
                        <div class="icon-lightbulb"></div>
                        <div class="icon-wrench"></div>
                    </div>
                </div>
                <div class="header-title">Fine Tuned Protection Measures</div>
            </div>
            <div class="content-box">
                <ul class="content-list">
                    <li>Allows customization of DDoS protection policies.</li>
                </ul>
            </div>
        </div>
    </div>
    
    <button class="action-button" onclick="window.parent.postMessage({type: 'showTemenosSaaSWAF'}, '*');">Temenos SaaS WAF</button>
</body>
</html>`

// WAF HTML Content
const WAFHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS WAF</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .title-label {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            font-size: 18px;
            color: #000;
            z-index: 1000;
            text-align: center;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            padding: 80px 40px 40px 40px;
            gap: 40px;
            height: 100%;
        }
        
        .left-section {
            flex: 1;
            display: flex;
            flex-direction: row;
            gap: 20px;
            max-width: 600px;
        }
        
        .text-column {
            flex: 1;
        }
        
        .column-header {
            background: #b3d9ff;
            color: #1e3a8a;
            padding: 12px 15px;
            border-radius: 6px 6px 0 0;
            font-size: 18px;
            font-weight: bold;
            text-align: left;
        }
        
        .column-content {
            background: #9333ea;
            color: #ffffff;
            padding: 20px 15px;
            border-radius: 0 0 6px 6px;
            min-height: 200px;
        }
        
        .content-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .content-list li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 12px;
            font-size: 15px;
            color: #ffffff;
            line-height: 1.5;
            text-align: left;
        }
        
        .content-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
        }
        
        .right-section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .waf-diagram {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .waf-central-box {
            width: 300px;
            height: 120px;
            background: #007BA7;
            border: 2px solid #4b5563;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            position: absolute;
            top: 50%;
            left: calc(50% - 100px);
            transform: translate(-50%, -50%);
            z-index: 5;
        }
        
        .functionality-box {
            position: absolute;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            color: #1a1a1a;
            text-align: center;
            min-width: 140px;
        }
        
        .box-orange {
            background: #fb923c;
        }
        
        .box-red {
            background: #ef4444;
            color: #ffffff;
        }
        
        .box-teal {
            background: #14b8a6;
        }
        
        .box-light-green {
            background: #86efac;
        }
        
        .box-blue {
            background: #60a5fa;
        }
        
        .box-network-protocol {
            top: 15%;
            left: 10%;
        }
        
        .box-http-protocol {
            top: 15%;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .box-stateful-connection {
            top: 15%;
            right: 10%;
        }
        
        .box-high-availability {
            top: 35%;
            right: 10%;
        }
        
        .box-session-management {
            top: 50%;
            right: 10%;
        }
        
        .box-honeypot {
            bottom: 15%;
            left: 10%;
        }
        
        .box-hidden-field {
            bottom: 15%;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .box-cookie-monitoring {
            bottom: 15%;
            right: 10%;
        }
    </style>
</head>
<body>
    <div class="title-label">Temenos SaaS WAF</div>
    
    <div class="main-container">
        <div class="left-section">
            <div class="text-column">
                <div class="column-header">Layer 7 attack protection</div>
                <div class="column-content">
                    <ul class="content-list">
                        <li>SQL injection and cross site scripting (XSS) are protected by WAF.</li>
                        <li>Prior to SaaS clients going live they are tested with WAF enabled in preventive mode and this is mandated control for security sign off</li>
                        <li>IP Reputation, Automatically blocks traffic from known malicious IP addresses</li>
                    </ul>
                </div>
            </div>
            
            <div class="text-column">
                <div class="column-header">Temenos SaaS WAF control</div>
                <div class="column-content">
                    <ul class="content-list">
                        <li>Azure front door</li>
                        <li>Azure WAF, NGNIX Application Gateway.</li>
                        <li>Temenos SaaS Go-Live environments are tested with WAF enabled in preventive mode</li>
                        <li>Use OWASP Core Rule Set 3.1</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="right-section">
            <div class="waf-diagram">
                <div class="waf-central-box">Web Application Firewall</div>
                
                <div class="functionality-box box-network-protocol box-orange">Network<br>protocol<br>Filtering</div>
                <div class="functionality-box box-http-protocol box-red">HTTP<br>Protocol<br>Filtering</div>
                <div class="functionality-box box-stateful-connection box-teal">Stateful<br>Connection<br>Monitoring</div>
                
                <div class="functionality-box box-high-availability box-light-green">High<br>Availability<br>Support</div>
                <div class="functionality-box box-session-management box-blue">Session<br>Management<br>Controls</div>
                
                <div class="functionality-box box-honeypot box-light-green">Honeypot/<br>Honeynet<br>Integration</div>
                <div class="functionality-box box-hidden-field box-teal">Hidden<br>Field<br>Enforcement</div>
                <div class="functionality-box box-cookie-monitoring box-red">Cookie<br>Monitoring<br>/Protection</div>
            </div>
        </div>
    </div>
</body>
</html>`

export function SecurityContentViewer() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showExate, setShowExate] = useState(false)
  const [showSaaSDefenceDepth, setShowSaaSDefenceDepth] = useState(false)
  const [showSaaSDataAccessControl, setShowSaaSDataAccessControl] = useState(false)
  const [showSaaSPAM, setShowSaaSPAM] = useState(false)
  const [showProtectAssets, setShowProtectAssets] = useState(false)
  const [showSecurityEventFeed, setShowSecurityEventFeed] = useState(false)
  const [showNetworkSecurityServices, setShowNetworkSecurityServices] = useState(false)
  const [showTemenosSaaSAntiDDoS, setShowTemenosSaaSAntiDDoS] = useState(false)
  const [showTemenosSaaSWAF, setShowTemenosSaaSWAF] = useState(false)

  const handleCardClick = (cardId: number) => {
    if (cardId === 1 || cardId === 2 || cardId === 3 || cardId === 4 || cardId === 5 || cardId === 6 || cardId === 7) {
      setSelectedCard(cardId)
    }
  }

  const handleBack = () => {
    setSelectedCard(null)
    setShowDetailedExplanation(false)
    setShowUserManagement(false)
    setShowExate(false)
    setShowSaaSDefenceDepth(false)
    setShowSaaSDataAccessControl(false)
    setShowSaaSPAM(false)
    setShowProtectAssets(false)
    setShowSecurityEventFeed(false)
    setShowNetworkSecurityServices(false)
    setShowTemenosSaaSAntiDDoS(false)
    setShowTemenosSaaSWAF(false)
  }

  const handleBackToArchitecture = () => {
    setShowDetailedExplanation(false)
  }

  // Listen for postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'showDetailedExplanation') {
        setShowDetailedExplanation(true)
      }
      if (event.data && event.data.type === 'showUserManagement') {
        setShowUserManagement(true)
      }
      if (event.data && event.data.type === 'showExate') {
        setShowExate(true)
      }
      if (event.data && event.data.type === 'showSaaSDefenceDepth') {
        setShowSaaSDefenceDepth(true)
      }
      if (event.data && event.data.type === 'showSaaSAccessData') {
        setShowSaaSDataAccessControl(true)
      }
      if (event.data && event.data.type === 'showPAM') {
        setShowSaaSPAM(true)
      }
      if (event.data && event.data.type === 'showProtectCriticalAssets') {
        setShowProtectAssets(true)
      }
      if (event.data && event.data.type === 'showSecurityEventsFeed') {
        setShowSecurityEventFeed(true)
      }
      if (event.data && event.data.type === 'showNetworkSecurityServices') {
        setShowNetworkSecurityServices(true)
      }
      if (event.data && event.data.type === 'showTemenosSaaSAntiDDoS') {
        setShowTemenosSaaSAntiDDoS(true)
      }
      if (event.data && event.data.type === 'showTemenosSaaSWAF') {
        setShowTemenosSaaSWAF(true)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Show HTML5 diagram when card 3 is selected
  if (selectedCard === 3) {
    // Show eXate page if button was clicked
    if (showExate) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowExate(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={eXateHTML}
            className="w-full h-full border-0 rounded-lg"
            title="eXate Solution"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show PrivacyEncryption by default
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={PrivacyEncryptionHTML}
          className="w-full h-full border-0 rounded-lg"
          title="Privacy & Encryption"
          sandbox="allow-same-origin allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  // Show HTML5 diagram when card 4 is selected
  if (selectedCard === 4) {
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={SaaSCloudSegregationHTML}
          className="w-full h-full border-0 rounded-lg"
          title="SaaS Cloud Segregation"
          sandbox="allow-same-origin allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  // Show HTML5 diagram when card 5 is selected
  if (selectedCard === 5) {
    // Show ProtectAssets if button was clicked
    if (showProtectAssets) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowProtectAssets(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={ProtectAssetsHTML}
            className="w-full h-full border-0 rounded-lg"
            title="Protect Assets"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show SaaSPAM if button was clicked
    if (showSaaSPAM) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowSaaSPAM(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={SaaSPAMHTML}
            className="w-full h-full border-0 rounded-lg"
            title="SaaS PAM"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show SaaSDataAccessControl if button was clicked
    if (showSaaSDataAccessControl) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowSaaSDataAccessControl(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={SaaSDataAccessControlHTML}
            className="w-full h-full border-0 rounded-lg"
            title="SaaS Data Access Control"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show SaaSAccessData by default
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={SaaSAccessDataHTML}
          className="w-full h-full border-0 rounded-lg"
          title="SaaS Access Data"
          sandbox="allow-same-origin allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  // Show HTML5 diagram when card 6 is selected
  if (selectedCard === 6) {
    // Show SaaSDefenceDepth page if button was clicked
    if (showSaaSDefenceDepth) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowSaaSDefenceDepth(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={SaaSDefenceDepthHTML}
            className="w-full h-full border-0 rounded-lg"
            title="SaaS Defence-in-Depth"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show PlatformManagement by default
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={PlatformManagementHTML}
          className="w-full h-full border-0 rounded-lg"
          title="Platform Management"
          sandbox="allow-same-origin allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  // Show HTML5 diagram when card 7 is selected
  if (selectedCard === 7) {
    // Show TemenosSaaSWAF if button was clicked
    if (showTemenosSaaSWAF) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowTemenosSaaSWAF(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={WAFHTML}
            className="w-full h-full border-0 rounded-lg"
            title="WAF"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show TemenosSaaSAntiDDoS if button was clicked
    if (showTemenosSaaSAntiDDoS) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowTemenosSaaSAntiDDoS(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={DDoSHTML}
            className="w-full h-full border-0 rounded-lg"
            title="DDoS Protection"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show NetworkSecurityServices if button was clicked
    if (showNetworkSecurityServices) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowNetworkSecurityServices(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={NetworkHTML}
            className="w-full h-full border-0 rounded-lg"
            title="Network Security"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show SecurityEventFeed if button was clicked
    if (showSecurityEventFeed) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowSecurityEventFeed(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={SecurityEventFeedHTML}
            className="w-full h-full border-0 rounded-lg"
            title="Security Event Feed"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show ProductSecurityUniform by default
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={ProductSecurityUniformHTML}
          className="w-full h-full border-0 rounded-lg"
          title="Product Security Uniform"
          sandbox="allow-same-origin allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  // Show HTML5 diagram when card 2 is selected
  if (selectedCard === 2) {
    // Show UserManagement if button was clicked
    if (showUserManagement) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowUserManagement(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={UserManagementHTML}
            className="w-full h-full border-0 rounded-lg"
            title="User Management"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show TemenosAuthorization by default
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={TemenosAuthorizationHTML}
          className="w-full h-full border-0 rounded-lg"
          title="Temenos Authorization"
          sandbox="allow-same-origin allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  // Show HTML5 diagram when card 1 is selected
  if (selectedCard === 1) {
    // Show TemenosAuthentication if button was clicked
    if (showDetailedExplanation) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleBackToArchitecture}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <iframe
            srcDoc={TemenosAuthenticationHTML}
            className="w-full h-full border-0 rounded-lg"
            title="Temenos Authentication"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '600px' }}
          />
        </div>
      )
    }
    
    // Show SecurityArchitecture by default
    return (
      <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <iframe
          srcDoc={SecurityArchitectureHTML}
          className="w-full h-full border-0 rounded-lg"
          title="Temenos Security Architecture"
          sandbox="allow-scripts"
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Content</h2>
        <p className="text-[#4A5568]">Select a security category and explore content</p>
      </div>

      {/* Layout: Column with categories + Card palette - Vertical center alignment */}
      <div className="flex gap-6">
        {/* Security Categories Column - Vertical */}
        <div className="w-64 flex-shrink-0 flex flex-col justify-center">
          <div className="space-y-4">
            {securityCategories.map((category) => {
              return (
                <div
                  key={category.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054] flex items-center justify-center"
                  style={{
                    minHeight: '200px',
                    height: '200px',
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-center p-6 w-full">
                    <h3 className="text-base font-semibold text-[#283054]">
                      {category.name}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card Palette - 3 rows x 3 cards - Grouped by rows for alignment */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* Row 1: Cards 1, 2, 3 */}
            <div className="grid grid-cols-3 gap-4">
              {cards.slice(0, 3).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                    style={{
                      borderColor: card.color,
                      minHeight: '200px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="flex flex-col items-center text-center p-6 w-full">
                      <div 
                        className="mb-4 p-4 rounded-lg"
                        style={{
                          backgroundColor: card.bgColor,
                        }}
                      >
                        <IconComponent 
                          className="w-8 h-8" 
                          style={{ color: card.color }}
                        />
                      </div>
                      <h3 
                        className="text-lg font-semibold mb-2"
                        style={{ color: card.color }}
                      >
                        {card.title}
                      </h3>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Row 2: Cards 4, 5, 6 */}
            <div className="grid grid-cols-3 gap-4">
              {cards.slice(3, 6).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                    style={{
                      borderColor: card.color,
                      minHeight: '200px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="flex flex-col items-center text-center p-6 w-full">
                      <div 
                        className="mb-4 p-4 rounded-lg"
                        style={{
                          backgroundColor: card.bgColor,
                        }}
                      >
                        <IconComponent 
                          className="w-8 h-8" 
                          style={{ color: card.color }}
                        />
                      </div>
                      <h3 
                        className="text-lg font-semibold mb-2"
                        style={{ color: card.color }}
                      >
                        {card.title}
                      </h3>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Row 3: Cards 7, 8, 9 */}
            <div className="grid grid-cols-3 gap-4">
              {cards.slice(6, 9).map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                    style={{
                      borderColor: card.color,
                      minHeight: '200px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="flex flex-col items-center text-center p-6 w-full">
                      <div 
                        className="mb-4 p-4 rounded-lg"
                        style={{
                          backgroundColor: card.bgColor,
                        }}
                      >
                        <IconComponent 
                          className="w-8 h-8" 
                          style={{ color: card.color }}
                        />
                      </div>
                      <h3 
                        className="text-lg font-semibold mb-2"
                        style={{ color: card.color }}
                      >
                        {card.title}
                      </h3>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
