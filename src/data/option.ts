/**
 * Example option lists.
 * Replace with your own domain data whenever ready.
 */
import type { Option } from "../types/options";

export const INTERVENTIONS: Option[] = [
  { id: "authenticity", label: "Encouraged reflection on authenticity", group: "CBT" },
  { id: "distress-tools", label: "Distress tolerance tools (ACCEPTS, TIP)", group: "DBT" },
  { id: "activation", label: "Behavioral activation principles", group: "CBT" },
  { id: "avoidance", label: "Avoidance & safety behaviors psychoeducation", group: "Psychoeducation" },
  { id: "mindfulness", label: "Mindfulness grounding exercise", group: "Mindfulness" },
  { id: "values", label: "Values clarification", group: "ACT" },
];

export const OBSERVATIONS: Option[] = [
  { id: "engaged", label: "Client engaged and reflective", group: "Affect" },
  { id: "guarded", label: "Guarded but cooperative", group: "Affect" },
  { id: "tearful", label: "Tearful at times", group: "Affect" },
  { id: "insight", label: "Demonstrates insight into patterns", group: "Cognition" },
  { id: "risk-none", label: "No acute risk reported", group: "Risk" },
];
