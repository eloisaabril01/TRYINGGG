
document.getElementById('detect-text').addEventListener('input', function() {
    const wordCount = this.value.trim().split(/\s+/).filter(word => word.length > 0).length;
    this.parentElement.querySelector('.word-count').textContent = `${wordCount} words`;
});

document.getElementById('detect-btn').addEventListener('click', async () => {
    const text = document.getElementById('detect-text').value;
    if (!text.trim()) return;

    const resultCard = document.getElementById('result-card');
    resultCard.style.display = 'block';

    const score = calculateAIScore(text);
    const meterFill = document.getElementById('detect-meter');
    const scoreLabel = document.getElementById('detect-label');
    const scoreValue = document.getElementById('detect-score');
    const details = document.getElementById('detection-details');

    meterFill.style.width = `${score}%`;
    scoreValue.textContent = `${score}%`;

    if (score <= 15) {
        scoreLabel.textContent = 'Human Written Content';
        scoreLabel.className = 'score-label human';
        details.textContent = 'This text appears to be written by a human. It shows natural language patterns and variations.';
    } else if (score <= 60) {
        scoreLabel.textContent = 'Potentially AI-Generated';
        scoreLabel.className = 'score-label mixed';
        details.textContent = 'This text shows some patterns typical of AI-generated content, but also has human-like elements.';
    } else {
        scoreLabel.textContent = 'AI-Generated Content';
        scoreLabel.className = 'score-label ai';
        details.textContent = 'This text strongly exhibits patterns consistent with AI-generated content.';
    }
});

function calculateAIScore(text) {
    if (!text) return 0;
    let score = 0;

    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length < 2) return 0;

    // 1. Vocabulary sophistication (40%)
    const uniqueWords = new Set(words);
    const vocabularyDiversity = uniqueWords.size / words.length;
    score += (1 - vocabularyDiversity) * 40;

    // 2. Sentence structure consistency (25%)
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b) / lengths.length;
    const lengthVariance = lengths.reduce((sum, len) => 
        sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    score += Math.max(0, 25 - (Math.sqrt(lengthVariance) * 5));

    // 3. Formal language patterns (20%)
    const formalPatterns = /\b(furthermore|moreover|however|therefore|thus|consequently|additionally|subsequently|accordingly|hence|wherein|whereby|thereby|nevertheless)\b/gi;
    const formalCount = (text.match(formalPatterns) || []).length;
    score += Math.min((formalCount / sentences.length) * 40, 20);

    // 4. Perfect structures and repetitions (15%)
    const perfectStructures = text.match(/\b(not only.*but also|both.*and|either.*or|neither.*nor|if.*then)\b/gi) || [];
    const repeatedPhrases = text.match(/\b(\w+\s+\w+\s+\w+)\b.*\b\1\b/gi) || [];
    score += Math.min(((perfectStructures.length * 3 + repeatedPhrases.length * 2) / sentences.length) * 30, 15);

    // 5. Reduce score for human markers
    const humanMarkers = /\b(like|sort of|kind of|you know|i mean|i guess|maybe|probably|um|uh|well|basically|stuff|thing|dunno|gonna|wanna)\b/gi;
    const humanCount = (text.match(humanMarkers) || []).length;
    score = Math.max(0, score - (humanCount * 8));

    // 6. Contextual coherence check
    const coherencePatterns = sentences.filter(s => 
        /\b(this|that|these|those|it|they)\b.*\b(means|suggests|indicates|shows|proves|demonstrates|implies)\b/i.test(s)
    ).length;
    score += Math.min((coherencePatterns / sentences.length) * 20, 15);

    return Math.min(Math.round(score), 100);
}
