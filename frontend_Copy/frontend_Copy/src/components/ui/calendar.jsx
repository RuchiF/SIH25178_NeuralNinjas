import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div
      className={cn(
        "p-3 flex flex-col items-center space-y-3 bg-background rounded-xl shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between w-full px-2">
        <button
          onClick={() =>
            setSelectedDate(
              new Date(selectedDate.setMonth(selectedDate.getMonth() - 1))
            )
          }
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <h2 className="text-sm font-medium">
          {selectedDate.toLocaleString("default", { month: "long" })}{" "}
          {selectedDate.getFullYear()}
        </h2>

        <button
          onClick={() =>
            setSelectedDate(
              new Date(selectedDate.setMonth(selectedDate.getMonth() + 1))
            )
          }
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        inline
        calendarClassName="rounded-xl border border-border bg-card"
        dayClassName={(date) =>
          cn(
            "text-sm rounded-md w-8 h-8 flex items-center justify-center hover:bg-accent hover:text-accent-foreground",
            date.toDateString() === selectedDate.toDateString()
              ? "bg-primary text-primary-foreground"
              : ""
          )
        }
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
