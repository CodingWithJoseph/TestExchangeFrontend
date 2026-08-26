import { useEffect } from 'react'

export function usePageMetadata(title: string, description: string, clearSocialImage = false) {
  useEffect(() => {
    const fullTitle = `${title} · TestExchange`
    document.title = fullTitle
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = descriptionMeta?.content
    const socialFields = [
      document.querySelector<HTMLMetaElement>('meta[property="og:title"]'),
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]'),
      document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]'),
      document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]'),
    ]
    const socialImages = [
      document.querySelector<HTMLMetaElement>('meta[property="og:image"]'),
      document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]'),
    ]
    const previousSocialFields = socialFields.map((meta) => meta?.content)
    const previousSocialImages = socialImages.map((meta) => meta?.content)

    if (descriptionMeta) descriptionMeta.content = description
    if (socialFields[0]) socialFields[0].content = fullTitle
    if (socialFields[1]) socialFields[1].content = description
    if (socialFields[2]) socialFields[2].content = fullTitle
    if (socialFields[3]) socialFields[3].content = description
    if (clearSocialImage) socialImages.forEach((meta) => { if (meta) meta.content = '' })

    return () => {
      document.title = 'TestExchange'
      if (descriptionMeta && previousDescription) descriptionMeta.content = previousDescription
      socialFields.forEach((meta, index) => { if (meta && previousSocialFields[index] !== undefined) meta.content = previousSocialFields[index]! })
      socialImages.forEach((meta, index) => { if (meta && previousSocialImages[index] !== undefined) meta.content = previousSocialImages[index]! })
    }
  }, [clearSocialImage, description, title])
}
