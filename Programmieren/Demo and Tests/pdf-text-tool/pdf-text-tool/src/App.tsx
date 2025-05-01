import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { ErrorBoundary, Layout } from './components/common';
import { FileList, LoadingSpinner, PDFUploader, PDFViewer, UploadError } from './components/pdf';
import { usePDFStore } from './store/pdf.store';
import theme from './styles/theme';

function App() {
  const document = usePDFStore(state => state.document);
  const { isLoading, error } = usePDFStore(state => state.loading);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <ErrorBoundary fallback={<div>Something went wrong. Please try again.</div>}>
          <Layout>
            {isLoading && <LoadingSpinner />}
            {error && <UploadError />}
            <main>
              {!document ? (
                <PDFUploader />
              ) : (
                <>
                  <FileList />
                  <PDFViewer />
                </>
              )}
            </main>
          </Layout>
        </ErrorBoundary>
      </ChakraProvider>
    </>
  );
}

export default App;
