"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedAuthForm, useAuth, useWallet } from "@crossmint/client-sdk-react-ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export function LoginPage() {
  const router = useRouter()
  const { status: authStatus, user } = useAuth()
  const { wallet, status: walletStatus } = useWallet()
  const isLoggedIn = authStatus === "logged-in"
  const isWalletReady = walletStatus === "loaded"

  useEffect(() => {
    if (!isLoggedIn) return

    if (!localStorage.getItem("impulsAR_user")) {
      const email = user?.email ?? "usuario@impulsar.app"
      const name = email.split("@")[0] || "Usuario ImpulsAR"

      localStorage.setItem(
        "impulsAR_user",
        JSON.stringify({
          email,
          name,
          loginDate: new Date().toISOString(),
        }),
      )
    }

    if (isWalletReady) {
      if (!localStorage.getItem("impulsAR_wallet")) {
        localStorage.setItem(
          "impulsAR_wallet",
          JSON.stringify({
            pulsBalance: 15420.5,
            arsBalance: 0,
            dailyYield: 0.85,
            totalEarned: 1240.3,
            lastUpdate: new Date().toISOString(),
            address: wallet?.address ?? "",
          }),
        )
      }

      router.push("/dashboard")
    }
  }, [isLoggedIn, isWalletReady, router, user?.email, wallet?.address])

  const statusMessage =
    authStatus === "in-progress"
      ? "Iniciando sesión..."
      : isLoggedIn && walletStatus === "in-progress"
        ? "Creando tu billetera Crossmint..."
        : isLoggedIn && walletStatus !== "loaded"
          ? "Conectando tu billetera..."
          : walletStatus === "error"
            ? "No pudimos cargar tu billetera."
            : ""

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src="/images/img-20251227-120843-641.jpg"
                alt="ImpulsAR Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">ImpulsAR</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Infraestructura Pública Digital</p>
          </div>
          <CardDescription className="text-base">
            Accedé a tus beneficios del gobierno y gestioná tu billetera cripto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoggedIn ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>{statusMessage || "Cargando tu sesión..."}</span>
            </div>
          ) : (
            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <EmbeddedAuthForm />
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground mt-6">
            Al continuar, aceptás los términos y condiciones del programa ImpulsAR
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
