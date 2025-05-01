import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const theme = extendTheme({
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900'
      }
    })
  },
  components: {
    PDFViewer: {
      baseStyle: (props: { colorMode: string }) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        borderRadius: 'lg',
        shadow: 'lg',
        p: { base: 4, md: 6 },
        minH: { base: '80vh', md: '85vh' }
      })
    },
    FileList: {
      baseStyle: {
        maxH: '200px',
        overflowY: 'auto',
        mb: 4
      }
    },
    PageNavigation: {
      baseStyle: (props: { colorMode: string }) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        p: 2,
        borderRadius: 'md',
        shadow: 'sm'
      })
    }
  },
  config,
  breakpoints: {
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em'
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif'
  }
})

export default theme