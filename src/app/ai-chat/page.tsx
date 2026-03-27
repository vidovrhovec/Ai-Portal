import { AIChatInterface } from '@/components/ai/AIChatInterface';

export default function AIChatPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Klepet</h1>
          <p className="text-gray-600">
            Klepetajte z umetno inteligenco. Sistem samodejno izbere najboljši razpoložljivi model
            (Ollama lokalno ali OpenAI v oblaku).
          </p>
        </div>

        <div className="h-[600px]">
          <AIChatInterface
            initialModel="llama2"
            showModelSelector={true}
            showSettings={true}
          />
        </div>
      </div>
    </div>
  );
}