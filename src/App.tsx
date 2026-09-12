// src/App.tsx
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PromptInput } from './components/PromptInput';
import { CostEstimationCard } from './components/CostEstimationCard';
import { BatchCardsGrid } from './components/BatchCardsGrid';
import { HistorySidebar } from './components/HistorySidebar';
import { AutoRunnerWizardModal } from './components/AutoRunnerWizardModal';
import { ErrorLogModal } from './components/ErrorLogModal';
import { MetadataSettingsModal } from './components/MetadataSettingsModal';
import { VersionChangelogModal } from './components/VersionChangelogModal';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import { useCostEstimator } from './hooks/useCostEstimator';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useErrorLogs } from './hooks/useErrorLogs';
import { useContributorProfile } from './hooks/useContributorProfile';
import { useAppSettings } from './hooks/useAppSettings';
import { TargetEngine, InputMode, PromptItem } from './types/prompt';
import { AlertCircle, AlertTriangle, Database, Tag } from 'lucide-react';

export function App() {
  // App Version & Feature Settings Hook (Full Mode vs Classic Mode)
  const {
    features,
    updateFeatures,
    resetToClassic,
    enableAllFeatures,
    isVersionModalOpen,
    openVersionModal,
    closeVersionModal,
  } = useAppSettings();

  // Contributor Profile / Metadata Settings Hook
  const { profile: contributorProfile, updateProfile } = useContributorProfile();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Exchange rate live hook (1x per day fetch with localStorage cache)
  const { usdToIdrRate, source: rateSource, exchangeDate } = useExchangeRate();

  // Error logging hook
  const {
    errorLogs,
    isErrorModalOpen,
    isLoadingLogs,
    openErrorModal,
    closeErrorModal,
    fetchErrorLogs,
    clearErrorLogs,
  } = useErrorLogs();

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
      {/* Top Navbar (Clean Minimalist Header) */}
      <Navbar
        totalSessionCostUsd={totalSessionCostUsd}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onResetWorkspace={handleResetWorkspace}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenProfileSettings={() => setIsProfileModalOpen(true)}
        onOpenVersionModal={openVersionModal}
        authorName={contributorProfile.authorName}
        isHistoryOpen={isHistoryOpen}
        usdToIdrRate={usdToIdrRate}
        showAutoRunner={features.showAutoRunner}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border-2 border-red-600 text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={openErrorModal}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Lihat Detail Log Error</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-2 py-1 text-red-700 hover:text-red-950 font-bold border border-red-300 hover:bg-red-100 transition-colors cursor-pointer"
              >
                TUTUP
              </button>
            </div>
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
            showConceptExpander={features.showConceptExpander}
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
            contributorProfile={contributorProfile}
            onOpenProfileSettings={() => setIsProfileModalOpen(true)}
            getCardQueueStatus={getCardQueueStatus}
            onGenerateImageForPrompt={handleGenerateImageForPrompt}
            onGenerateAllBatchImages={handleGenerateAllBatchImages}
            onRegenerateImage={handleRegenerateImage}
            onRegeneratePrompt={handleRegeneratePrompt}
            onSelectPromptVersion={handleSelectPromptVersion}
            onCancelQueueTask={cancelQueueTask}
            onCancelAllQueueTasks={cancelAllQueueTasks}
            onToggleFavorite={handleToggleFavorite}
            onDownloadAllImages={() => handleDownloadAllImages(contributorProfile)}
          />
        )}
      </main>

      {/* Contributor Profile / Metadata Settings Modal */}
      <MetadataSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={contributorProfile}
        onSaveProfile={updateProfile}
      />

      {/* Auto-Runner Wizard Modal */}
      <AutoRunnerWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        usdToIdrRate={usdToIdrRate}
        contributorProfile={contributorProfile}
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

      {/* Error Logs System Modal */}
      <ErrorLogModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        errorLogs={errorLogs}
        isLoading={isLoadingLogs}
        onRefresh={fetchErrorLogs}
        onClear={clearErrorLogs}
      />

      {/* Version & Changelog Modal */}
      <VersionChangelogModal
        isOpen={isVersionModalOpen}
        onClose={closeVersionModal}
        features={features}
        onUpdateFeatures={updateFeatures}
        onResetToClassic={resetToClassic}
        onEnableAllFeatures={enableAllFeatures}
      />

      {/* Footer (Extended Status Bar: SQLite, Exchange Rate, Error Logs, & Pricing) */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-xs font-mono text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-stone-100 pb-4">
            {/* Left: Studio Brand, Version Badge & SQLite Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-2 h-2 bg-stone-900 inline-block"></span>
              <span className="font-bold text-stone-900 uppercase">Agentic AI 2D Vector Studio</span>
              
              {/* Interactive Version Tag */}
              <button
                type="button"
                onClick={openVersionModal}
                title="Buka Catatan Riwayat Rilis & Pengaturan Fitur"
                className="flex items-center gap-1 px-1.5 py-0.5 border border-stone-300 bg-stone-50 hover:bg-stone-900 hover:text-white text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3 text-amber-600" />
                <span>v1.3.0</span>
              </button>

              <span>•</span>
              {/* SQLite Active Status Indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 border border-stone-200 bg-stone-50 text-[10px] font-bold text-emerald-800">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>SQLITE ACTIVE (data/prompt_studio.db)</span>
              </div>
            </div>

            {/* Right: Exchange Rate & Error Logs Trigger */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live Exchange Rate Pill (api.co.id) */}
              <div
                title={`Kurs Harian: 1 USD = Rp ${Math.round(usdToIdrRate).toLocaleString('id-ID')} (${rateSource === 'api.co.id' ? 'Live api.co.id' : rateSource === 'cache' ? 'Cache Harian' : 'Default'} - ${exchangeDate || 'Hari Ini'})`}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-stone-200 bg-stone-50 text-[11px] text-stone-700 cursor-help"
              >
                <span className={`w-1.5 h-1.5 inline-block ${rateSource === 'api.co.id' || rateSource === 'cache' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span>1 USD = Rp {Math.round(usdToIdrRate).toLocaleString('id-ID')}</span>
              </div>

              {/* Error Logs Modal Trigger */}
              <button
                onClick={openErrorModal}
                title="Lihat Log Error & Kegagalan Render"
                className={`px-2.5 py-1 border text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  errorLogs.length > 0
                    ? 'bg-red-50 text-red-700 border-red-400 hover:bg-red-100 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-900 hover:text-stone-900'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${errorLogs.length > 0 ? 'text-red-600 animate-pulse' : 'text-stone-400'}`} />
                <span>Log Error</span>
                {errorLogs.length > 0 && (
                  <span className="px-1 py-0.2 bg-red-600 text-white text-[9px] font-bold">
                    {errorLogs.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Footnote */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
            <span>Standar Output: 1:1 Square Microstock (Solid/Isolated Background)</span>
            <div className="flex items-center gap-3">
              <span>DeepSeek v4 Flash ($0.14/$0.56 / 1M)</span>
              <span>•</span>
              <span>GPT Image 2.5 ($0.020 / visual)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
