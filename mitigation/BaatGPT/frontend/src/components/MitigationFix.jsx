import { useState, useEffect } from 'react';

export default function MitigationFix() {
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [mitigations, setMitigations] = useState([]);
  const [saferRewrite, setSaferRewrite] = useState('');

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = () => {
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    if (history.length > 0) {
      const latest = history[history.length - 1];
      setLatestAnalysis(latest);
      generateMitigations(latest);
    }
  };

  const generateMitigations = (analysis) => {
    const steps = [];

    if (analysis.hallucination_risk === 'HIGH') {
      steps.push({
        title: 'Mitigate Hallucination Risk',
        icon: '🌀',
        color: 'red',
        items: [
          'Ask the AI to provide citations and sources for all claims',
          'Add a disclaimer: "This content is AI-generated and may contain inaccuracies"',
          'Implement RAG (Retrieval-Augmented Generation) with verified knowledge base',
          'Cross-verify facts with authoritative sources before publishing',
        ],
        prompt: 'Rewrite the content with citations and verified facts. Add disclaimers for any uncertain information.',
      });
    }

    if (analysis.bias_risk === 'HIGH') {
      steps.push({
        title: 'Mitigate Bias Risk',
        icon: '⚖️',
        color: 'yellow',
        items: [
          'Remove absolute claims and use balanced language',
          'Present multiple perspectives on controversial topics',
          'Avoid stereotypes and generalizations',
          'Use inclusive and neutral terminology',
        ],
        prompt: 'Rewrite the content with balanced, neutral language. Present multiple perspectives and avoid absolute claims.',
      });
    }

    if (analysis.toxicity_risk === 'HIGH') {
      steps.push({
        title: 'Mitigate Toxicity Risk',
        icon: '☠️',
        color: 'red',
        items: [
          'Apply content moderation filters',
          'Remove offensive, inflammatory, or harmful language',
          'Implement a blocklist for toxic terms',
          'Add human review before publication',
        ],
        prompt: 'Rewrite the content to be respectful, constructive, and non-harmful. Remove all offensive language.',
      });
    }

    if (analysis.pii_leak) {
      steps.push({
        title: 'Mitigate PII Leak',
        icon: '🔒',
        color: 'red',
        items: [
          'Mask or redact personal information (names, emails, phone numbers)',
          'Remove credit card numbers, SSNs, and other sensitive IDs',
          'Replace specific identifiers with generic placeholders',
          'Implement PII detection and redaction pipeline',
        ],
        prompt: 'Rewrite the content with all personal information masked. Replace emails with [EMAIL], phone numbers with [PHONE], names with [NAME], etc.',
      });
    }

    if (analysis.fraud_risk === 'HIGH') {
      steps.push({
        title: 'Mitigate Fraud Risk',
        icon: '🚨',
        color: 'red',
        items: [
          'Remove urgency tactics and pressure language',
          'Remove guarantees and unrealistic promises',
          'Add verification steps for claims',
          'Include warnings about scams and fraud',
        ],
        prompt: 'Rewrite the content to remove urgency, guarantees, and unrealistic promises. Add appropriate disclaimers and verification steps.',
      });
    }

    if (steps.length === 0) {
      steps.push({
        title: 'Content Looks Good',
        icon: '✅',
        color: 'green',
        items: [
          'No major risks detected',
          'Content passes all safety checks',
          'Ready for publication with standard review',
        ],
        prompt: '',
      });
    }

    setMitigations(steps);
    if (steps.length > 0 && steps[0].prompt) {
      setSaferRewrite(generateSaferVersion(analysis.text, steps));
    }
  };

  const generateSaferVersion = (originalText, steps) => {
    if (!originalText) return '';
    
    let safer = originalText;
    
    if (steps.some(s => s.title.includes('PII'))) {
      safer = safer
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
        .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN]')
        .replace(/\b\d{16}\b/g, '[CARD]');
    }
    
    if (steps.some(s => s.title.includes('Fraud'))) {
      safer = safer
        .replace(/guaranteed?|guarantee/gi, 'potential')
        .replace(/100%|certain/gi, 'possible')
        .replace(/get rich quick|make money fast/gi, 'investment opportunity')
        .replace(/limited time|act now|call now/gi, 'available')
        .replace(/\$/g, 'approximately $');
    }
    
    safer += '\n\n⚠️ Disclaimer: This content has been automatically sanitized for safety. Please review before use.';
    
    return safer;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const copyAllPrompts = () => {
    const allPrompts = mitigations
      .filter(m => m.prompt)
      .map(m => `${m.title}:\n${m.prompt}`)
      .join('\n\n');
    copyToClipboard(allPrompts);
  };

  if (!latestAnalysis) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛡️</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Analysis Available</h2>
        <p className="text-gray-400">Run an analysis first to see mitigation suggestions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Mitigation Fix</h2>
          <p className="text-gray-400">Step-by-step risk mitigation strategies</p>
        </div>
        {mitigations.some(m => m.prompt) && (
          <button
            onClick={copyAllPrompts}
            className="px-4 py-2 bg-accent-blue/20 border border-accent-blue text-accent-blue rounded-xl hover:bg-accent-blue/30 transition-colors font-medium"
          >
            📋 Copy All Fix Prompts
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {mitigations.map((mitigation, idx) => (
            <div
              key={idx}
              className={`bg-dark-card border rounded-2xl p-6 ${
                mitigation.color === 'red'
                  ? 'border-red-500/30'
                  : mitigation.color === 'yellow'
                  ? 'border-yellow-500/30'
                  : 'border-green-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{mitigation.icon}</span>
                <h3 className="text-xl font-bold text-white">{mitigation.title}</h3>
              </div>

              <ul className="space-y-2 mb-4">
                {mitigation.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className={`${mitigation.color === 'green' ? 'text-green-400' : 'text-white'}`}>
                      {mitigation.color === 'green' ? '✅' : '✓'}
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              {mitigation.prompt && (
                <button
                  onClick={() => copyToClipboard(mitigation.prompt)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:border-accent-blue transition-colors text-sm"
                >
                  📋 Copy Fix Prompt
                </button>
              )}
            </div>
          ))}
        </div>

        {saferRewrite && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Suggested Safer Rewrite</h3>
              <button
                onClick={() => copyToClipboard(saferRewrite)}
                className="px-3 py-1 bg-accent-blue/20 border border-accent-blue text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors text-sm"
              >
                📋 Copy
              </button>
            </div>
            <div className="bg-dark-bg border border-dark-border rounded-xl p-4 max-h-[600px] overflow-y-auto">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{saferRewrite}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              ⚠️ This is an automated suggestion. Always review and validate before use.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
