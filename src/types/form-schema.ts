import { z } from 'zod'

export const formSchema = z.object({
  url: z
    .string()
    .url({
      message: 'Insert a valid URL'
    })
    .min(1, {
      message: 'Insert a valid URL'
    })
})

export type FormSchema = z.infer<typeof formSchema>
