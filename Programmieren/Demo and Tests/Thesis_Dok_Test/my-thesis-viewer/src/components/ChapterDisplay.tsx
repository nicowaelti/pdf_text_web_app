import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ExtensionSuggestionItem from './ExtensionSuggestionItem.tsx';
import type { ThesisChapter, Section, Paragraph, ExtensionSuggestion, Bibliography } from '../types/thesis';

interface ChapterDisplayProps {
  chapter: ThesisChapter;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  bibliography: Bibliography | null;
}

const ChapterDisplay: React.FC<ChapterDisplayProps> = ({ chapter, onApprove, onReject, bibliography }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [expandedSuggestions, setExpandedSuggestions] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (sectionId: string) => {
    const isCurrentlyExpanded = !!expandedSections[sectionId]; // Capture state before toggle
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));

    // If the section was expanded and is now being collapsed, collapse its suggestions
    if (isCurrentlyExpanded) {
      const newExpandedSuggestions = { ...expandedSuggestions };
      const section = chapter.sections.find(s => s.section_id === sectionId);
      section?.paragraphs.forEach(p => {
        // Only try to collapse if there are suggestions and it might be expanded
        if ((p.extension_suggestions?.filter(sugg => sugg.keep) || []).length > 0) {
          newExpandedSuggestions[p.paragraph_id] = false; // Set to collapsed
        }
      });
      setExpandedSuggestions(newExpandedSuggestions);
    }
  };

  const toggleSuggestions = (paragraphId: string) => {
    setExpandedSuggestions(prev => ({ ...prev, [paragraphId]: !prev[paragraphId] }));
  };

  return (
    <div>
      <h1>{chapter.title}</h1>
      {chapter.sections.map(section => (
        <div key={section.section_id}>
          <h2 onClick={() => toggleSection(section.section_id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {expandedSections[section.section_id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span style={{ marginLeft: '8px' }}>{section.subtitle}</span>
          </h2>
          {expandedSections[section.section_id] && section.paragraphs.map(paragraph => {
            const activeSuggestions = paragraph.extension_suggestions?.filter(sugg => sugg.keep) || [];
            const hasActiveSuggestions = activeSuggestions.length > 0;

            return (
              <div key={paragraph.paragraph_id} style={{ marginLeft: '20px', marginBottom: '15px' }}>
                <p>{paragraph.text}</p>
                {hasActiveSuggestions && (
                  <div style={{ marginTop: '10px' }}>
                    <div
                      onClick={() => toggleSuggestions(paragraph.paragraph_id)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '5px 0',
                        userSelect: 'none'
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSuggestions(paragraph.paragraph_id); }}
                      aria-expanded={!!expandedSuggestions[paragraph.paragraph_id]}
                      aria-controls={`suggestions-${paragraph.paragraph_id}`}
                    >
                      {expandedSuggestions[paragraph.paragraph_id] ? <ChevronUp size={18} /> : <ChevronDown size={18} strokeWidth={2.5} color="green" />}
                      <span style={{ marginLeft: '8px', fontWeight: 500, color: '#333' }}>
                        Suggestions ({activeSuggestions.length})
                      </span>
                    </div>
                    {expandedSuggestions[paragraph.paragraph_id] && (
                      <div
                        id={`suggestions-${paragraph.paragraph_id}`}
                        style={{ marginLeft: '28px', marginTop: '8px', borderLeft: '2px solid #e0e0e0', paddingLeft: '12px' }}
                      >
                        {activeSuggestions.map(suggestion => (
                          <ExtensionSuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApprove={onApprove}
                            onReject={onReject}
                            bibliography={bibliography}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ChapterDisplay;