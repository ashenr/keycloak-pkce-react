import { useState } from 'react';
import { Button, Card, Container, Heading, VStack, Text, Code } from '@chakra-ui/react';
import { useApi } from '../services/api';

export const ApiTestPage = () => {
  const { get, post } = useApi();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async (endpoint: string, method: 'get' | 'post' = 'get') => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let data;
      if (method === 'get') {
        data = await get(endpoint);
      } else {
        data = await post(endpoint, { sample: 'data', timestamp: new Date().toISOString() });
      }
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack gap={6} align="stretch">
        <Heading>API Test Page</Heading>

        <Card.Root>
          <Card.Body>
            <VStack gap={3} align="stretch">
              <Text fontWeight="bold">Test Protected Endpoints:</Text>
              
              <Button
                onClick={() => handleApiCall('/api/protected')}
                colorScheme="blue"
                loading={loading}
              >
                GET /api/protected
              </Button>

              <Button
                onClick={() => handleApiCall('/api/user/profile')}
                colorScheme="teal"
                loading={loading}
              >
                GET /api/user/profile
              </Button>

              <Button
                onClick={() => handleApiCall('/api/user/roles')}
                colorScheme="purple"
                loading={loading}
              >
                GET /api/user/roles
              </Button>

              <Button
                onClick={() => handleApiCall('/api/data', 'post')}
                colorScheme="green"
                loading={loading}
              >
                POST /api/data
              </Button>

              <Button
                onClick={() => handleApiCall('/api/admin/users')}
                colorScheme="orange"
                loading={loading}
              >
                GET /api/admin/users (Admin Only)
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>

        {error && (
          <Card.Root bg="red.50">
            <Card.Body>
              <Text color="red.600" fontWeight="bold">Error:</Text>
              <Text color="red.600">{error}</Text>
            </Card.Body>
          </Card.Root>
        )}

        {response && (
          <Card.Root>
            <Card.Body>
              <VStack gap={3} align="stretch">
                <Text fontWeight="bold">Response:</Text>
                <Code
                  display="block"
                  p={4}
                  borderRadius="md"
                  fontSize="sm"
                  overflow="auto"
                  maxH="400px"
                >
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </Code>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Container>
  );
};
