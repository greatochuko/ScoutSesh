"use client";
import React from "react";
import { Button } from "../ui/button";

export default function EvaluationCard({
  title,
  description,
  icon,
  action,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.JSX.Element;
  action: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col bg-white shadow-lg p-6 rounded-lg h-full">
      <div className="flex items-center mb-4">
        {React.cloneElement(icon, {
          className: "h-6 w-6 text-green-600 flex-shrink-0",
        })}
        <h3 className="ml-2 font-semibold text-xl leading-6">{title}</h3>
      </div>
      <p className="flex-grow mb-4 text-gray-600">{description}</p>
      <Button
        onClick={onClick}
        className="bg-green-600 hover:bg-green-700 text-white self-start"
      >
        {action}
      </Button>
    </div>
  );
}
