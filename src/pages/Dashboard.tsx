import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  HStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const stats = [
    { label: 'Open Cases', value: '10' },
    { label: 'Pending Refunds', value: '2' },
    { label: 'Incomplete Trips', value: '5' },
  ]

  const mockCards = [
    { id: '1234567890', status: 'Active', balance: '$20.00' },
  ]

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber>{stat.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card mb={8}>
        <CardBody>
          <HStack mb={4}>
            <Input
              placeholder="Search by Card ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => navigate(`/card/${searchQuery}`)}>
              Search
            </Button>
          </HStack>

          <Heading size="md" mb={4}>Recent Cards</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Card ID</Th>
                <Th>Status</Th>
                <Th>Balance</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockCards.map((card) => (
                <Tr key={card.id}>
                  <Td>{card.id}</Td>
                  <Td>{card.status}</Td>
                  <Td>{card.balance}</Td>
                  <Td>
                    <Button size="sm" onClick={() => navigate(`/card/${card.id}`)}>
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Dashboard 