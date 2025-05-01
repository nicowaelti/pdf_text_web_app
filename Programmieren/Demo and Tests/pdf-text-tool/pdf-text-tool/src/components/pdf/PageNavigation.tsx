import { 
  ButtonGroup, 
  HStack, 
  IconButton, 
  Input, 
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { usePDFStore } from '../../store/pdf.store';

export const PageNavigation = () => {
  const document = usePDFStore(state => state.document);
  const { currentPage, zoom } = usePDFStore(state => state.navigation);
  const setCurrentPage = usePDFStore(state => state.setCurrentPage);
  const setZoom = usePDFStore(state => state.setZoom);

  if (!document) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, document.totalPages)));
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  return (
    <HStack spacing={4} p={2} bg="white" borderRadius="md" shadow="sm">
      <ButtonGroup size="sm" isAttached variant="outline">
        <IconButton
          aria-label="Previous page"
          icon={<FiChevronLeft />}
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />
        <HStack px={2} borderX="1px" borderColor="gray.200">
          <Input
            type="number"
            min={1}
            max={document.totalPages}
            value={currentPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
            width="60px"
            textAlign="center"
            size="sm"
          />
          <Text color="gray.500" fontSize="sm">
            / {document.totalPages}
          </Text>
        </HStack>
        <IconButton
          aria-label="Next page"
          icon={<FiChevronRight />}
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage >= document.totalPages}
        />
      </ButtonGroup>

      <ButtonGroup size="sm" isAttached variant="outline">
        <IconButton
          aria-label="Zoom out"
          icon={<FiZoomOut />}
          onClick={() => handleZoomChange(zoom - 0.25)}
          isDisabled={zoom <= 0.25}
        />
        <Tooltip label={`${Math.round(zoom * 100)}%`}>
          <Slider
            aria-label="Zoom level"
            min={0.25}
            max={5}
            step={0.25}
            value={zoom}
            onChange={handleZoomChange}
            width="100px"
            mx={2}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Tooltip>
        <IconButton
          aria-label="Zoom in"
          icon={<FiZoomIn />}
          onClick={() => handleZoomChange(zoom + 0.25)}
          isDisabled={zoom >= 5}
        />
      </ButtonGroup>
    </HStack>
  );
};