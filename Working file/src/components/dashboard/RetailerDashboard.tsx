import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface RetailerDashboardProps {
  userId: string;
  profile: any;
}

export function RetailerDashboard({ userId, profile }: RetailerDashboardProps) {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [partName, setPartName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");

  useEffect(() => {
    fetchParts();
  }, [userId]);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (error: any) {
      toast.error(`Error fetching parts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("parts").insert({
        part_name: partName,
        part_number: partNumber,
        vehicle_model: vehicleModel,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        seller_id: userId,
      });

      if (error) throw error;

      setPartName("");
      setPartNumber("");
      setVehicleModel("");
      setQuantity("1");
      setPrice("0");
      fetchParts();
      toast.success("Part added successfully!");
    } catch (error: any) {
      toast.error(`Error adding part: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Welcome, {profile.shop_name}</h2>
        <p className="text-muted-foreground">Manage your spare parts inventory</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Spare Part</CardTitle>
            <CardDescription>List a new part for sale</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPart} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partName">Part Name</Label>
                <Input
                  id="partName"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number (OEM)</Label>
                <Input
                  id="partNumber"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Compatible Vehicle Model</Label>
                <Input
                  id="vehicleModel"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (per unit)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Part
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Listed Parts</CardTitle>
            <CardDescription>View and manage your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : parts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't listed any parts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {parts.map((part) => (
                  <Card key={part.id}>
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold">{part.part_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Model: {part.vehicle_model} | Part #: {part.part_number || "N/A"}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        Stock: {part.quantity} | Price: ${part.price}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
