import { cache } from 'react'
import { Request } from '@/utils'
import type { Theme, Web } from '@/types/app/config'

export const getWebConfig = cache(async (name: string) => {
  const response = await Request<{ value: Web }>('GET', `/config/web/${name}`)
  return response?.data?.value as Web | undefined
})

export const getThemeConfig = cache(async () => {
  const response = await Request<{ value: Theme }>('GET', '/config/web/theme')
  return response?.data?.value as Theme | undefined
})
