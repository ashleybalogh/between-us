import { createFileRoute } from "@tanstack/react-router";
import { BetweenUsApp } from "@/components/between-us-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BetweenUsApp />;
}
