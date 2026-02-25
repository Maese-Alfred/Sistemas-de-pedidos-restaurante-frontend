import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import sofkaLogo from '@/assets/logo-sofkau.webp'

const INTRO_SEEN_KEY = 'sofka_intro_seen_v1'

export function WelcomePage() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(INTRO_SEEN_KEY) === '1')
    } catch {
      setSeen(false)
    } finally {
      setChecked(true)
    }
  }, [])

  function start() {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      // ignore
    }
    navigate('/client/table', { replace: true })
  }

  if (!checked) return null
  if (seen) return <Navigate to="/client/table" replace />

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#50B6E6]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#25308E]/18 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-2xl rounded-[2rem] border border-border/80 bg-card/85 p-8 text-center shadow-[0_24px_60px_-28px_rgba(37,48,142,0.45)] backdrop-blur"
        >
          <div className="relative mx-auto mb-4 h-28 w-full max-w-[430px] overflow-hidden sm:h-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, type: 'spring' }}
              className="absolute inset-0"
              style={{ clipPath: 'inset(0% 7% 64% 63%)' }}
            >
              <img
                src={sofkaLogo}
                alt="Gorro Sofka U"
                className="h-full w-full object-contain"
                draggable={false}
              />
            </motion.div>

            <motion.img
              src={sofkaLogo}
              alt="Logo Sofka U"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.45 }}
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.35 }}
            className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base"
          >
            En Sofka U creemos en la mejora continua y en transformar vidas a través de la tecnología. Tu historia, tu decisión.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.35 }}
            className="mt-8"
          >
            <Button
              onClick={start}
              size="lg"
              className="h-12 rounded-full !bg-[#25308E] px-9 text-base font-semibold !text-white shadow-[0_10px_28px_-12px_rgba(37,48,142,0.9)] hover:!bg-[#1f276f]"
            >
              Iniciar
            </Button>
          </motion.div>
        </motion.section>
      </main>
    </div>
  )
}
