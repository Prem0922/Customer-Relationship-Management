import {
  Box,
  Card,
  CardBody,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  FormControl,
  FormLabel,
  HStack,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useState } from 'react'

const PurchaseHistory = () => {
  const [dateRange, setDateRange] = useState('30')
  const [mode, setMode] = useState('all')

  const mockPurchases = [
    {
      date: 'Jan 23, 2024',
      mode: 'Bus',
      route: 'Route 1',
      location: 'Union Sq',
      status: 'Incomplete',
    },
    {
      date: 'Jan 22, 2024',
      mode: 'Subway',
      route: '4 Train',
      location: 'Main St',
      status: 'Complete',
    },
    {
      date: 'Jan 21, 2024',
      mode: 'Subway',
      route: '2 Train',
      location: 'Central',
      status: 'Complete',
    },
  ]

  return (
    <Box>
      <Card mb={6}>
        <CardBody>
          <Stack spacing={6}>
            <HStack spacing={4}>
              <FormControl maxW="200px">
                <FormLabel>Date Range</FormLabel>
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </Select>
              </FormControl>
              <FormControl maxW="200px">
                <FormLabel>Mode</FormLabel>
                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="all">All Modes</option>
                  <option value="bus">Bus</option>
                  <option value="subway">Subway</option>
                </Select>
              </FormControl>
              <Button alignSelf="flex-end">Apply Filters</Button>
            </HStack>

            {mockPurchases.some(purchase => purchase.status === 'Incomplete') && (
              <Alert status="warning">
                <AlertIcon />
                There are incomplete purchases in the history
              </Alert>
            )}

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Mode</Th>
                  <Th>Route</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockPurchases.map((purchase, index) => (
                  <Tr key={index}>
                    <Td>{purchase.date}</Td>
                    <Td>{purchase.mode}</Td>
                    <Td>{purchase.route}</Td>
                    <Td>{purchase.location}</Td>
                    <Td color={purchase.status === 'Incomplete' ? 'orange.500' : 'green.500'}>
                      {purchase.status}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default PurchaseHistory 