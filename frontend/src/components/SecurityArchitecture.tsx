export function SecurityArchitecture() {
  return (
    <div className="card relative" style={{ minHeight: '600px', padding: '20px', backgroundColor: '#F5F7FA' }}>
      {/* Label in right upper corner */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-[#283054]">
          <p className="text-sm font-semibold text-[#283054]">Here is the Temenos Security Architecture</p>
        </div>
      </div>

      {/* Main SVG Container - Responsive and proportional */}
      <svg
        viewBox="0 0 1200 750"
        className="w-full h-auto"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect width="1200" height="750" fill="#F5F7FA" />

        {/* TLS 1.2 Entry Points Container (Leftmost Dark Blue) */}
        <g id="tls-entry">
          <rect x="20" y="80" width="180" height="480" fill="#1E3A8A" rx="8" />
          <text x="110" y="110" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TLS 1.2</text>
          
          {/* User Interface */}
          <rect x="40" y="140" width="140" height="90" fill="#3B82F6" rx="4" />
          <text x="110" y="170" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">User Interface</text>
          
          {/* APIs */}
          <rect x="40" y="250" width="140" height="90" fill="#3B82F6" rx="4" />
          <text x="110" y="280" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">APIs</text>
          
          {/* Events */}
          <rect x="40" y="360" width="140" height="90" fill="#3B82F6" rx="4" />
          <text x="110" y="390" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Events</text>
        </g>

        {/* Temenos Software Container (Central Dark Blue) */}
        <g id="temenos-software">
          <rect x="240" y="80" width="500" height="480" fill="#1E3A8A" rx="8" />
          <text x="490" y="110" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">Temenos Software</text>
          
          {/* Authentication Box */}
          <rect x="260" y="140" width="220" height="140" fill="#3B82F6" rx="4" />
          <text x="370" y="165" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">Authentication</text>
          <text x="370" y="195" textAnchor="middle" fill="white" fontSize="11">oAuth 2.0, OpenID Connect</text>
          <text x="370" y="215" textAnchor="middle" fill="white" fontSize="11">JWT, SAML</text>
          <text x="370" y="240" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Role</text>
          <text x="370" y="265" textAnchor="middle" fill="white" fontSize="11">audit</text>
          
          {/* Authorization Box */}
          <rect x="260" y="300" width="220" height="140" fill="#3B82F6" rx="4" />
          <text x="370" y="330" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">Authorization</text>
          <text x="370" y="360" textAnchor="middle" fill="white" fontSize="11">(RBAC, ABAC)</text>
          <text x="370" y="385" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">role</text>
          
          {/* Audit Box */}
          <rect x="500" y="140" width="220" height="100" fill="#3B82F6" rx="4" />
          <text x="610" y="175" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">Audit</text>
        </g>

        {/* Bank's IAM (Top Right Purple) */}
        <g id="bank-iam">
          <rect x="780" y="80" width="200" height="110" fill="#8B5CF6" rx="4" />
          <text x="880" y="110" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Bank&apos;s identity access</text>
          <text x="880" y="130" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">management (IAM)</text>
          <text x="880" y="160" textAnchor="middle" fill="white" fontSize="10">oAuth 2.0, OpenID Connect</text>
          <text x="880" y="175" textAnchor="middle" fill="white" fontSize="10">JWT, SAML</text>
        </g>

        {/* Externalized Authorization (XACML) - Light Blue */}
        <g id="externalized-auth">
          <rect x="780" y="220" width="200" height="90" fill="#60A5FA" rx="4" />
          <text x="880" y="250" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Externalized authorization</text>
          <text x="880" y="275" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">(XACML)</text>
        </g>

        {/* Temenos Vault (Light Blue) */}
        <g id="temenos-vault">
          <rect x="780" y="340" width="200" height="110" fill="#60A5FA" rx="4" />
          <text x="880" y="380" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">Temenos Vault</text>
        </g>

        {/* Secrets Management (Purple) */}
        <g id="secrets-management">
          <rect x="1020" y="280" width="160" height="70" fill="#8B5CF6" rx="4" />
          <text x="1100" y="310" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Secrets</text>
          <text x="1100" y="335" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">management</text>
        </g>

        {/* Key Management (Purple) */}
        <g id="key-management">
          <rect x="1020" y="370" width="160" height="70" fill="#8B5CF6" rx="4" />
          <text x="1100" y="400" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Key</text>
          <text x="1100" y="425" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">management</text>
        </g>

        {/* Certificate Management (Purple) */}
        <g id="certificate-management">
          <rect x="1020" y="460" width="160" height="70" fill="#8B5CF6" rx="4" />
          <text x="1100" y="490" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Certificate</text>
          <text x="1100" y="515" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Management</text>
        </g>

        {/* DB (Database) - Cylindrical representation - Aligned horizontally with Data Encryption */}
        <g id="database">
          <ellipse cx="490" cy="600" rx="80" ry="20" fill="#10B981" />
          <rect x="410" y="600" width="160" height="70" fill="#10B981" />
          <ellipse cx="490" cy="670" rx="80" ry="20" fill="#059669" />
          <text x="490" y="640" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">DB</text>
        </g>

        {/* Data Encryption (Bottom Left Purple) - Aligned horizontally with DB */}
        <g id="data-encryption">
          <rect x="20" y="600" width="300" height="110" fill="#8B5CF6" rx="4" />
          <text x="170" y="635" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">Data Encryption</text>
          <text x="170" y="660" textAnchor="middle" fill="white" fontSize="13">(Data-at-rest, in transit)</text>
          <text x="170" y="690" textAnchor="middle" fill="white" fontSize="11">Transparent data encryption</text>
        </g>

        {/* Connection Lines - ALL RED COLOR */}
        {/* User Interface to Authentication */}
        <line x1="200" y1="185" x2="260" y2="210" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* APIs to Authentication */}
        <line x1="200" y1="295" x2="260" y2="210" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* Events to Authorization */}
        <line x1="200" y1="405" x2="260" y2="370" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* Authentication to Bank's IAM */}
        <line x1="480" y1="210" x2="780" y2="135" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* Authentication to Audit */}
        <line x1="480" y1="210" x2="500" y2="190" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* Authentication to Authorization */}
        <line x1="370" y1="280" x2="370" y2="300" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* Authorization to DB */}
        <line x1="370" y1="440" x2="450" y2="600" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* DB to Temenos Vault */}
        <line x1="530" y1="635" x2="780" y2="395" stroke="#EF4444" strokeWidth="2.5" />
        
        {/* Temenos Vault to Secrets Management */}
        <line x1="980" y1="365" x2="1020" y2="315" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Temenos Vault to Key Management */}
        <line x1="980" y1="395" x2="1020" y2="405" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Temenos Vault to Certificate Management */}
        <line x1="980" y1="425" x2="1020" y2="495" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Externalized Authorization to Authorization */}
        <line x1="780" y1="265" x2="480" y2="370" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />

        {/* Connection Lines - Dotted lines - ALL RED COLOR */}
        {/* DB to Data Encryption */}
        <line x1="450" y1="635" x2="320" y2="600" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* APIs to Data Encryption */}
        <line x1="110" y1="340" x2="110" y2="600" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Events to Data Encryption */}
        <line x1="110" y1="450" x2="110" y2="600" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
      </svg>
    </div>
  )
}

