import { HStack, StackProps } from '@chakra-ui/react';

export interface ToolbarProps extends StackProps {
  children: React.ReactNode;
}

export const Toolbar = ({ children, ...props }: ToolbarProps) => {
  return (
    <HStack
      as="nav"
      spacing={2}
      p={2}
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={1}
      {...props}
    >
      {children}
    </HStack>
  );
};