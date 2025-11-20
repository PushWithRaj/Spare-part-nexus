import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { ProfileSetup } from "@/components/profile/ProfileSetup";
import { RetailerDashboard } from "@/components/dashboard/RetailerDashboard";
import { ManufacturerDashboard } from "@/components/dashboard/ManufacturerDashboard";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, shop_name, company_name")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userEmail={session?.user?.email} />
      
      {!session ? (
        <AuthForm />
      ) : !profile ? (
        <ProfileSetup
          userId={session.user.id}
          onComplete={() => fetchProfile(session.user)}
        />
      ) : profile.role === "retailer" ? (
        <RetailerDashboard userId={session.user.id} profile={profile} />
      ) : profile.role === "manufacturer" ? (
        <ManufacturerDashboard userId={session.user.id} profile={profile} />
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-muted-foreground">Unknown user role. Please contact support.</p>
        </div>
      )}
    </div>
  );
};

export default Index;
