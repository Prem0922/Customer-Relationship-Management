import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Textarea,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'datetime-local' | 'textarea';
  options?: string[];
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  data: Record<string, any> | null;
  onSave: (data: Record<string, any>) => void;
  onCustomerChange?: (customerId: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  data,
  onSave,
  onCustomerChange,
}) => {
  const [formData, setFormData] = React.useState<Record<string, any>>(data || {});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const toast = useToast();

  React.useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      const emptyData: Record<string, any> = {};
      fields.forEach(field => {
        emptyData[field.name] = '';
      });
      setFormData(emptyData);
    }
    setErrors({});
  }, [data, fields, isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];
      
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.name === 'email' && !validateEmail(value)) {
        newErrors[field.name] = 'Please enter a valid email address';
      } else if (field.name === 'balance') {
        if (typeof value === 'string' && value.trim() === '') {
          newErrors[field.name] = 'Balance is required';
        } else {
          const balanceValue = parseFloat(value);
          if (isNaN(balanceValue)) {
            newErrors[field.name] = 'Balance must be a valid number';
          } else if (balanceValue < 0) {
            newErrors[field.name] = 'Balance cannot be negative';
          }
        }
      } else if (field.name === 'fare') {
        if (typeof value === 'string' && value.trim() === '') {
          newErrors[field.name] = 'Fare is required';
        } else {
          const fareValue = parseFloat(value);
          if (isNaN(fareValue)) {
            newErrors[field.name] = 'Fare must be a valid number';
          } else if (fareValue <= 0) {
            newErrors[field.name] = 'Fare must be greater than 0';
          }
        }
      } else if (field.name === 'tap_time') {
        if (typeof value === 'string' && value.trim() === '') {
          newErrors[field.name] = 'Tap Time is required';
        } else {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            newErrors[field.name] = 'Please enter a valid date and time format';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (name === 'customer_id' && onCustomerChange) {
      onCustomerChange(value as string);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onSave(formData);
    handleClose();
  };

  const formatDateTimeForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );
      case 'datetime-local':
        return (
          <Input
            type="datetime-local"
            value={formatDateTimeForInput(formData[field.name])}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={4}
            resize="vertical"
          />
        );
      default:
        const inputType = (field.name === 'balance' || field.name === 'fare') ? 'text' : field.type;
        return (
          <Input
            type={inputType}
            value={formData[field.name] || ''}
            onChange={(e) =>
              handleChange(
                field.name,
                field.type === 'number' && field.name !== 'balance' && field.name !== 'fare'
                  ? parseFloat(e.target.value)
                  : e.target.value
              )
            }
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {fields.map((field) => (
              <FormControl key={field.name} isInvalid={!!errors[field.name]}>
                <FormLabel>{field.label}</FormLabel>
                {renderField(field)}
                {errors[field.name] && (
                  <FormErrorMessage>{errors[field.name]}</FormErrorMessage>
                )}
              </FormControl>
            ))}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModal; 