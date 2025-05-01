import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { usePDFStore } from '../../store/pdf.store';

export const TextContent: React.FC = () => {
  const document = usePDFStore(state => state.document);
  const { currentPage, zoom } = usePDFStore(state => state.navigation);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  if (!document || !document.pages[currentPage - 1]) {
    return null;
  }

  const currentPageContent = document.pages[currentPage - 1];
  const { width: actualWidth, height: actualHeight } = currentPageContent.metadata;
  const items = currentPageContent.lines.flatMap(line => line.items);
  
  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="md"
      shadow="sm"
      width={`${actualWidth * zoom}px`}
      height={`${actualHeight * zoom}px`}
      position="relative"
      mx="auto"
      overflow="auto"
    >
      <Box
        position="absolute"
        inset={0}
        p={6}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {items.map((item, index) => {
          const [a, b, c, d, e, f] = item.transform; // Destructure full transform matrix

          // Adjust the 'f' value for the inverted Y-axis in HTML/CSS
          const adjustedF = actualHeight - f;

          // Apply the full transform matrix directly using CSS transform
          // The matrix includes scaling, skewing, rotation, and translation (e, f)
          return (
            <Text
              key={index}
              position="absolute"
              style={{
                fontFamily: item.fontName,
                fontSize: '0.8px', // Use a base font size, scaling is handled by the matrix
                transform: `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${adjustedF})`, // Apply full matrix transform with adjusted f
                transformOrigin: 'top left', // Set transform origin to top left
                whiteSpace: 'pre',
                padding: 0,
                margin: 0,
                lineHeight: '1',
                color: textColor,
                width: 'auto',
                height: 'auto',
                overflow: 'visible'
              }}
            >
              {item.str}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
};