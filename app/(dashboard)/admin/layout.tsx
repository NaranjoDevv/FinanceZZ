"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdmin();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-4 border-black shadow-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder al panel de administración.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Now the admin pages will use the main dashboard layout with dropdown navigation
  return <>{children}</>;
}