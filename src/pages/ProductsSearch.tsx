import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  useToast,
  Card as ChakraCard,
  CardBody,
  Badge,
  Divider,
  SimpleGrid,
  Icon,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaUser, FaExclamationCircle, FaSearch } from 'react-icons/fa'
import { getCards, getCustomers, getTrips, getCases, getTapHistoryByCustomer } from '../services/api'

interface Trip {
  id: string;
  card_id: string;
  entry_location: string;
  exit_location: string;
  fare: number;
  route: string;
  operator: string;
  transit_mode: string;
  start_time: string;
  end_time: string;
}

interface Case {
  id: string;
  type: string;
  status: string;
  priority: string;
  created_at: string;
  notes: string;
}

interface TapHistoryEntry {
  id: string;
  tap_time: string;
  location: string;
  device_id: string;
  transit_mode: string;
  direction: string;
  customer_id: string;
  result: string;
}

interface CardDetails {
  card: {
    id: string;
    type: string;
    status: string;
    balance: number;
    issue_date: string;
    customer_id: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  trips: Trip[];
  cases: Case[];
}

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const [tapHistory, setTapHistory] = useState<TapHistoryEntry[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Please enter a product number',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    setError('')
    setCardDetails(null)
    setTapHistory([])

    try {
      const cards = await getCards()
      const card = cards.find((c: any) => c.id === searchQuery)
      
      if (!card) {
        setError('Product not found')
        setIsLoading(false)
        return
      }

      const customers = await getCustomers()
      const customer = customers.find((c: any) => c.id === card.customer_id)

      if (!customer) {
        setError('Customer information not found')
        setIsLoading(false)
        return
      }

      const allTrips = await getTrips()
      console.log('All trips:', allTrips)
      
      const cardTrips = allTrips
        .filter((t: any) => {
          console.log('Checking trip:', t)
          console.log('Card ID match?', t.card_id === card.id)
          return t.card_id === card.id
        })
        .map((trip: any) => {
          console.log('Processing trip:', trip)
          const processed = {
            id: trip.id || '',
            card_id: trip.card_id || '',
            entry_location: trip.entry_location || '',
            exit_location: trip.exit_location || '',
            fare: typeof trip.fare === 'number' ? trip.fare : parseFloat(trip.fare) || 0,
            route: trip.route || '',
            operator: trip.operator || '',
            transit_mode: trip.transit_mode || '',
            start_time: trip.start_time || new Date().toISOString(),
            end_time: trip.end_time || new Date().toISOString()
          }
          console.log('Processed trip:', processed)
          return processed
        })
        .sort((a: Trip, b: Trip) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, 5)

      console.log('Final cardTrips:', cardTrips)

      const allCases = await getCases()
      const customerCases = allCases
        .filter((c: any) => c.customer_id === card.customer_id)
        .map((case_: any) => ({
          id: case_.id || '',
          type: case_.type || '',
          status: case_.status || 'Unknown',
          priority: case_.priority || 'Normal',
          created_at: case_.created_at || new Date().toISOString(),
          notes: case_.notes || ''
        }))
        .sort((a: Case, b: Case) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)

      setCardDetails({
        card: {
          id: card.id || '',
          type: card.type || '',
          status: card.status || 'Unknown',
          balance: typeof card.balance === 'number' ? card.balance : 0,
          issue_date: card.issue_date || new Date().toISOString(),
          customer_id: card.customer_id || ''
        },
        customer: {
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
  
        },
        trips: cardTrips,
        cases: customerCases
      })

      const tapHistoryData = await getTapHistoryByCustomer(card.customer_id)
      setTapHistory(
        tapHistoryData
          .sort((a: TapHistoryEntry, b: TapHistoryEntry) => new Date(b.tap_time).getTime() - new Date(a.tap_time).getTime())
          .slice(0, 5)
      )
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error fetching card details',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      })
      setError('Failed to fetch card details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'gray'
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'green'
      case 'blocked':
        return 'red'
      case 'expired':
        return 'gray'
      case 'suspended':
        return 'yellow'
      case 'completed':
        return 'green'
      case 'pending':
        return 'yellow'
      case 'resolved':
        return 'green'
      case 'open':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'blue'
    
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'blue'
      default:
        return 'blue'
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString()
    } catch {
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Search Section */}
        <Box 
          bg="white" 
          p={8} 
          borderRadius="xl" 
          boxShadow="sm"
          backgroundImage="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
        >
          <VStack spacing={4} align="center" maxW="600px" mx="auto">
            <Heading size="xl">Product Search</Heading>
                          <Text fontSize="lg">Enter your product number to view details</Text>
            <HStack w="100%">
              <Input
                placeholder="Enter Card Number"
                size="lg"
                bg="white"
                color="gray.800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                _placeholder={{ color: 'black.400' }}
              />
              <Button
                leftIcon={<FaSearch />}
                colorScheme="blue"
                size="lg"
                onClick={handleSearch}
                isLoading={isLoading}
                px={8}
              >
                Find
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Results Section */}
        {isLoading && (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        )}

        {error && (
          <Box textAlign="center" py={10}>
            <Text color="red.500" fontSize="xl">{error}</Text>
          </Box>
        )}

        {cardDetails && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Card Details */}
            <ChakraCard
              bg="white"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="sm"
            >
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Box>
                      <Text color="gray.500" fontSize="sm">Card Number</Text>
                      <Text fontSize="2xl" fontWeight="bold">{cardDetails.card.id}</Text>
                    </Box>
                    <Badge
                      colorScheme={getStatusColor(cardDetails.card.status)}
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {cardDetails.card.status}
                    </Badge>
                  </HStack>
                  <Divider />
                  <Box>
                    <Text color="gray.500" fontSize="sm">Balance</Text>
                    <Text fontSize="2xl" fontWeight="bold">{formatCurrency(cardDetails.card.balance)}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.500" fontSize="sm">Card Type</Text>
                    <Text fontSize="lg">{cardDetails.card.type}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.500" fontSize="sm">Issue Date</Text>
                    <Text fontSize="lg">{formatDate(cardDetails.card.issue_date)}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </ChakraCard>

            {/* Customer Details + Tabbed Section */}
            <ChakraCard
              bg="white"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="sm"
            >
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Icon as={FaUser} color="blue.500" boxSize={6} />
                    <Heading size="md">Customer Information</Heading>
                  </HStack>
                  <Box>
                    <Text color="gray.500" fontSize="sm">Name</Text>
                    <Text fontSize="lg" fontWeight="medium">{cardDetails.customer.name}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.500" fontSize="sm">Email</Text>
                    <Text fontSize="lg">{cardDetails.customer.email}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.500" fontSize="sm">Phone</Text>
                    <Text fontSize="lg">{cardDetails.customer.phone}</Text>
                  </Box>
                  <Box>
                    
                  </Box>
                  <Divider />
                  {/* Tabs for Trips, Cases, Tap History */}
                  <Tabs colorScheme="blue" variant="enclosed">
                    <TabList>
                      <Tab>Recent Trips</Tab>
                      <Tab>Recent Cases</Tab>
                      <Tab>Recent Tap History</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0}>
                        {cardDetails.trips.length === 0 ? (
                          <Text color="gray.500" textAlign="center">No recent trips found</Text>
                        ) : (
                          cardDetails.trips.map((trip) => (
                            <Box key={trip.id} p={3} bg="gray.50" borderRadius="md" mb={2}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">
                                    {trip.entry_location} → {trip.exit_location}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {formatDate(trip.start_time)}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {trip.route} • {trip.operator} • {trip.transit_mode}
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Text fontWeight="bold">{formatCurrency(trip.fare)}</Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))
                        )}
                      </TabPanel>
                      <TabPanel px={0}>
                        {cardDetails.cases.length === 0 ? (
                          <Text color="gray.500" textAlign="center">No recent cases found</Text>
                        ) : (
                          cardDetails.cases.map((case_) => (
                            <Box key={case_.id} p={3} bg="gray.50" borderRadius="md" mb={2}>
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{case_.type}</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {formatDate(case_.created_at)}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                    {case_.notes}
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Badge colorScheme={getStatusColor(case_.status)}>
                                    {case_.status}
                                  </Badge>
                                  <Badge colorScheme={getPriorityColor(case_.priority)}>
                                    {case_.priority}
                                  </Badge>
                                </VStack>
                              </HStack>
                            </Box>
                          ))
                        )}
                      </TabPanel>
                      <TabPanel px={0}>
                        {tapHistory.length === 0 ? (
                          <Text color="gray.500" textAlign="center">No recent tap history found</Text>
                        ) : (
                          tapHistory.map((tap) => (
                            <Box key={tap.id} p={3} bg="gray.50" borderRadius="md" mb={2}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">
                                    {tap.location} • {tap.device_id}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {new Date(tap.tap_time).toLocaleString()} • {tap.transit_mode} • {tap.direction}
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Text fontWeight="bold" color={
                                    tap.result === 'Success' ? 'green.500' : tap.result === 'Failure' ? 'red.500' : 'orange.500'
                                  }>
                                    {tap.result}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </CardBody>
            </ChakraCard>
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  )
}

export default ProductSearch 