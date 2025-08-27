import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, MapPinned, Rss } from "lucide-react"
import type { Alert } from "@/types"
import { alertCategories, cropTypes, severityLevels } from "../alerts/alert-creation-form"

interface AlertCardProps {
  alert: Alert
  onViewOnMap: (alert: Alert) => void
}

export function AlertCard({ alert, onViewOnMap }: AlertCardProps) {
  // Helper functions for the card
  const getCrop = (item: string) => {
    const cropOptions = [
      { value: "all", label: "Crops", icon: "🌿" },
      { value: "wheat", label: "Wheat", icon: "🌾" },
      { value: "corn", label: "Corn", icon: "🌽" },
      { value: "rice", label: "Rice", icon: "🍚" },
      { value: "tomatoes", label: "Tomatoes", icon: "🍅" },
      { value: "potatoes", label: "Potatoes", icon: "🥔" },
      { value: "cotton", label: "Cotton", icon: "☁️" },
      { value: "sunflower", label: "Sunflower", icon: "🌻" },
      { value: "canola", label: "Canola", icon: "🌼" },
      { value: "lettuce", label: "Lettuce", icon: "🥬" },
      { value: "carrots", label: "Carrots", icon: "🥕" },
      { value: "onions", label: "Onions", icon: "🧅" },
      { value: "peppers", label: "Peppers", icon: "🌶️" },
      { value: "cucumbers", label: "Cucumbers", icon: "🥒" },
      { value: "peas", label: "Peas", icon: "🟢" },
      { value: "spinach", label: "Spinach", icon: "🥬" },
    ];
    return cropOptions.find((c) => c.value === item);
  }

  const getSeverity = (item: string) => {
    return severityLevels.find((s) => s.value === item);
  }

  const getCategory = (item: string) => {
    return alertCategories.find((s) => s.value === item);
  }

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 0) return 'just now';
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  const getCategoryColor = (category: string) => {
    const categoryItem = alertCategories.find(c => c.value == category)
    return categoryItem ? categoryItem.color : "bg-gray-100 text-gray-800"
  };

  const getCropColor = (crop: string) => {
    const cropItem = cropTypes.find(c => c.value === crop);
    return cropItem ? cropItem.color : "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-bg-secondary border rounded-lg p-4 hover:shadow-md transition-shadow space-y-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge className={getCategoryColor(alert.category)}>
            {getCategory(alert.category)?.icon} {getCategory(alert.category)?.label}
          </Badge>
          <Badge className={getCropColor(alert.crop || "")}>
            {getCrop(alert.crop)?.icon} {getCrop(alert.crop)?.label}
          </Badge>
        </div>
        <Badge className={`${getPriorityColor(alert.severity)} text-white`}>
          {getSeverity(alert.severity)?.label}
        </Badge>
      </div>
      <h3 className="font-bold text-lg sm:text-xl mb-2">{alert.title}</h3>
      <div className="flex items-center text-sm mb-1">
        <MapPin className="h-4 w-4 stroke-[2.5]" />
        <span className="font-semibold mx-1">Location:</span>&nbsp;
        <span>{alert.address ?? `(${alert.latitude}, ${alert.longitude})`}</span>
      </div>
      <div className="flex items-center text-sm mb-3">
        <Rss className="h-3.5 w-3.5 stroke-[2.5]" />
        <span className="font-semibold mx-1">Coverage Area:</span>
        <span>{(alert.radius / 1000).toFixed(0)} Km radius</span>
      </div>
      <p className="text-sm mb-4 leading-relaxed">{alert.description}</p>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 bg-transparent font-bold hover:bg-accent hover:text-primary"
          onClick={() => onViewOnMap(alert)}
        >
          <span>View on Map</span>
          <span className="p-1 rounded-sm bg-primary text-white">
            <MapPinned />
          </span>
        </Button>
        <span className="text-sm">Posted: {timeAgo(alert.date)}</span>
      </div>
    </div>
  )
}