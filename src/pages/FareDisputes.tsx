import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Center, IconButton, Input, Select, HStack, useToast, Button, VStack, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel, FormErrorMessage
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  getFareDisputes, updateFareDispute, deleteFareDispute, createFareDispute, FareDispute, getCards, getTrips, Trip
} from '../services/api';

const filterFields = [
  { id: 'none', label: 'None' },
  { id: 'id', label: 'ID' },
  { id: 'card_id', label: 'Card ID' },
  { id: 'amount', label: 'Amount' },
  { id: 'description', label: 'Description' },
  { id: 'trip_id', label: 'Trip ID' },
  { id: 'dispute_type', label: 'Dispute Type' },
  { id: 'dispute_date', label: 'Dispute Date' },
];

const disputeTypeOptions = [
  'Duplicate Fare Charged',
  'Incorrect Fare Applied',
  'Failed Tap Entry',
  'Tap Mismatch - Incomplete Trip',
  'Wrong Fare Zone Applied',
];

const FareDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<FareDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [editDispute, setEditDispute] = useState<FareDispute | null>(null);
  const [editFields, setEditFields] = useState<any>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addFields, setAddFields] = useState<any>({
    dispute_date: '',
    card_id: '',
    amount: '',
    description: '',
    trip_id: '',
    dispute_type: '',
  });
  const [addErrors, setAddErrors] = useState<any>({});
  const [cards, setCards] = useState<{ id: string }[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await getFareDisputes();
      setDisputes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
    const fetchDropdowns = async () => {
      try {
        const cardsData = await getCards();
        setCards(cardsData);
        const tripsData = await getTrips();
        setTrips(tripsData);
      } catch (e) {
      }
    };
    fetchDropdowns();
  }, []);

  const handleEdit = (dispute: FareDispute) => {
    setEditDispute(dispute);
    setEditFields({ ...dispute, dispute_date: dispute.dispute_date.slice(0, 10) });
    onOpen();
  };

  const handleEditChange = (field: string, value: any) => {
    setEditFields((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editDispute) return;
    
    const amountValue = parseFloat(editFields.amount);
    if (isNaN(amountValue)) {
      toast({ title: 'Amount must be a valid number', status: 'error', duration: 3000 });
      return;
    } else if (amountValue <= 0) {
      toast({ title: 'Amount must be greater than 0', status: 'error', duration: 3000 });
      return;
    }
    
    try {
      await updateFareDispute(editDispute.id, {
        ...editFields,
        amount: amountValue,
      });
      toast({ title: 'Dispute updated', status: 'success', duration: 3000 });
      setEditDispute(null);
      onClose();
      fetchDisputes();
    } catch {
      toast({ title: 'Error updating dispute', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFareDispute(id);
      toast({ title: 'Dispute deleted', status: 'success', duration: 3000 });
      setDeleteId(null);
      fetchDisputes();
    } catch {
      toast({ title: 'Error deleting dispute', status: 'error', duration: 3000 });
    }
  };

  const filterDisputes = (disputes: FareDispute[]) => {
    if (!searchQuery) return disputes;
    const searchLower = searchQuery.toLowerCase();
    return disputes.filter(d => {
      switch (selectedFilter) {
        case 'id': return d.id.toString().includes(searchLower);
        case 'card_id': return d.card_id.toLowerCase().includes(searchLower);
        case 'amount': return d.amount.toString().includes(searchLower);
        case 'description': return d.description.toLowerCase().includes(searchLower);
        case 'trip_id': return d.trip_id.toLowerCase().includes(searchLower);
        case 'dispute_type': return d.dispute_type.toLowerCase().includes(searchLower);
        case 'dispute_date': return new Date(d.dispute_date).toLocaleDateString().toLowerCase().includes(searchLower);
        case 'none':
        default:
          return (
            d.id.toString().includes(searchLower) ||
            d.card_id.toLowerCase().includes(searchLower) ||
            d.amount.toString().includes(searchLower) ||
            d.description.toLowerCase().includes(searchLower) ||
            d.trip_id.toLowerCase().includes(searchLower) ||
            d.dispute_type.toLowerCase().includes(searchLower) ||
            new Date(d.dispute_date).toLocaleDateString().toLowerCase().includes(searchLower)
          );
      }
    });
  };

  const filteredDisputes = filterDisputes(disputes);

  const filteredTripsForCard = addFields.card_id ? trips.filter(trip => trip.card_id === addFields.card_id) : [];

  const validateAddForm = () => {
    const errors: any = {};
    
    if (!addFields.dispute_date.trim()) {
      errors.dispute_date = 'Dispute Date is required';
    }
    
    if (!addFields.card_id.trim()) {
      errors.card_id = 'Card ID is required';
    }
    
    if (!addFields.amount || addFields.amount.trim() === '') {
      errors.amount = 'Amount is required';
    } else {
      const amountValue = parseFloat(addFields.amount);
      if (isNaN(amountValue)) {
        errors.amount = 'Amount must be a valid number';
      } else if (amountValue <= 0) {
        errors.amount = 'Amount must be greater than 0';
      }
    }
    
    if (!addFields.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!addFields.trip_id.trim()) {
      errors.trip_id = 'Trip ID is required';
    }
    
    if (!addFields.dispute_type.trim()) {
      errors.dispute_type = 'Dispute Type is required';
    }
    
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddFieldChange = (field: string, value: any) => {
    setAddFields((prev: any) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddSave = async () => {
    if (!validateAddForm()) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all required fields', 
        status: 'error', 
        duration: 3000 
      });
      return;
    }
    
    try {
      await createFareDispute({ ...addFields, amount: parseFloat(addFields.amount) });
      toast({ title: 'Dispute added', status: 'success', duration: 3000 });
      setIsAddOpen(false);
      setAddFields({
        dispute_date: '',
        card_id: '',
        amount: '',
        description: '',
        trip_id: '',
        dispute_type: '',
      });
      setAddErrors({});
      fetchDisputes();
    } catch {
      toast({ title: 'Error adding dispute', status: 'error', duration: 3000 });
    }
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Fare Disputes</Heading>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <HStack spacing={4}>
          <Select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)} w="200px">
            {filterFields.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </Select>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            w="300px"
          />
        </HStack>
        <Button colorScheme="blue" onClick={() => { 
          setAddFields({ dispute_date: '', card_id: '', amount: '', description: '', trip_id: '', dispute_type: '' }); 
          setAddErrors({});
          setIsAddOpen(true); 
        }}>Add Fare Dispute</Button>
      </Box>
      {loading ? (
        <Center><Spinner /></Center>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Dispute Date</Th>
              <Th>Card ID</Th>
              <Th>Amount</Th>
              <Th>Description</Th>
              <Th>Trip ID</Th>
              <Th>Dispute Type</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredDisputes.map(d => (
              <Tr key={d.id}>
                <Td>{d.id}</Td>
                <Td>{new Date(d.dispute_date).toLocaleDateString()}</Td>
                <Td>{d.card_id}</Td>
                <Td>${d.amount.toFixed(2)}</Td>
                <Td>{d.description}</Td>
                <Td>{d.trip_id}</Td>
                <Td>{d.dispute_type}</Td>
                <Td>
                  <IconButton aria-label="Edit" icon={<FiEdit2 />} size="sm" mr={2} onClick={() => handleEdit(d)} />
                  <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" onClick={() => setDeleteId(d.id)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {/* Edit Modal */}
      <Modal isOpen={!!editDispute} onClose={() => { setEditDispute(null); onClose(); }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Fare Dispute</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text mb={1}>Dispute Date</Text>
                <Input type="date" value={editFields.dispute_date || ''} onChange={e => handleEditChange('dispute_date', e.target.value)} />
              </Box>
              <Box>
                <Text mb={1}>Card ID</Text>
                <Input value={editFields.card_id || ''} onChange={e => handleEditChange('card_id', e.target.value)} />
              </Box>
              <Box>
                <Text mb={1}>Dispute Amount</Text>
                <Input type="text" value={editFields.amount || ''} onChange={e => handleEditChange('amount', e.target.value)} />
              </Box>
              <Box>
                <Text mb={1}>Dispute Description</Text>
                <Input value={editFields.description || ''} onChange={e => handleEditChange('description', e.target.value)} />
              </Box>
              <Box>
                <Text mb={1}>Trip ID</Text>
                <Input value={editFields.trip_id || ''} onChange={e => handleEditChange('trip_id', e.target.value)} />
              </Box>
              <Box>
                <Text mb={1}>Dispute Type</Text>
                <Select value={editFields.dispute_type || ''} onChange={e => handleEditChange('dispute_type', e.target.value)}>
                  <option value="">Select type</option>
                  {disputeTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => { setEditDispute(null); onClose(); }} mr={3}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleEditSave}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete Confirmation */}
      {deleteId !== null && (
        <Box pos="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.400" zIndex={1000} display="flex" alignItems="center" justifyContent="center">
          <Box bg="white" p={6} borderRadius="md" minW="350px" boxShadow="lg">
            <Text mb={4}>Are you sure you want to delete this fare dispute?</Text>
            <HStack justify="end">
              <Button onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button colorScheme="red" onClick={() => handleDelete(deleteId)}>Delete</Button>
            </HStack>
          </Box>
        </Box>
      )}
      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => {
        setIsAddOpen(false);
        setAddFields({
          dispute_date: '',
          card_id: '',
          amount: '',
          description: '',
          trip_id: '',
          dispute_type: '',
        });
        setAddErrors({});
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Fare Dispute</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <FormControl isInvalid={!!addErrors.dispute_date}>
                <FormLabel>Dispute Date</FormLabel>
                <Input type="date" value={addFields.dispute_date} onChange={e => handleAddFieldChange('dispute_date', e.target.value)} />
                {addErrors.dispute_date && <FormErrorMessage>{addErrors.dispute_date}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isInvalid={!!addErrors.card_id}>
                <FormLabel>Card ID</FormLabel>
                <Select value={addFields.card_id} onChange={e => handleAddFieldChange('card_id', e.target.value)}>
                  <option value="">Select Card ID</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.id}</option>
                  ))}
                </Select>
                {addErrors.card_id && <FormErrorMessage>{addErrors.card_id}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isInvalid={!!addErrors.amount}>
                <FormLabel>Dispute Amount</FormLabel>
                <Input type="text" value={addFields.amount} onChange={e => handleAddFieldChange('amount', e.target.value)} />
                {addErrors.amount && <FormErrorMessage>{addErrors.amount}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isInvalid={!!addErrors.description}>
                <FormLabel>Dispute Description</FormLabel>
                <Input value={addFields.description} onChange={e => handleAddFieldChange('description', e.target.value)} />
                {addErrors.description && <FormErrorMessage>{addErrors.description}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isInvalid={!!addErrors.trip_id}>
                <FormLabel>Trip ID</FormLabel>
                <Select value={addFields.trip_id} onChange={e => handleAddFieldChange('trip_id', e.target.value)}>
                  <option value="">Select Trip ID</option>
                  {filteredTripsForCard.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.id}</option>
                  ))}
                </Select>
                {addErrors.trip_id && <FormErrorMessage>{addErrors.trip_id}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isInvalid={!!addErrors.dispute_type}>
                <FormLabel>Dispute Type</FormLabel>
                <Select value={addFields.dispute_type} onChange={e => handleAddFieldChange('dispute_type', e.target.value)}>
                  <option value="">Select type</option>
                  {disputeTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
                {addErrors.dispute_type && <FormErrorMessage>{addErrors.dispute_type}</FormErrorMessage>}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => {
              setIsAddOpen(false);
              setAddFields({
                dispute_date: '',
                card_id: '',
                amount: '',
                description: '',
                trip_id: '',
                dispute_type: '',
              });
              setAddErrors({});
            }} mr={3}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleAddSave}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FareDisputes; 