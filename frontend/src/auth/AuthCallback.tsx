import { useEffect, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { userManager } from './AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Complete the signin process
        const user = await userManager.signinRedirectCallback();

        if (user) {
          // Get the return URL from state or default to home
          const returnUrl = user.state?.returnUrl || '/';
          navigate(returnUrl);
        }
      } catch (err) {
        console.error('Authentication callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <Box p={8}>
        <VStack gap={4}>
          <Text fontSize="xl" color="red.500">
            Authentication Error
          </Text>
          <Text>{error}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
    >
      <VStack gap={4}>
        <Spinner size="xl" />
        <Text fontSize="lg">Completing authentication...</Text>
      </VStack>
    </Box>
  );
};

export default AuthCallback;
