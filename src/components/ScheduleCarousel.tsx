import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleEntry {
  month: string;
  copyDeadline: string;
  printDeadline: string;
  deliveryDate: string;
}

interface ScheduleCarouselProps {
  areaName: string;
  schedule: ScheduleEntry[];
  selectedMonth?: string;
  onMonthSelect?: (month: string) => void;
}

export const ScheduleCarousel: React.FC<ScheduleCarouselProps> = ({
  areaName,
  schedule = [],
  selectedMonth,
  onMonthSelect
}) => {
  // If no schedule data, generate placeholder months
  const scheduleData = schedule.length > 0 ? schedule : [
    { month: 'January', copyDeadline: '15th', printDeadline: '20th', deliveryDate: '25th' },
    { month: 'February', copyDeadline: '15th', printDeadline: '20th', deliveryDate: '25th' },
    { month: 'March', copyDeadline: '15th', printDeadline: '20th', deliveryDate: '25th' },
    { month: 'April', copyDeadline: '15th', printDeadline: '20th', deliveryDate: '25th' },
    { month: 'May', copyDeadline: '15th', printDeadline: '20th', deliveryDate: '25th' },
    { month: 'June', copyDeadline: '15th', printDeadline: '20th', deliveryDate: '25th' }
  ];

  const handleMonthClick = (month: string) => {
    onMonthSelect?.(month);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-gray-800">{areaName} - Publication Schedule</h4>
      </div>
      
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {scheduleData.map((entry, index) => (
              <CarouselItem key={entry.month} className="pl-2 md:pl-4 basis-full md:basis-1/3">
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedMonth === entry.month 
                      ? "ring-2 ring-primary bg-primary/5 border-primary" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleMonthClick(entry.month)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-sm text-gray-900">
                          {entry.month}
                        </h5>
                        {selectedMonth === entry.month && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Copy Deadline:</span>
                          <span className="font-medium">{entry.copyDeadline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Print Deadline:</span>
                          <span className="font-medium">{entry.printDeadline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery:</span>
                          <span className="font-medium">{entry.deliveryDate}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {scheduleData.length > 3 && (
            <>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </>
          )}
        </Carousel>
      </div>
      
      {selectedMonth && (
        <div className="mt-3 text-xs text-center text-primary">
          Campaign will start in {selectedMonth}
        </div>
      )}
    </div>
  );
};