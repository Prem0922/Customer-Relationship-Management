import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { axios } from '../services/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const toast = useToast();
  const { login } = useAuth();

  const boxBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (signupError) setSignupError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (signupError) setSignupError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (signupError) setSignupError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSignupError('');
    
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter your password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post('/auth/signup', { name, email, password });
      const data = response.data;
      if (!response.status || response.status >= 400) {
        throw new Error(data.detail || 'Signup failed');
      }
      login(data.access_token, data.user_name);
      toast({
        title: 'Account created',
        description: 'Welcome to Customer Management System!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      let errorMessage = 'An error occurred during signup';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || 'Email already exists';
        setPassword('');
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSignupError(errorMessage);
      
      toast({
        title: 'Signup failed',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      w="100%"
      position="fixed"
      top="0"
      left="0"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container maxW="md" mx="auto" px={4}>
        <Box
          bg={boxBg}
          p={{ base: 8, md: 10 }}
          rounded="xl"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={8} align="stretch">
            <VStack spacing={3}>
              <Heading
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                textAlign="center"
                color={textColor}
              >
                Create an account
              </Heading>
              <Text
                color={textColor}
                fontSize="lg"
                textAlign="center"
                opacity={0.8}
              >
                Sign up to get started
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Name</FormLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                    size="lg"
                    bg={inputBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    size="lg"
                    bg={inputBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      bg={inputBg}
                      borderColor={borderColor}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Error message display */}
                {signupError && (
                  <Box
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                    borderRadius="md"
                    p={3}
                    color="red.700"
                    fontSize="sm"
                  >
                    {signupError}
                  </Box>
                )}

                <Button
                  type="submit"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  width="full"
                  colorScheme="teal"
                >
                  Sign up
                </Button>
              </VStack>
            </form>

            <Text color={textColor} textAlign="center" fontSize="md">
              Already have an account?{' '}
              <Link to="/login">
                <Text
                  as="span"
                  display="inline"
                  color="teal.500"
                  fontWeight="semibold"
                  _hover={{
                    textDecoration: 'underline',
                  }}
                >
                  Sign in
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Flex>
  );
};

export default Signup; 