import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  HStack,
  Card,
  CardBody,
  Badge,
  Select,
  useToast,
  Spinner,
  Center,
  IconButton,
  useDisclosure,
  VStack,
  Text,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import EditModal from '../components/EditModal';
import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getCards,
  createFareDispute,
} from '../services/api';

interface Trip {
  id: string;
  start_time: string;
  end_time: string;
  entry_location: string;
  exit_location: string;
  fare: number;
  route: string;
  operator: string;
  transit_mode: string;
  adjustable: string;
  card_id: string;
}

interface Card {
  id: string;
  type: string;
}

interface Filters {
  start_date: string;
  end_date: string;
  route: string;
  min_fare: string;
  max_fare: string;
  exit_location: string;
  transit_mode: string;
  adjustable: string;
  operator: string;
  entry_location: string;
}

const locations = [
  'Downtown',
  'Central Station',
  'Shopping Mall',
  'University',
  'Airport Terminal',
  'Business District',
  'Sports Complex',
  'Entertainment Zone',
  'Beach Station',
  'Hospital Hub',
  'Tech Park',
  'Museum District',
  'Zoo Station',
  'Park & Ride',
  'Convention Center',
  'Stadium',
  'Financial District',
  'Tourist Center',
];

const transitModes = ['SubWay', 'Bus', 'Rail'];
const operators = ['Metro Transit', 'City Bus', 'Regional Rail'];
const adjustableOptions = ['Yes', 'No'];

const tripFields = [
  {
    name: 'card_id',
    label: 'Card',
    type: 'select' as const,
          options: [],
  },
  {
    name: 'start_time',
    label: 'Start Time',
    type: 'datetime-local' as const,
  },
  {
    name: 'end_time',
    label: 'End Time',
    type: 'datetime-local' as const,
  },
  {
    name: 'entry_location',
    label: 'Entry Location',
    type: 'select' as const,
    options: locations,
  },
  {
    name: 'exit_location',
    label: 'Exit Location',
    type: 'select' as const,
    options: locations,
  },
  {
    name: 'fare',
    label: 'Fare',
    type: 'number' as const,
  },
  {
    name: 'route',
    label: 'Route',
    type: 'text' as const,
  },
  {
    name: 'operator',
    label: 'Operator',
    type: 'select' as const,
    options: operators,
  },
  {
    name: 'transit_mode',
    label: 'Transit Mode',
    type: 'select' as const,
    options: transitModes,
  },
  {
    name: 'adjustable',
    label: 'Adjustable',
    type: 'select' as const,
    options: adjustableOptions,
  },
];

const filterFields = [
  { id: 'none', label: 'None' },
  { id: 'id', label: 'Trip ID' },
  { id: 'card_id', label: 'Card ID' },
  { id: 'entry_location', label: 'Entry Location' },
  { id: 'exit_location', label: 'Exit Location' },
  { id: 'fare', label: 'Fare' },
  { id: 'route', label: 'Route' },
  { id: 'operator', label: 'Operator' },
  { id: 'transit_mode', label: 'Transit Mode' },
  { id: 'adjustable', label: 'Adjustable' },
  { id: 'start_time', label: 'Start Time' },
  { id: 'end_time', label: 'End Time' },
];

function Purchases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    start_date: '',
    end_date: '',
    route: '',
    min_fare: '',
    max_fare: '',
    exit_location: '',
    transit_mode: '',
    adjustable: '',
    operator: '',
    entry_location: '',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeTrip, setDisputeTrip] = useState<Trip | null>(null);
  const [disputeAmount, setDisputeAmount] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeDate, setDisputeDate] = useState('');
  const [disputeType, setDisputeType] = useState('');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      const sortedData = data.slice().sort((a: Trip, b: Trip) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      setTrips(sortedData);
      setFilteredTrips(sortedData);
    } catch (error) {
      toast({
        title: 'Error fetching trips',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const data = await getCards();
      setCards(data);
      tripFields[0].options = data.map(({ id }: Card) => id);
    } catch (error) {
      toast({
        title: 'Error fetching cards',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchCards();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = [...trips];

      if (filters.start_date) {
        result = result.filter(trip => new Date(trip.start_time) >= new Date(filters.start_date));
      }
      if (filters.end_date) {
        result = result.filter(trip => new Date(trip.end_time) <= new Date(filters.end_date));
      }
      if (filters.route) {
        result = result.filter(trip => 
          trip.route.toLowerCase().includes(filters.route.toLowerCase())
        );
      }
      if (filters.min_fare) {
        result = result.filter(trip => trip.fare >= parseFloat(filters.min_fare));
      }
      if (filters.max_fare) {
        result = result.filter(trip => trip.fare <= parseFloat(filters.max_fare));
      }
      if (filters.exit_location) {
        result = result.filter(trip => 
          trip.exit_location.toLowerCase().includes(filters.exit_location.toLowerCase())
        );
      }
      if (filters.transit_mode) {
        result = result.filter(trip => trip.transit_mode === filters.transit_mode);
      }
      if (filters.adjustable) {
        result = result.filter(trip => trip.adjustable === filters.adjustable);
      }
      if (filters.operator) {
        result = result.filter(trip => trip.operator === filters.operator);
      }
      if (filters.entry_location) {
        result = result.filter(trip => trip.entry_location === filters.entry_location);
      }

      setFilteredTrips(result);
    };

    applyFilters();
  }, [filters, trips]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedTrip(null);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTrip(id);
      toast({
        title: 'Trip deleted',
        status: 'success',
        duration: 3000,
      });
      fetchTrips();
    } catch (error) {
      toast({
        title: 'Error deleting trip',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedTrip) {
        await updateTrip(selectedTrip.id, data);
        toast({
          title: 'Trip updated',
          status: 'success',
          duration: 3000,
        });
      } else {
        await createTrip(data);
        toast({
          title: 'Trip created',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      fetchTrips();
    } catch (error) {
      toast({
        title: selectedTrip ? 'Error updating trip' : 'Error creating trip',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const filterTrips = (trips: Trip[]) => {
    return trips.filter((trip) => {
      if (!searchQuery) return true;
      if (selectedFilter === 'none') {
        return Object.values(trip).some((value) =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return trip[selectedFilter as keyof Trip]
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const openDisputeModal = (trip: Trip) => {
    setDisputeTrip(trip);
    setDisputeAmount(trip.fare.toString());
    setDisputeDescription('');
    setDisputeDate(trip.start_time.slice(0, 10));
    setDisputeType('');
    setIsDisputeOpen(true);
  };

  const handleDisputeSubmit = async () => {
    if (!disputeTrip) return;
    try {
      await createFareDispute({
        dispute_date: disputeDate,
        card_id: disputeTrip.card_id,
        amount: parseFloat(disputeAmount),
        description: disputeDescription,
        trip_id: disputeTrip.id,
        dispute_type: disputeType,
      });
      toast({ title: 'Fare dispute submitted', status: 'success', duration: 3000 });
      setIsDisputeOpen(false);
    } catch (error) {
      toast({ title: 'Error submitting dispute', status: 'error', duration: 3000 });
    }
  };

  return (
    <Box p={4}>
      <Card mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Purchases</Heading>
            
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2}>Date Range</Text>
                <HStack spacing={4}>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  />
                  <Input
                    placeholder="End Tate"
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  />
                </HStack>
              </Box>

              <Box>
                <Text mb={2}>Route</Text>
                <Input
                  placeholder="Route"
                  value={filters.route}
                  onChange={(e) => handleFilterChange('route', e.target.value)}
                />
              </Box>

              <HStack spacing={4} align="flex-start">
                <Box flex={1}>
                  <Text mb={2}>Entry Location</Text>
                  <Select
                    placeholder="Select Entry Location"
                    value={filters.entry_location || ''}
                    onChange={e => handleFilterChange('entry_location', e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </Select>
                </Box>
                <Box flex={1}>
                  <Text mb={2}>Exit Location</Text>
                  <Select
                    placeholder="Select Exit Location"
                    value={filters.exit_location || ''}
                    onChange={e => handleFilterChange('exit_location', e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </Select>
                </Box>
              </HStack>

              <Box>
                <Text mb={2}>Fare Range</Text>
                <HStack spacing={4}>
                  <Input
                    placeholder="Min"
                    value={filters.min_fare}
                    onChange={(e) => handleFilterChange('min_fare', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.max_fare}
                    onChange={(e) => handleFilterChange('max_fare', e.target.value)}
                  />
                </HStack>
              </Box>

              <Box>
                <Text mb={2}>Transit Mode</Text>
                <Select
                  placeholder="Select mode"
                  value={filters.transit_mode}
                  onChange={(e) => handleFilterChange('transit_mode', e.target.value)}
                >
                  {transitModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text mb={2}>Adjustabe</Text>
                <Select
                  placeholder="Select option"
                  value={filters.adjustable}
                  onChange={(e) => handleFilterChange('adjustable', e.target.value)}
                >
                  {adjustableOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text mb={2}>Operator</Text>
                <Select
                  placeholder="Operator"
                  value={filters.operator}
                  onChange={(e) => handleFilterChange('operator', e.target.value)}
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </Select>
              </Box>
            </VStack>

            <HStack justify="flex-end">
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleCreate}
              >
                Add Trip
              </Button>
            </HStack>

            {loading ? (
              <Center p={8}>
                <Spinner />
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Card ID</Th>
                      <Th>Start Time</Th>
                      <Th>End Time</Th>
                      <Th>Entry Location</Th>
                      <Th>Exit Location</Th>
                      <Th>Fare</Th>
                      <Th>Route</Th>
                      <Th>Operator</Th>
                      <Th>Transit Mode</Th>
                      <Th>Adjustable</Th>
                      <Th>Fare Dispute Resolution</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredTrips.map((trip) => (
                      <Tr key={trip.id}>
                        <Td>{trip.id}</Td>
                        <Td>{trip.card_id}</Td>
                        <Td>{formatDateTime(trip.start_time)}</Td>
                        <Td>{formatDateTime(trip.end_time)}</Td>
                        <Td>{trip.id.startsWith('RID') ? '-' : trip.entry_location}</Td>
                        <Td>{trip.id.startsWith('RID') ? '-' : trip.exit_location}</Td>
                        <Td>${trip.fare.toFixed(2)}</Td>
                        <Td>{trip.id.startsWith('RID') ? '-' : trip.route}</Td>
                        <Td>{trip.operator}</Td>
                        <Td>{trip.id.startsWith('RID') ? '-' : trip.transit_mode}</Td>
                        <Td>
                          <Badge
                            colorScheme={trip.adjustable === 'Yes' ? 'green' : 'red'}
                          >
                            {trip.id.startsWith('RID') ? '-' : trip.adjustable}
                          </Badge>
                        </Td>
                        <Td>
                          {!trip.id.startsWith('RID') && (
                            <Button colorScheme="yellow" size="sm" onClick={() => openDisputeModal(trip)}>
                              Fare Dispute
                            </Button>
                          )}
                        </Td>
                        <Td>
                          {!trip.id.startsWith('RID') && (
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit trip"
                                icon={<FiEdit2 />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEdit(trip)}
                              />
                              <IconButton
                                aria-label="Delete trip"
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDelete(trip.id)}
                              />
                            </HStack>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      <EditModal
        isOpen={isOpen}
        onClose={onClose}
        data={selectedTrip}
        title={selectedTrip ? 'Edit Trip' : 'Create Trip'}
        onSave={handleSave}
        fields={tripFields}
      />

      {isDisputeOpen && disputeTrip && (
        <Box pos="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.400" zIndex={1000} display="flex" alignItems="center" justifyContent="center">
          <Box bg="white" p={6} borderRadius="md" minW="350px" boxShadow="lg">
            <Heading size="md" mb={4}>New Fare Dispute</Heading>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text mb={1}>Dispute Date</Text>
                <Input type="date" value={disputeDate} isReadOnly />
              </Box>
              <Box>
                <Text mb={1}>Card ID</Text>
                <Input value={disputeTrip.card_id} isReadOnly />
              </Box>
              <Box>
                <Text mb={1}>Dispute Amount</Text>
                <Input type="number" value={disputeAmount} isReadOnly />
              </Box>
              <Box>
                <Text mb={1}>Dispute Description</Text>
                <Input value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)} />
              </Box>
              <Box>
                <Text mb={1}>Dispute Type</Text>
                <Select placeholder="Select type" value={disputeType} onChange={e => setDisputeType(e.target.value)}>
                  <option value="Duplicate Fare Charged">Duplicate Fare Charged</option>
                  <option value="Incorrect Fare Applied">Incorrect Fare Applied</option>
                  <option value="Failed Tap Entry">Failed Tap Entry</option>
                  <option value="Tap Mismatch - Incomplete Trip">Tap Mismatch - Incomplete Trip</option>
                  <option value="Wrong Fare Zone Applied">Wrong Fare Zone Applied</option>
                </Select>
              </Box>
              <HStack justify="end" mt={2}>
                <Button onClick={() => setIsDisputeOpen(false)}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleDisputeSubmit}>Save</Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Purchases; 