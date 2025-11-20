import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Package } from "lucide-react";
import { toast } from "sonner";

interface ManufacturerDashboardProps {
  userId: string;
  profile: any;
}

export function ManufacturerDashboard({ userId, profile }: ManufacturerDashboardProps) {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async (search = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("parts")
        .select(`
          *,
          profiles!parts_seller_id_fkey ( shop_name )
        `)
        .gt("quantity", 0)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `part_name.ilike.%${search}%,part_number.ilike.%${search}%,vehicle_model.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      setParts(data || []);
    } catch (error: any) {
      toast.error(`Error fetching parts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParts(searchTerm);
  };

  const handlePlaceOrder = (part: any) => {
    toast.info(`Order feature coming soon for "${part.part_name}"`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Welcome, {profile.company_name}</h2>
        <p className="text-muted-foreground">Search and order spare parts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search for Spare Parts</CardTitle>
          <CardDescription>Find the parts you need from retailers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search by part name, number, or vehicle model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : parts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No parts found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {parts.map((part) => (
                <Card key={part.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">{part.part_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Model: {part.vehicle_model} | Part #: {part.part_number || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Seller: {part.profiles?.shop_name || "Unknown"}
                        </p>
                        <p className="text-lg font-bold mt-2">${part.price}</p>
                        <p className="text-sm text-muted-foreground">Stock: {part.quantity}</p>
                      </div>
                      <Button onClick={() => handlePlaceOrder(part)}>Place Order</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
