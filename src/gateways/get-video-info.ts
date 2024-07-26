import { VideoInfo } from '@/types/video-info'
import { enviroments } from '../utils/env/enviroments'
import { HttpClient, HttpResponse } from '../utils/http/http'
import { youtubeRegex } from '../utils/regex/youtube-regex'

interface GetVideoInfo {
  load(url: string): Promise<HttpResponse<VideoInfo>>
}

class GetVideoInfoGateway implements GetVideoInfo {
  constructor(
    private readonly httpClient: HttpClient<HttpResponse<VideoInfo>>
  ) {}

  async load(url: string): Promise<HttpResponse<VideoInfo>> {
    if (!url.match(youtubeRegex))
      return {
        statusCode: 400
      }

    return await this.httpClient.request({
      method: 'get',
      url: `${enviroments.apiUrl}/videoInfo?url=${encodeURIComponent(url)}`
    })
  }
}

const httpClient: HttpClient<HttpResponse<VideoInfo>> = {
  async request(data) {
    try {
      const response = await fetch(data.url, {
        method: data.method
      })

      if (!response.ok) {
        return {
          statusCode: response.status
        }
      }

      return {
        statusCode: response.status,
        data: await response.json()
      }
    } catch (error) {
      console.error('Error fetching video', error)
      return {
        statusCode: 500
      }
    }
  }
}

export const getVideoInfoGateway = new GetVideoInfoGateway(httpClient)
