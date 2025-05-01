import { IconButton as ChakraIconButton, IconButtonProps as ChakraIconButtonProps, Tooltip } from '@chakra-ui/react';

export interface IconButtonProps extends Omit<ChakraIconButtonProps, 'aria-label'> {
  label: string;
  icon: React.ReactElement;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const IconButton = ({ 
  label, 
  icon, 
  tooltipPlacement = 'top',
  ...props 
}: IconButtonProps) => {
  return (
    <Tooltip label={label} placement={tooltipPlacement}>
      <ChakraIconButton
        aria-label={label}
        icon={icon}
        borderRadius="md"
        _hover={{ transform: 'translateY(-1px)' }}
        transition="all 0.2s"
        {...props}
      />
    </Tooltip>
  );
};