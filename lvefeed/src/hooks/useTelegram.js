import { useState, useEffect } from 'react'

export const useTelegram = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initTelegramWebApp = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        
        // Telegram kullanıcı bilgilerini al
        const telegramUser = tg.initDataUnsafe?.user
        
        if (telegramUser) {
          // GIF avatar desteği için daha iyi photo URL alma
          const enhancedUser = { ...telegramUser }
          
          // Telegram'dan daha iyi avatar URL'si almaya çalış
          if (tg.initDataUnsafe?.user?.photo_url) {
            const photoUrl = tg.initDataUnsafe.user.photo_url
            console.log('Original photo URL:', photoUrl)
            
            // Eğer URL gif içeriyorsa veya mp4 ise, direkt kullan
            if (photoUrl.includes('.gif') || photoUrl.includes('.mp4') || photoUrl.includes('video')) {
              enhancedUser.photo_url = photoUrl
            } else {
              // Telegram'ın video avatar URL formatını dene
              const videoUrl = photoUrl.replace(/photos\//, 'videos/').replace(/\.jpg$/, '.mp4')
              console.log('Trying video URL:', videoUrl)
              enhancedUser.photo_url = videoUrl
              
              // Fallback olarak original URL'yi sakla
              enhancedUser.fallback_photo_url = photoUrl
            }
          }
          
          setUser(enhancedUser)
        } else {
          // Test için örnek kullanıcı (geliştirme ortamında)
          setUser({
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en',
            is_premium: false
          })
        }
      } else {
        // Telegram Web App mevcut değilse test kullanıcısı
        setUser({
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'en',
          is_premium: false
        })
      }
      setIsLoading(false)
    }

    initTelegramWebApp()
  }, [])

  return { user, isLoading }
} 