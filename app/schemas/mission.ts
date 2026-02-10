import { z } from 'zod'

const surveyStageConfigSchema = z.object({
  profile_question_ids: z.array(z.string().uuid()).min(1, 'Survey stages must have at least one question'),
})

export const stageSchema = z.object({
  stage_type: z.enum(['survey', 'redirect', 'visit_link', 'receipt_upload', 'image_upload', 'video_upload', 'review', 'custom']),
  stage_name: z.string().min(1, 'Stage name is required'),
  stage_description: z.string().optional(),
  reward_amount: z.number({ invalid_type_error: 'Reward must be a number' }).min(0, 'Reward cannot be negative').optional(),
  config: z.record(z.any()).optional(),
  is_optional: z.boolean().optional()
}).refine((data) => {
  if (data.stage_type === 'survey') {
    return surveyStageConfigSchema.safeParse(data.config).success
  }
  return true
}, {
  message: 'Survey stages require at least one profile question',
  path: ['config'],
})

export const createMissionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  brand_name: z.string().max(100, 'Brand name is too long').optional().or(z.literal('')),
  brand_logo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  brand_color: z.string().optional().or(z.literal('')),
  hero_image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  brand_about: z.string().optional().or(z.literal('')),
  mission_type: z.string().min(1, 'Mission type is required'),
  category: z.string().optional().or(z.literal('')),
  affiliate_url: z.string().url('Invalid affiliate URL').optional().or(z.literal('')),
  affiliate_network: z.string().optional().or(z.literal('')),
  reward_amount: z.number({ required_error: 'Reward amount is required', invalid_type_error: 'Reward must be a number' }).min(0, 'Reward cannot be negative'),
  reward_type: z.string().optional().or(z.literal('')),
  max_participants: z.number({ invalid_type_error: 'Max participants must be a number' }).int('Must be a whole number').positive('Must be greater than 0').optional().nullable(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  terms_conditions: z.string().optional().or(z.literal('')),
  estimated_completion_minutes: z.number({ invalid_type_error: 'Must be a number' }).int('Must be a whole number').positive('Must be greater than 0').optional().nullable(),
  mission_images: z.array(z.string().url()).optional(),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  stages: z.array(stageSchema).optional()
})

export const updateMissionSchema = createMissionSchema.partial()

export type CreateMissionFormData = z.infer<typeof createMissionSchema>
export type UpdateMissionFormData = z.infer<typeof updateMissionSchema>
