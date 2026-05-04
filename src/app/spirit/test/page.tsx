import { STANDARD_QUESTIONS } from '@/app/spirit/_data/surveyQuestions';
import { SpiritStepClient3D } from './_components/SpiritStepClient3D';

export default function SpiritTestPage() {
  return <SpiritStepClient3D questions={STANDARD_QUESTIONS} />;
}
