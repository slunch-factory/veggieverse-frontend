import { STANDARD_QUESTIONS } from "./_data/surveyQuestions";
import { SpiritStepClient3D } from "./_components/SpiritStepClient3D";

export default function SpiritPage() {
  return <SpiritStepClient3D questions={STANDARD_QUESTIONS} />;
}
