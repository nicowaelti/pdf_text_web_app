/**
 * Format markdown content to HTML with mermaid diagram support
 */
export async function formatMarkdown(content: string): Promise<string> {
  const response = await fetch('/api/markdown/format', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error('Failed to format markdown');
  }

  const { html } = await response.json();
  return html;
}

/**
 * Format multiple markdown items for display
 */
export async function formatMarkdownList(items: string[]): Promise<string> {
  const formattedItems = await Promise.all(items.map(item => formatMarkdown(item)));
  return formattedItems.join('\n\n');
}
