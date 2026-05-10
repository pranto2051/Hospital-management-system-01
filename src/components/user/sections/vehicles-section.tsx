"use client";

import { mockVehicles } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Badge } from "@/components/shared/badge";
import { Input } from "@/components/shared/input";
import { SuccessMessage, ConfirmModal } from "@/components/shared";
import { Car, Plus, Trash2, Edit3, ShieldCheck, Info, X } from "lucide-react";
import { useDemoModeStore } from "@/lib/data/use-mock-data";
import { useState } from "react";
import { Vehicle, VehicleType } from "@/lib/types";

export function VehiclesSection() {
  const { isDemoMode } = useDemoModeStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>(isDemoMode ? mockVehicles : []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState<{
    vehicle_number: string;
    brand: string;
    model: string;
    license_number: string;
    vehicle_type: VehicleType;
  }>({
    vehicle_number: "",
    brand: "",
    model: "",
    license_number: "",
    vehicle_type: "car"
  });

  const handleAddClick = () => {
    setEditingVehicle(null);
    setFormData({ vehicle_number: "", brand: "", model: "", license_number: "", vehicle_type: "car" });
    setIsFormOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      license_number: vehicle.license_number || "",
      vehicle_type: vehicle.vehicle_type
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...formData } : v));
      setSuccessMsg("Vehicle updated successfully!");
    } else {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: "user-1",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...formData
      };
      setVehicles(prev => [newVehicle, ...prev]);
      setSuccessMsg("Vehicle added successfully!");
    }
    setIsFormOpen(false);
    setShowSuccess(true);
  };

  const handleDelete = () => {
    if (vehicleToDelete) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete));
      setVehicleToDelete(null);
      setSuccessMsg("Vehicle deleted successfully!");
      setShowSuccess(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-gradient">My Vehicles</h1>
          <p className="text-muted-foreground font-medium">Add and manage your vehicles for seamless parking.</p>
        </div>
        <Button 
          onClick={handleAddClick}
          className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
        >
          <Plus className="h-5 w-5 mr-2 stroke-3" />
          Add New Vehicle
        </Button>
      </div>

      {isFormOpen && (
        <Card className="premium-card border-none rounded-4xl overflow-hidden animate-in slide-in-from-top-4">
          <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tight">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </CardTitle>
              <CardDescription className="font-medium">Enter your vehicle details below.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Plate Number</label>
                <Input 
                  value={formData.vehicle_number} 
                  onChange={e => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
                  placeholder="e.g. DHAKA-METRO-KA-1234" 
                  className="rounded-xl border-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Brand</label>
                <Input 
                  value={formData.brand} 
                  onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g. Toyota" 
                  className="rounded-xl border-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Model</label>
                <Input 
                  value={formData.model} 
                  onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g. Corolla" 
                  className="rounded-xl border-slate-200" 
                />
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">License Number</label>
                  <Input 
                    value={formData.license_number} 
                    onChange={e => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    placeholder="e.g. 12-3456" 
                    className="rounded-xl border-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Type</label>
                  <select 
                    value={formData.vehicle_type}
                    onChange={e => setFormData(prev => ({ ...prev, vehicle_type: e.target.value as VehicleType }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="truck">Truck</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl font-bold px-6">Cancel</Button>
                <Button onClick={handleSave} className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20">
                  {editingVehicle ? "Save Changes" : "Add Vehicle"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
              {/* Animated gradient background */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                vehicle.vehicle_type === 'car' ? 'bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5' : 'bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5'
              }`} />

              {/* Top accent bar with gradient */}
              <div className={`h-1.5 w-full ${
                vehicle.vehicle_type === 'car'
                  ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/60'
                  : 'bg-gradient-to-r from-accent via-accent/80 to-accent/60'
              }`} />

              <CardContent className="relative p-0">
                <div className="p-6">
                  {/* Header with icon and badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`relative ${
                      vehicle.vehicle_type === 'car'
                        ? 'bg-gradient-to-br from-primary to-primary/80'
                        : 'bg-gradient-to-br from-accent to-accent/80'
                    } p-4 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <Car className="h-7 w-7 text-white" />
                    </div>
                    <Badge className={`px-3 py-1.5 font-bold text-xs rounded-full shadow-lg ${
                      vehicle.is_verified
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-amber-500/20'
                    }`}>
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {vehicle.is_verified ? 'VERIFIED' : 'PENDING'}
                    </Badge>
                  </div>

                  {/* Plate number with enhanced styling */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        vehicle.vehicle_type === 'car' ? 'bg-primary' : 'bg-accent'
                      }`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration</span>
                    </div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl shadow-inner">
                      <span className={`text-xl font-black tracking-widest ${
                        vehicle.vehicle_type === 'car' ? 'text-primary' : 'text-accent'
                      }`}>{vehicle.vehicle_number}</span>
                    </div>
                  </div>

                  {/* Brand & Model with glass effect */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 border border-slate-100/50 backdrop-blur-sm">
                      <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl ${
                        vehicle.vehicle_type === 'car' ? 'bg-primary/10' : 'bg-accent/10'
                      }`} />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 relative">Brand</p>
                      <p className="text-sm font-bold text-slate-800 relative">{vehicle.brand}</p>
                    </div>
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 border border-slate-100/50 backdrop-blur-sm">
                      <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl ${
                        vehicle.vehicle_type === 'car' ? 'bg-primary/10' : 'bg-accent/10'
                      }`} />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 relative">Model</p>
                      <p className="text-sm font-bold text-slate-800 relative">{vehicle.model}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => handleEditClick(vehicle)}
                      className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all duration-300 ${
                        vehicle.vehicle_type === 'car'
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                          : 'bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25 hover:shadow-accent/40'
                      } hover:-translate-y-1`}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button
                      onClick={() => setVehicleToDelete(vehicle.id)}
                      className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-rose-500/25"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      <ConfirmModal 
        open={!!vehicleToDelete}
        onOpenChange={() => setVehicleToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <SuccessMessage 
        isVisible={showSuccess} 
        message={successMsg} 
        onClose={() => setShowSuccess(false)} 
      />
    </div>
  );
}

