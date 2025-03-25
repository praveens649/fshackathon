// 'use client';
import React from "react";

import { Clock, PhoneCall, UserCheck, UserMinus, UserPlus, Users } from "lucide-react";
// import { useDashboardMetrics } from "../_data/use-dashboard-metrics";
import { Card,CardHeader,CardTitle,CardContent } from "@/components/ui/card";


const DashboardCards = () => {
  // const { loading } = useDashboardMetrics();
  // const { checkIns, instructors, totalMembers, leads, } = useDashboardMetrics();
  // console.log(instructors);
  // console.log(leads);
  // if(loading)
  //   return <div>Loading...</div>;
  const metricData = [
    {
      title: "Total Members",
      icon: <Users className="text-muted-foreground h-4 w-4" />,
      value: 0,
      description: "-",
    },
    {
      title: "Request Pending",
      icon: <Clock className="text-muted-foreground h-4 w-4" />,
      value: 0,
      description: "-",
      
    },
    {
      title: "Passed Members",
      icon:<UserCheck className="text-muted-foreground h-4 w-4" />, 
      value: 0,
      description: "-",
    },
    {
      title: "Cancelled Members",
      icon: <UserMinus className="text-muted-foreground h-4 w-4" />,
      value: "0",
      description: "-",
    },
   
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {metricData.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-muted-foreground text-xs">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;