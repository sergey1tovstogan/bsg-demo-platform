import { useState, useEffect } from 'react'
import {
    Fingerprint, // Modern Auth
    ShieldCheck, // Modern Authorization
    LockKeyhole, // Modern Privacy
    Layers, // Modern Segregation
    ScanEye, // Modern Access
    Cpu, // Modern Platform
    CloudCog, // Modern SaaS
    Activity, // Modern Logs/BCP
    Scale, // Modern Compliance
    X,
    type LucideIcon,
    ChevronRight
} from 'lucide-react'
import { ModernSecurityArchitecture } from './ModernSecurityArchitecture'
import { ModernAuthorization } from './ModernAuthorization'
import { ModernPrivacyEncryption } from './ModernPrivacyEncryption'
import { ModernSegregation } from './ModernSegregation'
import ModernObservability from './ModernObservability'
import ModernAccessManagement from './ModernAccessManagement'
import ModernPlatformManagement from './ModernPlatformManagement'
import ModernSaaSSecurity from './ModernSaaSSecurity'
import ModernCompliance from './ModernCompliance'

interface SecurityCard {
    id: number
    title: string
    icon: LucideIcon
    color: string
    bgColor: string
    description: string
}

const cards: SecurityCard[] = [
    {
        id: 1,
        title: 'Authentication',
        icon: Fingerprint,
        color: '#60A5FA', // Blue-400
        bgColor: 'rgba(59, 130, 246, 0.1)',
        description: 'Identity verification & SSO'
    },
    {
        id: 2,
        title: 'Authorization',
        icon: ShieldCheck,
        color: '#34D399', // Emerald-400
        bgColor: 'rgba(16, 185, 129, 0.1)',
        description: 'Role-based access control'
    },
    {
        id: 3,
        title: 'Privacy & Encryption',
        icon: LockKeyhole,
        color: '#A78BFA', // Violet-400
        bgColor: 'rgba(139, 92, 246, 0.1)',
        description: 'Data protection standards'
    },
    {
        id: 4,
        title: 'Segregation',
        icon: Layers,
        color: '#FBBF24', // Amber-400
        bgColor: 'rgba(245, 158, 11, 0.1)',
        description: 'Multi-tenant isolation'
    },
    {
        id: 5,
        title: 'Access Management',
        icon: ScanEye,
        color: '#F87171', // Red-400
        bgColor: 'rgba(239, 68, 68, 0.1)',
        description: 'Privileged access monitoring'
    },
    {
        id: 6,
        title: 'SaaS Platform Management',
        icon: Cpu,
        color: '#22D3EE', // Cyan-400
        bgColor: 'rgba(6, 182, 212, 0.1)',
        description: 'Infrastructure controls'
    },
    {
        id: 7,
        title: 'SaaS Security Services',
        icon: CloudCog,
        color: '#818CF8', // Indigo-400
        bgColor: 'rgba(99, 102, 241, 0.1)',
        description: 'Cloud-native security'
    },
    {
        id: 8,
        title: 'SaaS BCP, Logs, Incidents',
        icon: Activity,
        color: '#2DD4BF', // Teal-400
        bgColor: 'rgba(20, 184, 166, 0.1)',
        description: 'Resilience & monitoring'
    },
    {
        id: 9,
        title: 'SaaS Compliance and Risk Managemet',
        icon: Scale,
        color: '#FB923C', // Orange-400
        bgColor: 'rgba(249, 115, 22, 0.1)',
        description: 'Regulatory alignment'
    },
]

const securityCategories = [
    { id: 1, name: 'Application Security' },
    { id: 2, name: 'Infrastructure Security' },
    { id: 3, name: 'SaaS Security' },
]



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

// Platform Management HTML Content (unused - removed)

// SaaS Defence-in-Depth HTML Content
const SaaSDefenceDepthHTML = `<!DOCTYPE html>
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

// SaaS Access Data HTML Content (unused - removed)

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

// SaaS PAM HTML Content
const SaaSPAMHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS PAM</title>
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

// Product Security Uniform HTML Content (unused - removed)

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
                description: "SIEM. Used Azure Sentinel's built-in Insecure Protocol Workbook to discover the use of insecure services and protocols. The Security Operations Centre operate a Security Incident and Event Management platform (SIEM) that collects a subsection of logs which are used to detect patterns, look for known malicious activities and signatures, etc. Alerts are correlated to gain a big picture understanding of a potential attack or incident.\n\nTemenos provides a SaaS Event Hub service that enables customers to access their application security logs in real time. This service works by collecting logs from the SaaS environment and pushing them into an Event Hub, which the customer can then integrate with their own monitoring or observability tools (e.g., Splunk, Azure Monitor, ELK Stack).\n\nThis capability ensures that customers maintain visibility and control over their operational data in production to support their monitoring needs of compliance, troubleshooting and performance.\n\nThis service is optional.\n\nForwarding logs to local central log repository is done automatically in real time.\n\nSecurity logs are reviewed on a daily, weekly and monthly basis as part of security operations activities. All exceptions and anomalies are analyzed and promptly escalated as per the security incident escalation process.',
                position: 'bottom'
            }
        ];
        
        function showTooltip(tooltipId) {
            const tooltip = document.getElementById('tooltip');
            const tooltipTitle = tooltip ? tooltip.querySelector('.tooltip-title') : null;
            const tooltipDescription = tooltip ? tooltip.querySelector('.tooltip-description') : null;
            
            let config;
            
            if (tooltipId === 'temenos-soc') {
                config = tooltips[0];
            } else if (tooltipId === 'azure-sentinel') {
                config = tooltips[1];
            }
            
            if (config && tooltip && tooltipTitle && tooltipDescription) {
                // Set both title and description
                tooltipTitle.textContent = config.title;
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

// Missing HTML constants - placeholder content
const TrustCenterHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Trust Center</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #283054; }
        p { line-height: 1.6; color: #333; }
    </style>
</head>
<body>
    <h1>Temenos Trust Center</h1>
    <p>Content coming soon...</p>
</body>
</html>`

const CompliancePositionHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Compliance Position</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #283054; }
        p { line-height: 1.6; color: #333; }
    </style>
</head>
<body>
    <h1>Temenos Compliance Position</h1>
    <p>Content coming soon...</p>
</body>
</html>`

const SecurityPolicyHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Security Policy</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #283054; }
        p { line-height: 1.6; color: #333; }
    </style>
</head>
<body>
    <h1>Temenos Security Policy</h1>
    <p>Content coming soon...</p>
</body>
</html>`

const ProtectionEmbeddedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos Protection Embedded</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #283054; }
        p { line-height: 1.6; color: #333; }
    </style>
</head>
<body>
    <h1>Temenos Protection Embedded</h1>
    <p>Content coming soon...</p>
</body>
</html>`

const RiskManagementHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Management</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #283054; }
        p { line-height: 1.6; color: #333; }
    </style>
</head>
<body>
    <h1>Risk Management</h1>
    <p>Content coming soon...</p>
</body>
</html>`

const SaaSComplianceOverviewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temenos SaaS Compliance Overview</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #283054; }
        p { line-height: 1.6; color: #333; }
    </style>
</head>
<body>
    <h1>Temenos SaaS Compliance Overview</h1>
    <p>Content coming soon...</p>
</body>
</html>`

// Log History HTML Content
interface SecurityContentViewerProps {
    initialSelectedCard?: number
}

export function SecurityContentViewer({ initialSelectedCard }: SecurityContentViewerProps = {}) {
    const [selectedCard, setSelectedCard] = useState<number | null>(initialSelectedCard || null)
    
    // Update selectedCard when initialSelectedCard prop changes
    useEffect(() => {
        if (initialSelectedCard !== undefined) {
            setSelectedCard(initialSelectedCard)
        }
    }, [initialSelectedCard])
    
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
    const [showSaaSComplianceOverview, setShowSaaSComplianceOverview] = useState(false)
    const [showCompliancePosition, setShowCompliancePosition] = useState(false)
    const [showTrustCenter, setShowTrustCenter] = useState(false)
    const [showRiskManagement, setShowRiskManagement] = useState(false)
    const [showSecurityPolicy, setShowSecurityPolicy] = useState(false)
    const [showProtectionEmbedded, setShowProtectionEmbedded] = useState(false)

    const handleCardClick = (cardId: number) => {
        if (cardId === 1 || cardId === 2 || cardId === 3 || cardId === 4 || cardId === 5 || cardId === 6 || cardId === 7 || cardId === 8 || cardId === 9) {
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
        setShowSaaSComplianceOverview(false)
        setShowCompliancePosition(false)
        setShowTrustCenter(false)
        setShowRiskManagement(false)
        setShowSecurityPolicy(false)
        setShowProtectionEmbedded(false)
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
            if (event.data && event.data.type === 'showComplianceOverview') {
                setShowSaaSComplianceOverview(true)
            }
            if (event.data && event.data.type === 'showCompliancePosition') {
                setShowCompliancePosition(true)
            }
            if (event.data && event.data.type === 'showTrustCenter') {
                setShowCompliancePosition(false)
                setShowTrustCenter(true)
            }
            if (event.data && event.data.type === 'showRiskManagement') {
                setShowTrustCenter(false)
                setShowCompliancePosition(false)
                setShowRiskManagement(true)
            }
            if (event.data && event.data.type === 'showSecurityPolicy') {
                setShowRiskManagement(false)
                setShowTrustCenter(false)
                setShowCompliancePosition(false)
                setShowSecurityPolicy(true)
            }
            if (event.data && event.data.type === 'showProtectionEmbedded') {
                setShowSecurityPolicy(false)
                setShowRiskManagement(false)
                setShowTrustCenter(false)
                setShowCompliancePosition(false)
                setShowProtectionEmbedded(true)
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
                    <div className="absolute top-4 right-4 z-50">
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

        // Show ModernPrivacyEncryption by default
        return (
            <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernPrivacyEncryption />
            </div>
        )
    }

    // Show ModernSegregation when card 4 is selected
    if (selectedCard === 4) {
        return (
            <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernSegregation />
            </div>
        )
    }

    // Show HTML5 diagram when card 5 is selected
    if (selectedCard === 5) {
        // Show ProtectAssets if button was clicked
        if (showProtectAssets) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
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
                    <div className="absolute top-4 right-4 z-50">
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
                    <div className="absolute top-4 right-4 z-50">
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
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernAccessManagement />
            </div>
        )
    }

    // Show HTML5 diagram when card 6 is selected
    if (selectedCard === 6) {
        // Show SaaSDefenceDepth page if button was clicked
        if (showSaaSDefenceDepth) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
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
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernPlatformManagement />
            </div>
        )
    }

    // Show HTML5 diagram when card 7 is selected
    if (selectedCard === 7) {
        // Show TemenosSaaSWAF if button was clicked
        if (showTemenosSaaSWAF) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
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
                    <div className="absolute top-4 right-4 z-50">
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
                    <div className="absolute top-4 right-4 z-50">
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
                    <div className="absolute top-4 right-4 z-50">
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
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernSaaSSecurity />
            </div>
        )
    }

    // Show ModernObservability when card 8 is selected
    if (selectedCard === 8) {
        return (
            <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernObservability />
            </div>
        )
    }

    // Show HTML5 diagram when card 9 is selected
    if (selectedCard === 9) {
        // Show Trust Center page if button was clicked
        if (showTrustCenter) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => {
                                setShowTrustCenter(false)
                                setShowCompliancePosition(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <iframe
                        srcDoc={TrustCenterHTML}
                        className="w-full h-full border-0 rounded-lg"
                        title="Temenos Trust Center"
                        sandbox="allow-same-origin allow-scripts"
                        style={{ minHeight: '600px' }}
                    />
                </div>
            )
        }

        // Show compliance position page if button was clicked
        if (showCompliancePosition) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => setShowCompliancePosition(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <iframe
                        srcDoc={CompliancePositionHTML}
                        className="w-full h-full border-0 rounded-lg"
                        title="Temenos Compliance Position"
                        sandbox="allow-same-origin allow-scripts"
                        style={{ minHeight: '600px' }}
                    />
                </div>
            )
        }

        // Show Security Policy page if button was clicked
        if (showSecurityPolicy) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => {
                                setShowSecurityPolicy(false)
                                setShowRiskManagement(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <iframe
                        srcDoc={SecurityPolicyHTML}
                        className="w-full h-full border-0 rounded-lg"
                        title="Temenos Security Policy"
                        sandbox="allow-same-origin allow-scripts"
                        style={{ minHeight: '600px' }}
                    />
                </div>
            )
        }

        // Show Protection Embedded page if button was clicked
        if (showProtectionEmbedded) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => {
                                setShowProtectionEmbedded(false)
                                setShowSecurityPolicy(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <iframe
                        srcDoc={ProtectionEmbeddedHTML}
                        className="w-full h-full border-0 rounded-lg"
                        title="Temenos Protection Embedded"
                        sandbox="allow-same-origin allow-scripts"
                        style={{ minHeight: '600px' }}
                    />
                </div>
            )
        }

        // Show Risk Management page if button was clicked
        if (showRiskManagement) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => {
                                setShowRiskManagement(false)
                                setShowTrustCenter(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <iframe
                        srcDoc={RiskManagementHTML}
                        className="w-full h-full border-0 rounded-lg"
                        title="Risk Management"
                        sandbox="allow-same-origin allow-scripts"
                        style={{ minHeight: '600px' }}
                    />
                </div>
            )
        }

        // Show overview page if button was clicked
        if (showSaaSComplianceOverview) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => setShowSaaSComplianceOverview(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <iframe
                        srcDoc={SaaSComplianceOverviewHTML}
                        className="w-full h-full border-0 rounded-lg"
                        title="Temenos SaaS Compliance Overview"
                        sandbox="allow-same-origin allow-scripts"
                        style={{ minHeight: '600px' }}
                    />
                </div>
            )
        }

        // Show design page by default
        return (
            <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernCompliance />
            </div>
        )
    }

    // Show HTML5 diagram when card 2 is selected
    if (selectedCard === 2) {
        // Show UserManagement if button was clicked
        if (showUserManagement) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
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

        // Show ModernAuthorization by default
        return (
            <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernAuthorization />
            </div>
        )
    }

    // Show HTML5 diagram when card 1 is selected
    if (selectedCard === 1) {
        // Show TemenosAuthentication if button was clicked
        if (showDetailedExplanation) {
            return (
                <div className="card" style={{ height: 'calc(100vh - 200px)', position: 'relative', padding: 0 }}>
                    <div className="absolute top-4 right-4 z-50">
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
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1e2440] transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <ModernSecurityArchitecture />
            </div>
        )
    }

    return (
        <div className="card">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Content</h2>
                <p className="text-gray-600 dark:text-gray-300">Select a security category and explore content</p>
            </div>

            {/* Layout: Vertical list of categories with their cards */}
            <div className="space-y-16">
                {securityCategories.map((category, index) => {
                    const startIndex = index * 3;
                    const categoryCards = cards.slice(startIndex, startIndex + 3);

                    return (
                        <div key={category.id} className="space-y-8">
                            {/* Category Header with Modern Accent */}
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                                    {category.name}
                                </h3>
                            </div>

                            {/* Cards Grid for this Category */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {categoryCards.map((card) => {
                                    const IconComponent = card.icon;
                                    return (
                                        <div
                                            key={card.id}
                                            onClick={() => handleCardClick(card.id)}
                                            className="group relative overflow-hidden rounded-3xl p-1 cursor-pointer transition-all duration-500 hover:-translate-y-2"
                                            style={{
                                                minHeight: '260px',
                                                height: '260px',
                                            }}
                                        >
                                            {/* Gradient Border Background */}
                                            <div
                                                className="absolute inset-0 bg-gradient-to-br from-gray-200 via-white to-gray-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 opacity-100 transition-all duration-500"
                                            />

                                            {/* Active Border Glow on Hover */}
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                style={{
                                                    background: `linear-gradient(135deg, ${card.color}, transparent 60%)`
                                                }}
                                            />

                                            {/* Card Content Container */}
                                            <div className="relative h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-6 flex flex-col items-center justify-center text-center border border-white/20 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/10">

                                                {/* Icon Container with Neon Glow */}
                                                <div
                                                    className="mb-6 p-5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                                    style={{
                                                        backgroundColor: card.bgColor,
                                                        boxShadow: `0 0 20px ${card.color}30`
                                                    }}
                                                >
                                                    <IconComponent
                                                        className="w-10 h-10 transition-all duration-300"
                                                        style={{
                                                            color: card.color,
                                                            filter: `drop-shadow(0 0 8px ${card.color}60)`
                                                        }}
                                                        strokeWidth={1.5}
                                                    />
                                                </div>

                                                {/* Title */}
                                                <h3
                                                    className="text-xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300"
                                                >
                                                    {card.title}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                                    {card.description}
                                                </p>

                                                {/* Hover Indicator */}
                                                <div
                                                    className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0"
                                                >
                                                    <ChevronRight
                                                        className="w-5 h-5"
                                                        style={{ color: card.color }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
