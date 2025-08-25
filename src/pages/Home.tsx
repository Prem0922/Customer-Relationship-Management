import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { FaCreditCard, FaUsers, FaRoute, FaFolder, FaHistory } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const QuickAccessCard = ({ to, icon, title, description }: {
  to: string;
  icon: any;
  title: string;
  description: string;
}) => (
  <Card
    as={Link}
    to={to}
    _hover={{
      transform: 'translateY(-4px)',
      shadow: 'lg',
      textDecoration: 'none'
    }}
    transition="all 0.2s"
  >
    <CardBody>
      <VStack spacing={4} align="center">
        <Icon as={icon} boxSize={8} color="blue.500" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.600" textAlign="center">{description}</Text>
      </VStack>
    </CardBody>
  </Card>
)

const Home = () => {
  const quickAccess = [
    {
      to: '/product-search',
      icon: FaCreditCard,
      title: 'Product Search',
      description: 'Search and view detailed product information'
    },
    {
      to: '/customers',
      icon: FaUsers,
      title: 'Customers',
      description: 'View and update customer information'
    },
    {
      to: '/purchases',
      icon: FaRoute,
      title: 'Purchases',
      description: 'Track purchase history and manage incomplete purchases'
    },
    {
      to: '/service-request',
      icon: FaFolder,
      title: 'Service Request',
      description: 'Handle customer service requests and support'
    },
    {
      to: '/transaction-history',
      icon: FaHistory,
      title: 'Transaction History',
      description: 'View detailed transaction history and interactions'
    },
    {
      to: '/register-product',
      icon: FaCreditCard,
      title: 'Register Product',
      description: 'Register a new product'
    }
  ]

  return (
    <Box>
              <Heading mb={2}>Welcome to Customer Management Application</Heading>
      <Text color="gray.600" mb={8}>
        Manage Products, Customer Information, Purchases & Service Requests all in one place.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {quickAccess.map((item) => (
          <QuickAccessCard key={item.to} {...item} />
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default Home 