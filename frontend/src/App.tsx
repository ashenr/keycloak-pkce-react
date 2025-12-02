import { Box, Button, Card, Container, Heading, HStack, Spinner, Text, VStack, Code } from '@chakra-ui/react'
import { useAuth } from './auth/AuthContext'
import { Link } from 'react-router-dom'

function App() {
  const { user, isLoading, isAuthenticated, login, logout, getAccessToken } = useAuth();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="100vh"
      >
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text fontSize="lg">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Container maxW="container.md" py={10}>
        <VStack gap={6} align="stretch">
          <Heading textAlign="center">
            Keycloak PKCE Authentication Demo
          </Heading>

          <Card.Root>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    Authentication Status
                  </Text>
                  <Box
                    px={3}
                    py={1}
                    borderRadius="md"
                    bg={isAuthenticated ? 'green.100' : 'red.100'}
                    color={isAuthenticated ? 'green.800' : 'red.800'}
                  >
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </Box>
                </HStack>

                {!isAuthenticated ? (
                  <VStack gap={4}>
                    <Text>Please sign in to access protected resources.</Text>
                    <Button 
                      onClick={login} 
                      colorScheme="blue" 
                      size="lg"
                      width="full"
                    >
                      Sign In with Keycloak
                    </Button>
                  </VStack>
                ) : (
                  <VStack gap={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold" mb={2}>User Information:</Text>
                      <VStack gap={2} align="stretch">
                        <Text>
                          <strong>Name:</strong> {user?.profile.name || 'N/A'}
                        </Text>
                        <Text>
                          <strong>Email:</strong> {user?.profile.email || 'N/A'}
                        </Text>
                        <Text>
                          <strong>Username:</strong> {user?.profile.preferred_username || 'N/A'}
                        </Text>
                        <Text>
                          <strong>Subject:</strong> {user?.profile.sub || 'N/A'}
                        </Text>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb={2}>Access Token</Text>
                      <Code 
                        display="block" 
                        p={3} 
                        borderRadius="md"
                        fontSize="sm"
                        wordBreak="break-all"
                      >
                        {getAccessToken()}...
                      </Code>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb={2}>Token Expiration:</Text>
                      <Text>
                        {user?.expires_at 
                          ? new Date(user.expires_at * 1000).toLocaleString()
                          : 'N/A'}
                      </Text>
                    </Box>

                    <HStack width="full" gap={2}>
                      <Button 
                        onClick={logout} 
                        colorScheme="red" 
                        size="lg"
                        flex="1"
                      >
                        Sign Out
                      </Button>
                      <Button 
                        as={Link}
                        to="/api-test"
                        colorScheme="blue" 
                        size="lg"
                        flex="1"
                      >
                        Test API
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {isAuthenticated && (
            <Card.Root>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Heading size="md">Full User Profile (JSON)</Heading>
                  <Code 
                    display="block" 
                    p={4} 
                    borderRadius="md"
                    fontSize="xs"
                    overflow="auto"
                    maxH="400px"
                  >
                    <pre>{JSON.stringify(user?.profile, null, 2)}</pre>
                  </Code>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Container>
    </>
  )
}

export default App