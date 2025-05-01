# PDF Text Tool

A modern web application for processing PDF files and displaying their text content. Built with React, TypeScript, and Vite.

## Project Overview

PDF Text Tool is a web-based utility that allows users to:
- Upload PDF files and extract their text content
- View PDF text content with proper formatting
- Navigate through pages using keyboard shortcuts or UI controls
- Zoom in/out to adjust text size
- Maintain a clean and responsive interface

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pdf-text-tool.git
cd pdf-text-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Open the application in your browser (default: http://localhost:5173)
2. Click the upload button or drag and drop a PDF file
3. Once uploaded, the text content will be displayed
4. Use the navigation controls or keyboard shortcuts to browse through pages

### Keyboard Shortcuts

- `→` or `PageDown`: Next page
- `←` or `PageUp`: Previous page
- `Home`: First page
- `End`: Last page

## Features

- **PDF Upload**: Drag and drop or click to upload PDF files
- **Text Extraction**: Accurate text content extraction from PDF files
- **Page Navigation**: 
  - Intuitive UI controls for page navigation
  - Keyboard shortcuts support
  - Page number input for direct access
- **Zoom Control**: 
  - Zoom in/out buttons
  - Slider for precise zoom level control
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages for invalid files or processing issues
- **Progress Indicator**: Loading spinner with progress percentage
- **Modern UI**: Clean interface using Chakra UI components

## Development

### Project Structure

```
pdf-text-tool/
├── src/
│   ├── components/
│   │   ├── common/         # Common UI components
│   │   ├── pdf/           # PDF-specific components
│   │   └── ui/            # Basic UI components
│   ├── services/          # PDF processing service
│   ├── store/             # State management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── tests/               # Test files
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage
```

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript type checking

### Technologies Used

- React
- TypeScript
- Vite
- Chakra UI
- Zustand (State Management)
- PDF.js (PDF Processing)
- Vitest + React Testing Library (Testing)

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
