import { Admonition } from '@/components/ui/Admonition'

interface PlatformCalloutProps {
  platform: string
  type?: 'warning' | 'tip' | 'info'
  children: React.ReactNode
}

// Map platform slugs to display names
const platformNames: Record<string, string> = {
  'anthropic-claude': 'Anthropic Claude (MCP)',
  'openai-frontier': 'OpenAI Frontier',
  'microsoft-copilot-studio': 'Microsoft Copilot Studio',
  'amazon-bedrock-agents': 'Amazon Bedrock Agents',
  'google-vertex-ai': 'Google Vertex AI',
  'langchain-langgraph': 'LangChain LangGraph',
  'crewai': 'CrewAI',
  'tray-ai': 'Tray.ai',
  'workato': 'Workato',
  'servicenow-ai-agents': 'ServiceNow AI Agents',
  'salesforce-agentforce': 'Salesforce Agentforce',
}

export function PlatformCallout({ platform, type = 'info', children }: PlatformCalloutProps) {
  const displayName = platformNames[platform] || platform

  return (
    <Admonition type={type} title={displayName}>
      {children}
    </Admonition>
  )
}
