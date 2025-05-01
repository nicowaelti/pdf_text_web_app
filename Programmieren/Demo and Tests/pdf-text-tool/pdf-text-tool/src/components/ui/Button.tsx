import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

export interface CustomButtonProps extends ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ children, variant = 'solid', size = 'md', ...props }: CustomButtonProps) => {
  return (
    <ChakraButton
      variant={variant}
      size={size}
      borderRadius="md"
      _hover={{ transform: 'translateY(-1px)' }}
      transition="all 0.2s"
      {...props}
    >
      {children}
    </ChakraButton>
  );
};