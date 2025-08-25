"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DebugPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);
  const makeCurrentUserAdmin = useMutation(api.admin.makeCurrentUserAdmin);
  const adminStatus = useQuery(api.admin.checkAdminStatus);

  const handleCreateUser = async () => {
    try {
      const result = await createUserIfNotExists();
      if (result.created) {
        toast.success("Usuario creado exitosamente");
      } else {
        toast.info("El usuario ya existe");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear usuario";
      toast.error(errorMessage);
    }
  };

  const handleMakeAdmin = async () => {
    try {
      const result = await makeCurrentUserAdmin();
      toast.success(result.message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al promocionar a admin";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-wider mb-8 text-black">
          Debug Dashboard
        </h1>

        <div className="grid gap-6">
          {/* Clerk Status */}
          <div className="bg-white p-6 border-4 border-black">
            <h2 className="text-xl font-bold uppercase mb-4">Clerk Status</h2>
            <div className="space-y-2">
              <p><strong>Is Loaded:</strong> {isLoaded ? "✅" : "❌"}</p>
              <p><strong>Is Signed In:</strong> {isSignedIn ? "✅" : "❌"}</p>
              <p><strong>Clerk User ID:</strong> {clerkUser?.id || "N/A"}</p>
              <p><strong>Email:</strong> {clerkUser?.emailAddresses?.[0]?.emailAddress || "N/A"}</p>
              <p><strong>Name:</strong> {clerkUser?.fullName || "N/A"}</p>
            </div>
          </div>

          {/* Convex User Status */}
          <div className="bg-white p-6 border-4 border-black">
            <h2 className="text-xl font-bold uppercase mb-4">Convex User Status</h2>
            <div className="space-y-2">
              <p><strong>User Found:</strong> {currentUser ? "✅" : "❌"}</p>
              {currentUser && (
                <>
                  <p><strong>User ID:</strong> {currentUser._id}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Name:</strong> {currentUser.name}</p>
                  <p><strong>Plan:</strong> 
                    <Badge className="ml-2">
                      {currentUser.plan}
                    </Badge>
                  </p>
                  <p><strong>Role:</strong> 
                    <Badge className="ml-2">
                      {currentUser.role || "N/A"}
                    </Badge>
                  </p>
                </>
              )}
            </div>
            
            {!currentUser && isSignedIn && (
              <Button 
                onClick={handleCreateUser}
                className="mt-4 bg-yellow-400 text-black border-2 border-black font-bold"
              >
                Crear Usuario en Convex
              </Button>
            )}
          </div>

          {/* Admin Status */}
          <div className="bg-white p-6 border-4 border-black">
            <h2 className="text-xl font-bold uppercase mb-4">Admin Status</h2>
            <div className="space-y-2">
              <p><strong>Is Admin:</strong> {adminStatus?.isAdmin ? "✅" : "❌"}</p>
              <p><strong>Admin Role:</strong> {adminStatus?.role || "N/A"}</p>
              <p><strong>Plan:</strong> {adminStatus?.plan || "N/A"}</p>
            </div>
            
            {currentUser && !adminStatus?.isAdmin && (
              <Button 
                onClick={handleMakeAdmin}
                className="mt-4 bg-red-500 text-white border-2 border-black font-bold"
              >
                Convertir en Super Admin
              </Button>
            )}
          </div>

          {/* Debug Actions */}
          <div className="bg-white p-6 border-4 border-black">
            <h2 className="text-xl font-bold uppercase mb-4">Debug Actions</h2>
            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white border-2 border-black font-bold"
              >
                Reload Page
              </Button>
              <Button 
                onClick={() => {
                  console.log("Clerk User:", clerkUser);
                  console.log("Convex User:", currentUser);
                  console.log("Admin Status:", adminStatus);
                }}
                className="bg-gray-500 text-white border-2 border-black font-bold"
              >
                Log to Console
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}