import { enviroments } from '../utils/env/enviroments'
import { HttpClient, HttpResponse } from '../utils/http/http'
import { youtubeRegex } from '../utils/regex/youtube-regex'

interface GetVideo {
  load(url: string): Promise<HttpResponse<Blob>>
}

class GetVideoGateway implements GetVideo {
  constructor(private readonly httpClient: HttpClient<HttpResponse<Blob>>) {}

  async load(url: string): Promise<HttpResponse<Blob>> {
    if (!url.match(youtubeRegex))
      return {
        statusCode: 400
      }

    return await this.httpClient.request({
      method: 'get',
      url: `${enviroments.apiUrl}/download?url=${encodeURIComponent(url)}`
    })
  }
}

const httpClient: HttpClient<HttpResponse<Blob>> = {
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
        data: await response.blob()
      }
    } catch (error) {
      console.error('Error fetching video', error)
      return {
        statusCode: 500
      }
    }
  }
}

export const getVideoGateway = new GetVideoGateway(httpClient)
