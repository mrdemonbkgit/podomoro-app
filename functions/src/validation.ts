/**
 * Zod validation schemas for Cloud Functions
 * Provides runtime type checking and input validation
 */

import {z} from 'zod';

/**
 * Schema for chatWithAI request
 */
export const chatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  isEmergency: z.boolean().optional().default(false),
});

export type ValidatedChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Schema for getChatHistory request
 */
export const getChatHistorySchema = z.object({
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(50),
});

export type ValidatedGetChatHistoryRequest = z.infer<typeof getChatHistorySchema>;

/**
 * Schema for clearChatHistory request (no parameters expected)
 */
export const clearChatHistorySchema = z.object({}).optional();

export type ValidatedClearChatHistoryRequest = z.infer<typeof clearChatHistorySchema>;

/**
 * Helper function to validate and parse request data
 * Throws Error with validation details if validation fails
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    // Format validation errors into a readable message
    const errors = result.error.issues.map((err) => {
      const path = err.path.join('.');
      return `${path || 'input'}: ${err.message}`;
    });
    
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return result.data;
}

