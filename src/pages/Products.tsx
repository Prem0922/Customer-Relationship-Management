  import { useEffect, useState } from 'react';
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
    Tooltip,
  } from '@chakra-ui/react';
  import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
  import EditModal from '../components/EditModal';
  import {
    getCards,
    createCard,
    updateCard,
    deleteCard,
    getCustomers,
  } from '../services/api';

  interface Card {
    id: string;
    type: string;
    status: string;
    balance: number;
    issue_date: string;
    customer_id: string;
  }

  interface Customer {
    id: string;
    name: string;
  }

  const cardTypes = [
    'Adult',
    'Student',
    'Senior',
    'Child',
    'Corporate',
    'Tourist',
    'Special',
    'VIP',
  ];

  const cardStatuses = ['Active', 'Blocked', 'Expired', 'Lost', 'Suspended'];

  const cardFields = [
    {
      name: 'id',
      label: 'Product ID',
      type: 'text' as const,
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select' as const,
      options: cardTypes,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: cardStatuses,
    },
    {
      name: 'balance',
      label: 'Balance',
      type: 'number' as const,
    },
    {
      name: 'customer_id',
      label: 'Customer',
      type: 'select' as const,
      options: [],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'blocked':
        return 'red';
      case 'expired':
        return 'gray';
      case 'lost':
        return 'orange';
      case 'suspended':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const filterFields = [
    { id: 'none', label: 'None' },
    { id: 'id', label: ' ID' },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status' },
    { id: 'balance', label: 'Balance' },
    { id: 'customer', label: 'Customer' },
    { id: 'issue_date', label: 'Issue Date' },
  ];

  const Products = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('none');
    const [products, setProducts] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const fetchProducts = async () => {
      try {
        const data = await getCards()
        setProducts(data)
        setLastRefreshed(new Date())
      } catch (error) {
        toast({
          title: 'Error fetching products',
          status: 'error',
          duration: 3000,
        })
      }
    }

    const fetchCustomers = async () => {
      try {
        const data = await getCustomers()
        setCustomers(data)
        cardFields[4].options = data.map(({ id }: Customer) => id)
      } catch (error) {
        toast({
          title: 'Error fetching customers',
          status: 'error',
          duration: 3000,
        })
      }
    }

    useEffect(() => {
      fetchProducts()
      fetchCustomers()
    }, [])

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
          event.preventDefault();
          if (!isRefreshing) {
            handleRefresh();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isRefreshing]);

    const handleEdit = (card: Card) => {
      setSelectedCard(card)
      onOpen()
    }

    const handleCreate = () => {
      setSelectedCard(null)
      onOpen()
    }

    const handleRefresh = async () => {
      if (isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        await fetchProducts()
        setTimeout(() => {
          setLastRefreshed(new Date());
          toast({
            title: 'Products refreshed',
            description: 'Product list has been updated',
            status: 'success',
            duration: 2000,
          })
        }, 300);
      } catch (error) {
        toast({
          title: 'Refresh failed',
          description: 'Failed to refresh products',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setIsRefreshing(false);
      }
    }

    const handleDelete = async (id: string) => {
      try {
        await deleteCard(id)
        await fetchProducts()
        toast({
          title: 'Product deleted successfully',
          status: 'success',
          duration: 3000,
        })
      } catch (error) {
        toast({
          title: 'Error deleting product',
          status: 'error',
          duration: 3000,
        })
      }
    }

    const handleSave = async (data: any) => {
      try {
        if (selectedCard) {
          await updateCard(selectedCard.id, data)
          toast({
            title: 'Product updated successfully',
            status: 'success',
            duration: 3000,
          })
        } else {
          await createCard(data)
          toast({
            title: 'Product created successfully',
            status: 'success',
            duration: 3000,
          })
        }
        await fetchProducts()
      } catch (error) {
        toast({
          title: selectedCard ? 'Error updating product' : 'Error creating product',
          status: 'error',
          duration: 3000,
        })
      }
    }

    const getCustomerName = (customerId: string) => {
      const customer = customers.find((c) => c.id === customerId)
      return customer ? customer.name : 'Unknown'
    }

    const getTypeColor = (type: string) => {
      switch (type.toLowerCase()) {
        case 'student':
          return 'blue'
        case 'senior':
          return 'purple'
        case 'adult':
          return 'orange'
        default:
          return 'gray'
      }
    }

    const filterCards = (cards: Card[]) => {
      if (!searchQuery) return cards;
      
      return cards.filter(card => {
        const searchLower = searchQuery.toLowerCase();
        switch (selectedFilter) {
          case 'none':
            return (
              card.id.toLowerCase().includes(searchLower) ||
              card.type.toLowerCase().includes(searchLower) ||
              card.status.toLowerCase().includes(searchLower) ||
              card.balance.toString().includes(searchLower) ||
              getCustomerName(card.customer_id).toLowerCase().includes(searchLower) ||
              new Date(card.issue_date).toLocaleDateString().toLowerCase().includes(searchLower)
            );
          case 'id':
            return card.id.toLowerCase().includes(searchLower);
          case 'type':
            return card.type.toLowerCase().includes(searchLower);
          case 'status':
            return card.status.toLowerCase().includes(searchLower);
          case 'balance':
            return card.balance.toString().includes(searchLower);
          case 'customer':
            return getCustomerName(card.customer_id).toLowerCase().includes(searchLower);
          case 'issue_date':
            return new Date(card.issue_date).toLocaleDateString().toLowerCase().includes(searchLower);
          default:
            return true;
        }
      });
    };

    const filteredProducts = filterCards(products);

    if (products.length === 0) {
      return (
        <Center h="500px">
          <Spinner size="xl" />
        </Center>
      )
    }

    return (
      <Box>
        <Heading mb={6}>Products</Heading>

        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <Text fontWeight="medium">Filter By</Text>
                {lastRefreshed && (
                  <Text fontSize="sm" color="gray.500">
                    Last updated: {lastRefreshed.toLocaleTimeString()}
                  </Text>
                )}
              </HStack>
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
            <HStack justifyContent="flex-end" mb={4} spacing={3}>
              <Tooltip label={`Refresh product list (${products.length} products) - Click to see latest updates`} placement="top">
                <IconButton
                  aria-label="Refresh products (Ctrl+R)"
                  icon={<FiRefreshCw />}
                  colorScheme="teal"
                  onClick={handleRefresh}
                  variant="outline"
                  isLoading={isRefreshing}
                  disabled={isRefreshing}
                  size="md"
                  _hover={{ 
                    bg: 'teal.50', 
                    borderColor: 'teal.300',
                    transform: 'scale(1.05)'
                  }}
                  _focus={{
                    boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.3)',
                    borderColor: 'teal.400',
                    outline: 'none'
                  }}
                  transition="all 0.2s"
                />
              </Tooltip>
              <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleCreate}>
                Add Product
              </Button>
            </HStack>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Product ID</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Balance</Th>
                  <Th>Customer</Th>
                  <Th>Issue Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredProducts.map((card) => (
                  <Tr key={card.id}>
                    <Td>{card.id}</Td>
                    <Td>
                      <Badge colorScheme={getTypeColor(card.type)}>
                        {card.type}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(card.status)}>
                        {card.status}
                      </Badge>
                    </Td>
                    <Td>${card.balance.toFixed(2)}</Td>
                    <Td>{getCustomerName(card.customer_id)}</Td>
                    <Td>{new Date(card.issue_date).toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit card"
                          icon={<FiEdit2 />}
                          size="sm"
                          onClick={() => handleEdit(card)}
                        />
                        <IconButton
                          aria-label="Delete card"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(card.id)}
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
          title={selectedCard ? 'Edit Product' : 'Add Product'}
          fields={cardFields}
          data={selectedCard || {}}
          onSave={handleSave}
        />
      </Box>
    )
  }

  export default Products 