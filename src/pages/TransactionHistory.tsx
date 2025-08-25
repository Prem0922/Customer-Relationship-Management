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
  Card,
  CardBody,
  Input,
  HStack,
  Select,
  Spinner,
  Center,
  VStack,
  Text,
} from '@chakra-ui/react';
import { getTapHistory, updateTapHistory } from '../services/api';
import { format } from 'date-fns';
import EditModal from '../components/EditModal';

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

const filterFields = [
  { id: 'none', label: 'None' },
  { id: 'id', label: 'ID' },
  { id: 'location', label: 'Location' },
  { id: 'device_id', label: 'Device ID' },
  { id: 'transit_mode', label: 'Transit Mode' },
  { id: 'direction', label: 'Direction' },
  { id: 'customer_id', label: 'Customer ID' },
  { id: 'result', label: 'Result' },
];

const TransactionHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [tapHistory, setTapHistory] = useState<TapHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<TapHistoryEntry | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTapHistory();
        setTapHistory(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterTapHistory = (entries: TapHistoryEntry[]) => {
    if (!searchQuery) return entries;
    const searchLower = searchQuery.toLowerCase();
    return entries.filter(entry => {
      switch (selectedFilter) {
        case 'none':
          return (
            entry.id.toLowerCase().includes(searchLower) ||
            entry.location.toLowerCase().includes(searchLower) ||
            entry.device_id.toLowerCase().includes(searchLower) ||
            entry.transit_mode.toLowerCase().includes(searchLower) ||
            entry.direction.toLowerCase().includes(searchLower) ||
            entry.customer_id.toLowerCase().includes(searchLower) ||
            entry.result.toLowerCase().includes(searchLower)
          );
        case 'id':
          return entry.id.toLowerCase().includes(searchLower);
        case 'location':
          return entry.location.toLowerCase().includes(searchLower);
        case 'device_id':
          return entry.device_id.toLowerCase().includes(searchLower);
        case 'transit_mode':
          return entry.transit_mode.toLowerCase().includes(searchLower);
        case 'direction':
          return entry.direction.toLowerCase().includes(searchLower);
        case 'customer_id':
          return entry.customer_id.toLowerCase().includes(searchLower);
        case 'result':
          return entry.result.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
  };

  const filteredHistory = filterTapHistory(tapHistory);

  const handleOpenEdit = (entry: TapHistoryEntry) => {
    setEditData(entry);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (data: any) => {
    if (!editData) return;
    await updateTapHistory(editData.id, data);
    const updated = await getTapHistory();
    setTapHistory(updated);
  };

  if (loading) {
    return (
      <Center h="500px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Heading mb={6}>Transaction History</Heading>
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">Filter By</Text>
            <HStack spacing={4}>
              <Select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                maxW="200px"
              >
                {filterFields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </Select>
              <Input
                placeholder={`Search in ${selectedFilter === 'none' ? 'All Fields' : filterFields.find(f => f.id === selectedFilter)?.label}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                flex={1}
              />
            </HStack>
          </VStack>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Tap Time</Th>
                <Th>Location</Th>
                <Th>Device ID</Th>
                <Th>Transit Mode</Th>
                <Th>Direction</Th>
                <Th>Customer ID</Th>
                <Th>Result</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredHistory.length === 0 ? (
                <Tr>
                  <Td colSpan={9}>
                    <Text color="gray.500" textAlign="center">No tap history found.</Text>
                  </Td>
                </Tr>
              ) : (
                filteredHistory.map((entry) => (
                  <Tr key={entry.id}>
                    <Td>{entry.id}</Td>
                    <Td>{format(new Date(entry.tap_time), 'MMM d, yyyy HH:mm:ss')}</Td>
                    <Td>{entry.location}</Td>
                    <Td>{entry.device_id}</Td>
                    <Td>{entry.transit_mode}</Td>
                    <Td>{entry.direction}</Td>
                    <Td>{entry.customer_id}</Td>
                    <Td>
                      <Text
                        color={
                          entry.result === 'Success'
                            ? 'green.500'
                            : entry.result === 'Failure'
                            ? 'red.500'
                            : 'orange.500'
                        }
                      >
                        {entry.result}
                      </Text>
                    </Td>
                    <Td>
                      <button onClick={() => handleOpenEdit(entry)} style={{ padding: '4px 10px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Tap Correction
                      </button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Tap Correction"
        fields={[
          { name: 'tap_time', label: 'Tap Time', type: 'datetime-local' },
          { name: 'location', label: 'Location', type: 'text' },
          { name: 'device_id', label: 'Device ID', type: 'text' },
          { name: 'transit_mode', label: 'Transit Mode', type: 'text' },
          { name: 'direction', label: 'Direction', type: 'text' },
          { name: 'customer_id', label: 'Customer ID', type: 'text' },
          { name: 'result', label: 'Result', type: 'text' },
        ]}
        data={editData}
        onSave={handleSaveEdit}
      />
    </Box>
  );
};

export default TransactionHistory; 