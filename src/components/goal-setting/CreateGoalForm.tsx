"use client";
import React, { useState } from "react";
import GoalOverviewScreen, {
  GoalDetailsType,
} from "@/components/goal-setting/GoalOverviewScreen";
import GoalDetailsScreen, {
  GoalType,
} from "@/components/goal-setting/GoalDetailsScreen";
import SaveTemplateScreen from "@/components/goal-setting/SaveTemplateScreens";
import CongratulationsScreen from "@/components/goal-setting/CongratulationsScreen";

export type GoalSubmissionType = {
  name: string;
  details: GoalDetailsType;
  goals: GoalType[];
};

export default function CreateGoalForm() {
  const [currentScreen, setCurrentScreen] = useState("goal-overview");
  const [goalName, setGoalName] = useState("");
  const [goalDetails, setGoalDetails] = useState<GoalDetailsType>({
    aspiration: "",
    strengths: "",
    weaknesses: "",
  });
  const [goals, setGoals] = useState<GoalType[]>([
    {
      goal: "",
      actions: "",
      location: "",
      frequency: "",
      confidence: -1,
      dateCompleted: null,
    },
  ]);

  const goalData: GoalSubmissionType = {
    name: goalName,
    details: goalDetails,
    goals,
  };

  return (
    <main className="flex flex-1">
      {currentScreen === "goal-overview" && (
        <GoalOverviewScreen
          setGoalDetails={setGoalDetails}
          goalDetails={goalDetails}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === "goal-details" && (
        <GoalDetailsScreen
          setGoals={setGoals}
          goals={goals}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === "save-template" && (
        <SaveTemplateScreen
          goalData={goalData}
          goalName={goalName}
          setGoalName={setGoalName}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === "congratulations" && <CongratulationsScreen />}
    </main>
  );
}
