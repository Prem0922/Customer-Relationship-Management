import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Stack,
  Text,
  Button,
  Heading,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

const ProductDetails = () => {
  const { id } = useParams()
  const [cardStatus, setCardStatus] = useState('Active')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const cardInfo = {
    id: id,
    status: cardStatus,
    type: 'Adult',
    issueDate: '01/15/2022',
    expirationDate: '01/2030',
  }

  const handleBlockCard = () => {
    setCardStatus('Blocked')
    onClose()
  }

  return (
    <Box>
      <Card mb={6}>
        <CardBody>
          <Stack spacing={4}>
            <HStack justifyContent="space-between">
              <Heading size="md">Product Details</Heading>
              <Button colorScheme={cardStatus === 'Active' ? 'red' : 'green'} onClick={onOpen}>
                {cardStatus === 'Active' ? 'Block Card' : 'Unblock Card'}
              </Button>
            </HStack>
            <Stack spacing={2}>
              <Text><strong>Product ID:</strong> {cardInfo.id}</Text>
              <Text><strong>Status:</strong> {cardInfo.status}</Text>
              <Text><strong>Type:</strong> {cardInfo.type}</Text>
              <Text><strong>Issue Date:</strong> {cardInfo.issueDate}</Text>
              <Text><strong>Expiration:</strong> {cardInfo.expirationDate}</Text>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Tabs>
        <TabList>
          <Tab>Customer Info</Tab>
          <Tab>Purchase History</Tab>
          <Tab>Product Operations</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card>
              <CardBody>
                <Stack spacing={4}>
                  <Text><strong>Name:</strong> Jane Smith</Text>
                  <Text><strong>Email:</strong> jane.smith@email.com</Text>
                  <Text><strong>Phone:</strong> 555-123-4567</Text>
                </Stack>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <Stack spacing={4}>
                  <HStack justifyContent="space-between">
                    <FormControl maxW="200px">
                      <FormLabel>Date Range</FormLabel>
                      <Select defaultValue="30">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                      </Select>
                    </FormControl>
                    <FormControl maxW="200px">
                      <FormLabel>Mode</FormLabel>
                      <Select defaultValue="all">
                        <option value="all">All Modes</option>
                        <option value="bus">Bus</option>
                        <option value="subway">Subway</option>
                      </Select>
                    </FormControl>
                  </HStack>
                  {/* Trip history table would go here */}
                </Stack>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <Stack spacing={4}>
                  <Button>Replace Card</Button>
                  <Button>Submit Refund Request</Button>
                  <Button>Fare Adjustment</Button>
                </Stack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>Are you sure you want to {cardStatus === 'Active' ? 'block' : 'unblock'} this card?</Text>
            <HStack mt={4} spacing={4}>
              <Button onClick={onClose}>Cancel</Button>
              <Button colorScheme={cardStatus === 'Active' ? 'red' : 'green'} onClick={handleBlockCard}>
                Confirm
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default ProductDetails 