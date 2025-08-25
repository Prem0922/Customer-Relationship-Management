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
  IconButton,
  useDisclosure,
  Button,
  HStack,
  useToast,
  Badge,
  Card,
  CardBody,
  Input,
  Select,
  VStack,
  Text,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown } from 'react-icons/fi';
import EditModal from '../components/EditModal';
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
  getCustomers,
  getCards,
} from '../services/api';

const AGENTS = [
  'John Smith',
  'Sarah Johnson',
  'Mike Wilson',
  'Lisa Anderson',
  'David Brown',
  'Emma Davis',
  'Alex Turner',
  'Maria Garcia',
  'James Lee',
  'Rachel White'
];

interface Case {
  id: string;
  created_date: string;
  last_updated: string;
  customer_id: string;
  card_id: string;
  case_status: string;
  priority: string;
  category: string;
  assigned_agent: string;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
}

const CASE_CATEGORIES = [
  "Card issue",
  "Trip Dispute",
  "Eligibility verification",
  "Refund Request"
];

const CASE_STATUSES = [
  "Escalated",
  "Open",
  "In progress",
  "Closed"
];

const CASE_PRIORITIES = [
  "High",
  "Low",
  "Medium",
  "Critical"
];

type FieldType = 'number' | 'select' | 'text' | 'textarea';

interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
}

const caseFields = [
  {
    name: 'customer_id',
    label: 'Customer',
    type: 'select' as const,
    options: [],
  },
  {
    name: 'card_id',
    label: 'Card',
    type: 'select' as const,
    options: [],
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    options: CASE_CATEGORIES,
  },
  {
    name: 'case_status',
    label: 'Status',
    type: 'select' as const,
    options: CASE_STATUSES,
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select' as const,
    options: CASE_PRIORITIES,
  },
  {
    name: 'assigned_agent',
    label: 'Assigned Agent',
    type: 'select' as const,
    options: AGENTS,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea' as const,
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'blue';
    case 'in progress':
      return 'yellow';
    case 'closed':
      return 'gray';
    case 'escalated':
      return 'red';
    case 'on hold':
      return 'orange';
    case 'resolved':
      return 'green';
    case 'reopened':
      return 'purple';
    default:
      return 'gray';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'gray';
    case 'medium':
      return 'blue';
    case 'high':
      return 'yellow';
    case 'critical':
      return 'orange';
    case 'urgent':
      return 'red';
    default:
      return 'gray';
  }
};

const filterFields = [
  { id: 'none', label: 'None' },
  { id: 'id', label: 'ID' },
  { id: 'customer', label: 'Customer' },
  { id: 'category', label: 'Category' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'assigned_to', label: 'Assigned To' },
  { id: 'created_at', label: 'Created At' },
];

interface ICard {
  id: string;
  type: string;
  status: string;
  balance: number;
  issue_date: string;
  customer_id: string;
}

const ServiceRequest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cards, setCards] = useState<ICard[]>([]);
  const [filteredCards, setFilteredCards] = useState<ICard[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchCases = async () => {
    try {
      const data = await getCases();
      setCases(data);
    } catch (error) {
      toast({
        title: 'Error fetching cases',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
      caseFields[0].options = data.map(({ id }: Customer) => id);
    } catch (error) {
      toast({
        title: 'Error fetching customers',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchCards = async () => {
    try {
      const data = await getCards();
      setCards(data);
    } catch (error) {
      toast({
        title: 'Error fetching cards',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchCases();
    fetchCustomers();
    fetchCards();
  }, []);

  const handleEdit = (caseItem: Case) => {
    setSelectedCase(caseItem);
    const filtered = cards.filter(card => card.customer_id === caseItem.customer_id);
    setFilteredCards(filtered);
    caseFields[1].options = filtered.map(card => card.id);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedCase(null);
    setFilteredCards([]);
    caseFields[1].options = [];
    onOpen();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCase(id);
      await fetchCases();
      toast({
        title: 'Case deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting case',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSave = async (data: any) => {
    const sanitizedData = { ...data };
    delete sanitizedData.created_at;
    delete sanitizedData.created_date;
    const requiredFields = [
      'customer_id',
      'card_id',
      'case_status',
      'priority',
      'category',
      'assigned_agent',
      'notes',
    ];
    for (const field of requiredFields) {
      if (!sanitizedData[field] || sanitizedData[field] === '') {
        toast({
          title: 'Missing required field',
          description: `Please fill in the ${field.replace('_', ' ')} field`,
          status: 'error',
          duration: 3000,
        });
        return;
      }
    }
    try {
      if (!selectedCase) {
        const now = new Date().toISOString();
        sanitizedData.created_date = now;
        sanitizedData.last_updated = now;
      }
      delete sanitizedData.created_at;
      console.log('Submitting case data:', sanitizedData);
      if (selectedCase) {
        await updateCase(selectedCase.id, sanitizedData);
        toast({
          title: 'Case updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        await createCase(sanitizedData);
        toast({
          title: 'Case created successfully',
          status: 'success',
          duration: 3000,
        });
      }
      await fetchCases();
    } catch (error) {
      toast({
        title: selectedCase ? 'Error updating case' : 'Error creating case',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  const handleCustomerChange = (customerId: string) => {
    const filtered = cards.filter(card => card.customer_id === customerId);
    setFilteredCards(filtered);
    caseFields[1].options = filtered.map(card => card.id);
  };

  const filterCases = (cases: Case[]) => {
    if (!searchQuery) return cases;
    
    return cases.filter(caseItem => {
      const searchLower = searchQuery.toLowerCase();
      switch (selectedFilter) {
        case 'none':
          return (
            caseItem.id.toLowerCase().includes(searchLower) ||
            getCustomerName(caseItem.customer_id).toLowerCase().includes(searchLower) ||
            caseItem.category.toLowerCase().includes(searchLower) ||
            caseItem.case_status.toLowerCase().includes(searchLower) ||
            caseItem.priority.toLowerCase().includes(searchLower) ||
            caseItem.assigned_agent.toLowerCase().includes(searchLower) ||
            new Date(caseItem.created_date).toLocaleString().toLowerCase().includes(searchLower) ||
            new Date(caseItem.last_updated).toLocaleString().toLowerCase().includes(searchLower)
          );
        case 'id':
          return caseItem.id.toLowerCase().includes(searchLower);
        case 'customer':
          return getCustomerName(caseItem.customer_id).toLowerCase().includes(searchLower);
        case 'category':
          return caseItem.category.toLowerCase().includes(searchLower);
        case 'status':
          return caseItem.case_status.toLowerCase().includes(searchLower);
        case 'priority':
          return caseItem.priority.toLowerCase().includes(searchLower);
        case 'assigned_to':
          return caseItem.assigned_agent.toLowerCase().includes(searchLower);
        case 'created_at':
          return new Date(caseItem.created_date).toLocaleString().toLowerCase().includes(searchLower);
        case 'last_updated':
          return new Date(caseItem.last_updated).toLocaleString().toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
  };

  return (
    <Box p={4}>
      <Card mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="lg">Service Request</Heading>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleCreate}
              >
                Add Case
              </Button>
            </HStack>

            <HStack spacing={4}>
              <Select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                w="200px"
              >
                {filterFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Search in All Fields"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                flex={1}
              />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Case ID</Th>
              <Th>Customer</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Assigned To</Th>
              <Th>Notes</Th>
              <Th>Created</Th>
              <Th>Last Updated</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filterCases(cases).map((caseItem) => (
              <Tr key={caseItem.id}>
                <Td>{caseItem.id}</Td>
                <Td>{getCustomerName(caseItem.customer_id)}</Td>
                <Td>{caseItem.category}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(caseItem.case_status)}>
                    {caseItem.case_status}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getPriorityColor(caseItem.priority)}>
                    {caseItem.priority}
                  </Badge>
                </Td>
                <Td>{caseItem.assigned_agent}</Td>
                <Td maxW="300px" whiteSpace="normal">
                  <Text noOfLines={2}>{caseItem.notes}</Text>
                </Td>
                <Td>{new Date(caseItem.created_date).toLocaleString()}</Td>
                <Td>{new Date(caseItem.last_updated).toLocaleString()}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit case"
                      icon={<FiEdit2 />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEdit(caseItem)}
                    />
                    <IconButton
                      aria-label="Delete case"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(caseItem.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <EditModal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedCase ? 'Edit Case' : 'Create Case'}
        fields={caseFields}
        data={selectedCase}
        onSave={handleSave}
        onCustomerChange={handleCustomerChange}
      />
    </Box>
  );
};

export default ServiceRequest; 