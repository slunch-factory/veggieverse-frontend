import { STANDARD_QUESTIONS } from "./_data/surveyQuestions";
import { SpiritStepClient } from "./_components/SpiritStepClient";

export default function SpiritPage() {
  return <SpiritStepClient questions={STANDARD_QUESTIONS} />;
}
