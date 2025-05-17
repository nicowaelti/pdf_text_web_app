import React, { useState, useEffect } from 'react';
import ChapterDisplay from './components/ChapterDisplay';
import type { ThesisChapter, Section, Paragraph, ExtensionSuggestion, Bibliography, ResolvedCitation } from './types/thesis';

const chapterFiles = [
  '/chapters/chapter2.1.json',
  '/chapters/chapter2.2.json',
  '/chapters/chapter2.3.json',
  '/chapters/chapter2.4.json',
  '/chapters/chapter2.5.json',
];

function App() {
  const [chapters, setChapters] = useState<ThesisChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ThesisChapter | null>(null);
  const [bibliography, setBibliography] = useState<Bibliography | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load Chapters
      const loadedChaptersPromises = chapterFiles.map(async (file) => {
        const response = await fetch(file);
        const data: ThesisChapter = await response.json();
        // Ensure extension_suggestions have id, and initialize choosen and keep if needed
        data.sections.forEach((section: Section) => {
          section.paragraphs.forEach((paragraph: Paragraph) => {
            paragraph.extension_suggestions?.forEach((sugg: ExtensionSuggestion, index: number) => {
              if (!sugg.id) sugg.id = `${paragraph.paragraph_id}-sugg-${index}`; // Made ID more unique
              if (sugg.choosen === undefined) sugg.choosen = false;
              if (sugg.keep === undefined) sugg.keep = true;
            });
          });
        });
        return data;
      });

      // Load Bibliography
      const bibliographyPromise = fetch('/chapters/bibliography.json')
        .then(res => res.json())
        .then(data => data as Bibliography);

      const [loadedChapters, loadedBibliography] = await Promise.all([
        Promise.all(loadedChaptersPromises),
        bibliographyPromise
      ]);
      
      setChapters(loadedChapters);
      setBibliography(loadedBibliography);

      if (loadedChapters.length > 0) {
        setSelectedChapter(loadedChapters[0]);
      }
    };
    loadData();
  }, []);

  const handleApprove = (id: string) => {
    setChapters(prevChapters =>
      prevChapters.map(chapter =>
        updateSuggestionInChapter(chapter, id, { choosen: true, keep: true })
      )
    );
    if (selectedChapter) {
      setSelectedChapter(updateSuggestionInChapter(selectedChapter, id, { choosen: true, keep: true }));
    }
  };

  const handleReject = (id: string) => {
    setChapters(prevChapters =>
      prevChapters.map(chapter =>
        updateSuggestionInChapter(chapter, id, { choosen: true, keep: false })
      )
    );
    if (selectedChapter) {
      setSelectedChapter(updateSuggestionInChapter(selectedChapter, id, { choosen: true, keep: false }));
    }
  };

  const updateSuggestionInChapter = (chapter: ThesisChapter, id: string, updates: { choosen?: boolean, keep?: boolean }): ThesisChapter => {
    return {
      ...chapter,
      sections: chapter.sections.map((section: Section) => ({
        ...section,
        paragraphs: section.paragraphs.map((paragraph: Paragraph) => ({
          ...paragraph,
          extension_suggestions: paragraph.extension_suggestions
            ?.map((sugg: ExtensionSuggestion) =>
              sugg.id === id ? { ...sugg, ...updates } : sugg
            )
            .filter((sugg: ExtensionSuggestion) => sugg.keep)  // Filter out rejected suggestions
        }))
      }))
    };
  };

  return (
    <div style={{ display: 'flex' }}>
      <nav style={{ width: '200px', padding: '1rem' }}>
        <h2>Chapters</h2>
        {chapters.map((chapter, index) => (
          <div
            key={index}
            onClick={() => setSelectedChapter(chapter)}
            style={{ cursor: 'pointer', fontWeight: selectedChapter === chapter ? 'bold' : 'normal' }}
          >
            {chapter.title}
          </div>
        ))}
      </nav>
      <main style={{ flex: 1, padding: '1rem' }}>
        {selectedChapter && (
          <ChapterDisplay
            chapter={selectedChapter}
            onApprove={handleApprove}
            onReject={handleReject}
            bibliography={bibliography}
          />
        )}
      </main>
    </div>
  );
}

export default App;
