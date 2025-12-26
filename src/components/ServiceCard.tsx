import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onViewDetails: () => void;
}

export function ServiceCard({ title, description, icon: Icon, onViewDetails }: ServiceCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-accent/50 bg-card">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={onViewDetails}
          className="w-full group-hover:border-accent group-hover:text-accent hover:!bg-accent hover:!text-accent-foreground transition-colors"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
