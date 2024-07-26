import { getVideoGateway } from '@/gateways/get-video'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormSchema, formSchema } from '@/types/form-schema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { useState } from 'react'
import { LoadingSpin } from '@/components/ui/loading-spin'
import { VideoInfo } from '@/types/video-info'
import { getVideoInfoGateway } from '@/gateways/get-video-info'
import { useToast } from '@/components/ui/use-toast'

export function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

  const { toast } = useToast()

  const handleDownload = async () => {
    if (videoInfo) {
      try {
        setIsLoading(true)
        const response = await getVideoGateway.load(form.getValues().url)
        if (!response.data) {
          throw new Error('Error fetching video')
        }
        const blob = new Blob([response.data], { type: 'video/mp4' })

        const downloadUrl = URL.createObjectURL(blob)

        // Cria um link e aciona o download automaticamente
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = 'video.mp4'
        document.body.appendChild(link)
        link.click()

        // Remove o link do DOM
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)
      } catch (error) {
        console.error('Error fetching video', error)
        toast({
          title: 'Error fetching video',
          description: (error as Error).message
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const onSubmit = async (values: FormSchema) => {
    try {
      setIsLoading(true)

      const response = await getVideoInfoGateway.load(values.url)

      console.log(response.data)

      if (!response.data) {
        if (response.statusCode === 400) {
          throw new Error('Invalid URL')
        }
        throw new Error('Error fetching video info')
      }

      setVideoInfo(response.data)
    } catch (error) {
      console.error('Error fetching video info: ', (error as Error).message)
      toast({
        title: 'Error fetching video',
        description: (error as Error).message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: ''
    },
    mode: 'onBlur',
    disabled: isLoading
  })

  return (
    <>
      <Navbar />
      <main className="flex h-screen w-full flex-col items-center justify-center gap-6 font-geist">
        {!videoInfo ? (
          <>
            <h1 className="text-center text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Enter a Youtube URL
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col items-center justify-center gap-2"
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="w-2/5 min-w-48">
                      <FormControl>
                        <Input
                          placeholder="https://youtu.be/zG5gWncAhls?si=DqMkerSQYtxIaios"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <LoadingSpin /> : 'Send'}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <Card className="w-4/5 md:w-3/5">
            <CardHeader>
              <CardTitle>{videoInfo?.title}</CardTitle>
              <CardDescription>{videoInfo?.author}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6">
              <iframe
                src={
                  videoInfo?.embedUrl ||
                  `https://youtube.com/embed/${form.getValues().url.split('/')[form.getValues().url.split('/').length - 1]}`
                }
                className="h-60 w-full md:h-96"
              />
              <Separator />
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={handleDownload} disabled={isLoading}>
                {isLoading ? <LoadingSpin /> : 'Download'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  )
}
