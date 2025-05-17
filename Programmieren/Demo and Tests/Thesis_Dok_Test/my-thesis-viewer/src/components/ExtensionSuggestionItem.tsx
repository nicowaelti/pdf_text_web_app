import React from 'react';
import { Check, X } from 'lucide-react';
import type { ExtensionSuggestion, Bibliography, ResolvedCitation } from '../types/thesis';

interface ExtensionSuggestionItemProps {
  suggestion: ExtensionSuggestion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  bibliography: Bibliography | null;
}

const ExtensionSuggestionItem: React.FC<ExtensionSuggestionItemProps> = ({ suggestion, onApprove, onReject, bibliography }) => {
  
  const getCitationDisplay = () => {
    if (!bibliography || !bibliography.resolved_citations) {
      return suggestion.citation; // Fallback to ID if no bibliography
    }
    const foundCitation = bibliography.resolved_citations.find(
      (cit: ResolvedCitation) => cit.citation_id === suggestion.citation
    );

    if (foundCitation) {
      const authorShort = foundCitation.author.length > 50 ? `${foundCitation.author.substring(0, 50)}...` : foundCitation.author;
      return `${authorShort} (${foundCitation.year || 'N.D.'}). ${foundCitation.title}.`;
    }
    return suggestion.citation; // Fallback to ID if not found
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', backgroundColor: '#f9f9f9' }}>
      <p><strong>Text:</strong> {suggestion.text}</p>
      <p style={{ fontSize: '0.8em', color: '#555', fontStyle: 'italic', marginTop: '5px' }}>
        Source: {getCitationDisplay()}
      </p>
      {suggestion.relevance && <p><strong>Relevance:</strong> {suggestion.relevance}%</p>}
      {suggestion["Main Statement"] && <p><strong>Main Statement:</strong> {suggestion["Main Statement"]}</p>}
      {/* <p><strong>Chosen:</strong> {suggestion.choosen ? 'Yes' : 'No'}</p> */}
      {/* <p><strong>Keep:</strong> {suggestion.keep ? 'Yes' : 'No'}</p> */}
      <div>
        <button onClick={() => onApprove(suggestion.id)}>Approve</button>
        <button onClick={() => onReject(suggestion.id)}>Reject</button>
      </div>
    </div>
  );
};

export default ExtensionSuggestionItem;