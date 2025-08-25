import { Box } from '@chakra-ui/react'
import Routes from './Routes'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Box ml="250px" p={8}>
          <Routes />
        </Box>
      </Box>
    </AuthProvider>
  )
}

export default App 