import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

const LogoutCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any remaining auth state and redirect to home
    const handleLogoutCallback = () => {
      // Give a brief moment for cleanup, then redirect
      setTimeout(() => {
        navigate('/');
      }, 500);
    };

    handleLogoutCallback();
  }, [navigate]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
    >
      <VStack gap={4}>
        <Spinner size="xl" />
        <Text fontSize="lg">Signing out...</Text>
      </VStack>
    </Box>
  );
};

export default LogoutCallback;
