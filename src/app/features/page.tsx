import React from "react";
import FeatureSection from "@/components/FeatureSection";
import LinkButton from "@/components/LinkButton";

export const metadata = {
  title: "Features",
  description:
    "Explore the powerful tools and resources that ScoutSesh offers to help you elevate your performance in your sport. Discover our features and start your journey today.",
};

export default function FeaturesPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-[90%] max-w-6xl py-6 sm:py-8">
        <h1 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl">
          ScoutSesh Features
        </h1>
        <p className="mb-4 text-base sm:mb-8 sm:text-lg">
          Discover the powerful tools and resources that ScoutSesh offers to
          help you elevate your performance in your sport.
        </p>
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <FeatureSection
            title="Athlete Evaluation"
            description="Receive comprehensive evaluations from experienced coaches, combining quantitative analytical metrics with thorough feedback. Our platform provides a holistic view of your performance, helping you identify strengths and areas for improvement with precision."
            imageSrc="/features-evaluation.png"
          />
          <FeatureSection
            title="Goal Setting"
            description="Set ambitious yet achievable goals and complete weekly reflections to ensure you're on track for success. Our intuitive goal-setting tools help you stay focused and motivated throughout your development journey, providing regular check-ins and adjustments as needed."
            imageSrc="/features-goals.png"
          />
          <FeatureSection
            title="Group Classes"
            description="Join virtual group classes led by professional coaches across various sports. Enhance your technique, strategy, game understanding, and mental approach through interactive sessions. Collaborate with peers and learn from experts to elevate every aspect of your performance."
            imageSrc="/features-group-class.png"
          />
          <FeatureSection
            title="Daily Journal"
            description="Maintain an intentional focus on your athletic journey with our daily journaling feature. Record your thoughts, track your progress, and ensure you're consistently moving towards your goals. This tool helps you stay accountable and mindful of your daily efforts and achievements."
            imageSrc="/features-journal.png"
          />
        </div>
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
            Ready to Experience These Features?
          </h2>
          <p className="mb-6 text-base sm:text-lg">
            Join ScoutSesh today and start your journey to becoming an elite
            player in your sport.
          </p>
          <LinkButton href="/signup" size="lg">
            Sign Up Now
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
