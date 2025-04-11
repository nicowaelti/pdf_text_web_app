import { NextResponse } from 'next/server';
import MarkdownIt from 'markdown-it';
import mermaid from 'markdown-it-mermaid';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});
md.use(mermaid);

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    console.log('Received markdown content:', content);

    if (!content) {
      console.log('No content provided');
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const html = md.render(content);
    console.log('Generated HTML:', html);
    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error formatting markdown:', error);
    return NextResponse.json(
      { error: 'Failed to format markdown' },
      { status: 500 }
    );
  }
}
