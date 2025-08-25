import {
  Box,
  Card,
  CardBody,
  Stack,
  Button,
  Select,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { useState } from 'react'

const CardOperations = () => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [operationType, setOperationType] = useState<'replace' | 'refund' | 'adjust' | null>(null)
  const [formData, setFormData] = useState({
    reason: '',
    amount: '',
  })

  const handleOperationClick = (type: 'replace' | 'refund' | 'adjust') => {
    setOperationType(type)
    onOpen()
  }

  const handleSubmit = () => {
    toast({
      title: 'Success',
      description: `${operationType?.charAt(0).toUpperCase()}${operationType?.slice(1)} operation completed successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    onClose()
  }

  const renderModalContent = () => {
    switch (operationType) {
      case 'replace':
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Replacement Reason</FormLabel>
              <Select placeholder="Select reason">
                <option value="lost">Lost</option>
                <option value="stolen">Stolen</option>
                <option value="damaged">Damaged</option>
              </Select>
            </FormControl>
            <Text>A new card will be issued and the old card will be deactivated.</Text>
          </VStack>
        )
      case 'refund':
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Refund Amount</FormLabel>
              <Input type="number" placeholder="Enter amount" />
            </FormControl>
            <FormControl>
              <FormLabel>Refund Reason</FormLabel>
              <Select placeholder="Select reason">
                <option value="overcharge">Fare Overcharge</option>
                <option value="service">Service Issue</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
          </VStack>
        )
      case 'adjust':
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Adjustment Type</FormLabel>
              <Select placeholder="Select type">
                <option value="fare">Fare Adjustment</option>
                <option value="balance">Balance Adjustment</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>New Fare Category</FormLabel>
              <Select placeholder="Select category">
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
                <option value="student">Student</option>
              </Select>
            </FormControl>
          </VStack>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <Card>
        <CardBody>
          <Stack spacing={4}>
            <Button onClick={() => handleOperationClick('replace')}>Replace Card</Button>
            <Button onClick={() => handleOperationClick('refund')}>Submit Refund Request</Button>
            <Button onClick={() => handleOperationClick('adjust')}>Fare Adjustment</Button>
          </Stack>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {operationType?.charAt(0).toUpperCase()}
            {operationType?.slice(1)} Card
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderModalContent()}
            <HStack mt={4} spacing={4} justifyContent="flex-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button colorScheme="brand" onClick={handleSubmit}>
                Submit
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default CardOperations 