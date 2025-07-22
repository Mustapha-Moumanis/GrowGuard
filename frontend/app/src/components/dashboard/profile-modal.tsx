"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Camera, MapPin, Mail, User } from "lucide-react"
import { userApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth"
import LocationMap from "../location-map"

export function ProfileModal({ onClose }: {onClose: () => void}) {
  const { user, updateUser } = useAuth()

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    farmLocation: user?.farmLocation || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
    address?: string
    country?: string
    region?: string
    city?: string
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      
      if (user?.role === "Farmer") {
        formDataToSend.append('farmLocation', formData.farmLocation);
      }
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      console.log("Submitting profile update with data:", formDataToSend);
      const updatedUser = await userApi.updateProfile(formDataToSend);
      
      updateUser({
        ...user,
        ...updatedUser,
        avatar: updatedUser.avatar || user?.avatar,
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">Click the camera icon to update your photo</p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {user?.role === "Farmer" && (
                <div className="space-y-2 col-span-2 ">
                  <LocationMap user={user} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />

                  {/* <Label htmlFor="farmLocation" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Farm Location
                  </Label>
                  <Input
                    id="farmLocation"
                    value={formData.farmLocation}
                    onChange={handleInputChange}
                    placeholder="Enter your farm address"
                  /> */}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// "use client"

// import type React from "react"
// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { X, Camera, MapPin, Mail, User, Plus, Trash } from "lucide-react"
// import { userApi } from "@/lib/api";
// import { useAuth } from "@/hooks/use-auth"
// import LocationMap from "../location-map"

// type FarmLocation = {
//   latitude: number
//   longitude: number
//   address?: string
//   country?: string
//   region?: string
//   city?: string
//   name?: string
// }

// export function ProfileModal({ onClose }: {onClose: () => void}) {
//   const { user, updateUser } = useAuth()

//   const [formData, setFormData] = useState({
//     username: user?.username || "",
//     email: user?.email || "",
//   });

//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

//   // Initialize farm locations from user data or empty array
//   const [farmLocations, setFarmLocations] = useState<FarmLocation[]>(
//     user?.farmLocations?.length ? user.farmLocations : []
//   );

//   // State for the currently selected/edited location
//   const [currentLocation, setCurrentLocation] = useState<FarmLocation | null>(null);
//   const [locationName, setLocationName] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append('username', formData.username);
//       formDataToSend.append('email', formData.email);
      
//       if (user?.role === "Farmer") {
//         formDataToSend.append('farmLocations', JSON.stringify(farmLocations));
//       }
      
//       if (avatarFile) {
//         formDataToSend.append('avatar', avatarFile);
//       }

//       console.log("Submitting profile update with data:", formDataToSend);
//       const updatedUser = await userApi.updateProfile(formDataToSend);
      
//       updateUser({
//         ...user,
//         ...updatedUser,
//         avatar: updatedUser.avatar || user?.avatar,
//       });
      
//       onClose();
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       // Handle error (show toast, etc.)
//     }
//   };

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAvatarFile(file);
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setAvatarPreview(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [id]: value
//     }));
//   };

//   const handleAddLocation = () => {
//     if (currentLocation) {
//       const newLocation = {
//         ...currentLocation,
//         name: locationName || `Farm ${farmLocations.length + 1}`
//       };
      
//       setFarmLocations([...farmLocations, newLocation]);
//       setCurrentLocation(null);
//       setLocationName("");
//     }
//   };

//   const handleRemoveLocation = (index: number) => {
//     const updatedLocations = [...farmLocations];
//     updatedLocations.splice(index, 1);
//     setFarmLocations(updatedLocations);
//   };

//   const handleLocationSelect = (location: FarmLocation) => {
//     setCurrentLocation(location);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Edit Profile</CardTitle>
//               <CardDescription>Update your personal information and preferences</CardDescription>
//             </div>
//             <Button variant="ghost" size="icon" onClick={onClose}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
//             {/* Avatar Section */}
//             <div className="flex flex-col items-center space-y-4">
//               <div className="relative">
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden">
//                   {avatarPreview ? (
//                     <img
//                       src={avatarPreview}
//                       alt="Avatar"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <User className="w-12 h-12 text-white" />
//                   )}
//                 </div>
//                 <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
//                   <Camera className="w-4 h-4" />
//                   <input 
//                     type="file" 
//                     accept="image/*" 
//                     onChange={handleAvatarChange} 
//                     className="hidden" 
//                   />
//                 </label>
//               </div>
//               <p className="text-sm text-muted-foreground">Click the camera icon to update your photo</p>
//             </div>

//             {/* Basic Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="username" className="flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Full Name
//                 </Label>
//                 <Input
//                   id="username"
//                   value={formData.username}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="flex items-center gap-2">
//                   <Mail className="w-4 h-4" />
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               {user?.role === "Farmer" && (
//                 <div className="space-y-4 col-span-2">
//                   <div className="space-y-2">
//                     <Label className="flex items-center gap-2">
//                       <MapPin className="w-4 h-4" />
//                       Farm Locations
//                     </Label>
                    
//                     {/* Current farm locations list */}
//                     {farmLocations.length > 0 && (
//                       <div className="space-y-2">
//                         {farmLocations.map((location, index) => (
//                           <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                             <div>
//                               <p className="font-medium">{location.name}</p>
//                               <p className="text-sm text-muted-foreground">
//                                 {[location.address, location.city, location.region, location.country]
//                                   .filter(Boolean).join(', ')}
//                               </p>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleRemoveLocation(index)}
//                             >
//                               <Trash className="w-4 h-4 text-red-500" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Map for selecting new location */}
//                     <LocationMap 
//                       selectedLocation={currentLocation} 
//                       setSelectedLocation={handleLocationSelect} 
//                     />

//                     {/* Location name input */}
//                     {currentLocation && (
//                       <div className="flex gap-2 items-end">
//                         <div className="flex-1 space-y-2">
//                           <Label htmlFor="locationName">Location Name</Label>
//                           <Input
//                             id="locationName"
//                             value={locationName}
//                             onChange={(e) => setLocationName(e.target.value)}
//                             placeholder="Give this location a name (e.g., Main Farm)"
//                           />
//                         </div>
//                         <Button
//                           type="button"
//                           onClick={handleAddLocation}
//                           className="gap-1"
//                         >
//                           <Plus className="w-4 h-4" />
//                           Add Location
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3 pt-4">
//               <Button type="button" variant="outline" onClick={onClose} className="flex-1">
//                 Cancel
//               </Button>
//               <Button type="submit" className="flex-1">
//                 Save Changes
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }