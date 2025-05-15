
document.getElementById('input-text').addEventListener('input', function() {
    const text = this.value;
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    this.parentElement.querySelector('.word-count').textContent = `${wordCount} words`;
});

// Copy button functionality
document.getElementById('copy-btn').addEventListener('click', () => {
    const outputText = document.getElementById('output-text').textContent;
    navigator.clipboard.writeText(outputText)
        .then(() => {
            const copyBtn = document.getElementById('copy-btn');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 2000);
        });
});

// Paste button functionality
document.getElementById('paste-btn').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('input-text').value = text;
        // Trigger input event to update word count
        document.getElementById('input-text').dispatchEvent(new Event('input'));
    } catch (err) {
        console.error('Failed to paste:', err);
    }
});

// AI detection score calculation
function calculateAIScore(text) {
    if (!text) return 0;

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);

    // Check for repetitive patterns
    const repetitionScore = new Set(words).size / words.length;
    score += (1 - repetitionScore) * 30;

    // Check for mechanical transitions
    const transitions = text.match(/however|therefore|thus|consequently|furthermore/gi) || [];
    score += Math.min((transitions.length / words.length) * 100, 20);

    // Check for uniform sentence lengths
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
    const uniformity = sentences.reduce((sum, s) => {
        const len = s.trim().split(/\s+/).length;
        return sum + Math.abs(len - avgLength);
    }, 0) / sentences.length;
    score += (1 - Math.min(uniformity / 5, 1)) * 25;

    // Check for natural language markers
    const naturalMarkers = text.match(/um|uh|well|like|you know|i mean/gi) || [];
    score -= Math.min((naturalMarkers.length / words.length) * 100, 25);

    return Math.max(0, Math.min(Math.round(score), 100));
}

document.getElementById('humanize-btn').addEventListener('click', async () => {
    const button = document.getElementById('humanize-btn');
    const inputText = document.getElementById('input-text').value;

    if (!inputText.trim()) return;

    button.setAttribute('data-loading', 'true');
    button.textContent = 'Processing...';

    try {
        const response = await fetch('/humanize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: inputText })
        });

        const data = await response.json();

        const outputText = document.getElementById('output-text');
        outputText.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 800)); // Minimum loading time

        setTimeout(() => {
            outputText.innerHTML = data.humanized_text.split('\n').map(line => 
                line.trim() ? line : '<br>'
            ).join('\n');
            outputText.style.opacity = '1';
            document.getElementById('humanized-count').textContent = `${data.humanized_words} words`;
            const aiScore = calculateAIScore(data.humanized_text);
            const scoreLabel = document.getElementById('score-label');
            const scoreValue = document.getElementById('ai-score');
            const meterFill = document.getElementById('meter-fill');

            meterFill.style.width = `${aiScore}%`;
            scoreValue.textContent = aiScore <= 15 ? '0%' : `${aiScore}%`;

            if (aiScore <= 15) {
                scoreLabel.textContent = 'Your Text is Human written';
                scoreLabel.style.color = '#4CAF50';
                scoreValue.style.color = '#4CAF50';
            } else {
                scoreLabel.textContent = 'Your Text is AI/GPT Generated';
                scoreLabel.style.color = aiScore > 60 ? '#FF5722' : '#FFC107';
                scoreValue.style.color = aiScore > 60 ? '#FF5722' : '#FFC107';
            }
        }, 200);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        button.setAttribute('data-loading', 'false');
        button.textContent = 'Humanize';
    }
});
