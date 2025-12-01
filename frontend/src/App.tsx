import { Button, HStack } from '@chakra-ui/react'

import { Provider } from './components/ui/provider'

function App() {

  return (
    <Provider>
      {/* Sample UI for Chakra UI */}
      <HStack>
      <Button>Click me</Button>
      <Button>Click me</Button>
    </HStack>
    </Provider>
  )
}

export default App
