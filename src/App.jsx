import React, { useState } from 'react';

// DeepL supported languages with their codes and speech synthesis language codes
// Ordered: English first, then Spanish, Chinese, German, Russian, then others alphabetically
const availableLanguages = [
  { code: "EN", sourceCode: "EN", name: "English", flag: "🇬🇧", color: "#1e40af", speechCode: "en-GB" },
  { code: "EN-US", sourceCode: "EN", name: "English (US)", flag: "🇺🇸", color: "#1e40af", speechCode: "en-US" },
  { code: "ES", sourceCode: "ES", name: "Spanish", flag: "🇪🇸", color: "#dc2626", speechCode: "es-ES" },
  { code: "ZH-HANS", sourceCode: "ZH", name: "Chinese (Simplified)", flag: "🇨🇳", color: "#ea580c", speechCode: "zh-CN" },
  { code: "DE", sourceCode: "DE", name: "German", flag: "🇩🇪", color: "#1d4ed8", speechCode: "de-DE" },
  { code: "RU", sourceCode: "RU", name: "Russian", flag: "🇷🇺", color: "#16a34a", speechCode: "ru-RU" },
  { code: "AR", sourceCode: "AR", name: "Arabic", flag: "🇸🇦", color: "#15803d", speechCode: "ar-SA" },
  { code: "CS", sourceCode: "CS", name: "Czech", flag: "🇨🇿", color: "#1e40af", speechCode: "cs-CZ" },
  { code: "DA", sourceCode: "DA", name: "Danish", flag: "🇩🇰", color: "#dc2626", speechCode: "da-DK" },
  { code: "NL", sourceCode: "NL", name: "Dutch", flag: "🇳🇱", color: "#f97316", speechCode: "nl-NL" },
  { code: "FI", sourceCode: "FI", name: "Finnish", flag: "🇫🇮", color: "#1d4ed8", speechCode: "fi-FI" },
  { code: "FR", sourceCode: "FR", name: "French", flag: "🇫🇷", color: "#7c3aed", speechCode: "fr-FR" },
  { code: "EL", sourceCode: "EL", name: "Greek", flag: "🇬🇷", color: "#1e40af", speechCode: "el-GR" },
  { code: "HU", sourceCode: "HU", name: "Hungarian", flag: "🇭🇺", color: "#16a34a", speechCode: "hu-HU" },
  { code: "ID", sourceCode: "ID", name: "Indonesian", flag: "🇮🇩", color: "#dc2626", speechCode: "id-ID" },
  { code: "IT", sourceCode: "IT", name: "Italian", flag: "🇮🇹", color: "#059669", speechCode: "it-IT" },
  { code: "JA", sourceCode: "JA", name: "Japanese", flag: "🇯🇵", color: "#e11d48", speechCode: "ja-JP" },
  { code: "KO", sourceCode: "KO", name: "Korean", flag: "🇰🇷", color: "#4f46e5", speechCode: "ko-KR" },
  { code: "NB", sourceCode: "NB", name: "Norwegian", flag: "🇳🇴", color: "#dc2626", speechCode: "nb-NO" },
  { code: "PL", sourceCode: "PL", name: "Polish", flag: "🇵🇱", color: "#dc2626", speechCode: "pl-PL" },
  { code: "PT-PT", sourceCode: "PT", name: "Portuguese", flag: "🇵🇹", color: "#0891b2", speechCode: "pt-PT" },
  { code: "PT-BR", sourceCode: "PT", name: "Portuguese (Brazil)", flag: "🇧🇷", color: "#15803d", speechCode: "pt-BR" },
  { code: "RO", sourceCode: "RO", name: "Romanian", flag: "🇷🇴", color: "#1d4ed8", speechCode: "ro-RO" },
  { code: "SV", sourceCode: "SV", name: "Swedish", flag: "🇸🇪", color: "#0284c7", speechCode: "sv-SE" },
  { code: "TR", sourceCode: "TR", name: "Turkish", flag: "🇹🇷", color: "#b91c1c", speechCode: "tr-TR" },
  { code: "UK", sourceCode: "UK", name: "Ukrainian", flag: "🇺🇦", color: "#0284c7", speechCode: "uk-UA" },
];

export default function MultiTranslator() {
  const [input, setInput] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState(() => localStorage.getItem('source_language') || "EN");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('deepl_api_key') || "");
  const [showApiKeyInput, setShowApiKeyInput] = useState(() => !localStorage.getItem('deepl_api_key'));
  const [selectedLanguages, setSelectedLanguages] = useState(() => {
    const saved = localStorage.getItem('selected_languages');
    return saved ? JSON.parse(saved) : ["ES", "DE", "RU"];
  });
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('translation_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showLanguageManager, setShowLanguageManager] = useState(false);
  const [speakingLang, setSpeakingLang] = useState(null);

  const getLanguageInfo = (code) => availableLanguages.find(l => l.code === code);

  const speak = (text, langCode) => {
    const lang = getLanguageInfo(langCode);
    if (!lang?.speechCode || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang.speechCode;
    utterance.rate = 0.9; // Slightly slower for learning

    utterance.onstart = () => setSpeakingLang(langCode);
    utterance.onend = () => setSpeakingLang(null);
    utterance.onerror = () => setSpeakingLang(null);

    window.speechSynthesis.speak(utterance);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem('deepl_api_key', key);
    }
  };

  const saveSourceLanguage = (code) => {
    setSourceLanguage(code);
    localStorage.setItem('source_language', code);
  };

  const saveSelectedLanguages = (langs) => {
    setSelectedLanguages(langs);
    localStorage.setItem('selected_languages', JSON.stringify(langs));
  };

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('translation_history', JSON.stringify(newHistory));
  };

  const translateWithDeepL = async (text, targetLang) => {
    const sourceLang = getLanguageInfo(sourceLanguage);
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: apiKey,
        text: text,
        sourceLang: sourceLang?.sourceCode || "EN",
        targetLang: targetLang,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 403) {
        throw new Error("Invalid API key. Please check your DeepL API key.");
      } else if (response.status === 456) {
        throw new Error("Quota exceeded. You've reached your DeepL character limit.");
      }
      throw new Error(errorData.message || `DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  };

  const handleTranslate = async () => {
    const query = input.trim();
    if (!query || selectedLanguages.length === 0) return;
    
    if (!apiKey.trim()) {
      setError("Please enter your DeepL API key first.");
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslations({});

    try {
      // Filter out source language and translate to remaining languages
      const targetLanguages = selectedLanguages.filter(code => code !== sourceLanguage);
      
      if (targetLanguages.length === 0) {
        setError("Please select at least one target language different from the source language.");
        setIsLoading(false);
        return;
      }

      // Translate to all selected languages in parallel
      const translationPromises = targetLanguages.map(async (langCode) => {
        const translation = await translateWithDeepL(query, langCode);
        return { langCode, translation };
      });

      const results = await Promise.all(translationPromises);
      
      const newTranslations = {};
      results.forEach(({ langCode, translation }) => {
        newTranslations[langCode] = translation;
      });

      setTranslations(newTranslations);
      setShowApiKeyInput(false);
      
      const historyItem = { query, translations: newTranslations, languages: [...selectedLanguages], sourceLanguage };
      const newHistory = [historyItem, ...history.filter(h => h.query.toLowerCase() !== query.toLowerCase())].slice(0, 15);
      saveHistory(newHistory);
      
    } catch (err) {
      console.error("Translation error:", err);
      setError(err.message || "Failed to translate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const addLanguage = (code) => {
    if (!selectedLanguages.includes(code)) {
      saveSelectedLanguages([...selectedLanguages, code]);
    }
  };

  const removeLanguage = (code) => {
    saveSelectedLanguages(selectedLanguages.filter(c => c !== code));
  };

  const selectFromHistory = (item) => {
    setInput(item.query);
    setTranslations(item.translations);
    saveSelectedLanguages(item.languages);
    if (item.sourceLanguage) {
      saveSourceLanguage(item.sourceLanguage);
    }
  };

  const commonPhrases = ["Hello", "Thank you", "How are you?", "Goodbye", "I love you", "Where is the bathroom?"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Multi-Language Translator</h1>
          <p className="text-slate-600">Translate to multiple languages at once — powered by DeepL</p>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">🔑 DeepL API Key Required</h3>
            <p className="text-blue-700 text-sm mb-3">
              Get your free API key at{" "}
              <a 
                href="https://www.deepl.com/pro-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                deepl.com/pro-api
              </a>
              {" "}(500,000 chars/month free)
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="Enter your DeepL API key..."
                className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => apiKey.trim() && setShowApiKeyInput(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* API Key Toggle (when hidden) */}
        {!showApiKeyInput && apiKey && (
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              🔑 Change API Key
            </button>
          </div>
        )}

        {/* Source Language Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-slate-700">Translate from:</h3>
            <div className="relative flex-1 max-w-xs">
              <select
                value={sourceLanguage}
                onChange={(e) => saveSourceLanguage(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-slate-700 font-medium cursor-pointer"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Language Manager */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Translate to: ({selectedLanguages.filter(code => code !== sourceLanguage).length} languages)</h3>
            <button
              onClick={() => setShowLanguageManager(!showLanguageManager)}
              className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
            >
              {showLanguageManager ? "Done" : "+ Add / Remove"}
            </button>
          </div>

          {/* Selected Languages */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLanguages.filter(code => code !== sourceLanguage).length === 0 ? (
              <p className="text-slate-500 text-sm">No languages selected. Add some languages to get started!</p>
            ) : (
              selectedLanguages.filter(code => code !== sourceLanguage).map(code => {
                const lang = getLanguageInfo(code);
                return (
                  <div
                    key={code}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg"
                  >
                    <span>{lang?.flag}</span>
                    <span className="text-sm font-medium text-slate-700">{lang?.name}</span>
                    <button
                      onClick={() => removeLanguage(code)}
                      className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Language Selector */}
          {showLanguageManager && (
            <div className="border-t pt-4">
              <p className="text-sm text-slate-600 mb-3">Click to add a language:</p>
              <div className="flex flex-wrap gap-2">
                {availableLanguages
                  .filter(lang => !selectedLanguages.includes(lang.code) && lang.code !== sourceLanguage)
                  .map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => addLanguage(lang.code)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm text-slate-700">{lang.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Translation Input */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter ${getLanguageInfo(sourceLanguage)?.name || 'source'} text to translate...`}
              className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleTranslate}
              disabled={isLoading || selectedLanguages.length === 0 || !apiKey.trim()}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500 py-1">Try:</span>
            {commonPhrases.map(phrase => (
              <button
                key={phrase}
                onClick={() => setInput(phrase)}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Translation Results */}
        {Object.keys(translations).length > 0 && !isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <span>{getLanguageInfo(sourceLanguage)?.flag}</span>
                <span>{getLanguageInfo(sourceLanguage)?.name}:</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">"{input}"</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedLanguages.filter(code => code !== sourceLanguage).map(code => {
                const lang = getLanguageInfo(code);
                const translation = translations[code];
                if (!translation) return null;
                
                return (
                  <div
                    key={code}
                    className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: lang?.color }} />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang?.flag}</span>
                        <span className="font-semibold text-slate-700">{lang?.name}</span>
                      </div>
                      <button
                        onClick={() => speak(translation, code)}
                        className={`p-2 rounded-full transition-colors ${
                          speakingLang === code 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                        }`}
                        title="Listen to pronunciation"
                      >
                        {speakingLang === code ? (
                          <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xl font-medium text-slate-900 break-words">
                      {translation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Recent Translations</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => selectFromHistory(item)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-slate-400 text-sm mt-6">
          Powered by DeepL API • High-quality neural machine translation
        </p>
      </div>
    </div>
  );
}
