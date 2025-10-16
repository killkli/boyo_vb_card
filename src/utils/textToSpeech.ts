/**
 * Speak text using Web Speech API
 */
export function speakText(text: string, lang: string = 'en-US'): void {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser');
  }
}

/**
 * Check if text-to-speech is supported
 */
export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
