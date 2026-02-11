/**
 * Structured RAG Display Component
 * 
 * Displays RAG content in a well-structured, human-friendly format
 * with proper headings, paragraphs, and sections.
 */

interface StructuredRAGDisplayProps {
  architecturalOverview: string
  functionalOverview: string
  capabilities: string[]
  componentName?: string
  componentType?: string
  service?: any
}

export function StructuredRAGDisplay({
  architecturalOverview,
  functionalOverview,
  capabilities = [],
  componentName,
  componentType,
  service
}: StructuredRAGDisplayProps) {
  // Remove unused props warning by using them
  void componentName
  void componentType
  void service
  
  // Helper function to parse markdown tables
  const parseMarkdownTable = (text: string): {headers: string[], rows: string[][]} | null => {
    const lines = text.split('\n').filter(l => l.trim())
    let tableStart = -1
    let headers: string[] = []
    const rows: string[][] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter(c => c && !c.match(/^[-:]+$/))
        if (cells.length > 0) {
          if (tableStart === -1) {
            // First row is headers
            headers = cells
            tableStart = i
          } else if (i === tableStart + 1) {
            // Second row is separator, skip it
            continue
          } else {
            // Data rows
            if (cells.length === headers.length) {
              rows.push(cells)
            }
          }
        }
      } else if (tableStart !== -1) {
        // End of table
        break
      }
    }
    
    if (headers.length > 0 && rows.length > 0) {
      return { headers, rows }
    }
    return null
  }
  
  // Parse architectural overview into structured sections with proper formatting
  // CANONICAL PARSER: Works for ALL microservices using Event Store as reference
  const parseArchitecturalOverview = (text: string) => {
    // Always return the canonical structure, even if text is empty
    const sections: any = {
      executiveSummary: "",
      sections: [], // Structured sections with headings and paragraphs
      lifecycle: [],
      components: [],
      deployment: [],
      nonGoals: []
    }
    
    // More lenient check - only exclude obvious error messages at the START
    // RAG API provides information for ALL microservices, so be less aggressive
    const lowerText = text?.toLowerCase() || ''
    if (!text || text.trim().length < 10) {
      // Return empty structure - UI will show "Not available" gracefully
      return sections
    }
    // Only filter if it's an explicit error message at the START (not if it appears somewhere in the text)
    if (lowerText.trim().startsWith("information not available") || 
        lowerText.trim().startsWith("i cannot provide") ||
        lowerText.trim().startsWith("no information available")) {
      // Return empty structure - UI will show "Not available" gracefully
      return sections
    }
    
    // Parse sections A, B, C, D, etc. from the original RAG format
    // Look for patterns like "## A) Architecture Overview" or "A) Architecture Overview"
    // This works for ALL microservices - Event Store, Adapter, Generic Config, etc.
    const sectionMatches = text.match(/(?:##?\s*)?([A-G])\)\s*([^\n]+)/g)
    
    if (sectionMatches) {
      // Split text by section headers
      const sectionParts = text.split(/(?:##?\s*)?[A-G]\)\s*/)
      
      for (let i = 0; i < sectionMatches.length; i++) {
        const match = sectionMatches[i]
        const sectionLetter = match.match(/([A-G])\)/)?.[1]
        const sectionTitle = match.match(/\)\s*([^\n]+)/)?.[1]?.trim() || ''
        
        if (sectionLetter && i + 1 < sectionParts.length) {
          const sectionContent = sectionParts[i + 1]?.trim() || ''
          
          // Section A) Architecture Overview - Executive Summary
          if (sectionLetter === 'A' || sectionTitle.toLowerCase().includes('architecture overview')) {
            const contentLines = sectionContent.split('\n').filter(l => l.trim() && !l.match(/^##?\s*[A-G]\)/))
            if (contentLines.length > 0) {
              const summary = contentLines.join(' ').trim()
              // Remove duplicate sentences
              const sentences = summary.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
              const uniqueSentences: string[] = []
              for (const sent of sentences) {
                const normalized = sent.toLowerCase().replace(/\s+/g, ' ')
                if (!uniqueSentences.some(existing => existing.toLowerCase().replace(/\s+/g, ' ') === normalized)) {
                  uniqueSentences.push(sent)
                }
              }
              if (uniqueSentences.length > 0) {
                sections.executiveSummary = uniqueSentences.join('. ') + '.'
              }
            }
          }
          
          // Section B) Patterns & Guarantees - Parse table properly
          if (sectionLetter === 'B' || sectionTitle.toLowerCase().includes('pattern')) {
            // Parse markdown table
            const tableData = parseMarkdownTable(sectionContent)
            if (tableData && tableData.rows.length > 0) {
              sections.sections.push({
                heading: sectionTitle || 'Patterns & Guarantees',
                table: tableData
              })
            } else {
              sections.sections.push({
                heading: sectionTitle || 'Patterns & Guarantees',
                paragraphs: [sectionContent]
              })
            }
          }
          
          // Section C) Event Processing Flow / Canonical Event Lifecycle
          if (sectionLetter === 'C' || sectionTitle.toLowerCase().includes('lifecycle') || sectionTitle.toLowerCase().includes('event processing') || sectionTitle.toLowerCase().includes('flow')) {
            const numberedSteps = sectionContent.match(/\d+[.)]\s*([^\n]+)/g)
            if (numberedSteps) {
              sections.lifecycle = numberedSteps.map(step => {
                const clean = step.replace(/^\d+[.)]\s*/, '').replace(/\*\*/g, '').trim()
                return clean.replace(/\s+[a-z]{1,4}$/i, '')
              }).filter(step => step.length >= 15)
            }
          }
          
          // Section D) Components & Interactions
          if (sectionLetter === 'D' || sectionTitle.toLowerCase().includes('component') || sectionTitle.toLowerCase().includes('interaction')) {
            const tableRows = sectionContent.match(/\|([^|]+)\|([^|]+)\|([^|]*)\|/g)
            if (tableRows) {
              for (const row of tableRows) {
                const parts = row.split('|').map(p => p.trim()).filter(p => p && !p.match(/^[-|:]+$/))
                if (parts.length >= 2) {
                  sections.components.push({
                    name: parts[0],
                    responsibility: parts[1],
                    notes: parts[2] || ""
                  })
                }
              }
            }
            // Parse markdown table
            const tableData = parseMarkdownTable(sectionContent)
            if (tableData && tableData.rows.length > 0) {
              sections.sections.push({
                heading: sectionTitle || 'Components & Interactions',
                table: tableData
              })
            } else {
              sections.sections.push({
                heading: sectionTitle || 'Components & Interactions',
                paragraphs: [sectionContent]
              })
            }
          }
          
          // Section E) Integration Landscape
          if (sectionLetter === 'E' || sectionTitle.toLowerCase().includes('integration')) {
            // Parse markdown table
            const tableData = parseMarkdownTable(sectionContent)
            if (tableData && tableData.rows.length > 0) {
              sections.sections.push({
                heading: sectionTitle || 'Integration Landscape',
                table: tableData
              })
            } else {
              sections.sections.push({
                heading: sectionTitle || 'Integration Landscape',
                paragraphs: [sectionContent]
              })
            }
          }
          
          // Section F) Deployment Snapshot
          if (sectionLetter === 'F' || sectionTitle.toLowerCase().includes('deployment')) {
            const bullets = sectionContent.match(/^[-*•]\s+([^\n]+)/gm)
            if (bullets) {
              sections.deployment = bullets.map(b => b.replace(/^[-*•]\s+/, '').trim()).filter(b => b.length > 10)
            }
            sections.sections.push({
              heading: sectionTitle || 'Deployment Snapshot',
              paragraphs: [sectionContent]
            })
          }
          
          // Section G) Observability & Resilience - Skip per user request
          // But we can still parse it if needed
        }
      }
    }
    
    // Fallback: Extract Executive Summary if no sections found
    if (!sections.executiveSummary) {
      const lines = text.split('\n').filter(l => l.trim())
      let execSummaryLines: string[] = []
      let inExecSummary = true
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        
        // Stop at major section headers
        if (trimmed.match(/^##?\s*[A-G]\)/) || 
            trimmed.match(/^##\s+(Architecture|Design|Components|Deployment|Integration|Security|Observability)/i) ||
            trimmed.match(/^\*\*[A-Z]/)) {
          inExecSummary = false
          break
        }
        
        if (inExecSummary && trimmed.length > 20) {
          execSummaryLines.push(trimmed)
        }
      }
      
      if (execSummaryLines.length > 0) {
        let summary = execSummaryLines.join(' ').replace(/^##?\s*[A-G]\)\s*/, '').trim()
        const sentences = summary.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
        const uniqueSentences: string[] = []
        for (const sent of sentences) {
          const normalized = sent.toLowerCase().replace(/\s+/g, ' ')
          if (!uniqueSentences.some(existing => existing.toLowerCase().replace(/\s+/g, ' ') === normalized)) {
            uniqueSentences.push(sent)
          }
        }
        if (uniqueSentences.length > 0) {
          sections.executiveSummary = uniqueSentences.join('. ') + '.'
        }
      }
    }
    
    // Parse structured sections with headings and paragraphs (only if we didn't already parse A-G sections)
    if (sections.sections.length === 0) {
      // Look for patterns like "**Heading**" or "## Heading" or "**Heading** -"
      const sectionPatterns = [
        /^\*\*([^*]+)\*\*\s*[:\-]?\s*(.*)/,  // **Heading**: content
        /^##\s+(.+)/,  // ## Heading
        /^###\s+(.+)/,  // ### Heading
        /^([A-Z][^:]+):\s*(.+)/  // Heading: content
      ]
      
      const allLines = text.split('\n').filter(l => l.trim())
      let currentSection: {heading: string, paragraphs: string[]} | null = null
      let currentParagraph: string[] = []
      
      for (const line of allLines) {
        const trimmed = line.trim()
        if (!trimmed) {
          // Empty line - end current paragraph if we have content
          if (currentParagraph.length > 0 && currentSection) {
            const para = currentParagraph.join(' ').trim()
            if (para.length > 20) {
              currentSection.paragraphs.push(para)
            }
            currentParagraph = []
          }
          continue
        }
        
        // Check if this is a section header
        let isHeader = false
        let heading = ''
        let content = ''
        
        for (const pattern of sectionPatterns) {
          const match = trimmed.match(pattern)
          if (match) {
            isHeader = true
            heading = match[1].trim()
            content = match[2]?.trim() || ''
            break
          }
        }
        
        // Also check for bold text at start of line
        if (!isHeader && trimmed.match(/^\*\*[^*]+\*\*/)) {
          const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*[:\-]?\s*(.*)/)
          if (boldMatch) {
            isHeader = true
            heading = boldMatch[1].trim()
            content = boldMatch[2].trim()
          }
        }
        
        if (isHeader) {
          // Save previous section
          if (currentSection) {
            if (currentParagraph.length > 0) {
              const para = currentParagraph.join(' ').trim()
              if (para.length > 20) {
                currentSection.paragraphs.push(para)
              }
            }
            if (currentSection.paragraphs.length > 0 || currentSection.heading.length > 0) {
              sections.sections.push(currentSection)
            }
          }
          
          // Start new section
          currentSection = {
            heading: heading,
            paragraphs: []
          }
          currentParagraph = []
          
          // If there's content after the heading, add it
          if (content && content.length > 20) {
            currentParagraph.push(content)
          }
        } else {
          // Regular content line
          if (trimmed.match(/^[-*•]\s+/)) {
            // Bullet point - add to current paragraph
            const bulletContent = trimmed.replace(/^[-*•]\s+/, '').replace(/\*\*/g, '').trim()
            if (bulletContent.length > 10) {
              currentParagraph.push(bulletContent)
            }
          } else if (trimmed.length > 20) {
            // Regular paragraph text
            const cleanLine = trimmed.replace(/\*\*/g, '').trim()
            if (cleanLine.length > 20) {
              currentParagraph.push(cleanLine)
            }
          }
        }
      }
      
      // Save last section
      if (currentSection) {
        if (currentParagraph.length > 0) {
          const para = currentParagraph.join(' ').trim()
          if (para.length > 20) {
            currentSection.paragraphs.push(para)
          }
        }
        if (currentSection.paragraphs.length > 0 || currentSection.heading.length > 0) {
          sections.sections.push(currentSection)
        }
      }
    }
    
    // Parse Event Processing Flow
    const lifecycleMatch = text.match(/Event Processing Flow|Canonical Event Lifecycle|Event Lifecycle/i)
    if (lifecycleMatch) {
      const lifecycleStart = text.indexOf(lifecycleMatch[0])
      const lifecycleText = text.substring(lifecycleStart)
      const numberedSteps = lifecycleText.match(/\d+[.)]\s*([^\n]+)/g)
      if (numberedSteps) {
        sections.lifecycle = numberedSteps.map(step => {
          const clean = step.replace(/^\d+[.)]\s*/, '').replace(/\*\*/g, '').trim()
          // Remove incomplete endings
          return clean.replace(/\s+[a-z]{1,4}$/i, '')
        }).filter(step => step.length >= 15)
      }
    }
    
    // Parse Components table
    const componentsMatch = text.match(/Components.*Interactions|Key Components/i)
    if (componentsMatch) {
      const componentsText = text.substring(text.indexOf(componentsMatch[0]))
      const tableRows = componentsText.match(/\|([^|]+)\|([^|]+)\|([^|]*)\|/g)
      if (tableRows) {
        for (const row of tableRows) {
          const parts = row.split('|').map(p => p.trim()).filter(p => p && !p.match(/^[-|:]+$/))
          if (parts.length >= 2) {
            sections.components.push({
              name: parts[0],
              responsibility: parts[1],
              notes: parts[2] || ""
            })
          }
        }
      }
    }
    
    // Parse Deployment
    const deploymentMatch = text.match(/Deployment|Runtime Deployment/i)
    if (deploymentMatch) {
      const deploymentText = text.substring(text.indexOf(deploymentMatch[0]))
      const bullets = deploymentText.match(/^[-*•]\s+([^\n]+)/gm)
      if (bullets) {
        sections.deployment = bullets.map(b => b.replace(/^[-*•]\s+/, '').trim()).filter(b => b.length > 10)
      }
    }
    
    return sections
  }
  
  // Parse functional overview into structured sections
  // CANONICAL PARSER: Works for ALL microservices using Event Store as reference
  const parseFunctionalOverview = (text: string) => {
    // Always return the canonical structure, even if text is empty
    const funcSections: any = {
      sections: [],
      capabilities: []
    }
    
    // More lenient check - only exclude obvious error messages at the START
    // RAG API provides information for ALL microservices, so be less aggressive
    if (!text || text.trim().length < 10) {
      // Return empty structure - UI will show "Not available" gracefully
      return funcSections
    }
    // Only filter if it's an explicit error message at the START (not if it appears somewhere in the text)
    const lowerText = text.toLowerCase().trim()
    if (lowerText.startsWith("information not available") || 
        lowerText.startsWith("i cannot provide") ||
        lowerText.startsWith("no information available")) {
      // Return empty structure - UI will show "Not available" gracefully
      return funcSections
    }
    
    const sections: any = {
      sections: [],
      capabilities: []
    }
    
    // Similar parsing as architectural overview
    const lines = text.split('\n').filter(l => l.trim())
    let currentSection: {heading: string, paragraphs: string[]} | null = null
    let currentParagraph: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        if (currentParagraph.length > 0 && currentSection) {
          const para = currentParagraph.join(' ').trim()
          if (para.length > 20) {
            currentSection.paragraphs.push(para)
          }
          currentParagraph = []
        }
        continue
      }
      
      // Check for section headers
      const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*[:\-]?\s*(.*)/)
      if (boldMatch) {
        if (currentSection) {
          if (currentParagraph.length > 0) {
            const para = currentParagraph.join(' ').trim()
            if (para.length > 20) {
              currentSection.paragraphs.push(para)
            }
          }
          if (currentSection.paragraphs.length > 0) {
            sections.sections.push(currentSection)
          }
        }
        currentSection = {
          heading: boldMatch[1].trim(),
          paragraphs: []
        }
        currentParagraph = []
        if (boldMatch[2] && boldMatch[2].trim().length > 20) {
          currentParagraph.push(boldMatch[2].trim())
        }
      } else if (trimmed.length > 20) {
        const cleanLine = trimmed.replace(/\*\*/g, '').trim()
        if (cleanLine.length > 20) {
          currentParagraph.push(cleanLine)
        }
      }
    }
    
    if (currentSection) {
      if (currentParagraph.length > 0) {
        const para = currentParagraph.join(' ').trim()
        if (para.length > 20) {
          currentSection.paragraphs.push(para)
        }
      }
      if (currentSection.paragraphs.length > 0) {
        sections.sections.push(currentSection)
      }
    }
    
    return sections
  }
  
  // Parse capabilities array properly - handle split text
  const parseCapabilities = (caps: string[]) => {
    const parsed: Array<{name: string, description: string}> = []
    
    // First pass: merge split capabilities
    const mergedCaps: string[] = []
    for (let i = 0; i < caps.length; i++) {
      const cap = caps[i]
      if (!cap || typeof cap !== 'string') continue
      
      let cleanCap = cap.replace(/\*\*/g, '').trim()
      
      // Check if this looks like a continuation of previous
      if (i > 0 && mergedCaps.length > 0) {
        const prevCap = mergedCaps[mergedCaps.length - 1]
        const prevEndsWith = prevCap.match(/\s+(or|and|to|for|after|with|by|in|on|at|the|a|an)$/i)
        const currentStartsLower = cleanCap.match(/^[a-z]/)
        
        if (prevEndsWith && currentStartsLower && cleanCap.length < 50) {
          mergedCaps[mergedCaps.length - 1] = prevCap + ' ' + cleanCap
          continue
        }
      }
      
      mergedCaps.push(cleanCap)
    }
    
    // Second pass: parse merged capabilities
    for (const cap of mergedCaps) {
      if (cap.includes('I cannot provide') || cap.includes('not available') || cap.length < 15) {
        continue
      }
      
      if (/^[a-z]{1,3}$/i.test(cap)) {
        continue
      }
      
      if (cap.toLowerCase().includes('below is a comprehensive') || 
          cap.toLowerCase().includes('functional capabilities and responsibilities') ||
          cap.toLowerCase().includes('key business processes handled')) {
        continue
      }
      
      // Try to extract name and description
      const boldMatch = cap.match(/\*\*([^*]+)\*\*\s*[:\-]?\s*(.+)/)
      if (boldMatch && boldMatch[2].trim().length > 5) {
        const name = boldMatch[1].trim()
        const desc = boldMatch[2].trim()
        parsed.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          description: desc.charAt(0).toUpperCase() + desc.slice(1)
        })
        continue
      }
      
      const colonMatch = cap.match(/^([^:\-]+?)[:\-]\s*(.+)/)
      if (colonMatch && colonMatch[1].trim().length > 5 && colonMatch[2].trim().length > 5) {
        const name = colonMatch[1].trim()
        const desc = colonMatch[2].trim()
        parsed.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          description: desc.charAt(0).toUpperCase() + desc.slice(1)
        })
        continue
      }
      
      if (cap.length > 30 && !cap.match(/\s+(or|and|to|for|after|with|by|in|on|at|the|a|an)$/i)) {
        const words = cap.split(/\s+/)
        if (words.length > 8) {
          const nameWords = words.slice(0, 10)
          const descWords = words.slice(10)
          const name = nameWords.join(' ')
          const desc = descWords.join(' ')
          parsed.push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            description: desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : ""
          })
        } else {
          parsed.push({
            name: cap.charAt(0).toUpperCase() + cap.slice(1),
            description: ""
          })
        }
      }
    }
    
    // Remove duplicates and format
    const unique: Array<{name: string, description: string}> = []
    for (const cap of parsed) {
      const capName = cap.name.trim()
      const capDesc = cap.description.trim()
      
      const formattedName = capName.length > 0 && capName[0] !== capName[0].toUpperCase() 
        ? capName.charAt(0).toUpperCase() + capName.slice(1)
        : capName
      
      const formattedDesc = capDesc.length > 0 && capDesc[0] !== capDesc[0].toUpperCase()
        ? capDesc.charAt(0).toUpperCase() + capDesc.slice(1)
        : capDesc
      
      const formattedCap = {
        name: formattedName,
        description: formattedDesc
      }
      
      const existing = unique.find(c => 
        c.name.toLowerCase() === formattedCap.name.toLowerCase() ||
        (c.name.toLowerCase().includes(formattedCap.name.toLowerCase()) && formattedCap.name.length > 20) ||
        (formattedCap.name.toLowerCase().includes(c.name.toLowerCase()) && c.name.length > 20)
      )
      
      if (!existing) {
        unique.push(formattedCap)
      } else if (formattedCap.description && !existing.description) {
        existing.description = formattedCap.description
      } else if (formattedCap.description && existing.description && formattedCap.description.length > existing.description.length) {
        existing.description = formattedCap.description
      }
    }
    
    return unique
  }

  // Parse 12-factor format: ## 1. Purpose & Scope, ## 2. Architectural Role, ... ## 12. Explicit Non-Goals / Out-of-Scope
  const parse12FactorSections = (text: string): Array<{ title: string; content: string }> => {
    const sections: Array<{ title: string; content: string }> = []
    if (!text || text.trim().length < 10) return sections

    const lowerText = text.toLowerCase().trim()
    if (lowerText.startsWith('information not available') || lowerText.startsWith('i cannot provide')) {
      return sections
    }

    // Must contain 12-factor format indicator
    if (!text.includes('## 1.') && !text.includes('##1.')) return sections

    // Split by ## N. SectionName pattern (lenient: allow ##1. or ## 1. with optional space)
    const headerPattern = /^##\s*(\d+\.\s*[^\n]+)\s*$/gm
    const matches = [...text.matchAll(headerPattern)]
    if (matches.length === 0) return sections

    for (let i = 0; i < matches.length; i++) {
      const title = matches[i][1].trim()
      const startIdx = matches[i].index! + matches[i][0].length
      const endIdx = i + 1 < matches.length ? matches[i + 1].index! : text.length
      let content = text.slice(startIdx, endIdx).trim()
      content = content.replace(/^#+\s*/gm, '').trim()
      if (content.length > 0) {
        sections.push({ title, content })
      }
    }
    return sections
  }

  const twelveFactorSections = parse12FactorSections(architecturalOverview)
  const has12FactorFormat = twelveFactorSections.length > 0

  const archSections = parseArchitecturalOverview(architecturalOverview)
  const funcSections = parseFunctionalOverview(functionalOverview)
  const parsedCapabilities = parseCapabilities(capabilities)
  const runtimeDeployment = service?.runtimeDeployment || null

  const hasArchitectureSections = archSections.sections.length > 0
  const hasFunctionalSections = funcSections.sections.length > 0
  const hasCapabilitiesTable = parsedCapabilities.length > 0
  const hasNonGoals = archSections.nonGoals.length > 0

  const hasRuntimeDeployment =
    runtimeDeployment &&
    (runtimeDeployment.serviceType ||
      runtimeDeployment.namespace ||
      runtimeDeployment.region ||
      runtimeDeployment.resourceGroup)

  const renderTable = (table: { headers: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-slate-700/40">
          <tr>
            {table.headers.map((header, hIdx) => (
              <th key={hIdx} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
          {table.rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {cell.replace(/\*\*/g, '').trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderParagraphs = (paragraphs: string[]) => (
    <div className="space-y-3">
      {paragraphs.map((para, idx) => (
        <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  )

  // Render 12-factor section content (markdown-like bullets to HTML)
  const render12FactorContent = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim())
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed) return null
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span>{trimmed.replace(/^[-*]\s*/, '').trim()}</span>
              </div>
            )
          }
          return (
            <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {trimmed}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Quick facts */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
        <h6 className="font-semibold text-purple-900 dark:text-purple-200 text-xs uppercase tracking-wide mb-3">At a Glance</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Component</div>
            <div className="text-gray-700 dark:text-gray-300">{componentName || 'Unknown'}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Platform</div>
            <div className="text-gray-700 dark:text-gray-300">Temenos Transact</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Logical Role</div>
            <div className="text-gray-700 dark:text-gray-300">
              {has12FactorFormat && twelveFactorSections[0]
                ? (() => {
                    const first = twelveFactorSections[0].content
                    const line = first.split('\n').find(l => l.trim().startsWith('- Responsibility:'))
                    if (line) return line.replace(/^-\s*Responsibility:\s*/i, '').trim().substring(0, 120)
                    const fallback = first.split('\n')[0]?.replace(/^-\s*/, '').trim()
                    return (fallback || 'Core banking microservice').substring(0, 120)
                  })()
                : archSections.executiveSummary.substring(0, 120) || 'Core banking microservice'}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Deployment Substrate</div>
            <div className="text-gray-700 dark:text-gray-300">{componentType || runtimeDeployment?.serviceType || 'Azure'}</div>
          </div>
        </div>
      </div>

      {/* 12-factor expandable sections */}
      {has12FactorFormat ? (
        twelveFactorSections.map((section, idx) => (
          <details
            key={idx}
            open={idx === 0}
            className="group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg px-5 py-4 list-none flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform text-gray-500 dark:text-gray-400">▶</span>
              {section.title}
            </summary>
            <div className="px-5 pb-5 pl-9">
              {render12FactorContent(section.content)}
            </div>
          </details>
        ))
      ) : (
        <>
          <details open className="group bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
              Executive Summary
            </summary>
            <div className="mt-3">
              {archSections.executiveSummary ? (
                <div className="space-y-3">
                  {archSections.executiveSummary
                    .split(/[.!?]+/)
                    .filter((s: string) => s.trim().length > 10)
                    .map((sentence: string, idx: number) => (
                      <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {sentence.trim() + (sentence.trim().match(/[.!?]$/) ? '' : '.')}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Information not available for this component.</p>
              )}
            </div>
          </details>

          <details className="group bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
              Architecture & Design
            </summary>
            <div className="mt-4 space-y-6">
              {hasArchitectureSections ? (
                archSections.sections.map((section: any, sIdx: number) => (
                  <div key={sIdx} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    {section.heading && (
                      <h6 className="font-semibold text-gray-900 dark:text-white mb-3">{section.heading}</h6>
                    )}
                    {section.table ? renderTable(section.table) : renderParagraphs(section.paragraphs || [])}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Architectural details not available.</p>
              )}
            </div>
          </details>

          <details className="group bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
              Functional Capabilities
            </summary>
            <div className="mt-4 space-y-6">
              {hasCapabilitiesTable ? (
                renderTable({
                  headers: ['Capability', 'Description'],
                  rows: parsedCapabilities.slice(0, 20).map((cap: any) => [cap.name, cap.description || '-'])
                })
              ) : hasFunctionalSections ? (
                <div className="space-y-4">
                  {funcSections.sections.map((section: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      {section.heading && <h6 className="font-semibold text-gray-900 dark:text-white mb-3">{section.heading}</h6>}
                      {renderParagraphs(section.paragraphs || [])}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Functional capabilities not available.</p>
              )}
            </div>
          </details>
        </>
      )}

      {hasNonGoals && !has12FactorFormat && (
        <details className="group bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-800">
          <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
            Explicit Non-Goals
          </summary>
          <ul className="mt-4 list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {archSections.nonGoals.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </details>
      )}

      {hasRuntimeDeployment && (
        <details className="group bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 border border-indigo-200 dark:border-indigo-800">
          <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
            Runtime Deployment (Azure)
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {runtimeDeployment?.serviceType && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Service Type:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{runtimeDeployment.serviceType}</span>
              </div>
            )}
            {runtimeDeployment?.namespace && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Namespace:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-mono">{runtimeDeployment.namespace}</span>
              </div>
            )}
            {runtimeDeployment?.region && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Region:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{runtimeDeployment.region}</span>
              </div>
            )}
            {runtimeDeployment?.resourceGroup && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Resource Group:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{runtimeDeployment.resourceGroup}</span>
              </div>
            )}
          </div>
        </details>
      )}

    </div>
  )
}
