import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex-shrink-0 w-full w-[75%] md:w-2/4 lg:w-1/4 flex flex-col items-center text-center py-16 px-4 md:px-8 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardHeader className="w-full gap-3 lg:gap-1 px-0 lg:flex">
        <div className="text-4xl text-purple-900 font-bold flex justify-center">{icon}</div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <p className="text-gray-700">{description}</p>
      </CardContent>
    </Card>
  );
}