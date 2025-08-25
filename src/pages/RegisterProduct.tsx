import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Select,
  VStack,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createCard, getCustomers } from '../services/api';

const cardTypes = [
  'Account Based Card',
  'Bank Card',
  'Closed Loop Card',
];

const RegisterProduct = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch((err) => {
        setCustomers([]);
        console.error('Failed to load customers', err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCard({
        id: cardNumber,
        type: cardType,
        status: 'Active',
        balance: 0,
        issue_date: issueDate,
        customer_id: customerId,
      });
      toast({ title: 'Product registered!', status: 'success', duration: 3000 });
      navigate('/products');
    } catch (err) {
      toast({ title: 'Product registration failed', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Card w={{ base: '100%', sm: '500px' }} boxShadow="xl">
        <CardBody>
          <VStack as="form" spacing={6} onSubmit={handleSubmit}>
            <Heading size="lg">Register Product</Heading>
            <Text color="gray.600" mb={2} textAlign="center">
              Enter the details for the new product.
            </Text>
            <FormControl isRequired>
              <FormLabel>Product ID</FormLabel>
              <Input
                placeholder="Product ID"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                maxLength={16}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Product Type</FormLabel>
              <Select
                placeholder="Select product type"
                value={cardType}
                onChange={e => setCardType(e.target.value)}
              >
                {cardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Issue Date</FormLabel>
              <Input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Customer ID</FormLabel>
              <Select
                placeholder={customers.length === 0 ? 'No customers available' : 'Select customer'}
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                isDisabled={customers.length === 0}
              >
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                ))}
              </Select>
              {customers.length === 0 && (
                <Text color="red.400" fontSize="sm">No customers found. Please add a customer first.</Text>
              )}
            </FormControl>
            <Flex w="100%" justify="flex-end" gap={2}>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" isLoading={loading}>
                Register
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default RegisterProduct; 