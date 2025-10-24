import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
}

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = event.target;
      const newValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;

      setState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: newValue },
        touched: { ...prev.touched, [name]: true },
      }));
    },
    []
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = event.target;
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      let errors = {};
      if (validate) {
        errors = validate(state.values);
        setState(prev => ({
          ...prev,
          errors,
          touched: Object.keys(prev.values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        }));

        if (Object.keys(errors).length > 0) {
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(state.values);
      } catch (error) {
        logger.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [state.values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
