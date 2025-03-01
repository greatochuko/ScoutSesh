import React from "react";
import { getSessionFromHeaders } from "@/services/authServices";
import AthleteGoalSettingSubmissionsPage from "@/components/dashboard-pages/AthleteGoalSettingSubmissionsPage";
import CoachGoalSettingSubmissionsPage from "@/components/dashboard-pages/CoachGoalSettingSubmissionsPage";
import { notFound } from "next/navigation";
import { fetchTeamGoalData } from "@/services/goalServices";

export const metadata = {
  title: "Goal Setting Submissions",
  description: "View and manage goal setting submissions for your team.",
};

export default async function GoalSettingSubmissionsPage() {
  const user = await getSessionFromHeaders();

  if (user.role !== "Head Coach") {
    return <AthleteGoalSettingSubmissionsPage />;
  }

  const { teamGoalData, error } = await fetchTeamGoalData(
    user.organization!._id,
  );
  if (error !== null) notFound();

  return <CoachGoalSettingSubmissionsPage teamGoalData={teamGoalData} />;
}
