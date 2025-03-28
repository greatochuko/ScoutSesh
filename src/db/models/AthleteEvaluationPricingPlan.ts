import mongoose from "mongoose";
import { UserType } from "./User";

export type StandardPlanType = {
  _id: string;
  name: "Monthly" | "Quarterly" | "Semi Annual" | "Yearly";
  evaluations: number;
  price: number;
} & mongoose.Document;

export type CustomPlanType = {
  _id: string;
  type: "single" | "range";
  evaluations: { from: number; to: number };
  price: number;
} & mongoose.Document;

type AECustomPlanType =
  | {
      offerCustomPlan: false;
    }
  | {
      offerCustomPlan: boolean;
      customPlanTiers: CustomPlanType[];
    };

type AEVirtualConsultationType =
  | {
      offerVirtualConsultation: false;
    }
  | {
      offerVirtualConsultation: boolean;
      virtualConsultationType: "addon" | "included";
      virtualConsultationDuration: number;
      virtualConsultationRate: number;
      discussionTopics: {
        athleteEvaluation: boolean;
        goalSetting: boolean;
        dailyJournal: boolean;
        other: boolean;
      };
    };

interface BaseAEPricingPlanType extends mongoose.Document {
  _id: string;
  standardPlans: StandardPlanType[];
  firstEvaluationDays: number;
  user: UserType;
}

export type AEPricingPlanType = BaseAEPricingPlanType &
  AECustomPlanType &
  AEVirtualConsultationType;

const StandardPlanSchema = new mongoose.Schema<StandardPlanType>({
  name: {
    type: String,
    enum: ["Monthly", "Quarterly", "Semi Annual", "Yearly"],
    required: true,
  },
  evaluations: { type: Number, required: true },
  price: { type: Number, required: true },
});

const CustomPlanTierSchema = new mongoose.Schema<CustomPlanType>({
  type: {
    type: String,
    enum: ["single", "range"],
  },
  evaluations: {
    from: {
      type: Number,
    },
    to: {
      type: Number,
    },
  },
  price: {
    type: Number,
  },
});

export const AthleteEvaluationPricingPlanSchema =
  new mongoose.Schema<AEPricingPlanType>(
    {
      standardPlans: [StandardPlanSchema],
      firstEvaluationDays: { type: Number, required: true },
      offerCustomPlan: { type: Boolean, required: true },
      customPlanTiers: [CustomPlanTierSchema],
      offerVirtualConsultation: { type: Boolean },
      virtualConsultationType: { type: String },
      virtualConsultationDuration: { type: Number },
      virtualConsultationRate: { type: Number },
      discussionTopics: {
        athleteEvaluation: { type: Boolean },
        goalSetting: { type: Boolean },
        dailyJournal: { type: Boolean },
        other: { type: Boolean },
      },
      user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "User",
      },
    },
    { timestamps: true },
  );

const AthleteEvaluationPricingPlan =
  mongoose.models?.AthleteEvaluationPricingPlan ||
  mongoose.model(
    "AthleteEvaluationPricingPlan",
    AthleteEvaluationPricingPlanSchema,
  );

export default AthleteEvaluationPricingPlan;
