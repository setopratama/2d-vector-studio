// src/App.tsx
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PromptInput } from './components/PromptInput';
import { CostEstimationCard } from './components/CostEstimationCard';
import { BatchCardsGrid } from './components/BatchCardsGrid';
import { HistorySidebar } from './components/HistorySidebar';
import { AutoRunnerWizardModal } from './components/AutoRunnerWizardModal';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import { useCostEstimator } from './hooks/useCostEstimator';
import { useExchangeRate } from './hooks/useExchangeRate';
import { TargetEngine, InputMode, PromptItem } from './types/prompt';
import { AlertCircle } from 'lucide-react';

export function App() {
  // Exchange rate live hook (1x per day fetch with localStorage cache)
  const { usdToIdrRate, source: rateSource, exchangeDate } = useExchangeRate();

  // Input form states - default 5 variations as requested!
  const [rawIdea, setRawIdea] = useState('maskot rubah mekanik');
  const [inputMode, setInputMode] = useState<InputMode>('variations');
  const [batchCount, setBatchCount] = useState<number>(5);
  const [selectedEngine, setSelectedEngine] = useState<TargetEngine>('gpt-image');
  const [selectedPreset, setSelectedPreset] = useState('flat-vector');
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Active batch concept count
  const lineConcepts = rawIdea
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const effectiveBatchCount = inputMode === 'multi-keyword' ? Math.max(1, lineConcepts.length) : batchCount;

  // Live Token & Cost Estimator Hook
  const { userTokens, promptEstimate, imageEstimate } = useCostEstimator(
    rawIdea,
    effectiveBatchCount,
    1,
    inputMode === 'multi-keyword'
  );

  // Workflow Generator Hook (Connected to SQLite DB & FIFO Queue Worker)
  const {
    history,
    activePrompts,
    setActivePrompts,
    isGeneratingPrompt,
    taskQueue,
    getCardQueueStatus,
    cancelQueueTask,
    cancelAllQueueTasks,
    errorMessage,
    setErrorMessage,
    handleGeneratePrompts,
    handleRegeneratePrompt,
    handleSelectPromptVersion,
    handleGenerateImageForPrompt,
    handleGenerateAllBatchImages,
    handleRegenerateImage,
    handleDownloadAllImages,
    handleToggleFavorite,
    handleDeletePrompt,
    handleClearHistory,
  } = usePromptGenerator();

  // Total session spend across all items
  const totalSessionCostUsd = history.reduce(
    (acc, curr) => acc + parseFloat(curr.totalCostUsd || '0'),
    0
  );

  // Trigger batch prompt generation
  const onTriggerPromptGeneration = () => {
    handleGeneratePrompts({
      rawIdea,
      inputMode,
      batchCount: effectiveBatchCount,
      selectedEngine,
      selectedPreset,
      isBlackAndWhite,
    });
  };

  // Reset workspace
  const handleResetWorkspace = () => {
    setRawIdea('');
    setActivePrompts([]);
  };

  // Callback when Auto-Runner Wizard completes an item
  const handleWizardItemGenerated = (newItems: PromptItem[]) => {
    setActivePrompts((prev) => {
      const ids = new Set(newItems.map((n) => n.id));
      const filtered = prev.filter((p) => !ids.has(p.id));
      return [...newItems, ...filtered];
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        totalSessionCostUsd={totalSessionCostUsd}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onResetWorkspace={handleResetWorkspace}
        onOpenWizard={() => setIsWizardOpen(true)}
        isHistoryOpen={isHistoryOpen}
        usdToIdrRate={usdToIdrRate}
        rateSource={rateSource}
        rateDate={exchangeDate}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border-2 border-red-600 text-red-900 flex items-start justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              TUTUP
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAHAP 1: INPUT KEYWORD / BATCH & PRA-ESTIMASI BIAYA PROMPT           */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          <PromptInput
            rawIdea={rawIdea}
            setRawIdea={setRawIdea}
            inputMode={inputMode}
            setInputMode={setInputMode}
            batchCount={batchCount}
            setBatchCount={setBatchCount}
            selectedEngine={selectedEngine}
            setSelectedEngine={setSelectedEngine}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            isBlackAndWhite={isBlackAndWhite}
            setIsBlackAndWhite={setIsBlackAndWhite}
            tokenCount={userTokens}
          />

          <CostEstimationCard
            rawIdea={rawIdea}
            batchCount={effectiveBatchCount}
            promptEstimate={promptEstimate}
            imageEstimate={imageEstimate}
            isLoading={isGeneratingPrompt}
            onGeneratePrompts={onTriggerPromptGeneration}
            isBlackAndWhite={isBlackAndWhite}
          />
        </div>

        {/* ==================================================================== */}
        {/* TAHAP 2 & 3: GRID 5 CARD MANDIRI (SIMPAN DB + GAMBAR DI CARD SAMA)   */}
        {/* ==================================================================== */}
        {activePrompts.length > 0 && (
          <BatchCardsGrid
            promptItems={activePrompts}
            taskQueue={taskQueue}
            getCardQueueStatus={getCardQueueStatus}
            onGenerateImageForPrompt={handleGenerateImageForPrompt}
            onGenerateAllBatchImages={handleGenerateAllBatchImages}
            onRegenerateImage={handleRegenerateImage}
            onRegeneratePrompt={handleRegeneratePrompt}
            onSelectPromptVersion={handleSelectPromptVersion}
            onCancelQueueTask={cancelQueueTask}
            onCancelAllQueueTasks={cancelAllQueueTasks}
            onToggleFavorite={handleToggleFavorite}
            onDownloadAllImages={handleDownloadAllImages}
          />
        )}
      </main>

      {/* Auto-Runner Wizard Modal */}
      <AutoRunnerWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        usdToIdrRate={usdToIdrRate}
        onItemsGenerated={handleWizardItemGenerated}
      />

      {/* History Drawer Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        usdToIdrRate={usdToIdrRate}
        onSelectPrompt={(item: PromptItem) => {
          if (item.batchId) {
            const batchMembers = history.filter((p) => p.batchId === item.batchId);
            if (batchMembers.length > 0) {
              setActivePrompts(batchMembers);
            } else {
              setActivePrompts([item]);
            }
          } else {
            setActivePrompts([item]);
          }
          setRawIdea(item.rawIdea);
          setIsBlackAndWhite(item.isBlackAndWhite);
          setIsHistoryOpen(false);
        }}
        onClearHistory={handleClearHistory}
        onDeletePrompt={handleDeletePrompt}
        activePromptId={activePrompts[0]?.id}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-xs font-mono text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-stone-900 inline-block"></span>
            <span className="font-bold text-stone-900 uppercase">Agentic AI 2D Vector Studio</span>
            <span>•</span>
            <span>SQLite Local Database (`data/prompt_studio.db`)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>DeepSeek v4 Flash ($0.14/$0.56)</span>
            <span>•</span>
            <span>GPT Image 2.5 ($0.020 / 1:1)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
