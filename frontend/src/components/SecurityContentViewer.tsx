import { useState, useEffect, useRef } from 'react'
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
    title: 'SaaS Security Model',
    icon: Cloud,
    color: '#6366F1', // Indigo
    bgColor: '#E0E7FF', // Light indigo background
  },
  {
    id: 8,
    title: 'SaaS Access Control',
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
            padding: 12px 24px;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: bold;
            font-size: 16px;
            color: #283054;
            z-index: 1000;
            text-align: center;
            line-height: 1.4;
        }
        
        .tooltip {
            position: absolute;
            background: white;
            border: 2px solid #ff0000;
            border-radius: 4px;
            padding: 12px;
            max-width: 450px;
            font-size: 16px;
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
            font-size: 16px;
            margin-bottom: 8px;
            color: #283054;
        }
        
        .tooltip-description {
            color: #333;
            font-size: 16px;
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
            font-size: 14px;
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
            font-size: 12px;
            fill: #000;
        }
        
        .title-text {
            font-size: 14px;
            font-weight: bold;
        }
        
        .small-text {
            font-size: 10px;
        }
        
        .temenos-box {
            fill: #d3d3d3;
            stroke: #3B82F6;
            stroke-width: 3;
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
            <span style="font-size: 14px; font-weight: normal;">click on elements to get more details</span>
        </div>
        <div id="tooltip" class="tooltip">
            <div class="tooltip-title" id="tooltip-title"></div>
            <div class="tooltip-description" id="tooltip-description"></div>
        </div>
        <svg viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet">
            <!-- Entry Points Bar (Left Vertical) - TLS 1.2 Container -->
            <rect id="tls-entry-points" x="50" y="200" width="80" height="400" class="entry-bar clickable"/>
            <text x="90" y="230" text-anchor="middle" class="text-white title-text">TLS 1.2</text>
            
            <!-- Temenos Software (Central Light Grey Block with Blue Border) - Moved 40px right -->
            <rect x="240" y="150" width="500" height="500" class="temenos-box" rx="5"/>
            <text x="490" y="180" text-anchor="middle" class="text-black title-text">Temenos software</text>
            
            <!-- User Interface (Grey) - Moved between TLS 1.2 and Temenos Software, right border moved 50px right -->
            <rect x="135" y="270" width="120" height="50" class="entry-item-grey"/>
            <text x="195" y="290" text-anchor="middle" class="text-white">User</text>
            <text x="195" y="310" text-anchor="middle" class="text-white">Interface</text>
            
            <!-- APIs (Grey) - Moved between TLS 1.2 and Temenos Software, right border moved 50px right -->
            <rect x="135" y="340" width="120" height="40" class="entry-item-grey"/>
            <text x="195" y="365" text-anchor="middle" class="text-white">APIs</text>
            
            <!-- Events (Grey) - Moved between TLS 1.2 and Temenos Software, right border moved 50px right -->
            <rect x="135" y="400" width="120" height="40" class="entry-item-grey"/>
            <text x="195" y="425" text-anchor="middle" class="text-white">Events</text>
            
            <!-- Authentication Box - Moved 40px right -->
            <rect id="authentication-box" x="290" y="220" width="180" height="120" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="380" y="245" text-anchor="middle" class="text-white title-text">Authentication</text>
            <text x="380" y="270" text-anchor="middle" class="text-white small-text">oAuth 2.0</text>
            <text x="380" y="290" text-anchor="middle" class="text-white small-text">OpenID Connect</text>
            <text x="380" y="310" text-anchor="middle" class="text-white small-text">JWT, SAML</text>
            
            <!-- Authorization Box - Moved 40px right -->
            <rect id="authorization-box" x="510" y="220" width="180" height="120" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="600" y="245" text-anchor="middle" class="text-white title-text">Authorization</text>
            <text x="600" y="270" text-anchor="middle" class="text-white small-text">RBAC, ABAC</text>
            
            <!-- Audit Box - Moved 40px right -->
            <rect id="audit-box" x="390" y="360" width="100" height="50" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="440" y="385" text-anchor="middle" class="text-white">Audit</text>
            
            <!-- DB Box - Green Cylinder outside Temenos Software - Moved 40px right -->
            <!-- Cylinder shape: ellipse on top, rectangle in middle, ellipse on bottom -->
            <ellipse cx="350" cy="580" rx="60" ry="15" class="db-cylinder"/>
            <rect x="290" y="580" width="120" height="100" class="db-cylinder"/>
            <ellipse cx="350" cy="680" rx="60" ry="15" class="db-cylinder"/>
            <text x="350" y="625" text-anchor="middle" class="text-white title-text">DB</text>
            <text x="420" y="625" text-anchor="start" class="text-black small-text" style="font-weight: bold;">Transparent Data Encryption TDE</text>
            
            <!-- Temenos Vault Box - Positioned in lower right corner of Temenos Software -->
            <rect id="temenos-vault" x="590" y="570" width="150" height="80" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="665" y="595" text-anchor="middle" class="text-white title-text">Temenos</text>
            <text x="665" y="615" text-anchor="middle" class="text-white title-text">Vault</text>
            
            <!-- Externalized authorization Box - Moved 40px right -->
            <rect id="externalized-auth" x="630" y="450" width="80" height="80" fill="#2563eb" stroke="#000" stroke-width="1" class="clickable"/>
            <text x="670" y="485" text-anchor="middle" class="text-white small-text">Externalized</text>
            <text x="670" y="505" text-anchor="middle" class="text-white small-text">authorization</text>
            <text x="670" y="520" text-anchor="middle" class="text-white small-text">(XACML)</text>
            
            <!-- Bank's IAM (Purple Box) - Aligned with upper border of Temenos Software -->
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
            
            <!-- Data Encryption (Purple Box) - Centered horizontally with DB, 30px below DB - Moved 40px right -->
            <rect id="data-encryption" x="250" y="710" width="200" height="80" class="purple-box clickable" rx="5"/>
            <text x="350" y="740" text-anchor="middle" class="text-white title-text">Data Encryption</text>
            <text x="350" y="765" text-anchor="middle" class="text-white small-text">(Data-at-rest,</text>
            <text x="350" y="780" text-anchor="middle" class="text-white small-text">in transit)</text>
            
            <!-- Lines - All Red -->
            
            <!-- REMOVED: Entry Points to Temenos lines (User Interface, APIs, Events) -->
            
            <!-- Authentication to Authorization (role) - Updated coordinates -->
            <line x1="470" y1="280" x2="510" y2="280" class="line-red"/>
            <text x="490" y="275" text-anchor="middle" class="text-black small-text">role</text>
            
            <!-- REMOVED: Authentication to Audit line (as requested) -->
            
            <!-- Bank's IAM to Temenos Software right border -->
            <line x1="800" y1="210" x2="740" y2="210" class="line-red"/>
            
            <!-- Authorization to Externalized authorization - Updated coordinates -->
            <line x1="690" y1="280" x2="670" y2="490" class="line-red"/>
            
            <!-- REMOVED: All lines linked to DB -->
            
            <!-- REMOVED: All lines linked to Data Encryption -->
            
            <!-- Externalized authorization to Secrets management - Updated coordinates -->
            <line x1="670" y1="450" x2="1050" y2="270" class="line-red"/>
            
            <!-- Externalized authorization to Key management - Updated coordinates -->
            <line x1="670" y1="490" x2="1050" y2="410" class="line-red"/>
            
            <!-- Externalized authorization to Certificate Management - Updated coordinates -->
            <line x1="670" y1="530" x2="1050" y2="550" class="line-red"/>
            
            <!-- Temenos Vault to Secrets management - Updated coordinates (Temenos Vault in lower right corner) -->
            <line x1="665" y1="570" x2="1050" y2="270" class="line-red"/>
            
            <!-- Temenos Vault to Key management - Updated coordinates -->
            <line x1="665" y1="610" x2="1050" y2="410" class="line-red"/>
            
            <!-- Temenos Vault to Certificate Management - Updated coordinates -->
            <line x1="665" y1="650" x2="1050" y2="550" class="line-red"/>
        </svg>
        <button class="tooltip-button" onclick="window.parent.postMessage({type: 'showDetailedExplanation'}, '*')">Move to Detailed Explanation</button>
    </div>
    
    <script>
        // Tooltip Configuration
        const tooltips = [
            {
                id: 'key-management',
                title: 'Key Management',
                description: 'The system checks for file integrity upon upload and download using checksums and cryptographic hashing methods. SSH keys and certificates are stored in Azure Key Vault to ensure secure key management practices.',
                position: 'right'
            },
            {
                id: 'secrets-management',
                title: 'Secrets Management',
                description: 'Secrets management depends on stack deployment and requirements. Runtime secrets can be held within Hashicorp Vault, and minimum privilege should be used around key issuance, with audit logging of issued secrets. Good practice dictates that all runtime secrets are rotated at each deploy, and Cryptographic keys are rotated every 3 months, or whenever required by the organization. For Azure deployment, Temenos recommend using Azure Key Vault - Azure Key Vault: Azure Key Vault is a secure and centralized key management service that helps you safeguard cryptographic keys, certificates, and secrets used by cloud applications and services. Azure Key Vault is a cloud service that provides secure storage of keys for encrypting data. Multiple keys, and multiple versions of the same key, can be kept in the Azure Key Vault. Cryptographic keys in Azure Key Vault are represented as JSON Web Key [JWK] objects.',
                position: 'right'
            },
            {
                id: 'temenos-vault',
                title: 'Temenos Vault',
                description: 'Users should be able to create and store the application Certificates into the Vault (Azure Key vault). Applications should be able to retrieve the Certificates from the vault (Azure Key vault) and use it on the fly without any storing mechanism. Temenos Vault APIs should be created to support the above requirements to interact with the Vault (Azure Key vault). Temenos Vault – provides common framework for our products to integrate with underlaying platform Secrets services. Temenos Vault provides a facade that can be used by products and can be configured to point to the relevant Vault implementation based on the deployment environment. As well as this it can be used by the SaaS platform for provisioning the secrets, keys, and certificates for product or for the platform. We will support Azure Key Vault, AWS Secret, Key and Certificate Manager as well as Hashicorp Vault for On Premise solutions.',
                position: 'bottom'
            },
            {
                id: 'externalized-auth',
                title: 'Externalized Authorization',
                description: 'Temenos solution supports the externalized mechanism based on SAML 2.0, OIDC/ JSON Web Token (JWT) for authentication.  OAuth is an open standard authorization protocol. It enables your account information to be obtained by third-party services. Without exposing user credentials, OAuth provides an access token and a refresh token for third-party services.',
                position: 'bottom'
            },
            {
                id: 'data-encryption',
                title: 'Data Encryption',
                description: 'Temenos uses a range of security controls to protect data at rest, at use and in transit.  One of these mechanisms is Transparent Data Encryption (TDE) which provides real-time encryption and decryption of the database, associated backups, and transaction log files at rest. TDE protects data and log files, using AES (256-bit encryption) encryption algorithms. Temenos can offer encryption today via eXate as part of the Temenos Exchange ecosystem.  (requiring a dedicated discussion and license with eXate company).',
                position: 'top'
            },
            {
                id: 'certificate-management',
                title: 'Certificate Management',
                description: '',
                position: 'right'
            },
            {
                id: 'bank-iam',
                title: 'Bank\\'s Identity and Access Management',
                description: 'For authentication, Temenos solution makes use of Bank\\'s Identity and Access Management (IaM) solution like Active Directory. The bank\\'s individual employees are authenticated at Active Directory. Temenos comes pre-integrated with KeyCloak. KeyCloak will become the defacto IaM system for Temenos applications. It acts as the identity broker for redirecting authentication requests to the Bank managed IaM solution.',
                position: 'left'
            },
            {
                id: 'authentication-box',
                title: 'Authentication',
                description: 'The external authentication mechanism for Temenos solution leverages Keycloak solution. Temenos SaaS leverages Keycloak as authentication and authorization. Keycloak can be federated to another Bank\\'s identity management system. A bank can replace Keycloak with any existing fit-for-purpose IAM solution capable of OIDC AZ Code & PKCE & client grant type private key JSON Web Token (JWT).',
                position: 'top'
            },
            {
                id: 'authorization-box',
                title: 'Authorization',
                description: 'Temenos has embedded internal mechanism, native to the solution. The internal mechanism provides sufficient and granular access management to all applications as well as role/group facilities. The Temenos Security Management System (SMS) provides role-based access limits and full transaction and user activity audit. Each user has their own profile within the SMS which contains full user details and security settings to control the user\\'s access within the system. SMS managing the access control, executing the following steps: Checks each user activity against the profile to determine validity; unacceptable actions are prevented and recorded (User Profile), Validates each contract against conditions, such as limits and exchange rate tolerance bands, before it is accepted (User Authority), Make specific data inaccessible to specified users or user groups based on conditions (Data Security).',
                position: 'top'
            },
            {
                id: 'audit-box',
                title: 'Audit',
                description: 'Temenos provides a full audit and logging across the entire business and technical landscape which can be utilized to track important security related events. The audit trails are stored as part of each data record and include details of the change made, by whom and when. Optionally it can include a delivery reference and IP address. Auditing is done both for users who use the solution directly or via APIs.\\n\\nAuditing includes: User activity auditing includes details of; Applications accessed, ID of transactions executed, Time connected, No. of operations executed etc. Application activity auditing includes details of; ID of new transactions, Inputter and Authorizer,  Security violation reports store details of unauthorised access attempts including who accessed the system, when and the target application',
                position: 'top'
            },
            {
                id: 'tls-entry-points',
                title: 'TLS 1.2 Entry Points Container',
                description: 'All access to web applications and API endpoints is over HTTPS, using modern TLS ciphers (TLS 1.2).',
                position: 'right'
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
            if (!tooltip.contains(e.target) && !e.target.classList.contains('clickable')) {
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
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #283054;
        }
        
        .text-section ul {
            list-style-type: disc;
            padding-left: 20px;
            font-size: 14px;
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
            position: absolute;
            background: white;
            border: 2px solid #ff0000;
            border-radius: 4px;
            padding: 12px;
            max-width: 500px;
            font-size: 16px;
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
            font-size: 16px;
            margin-bottom: 8px;
            color: #283054;
        }
        
        .tooltip-description {
            color: #333;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-label">Here is the Temenos Authentication</div>
        <div id="tooltip" class="tooltip">
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
                if (top + tooltipRect.height > containerRect.bottom) {
                    top = containerRect.bottom - tooltipRect.height - 10;
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
            if (!tooltip.contains(e.target) && !e.target.classList.contains('clickable')) {
                hideTooltip();
            }
        });
    </script>
</body>
</html>`

export function SecurityContentViewer() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleCardClick = (cardId: number) => {
    if (cardId === 1) {
      setSelectedCard(cardId)
    }
  }

  const handleBack = () => {
    setSelectedCard(null)
    setShowDetailedExplanation(false)
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
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Show HTML5 diagram when card 1 is selected
  if (selectedCard === 1) {
    // Show detailed explanation (TemenosAuthentication.html) if requested
    if (showDetailedExplanation) {
      return (
        <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleBackToArchitecture}
              className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Back to Architecture</span>
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

    // Show Security Architecture diagram
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
          ref={iframeRef}
          srcDoc={SecurityArchitectureHTML}
          className="w-full h-full border-0 rounded-lg"
          title="Temenos Security Architecture"
          sandbox="allow-same-origin allow-scripts"
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
