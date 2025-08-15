'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

/**
 * Componente principal de la aplicación - Landing Page YEEZY AI
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section - Diseño minimalista inspirado en Kanye West */}
      <header className="relative w-full min-h-screen flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-1000" />

        {/* Contenido principal */}
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Título principal con tipografía bold y condensada */}
          <h1 className="text-6xl md:text-8xl lg:text-[12rem] xl:text-[16rem] font-black tracking-tighter leading-none mb-8 transform transition-all duration-700 hover:scale-105">
            <span className="block text-white">FinanceZZ</span>
          </h1>

          {/* Subtítulo elegante */}
          <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Refactoriza tu visión financiera. Un futuro diseñado con inteligencia artificial.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 font-bold text-lg px-12 py-6 rounded-none border-2 border-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                COMENZAR AHORA
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black font-bold text-lg px-12 py-6 rounded-none transition-all duration-300 hover:scale-105"
            >
              VER DEMO
            </Button>
          </div>
        </div>
      </header>

      {/* Sección de Características - Grid minimalista */}
      <section className="relative py-24 px-8">
        {/* Título de sección */}
        <div className="max-w-6xl mx-auto mb-20 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            CARACTERÍSTICAS
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Herramientas diseñadas para revolucionar tu gestión financiera
          </p>
        </div>

        {/* Grid de características */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Gestión Inteligente */}
          <Card className="bg-gray-900 border-gray-800 text-white rounded-none group hover:bg-gray-800 transition-all duration-500">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-white mb-4 flex items-center justify-center">
                <span className="text-black font-black text-xl">01</span>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">GESTIÓN</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Control total de tus finanzas personales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 9} className="bg-black border border-gray-700 flex items-center justify-center mb-6 group-hover:border-white transition-colors duration-300">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">$</div>
                  <span className="text-gray-500 text-sm font-medium">DASHBOARD FINANCIERO</span>
                </div>
              </AspectRatio>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Seguimiento de ingresos y gastos</li>
                <li>• Categorización automática</li>
                <li>• Reportes en tiempo real</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Análisis Avanzado */}
          <Card className="bg-gray-900 border-gray-800 text-white rounded-none group hover:bg-gray-800 transition-all duration-500">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-white mb-4 flex items-center justify-center">
                <span className="text-black font-black text-xl">02</span>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">ANÁLISIS</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Insights inteligentes con IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 9} className="bg-black border border-gray-700 flex items-center justify-center mb-6 group-hover:border-white transition-colors duration-300">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">📊</div>
                  <span className="text-gray-500 text-sm font-medium">ANALYTICS AVANZADOS</span>
                </div>
              </AspectRatio>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Predicciones de gastos</li>
                <li>• Patrones de comportamiento</li>
                <li>• Recomendaciones personalizadas</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3: Control de Deudas */}
          <Card className="bg-gray-900 border-gray-800 text-white rounded-none group hover:bg-gray-800 transition-all duration-500">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-white mb-4 flex items-center justify-center">
                <span className="text-black font-black text-xl">03</span>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">DEUDAS</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Estrategias de pago optimizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 9} className="bg-black border border-gray-700 flex items-center justify-center mb-6 group-hover:border-white transition-colors duration-300">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">⚡</div>
                  <span className="text-gray-500 text-sm font-medium">OPTIMIZACIÓN DEUDAS</span>
                </div>
              </AspectRatio>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Planes de pago personalizados</li>
                <li>• Calculadora de intereses</li>
                <li>• Estrategias de liberación</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sección del Footer */}
      <footer className="container mx-auto p-8 text-center text-sm text-gray-500">
        <Separator className="bg-neutral-700 mb-4" />
        <p>&copy; 2024 NARANJO INDUSTRIES. Todos los derechos reservados.</p>
        <p className="mt-2">
          Diseñado con <span className="text-white">creatividad</span>, impulsado por <span className="text-white">IA</span>.
        </p>
      </footer>
    </div>
  );
};

export default App;
