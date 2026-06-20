// src/hooks/useQrScanner.js
// Hook reusable: maneja cámara + detección de QR (jsQR vía CDN).
// No requiere instalar ningún paquete nuevo.

import { useRef, useState, useCallback, useEffect } from 'react'

async function loadJsQR() {
  if (window.jsQR) return window.jsQR
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    s.onload = () => resolve(window.jsQR)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// onDetect(rawText) se llama una sola vez por escaneo y la cámara se detiene sola
export function useQrScanner(onDetect) {
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const jsQR = await loadJsQR()
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)

      const tick = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code?.data) {
          stop()
          onDetect(code.data.trim())
        } else {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      setError('No se pudo acceder a la cámara.')
      setActive(false)
    }
  }, [onDetect, stop])

  useEffect(() => () => stop(), [stop])

  return { videoRef, canvasRef, active, error, start, stop }
}