import { type ZodSchema, type ZodError } from 'zod'

export interface ValidationErrors {
  [key: string]: string | ValidationErrors
}

/**
 * Composable for form validation with Zod schemas
 * Returns validation function and reactive errors object
 */
export function useFormValidation<T>(schema: ZodSchema<T>) {
  const errors = ref<ValidationErrors>({})

  /**
   * Validate form data against schema
   * Returns true if valid, false if invalid (and sets errors)
   */
  function validate(data: unknown): data is T {
    errors.value = {}

    const result = schema.safeParse(data)

    if (result.success) {
      return true
    }

    // Convert Zod errors to flat object structure
    errors.value = formatZodErrors(result.error)
    return false
  }

  /**
   * Validate a single field
   */
  function validateField(fieldName: string, value: unknown): string | null {
    try {
      // Extract field schema and validate
      const fieldSchema = (schema as any).shape?.[fieldName]
      if (!fieldSchema) return null

      fieldSchema.parse(value)

      // Clear error for this field
      if (errors.value[fieldName]) {
        delete errors.value[fieldName]
      }

      return null
    } catch (err) {
      const zodError = err as ZodError
      const message = zodError.errors[0]?.message || 'Invalid value'
      errors.value[fieldName] = message
      return message
    }
  }

  /**
   * Clear all errors
   */
  function clearErrors() {
    errors.value = {}
  }

  /**
   * Clear error for specific field
   */
  function clearFieldError(fieldName: string) {
    delete errors.value[fieldName]
  }

  /**
   * Get error message for a field
   */
  function getFieldError(fieldName: string): string | undefined {
    const error = errors.value[fieldName]
    return typeof error === 'string' ? error : undefined
  }

  /**
   * Check if field has error
   */
  function hasFieldError(fieldName: string): boolean {
    return !!errors.value[fieldName]
  }

  return {
    errors: readonly(errors),
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
  }
}

/**
 * Format Zod errors into flat object structure
 */
function formatZodErrors(error: ZodError): ValidationErrors {
  const formatted: ValidationErrors = {}

  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formatted[path] = err.message
  })

  return formatted
}
