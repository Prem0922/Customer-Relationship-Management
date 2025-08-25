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
  useToast,
  Spinner,
  Center,
  IconButton,
  useDisclosure,
  VStack,
  Text,
  Select,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown } from 'react-icons/fi';
import EditModal from '../components/EditModal';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notifications: string;
  join_date: string;
}

const customerFields = [
  { name: 'name', label: 'Name', type: 'text' as const },
  { name: 'email', label: 'Email', type: 'text' as const },
  { name: 'phone', label: 'Phone', type: 'text' as const },

  { name: 'notifications', label: 'Notifications', type: 'select' as const, options: ['SMS Enabled', 'Email Enabled'] },
];

const filterFields = [
  { id: 'none', label: 'None' },
  { id: 'id', label: 'Customer ID' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },

  { id: 'notifications', label: 'Notifications' },
  { id: 'join_date', label: 'Join Date' },
];

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      toast({
        title: 'Error fetching customers',
        status: 'error',
        duration: 3000,
      })
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    onOpen()
  }

  const handleCreate = () => {
    setSelectedCustomer(null)
    onOpen()
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id)
      await fetchCustomers()
      toast({
        title: 'Customer deleted successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error deleting customer',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, data)
        toast({
          title: 'Customer updated successfully',
          status: 'success',
          duration: 3000,
        })
      } else {
        await createCustomer(data)
        toast({
          title: 'Customer created successfully',
          status: 'success',
          duration: 3000,
        })
      }
      await fetchCustomers()
    } catch (error) {
      toast({
        title: selectedCustomer
          ? 'Error updating customer'
          : 'Error creating customer',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const filterCustomers = (customers: Customer[]) => {
    if (!searchQuery) return customers;
    
    return customers.filter(customer => {
      const searchLower = searchQuery.toLowerCase();
      switch (selectedFilter) {
        case 'none':
          return (
            customer.id.toLowerCase().includes(searchLower) ||
            customer.name.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.phone.toLowerCase().includes(searchLower) ||

            customer.notifications.toLowerCase().includes(searchLower) ||
            new Date(customer.join_date).toLocaleDateString().toLowerCase().includes(searchLower)
          );
        case 'id':
          return customer.id.toLowerCase().includes(searchLower);
        case 'name':
          return customer.name.toLowerCase().includes(searchLower);
        case 'email':
          return customer.email.toLowerCase().includes(searchLower);
        case 'phone':
          return customer.phone.toLowerCase().includes(searchLower);

        case 'notifications':
          return customer.notifications.toLowerCase().includes(searchLower);
        case 'join_date':
          return new Date(customer.join_date).toLocaleDateString().toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
  };

  const filteredCustomers = filterCustomers(customers);

  if (customers.length === 0) {
    return (
      <Center h="500px">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box>
      <Heading mb={6}>Customers</Heading>

      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">Filter By</Text>
            <HStack spacing={4}>
              <Select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                maxW="200px"
                icon={<FiChevronDown />}
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
          <HStack justifyContent="flex-end" mb={4}>
            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleCreate}>
              Add Customer
            </Button>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Customer ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>

                <Th>Notifications</Th>
                <Th>Join Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCustomers.map((customer) => (
                <Tr key={customer.id}>
                  <Td>{customer.id}</Td>
                  <Td>{customer.name}</Td>
                  <Td>{customer.email}</Td>
                  <Td>{customer.phone}</Td>

                  <Td>{customer.notifications}</Td>
                  <Td>{new Date(customer.join_date).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit customer"
                        icon={<FiEdit2 />}
                        size="sm"
                        onClick={() => handleEdit(customer)}
                      />
                      <IconButton
                        aria-label="Delete customer"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(customer.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <EditModal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        fields={customerFields}
        data={selectedCustomer || {}}
        onSave={handleSave}
      />
    </Box>
  )
}

export default Customers 