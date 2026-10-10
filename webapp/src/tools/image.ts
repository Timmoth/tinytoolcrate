export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export const IMAGE_FORMATS: { type: ImageFormat; label: string; extension: string }[] = [
  { type: 'image/png', label: 'PNG', extension: 'png' },
  { type: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
  { type: 'image/webp', label: 'WebP', extension: 'webp' },
]

export type ConvertOptions = {
  type: ImageFormat
  quality: number
  width: number
  height: number
}

export async function loadImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file)
  } catch {
    throw new Error('That file is not an image the browser can decode')
  }
}

export async function convertImage(
  source: ImageBitmap,
  { type, quality, width, height }: ConvertOptions
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')

  // JPEG has no alpha, so transparent pixels would otherwise come out black.
  if (type === 'image/jpeg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error(`Could not encode as ${type}`)),
      type,
      quality
    )
  })
}
