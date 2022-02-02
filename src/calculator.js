export function range(n) {
    return Array.from({ length: n }, (_, i) => i);
}

class LetterInfo {
    constructor() {
        this.min_count = 0;
        this.max_count = 5;
        this.correct = [];
        this.present = [];
    }
}

export function doCalculate(word_grid, state_grid, dictionary) {
    const knowledge = {};

    // Step through full words in the grid adding constraints for each letter
    for (let i = 0; i < word_grid.length; i++) {
        const word = word_grid[i].join('');
        if (!word || word.length !== 5) continue;

        // Analyse this word, improving our knowledge
        analyseWord(knowledge, word, state_grid[i]);
    }

    // Step through all possible words looking for ones that match our knowledge
    const foundWords = dictionary.filter(word => isWordValid(word, knowledge));

    return foundWords;
}

function analyseWord(knowledge, word, states) {
    word = word.toLowerCase();
    const foundLetters = {};

    for (let i=0; i<5; i++) {
        const char = word[i];
        const state = states[i];

        // Keep track of how many times 'present' letters appear in this word
        if (state == 'present') {
            foundLetters[char] = (foundLetters[char] || 0) + 1;
        }

        // Ensure we have an info object for this letter
        if (!(char in knowledge)) {
            knowledge[char] = new LetterInfo();
        }

        const info = knowledge[char];

        if (state === 'absent') {
            // Incorrect: limit the count of this letter
            info.max_count = Math.min(info.max_count, foundLetters[char]-1);
        } else if (state === 'correct') {
            // Correct: add this position to the 'correct' options
            info.correct.push(i);
            info.min_count = Math.max(info.min_count, foundLetters[char]);
        } else if (state === 'present') {
            // Present: add this position to the 'present' options
            info.present.push(i);
            info.min_count = Math.max(info.min_count, foundLetters[char]);
        }
    }
}

function isWordValid(word, knowledge) {
    const letterCounts = {};
    for (const char of word) {
        letterCounts[char] = (letterCounts[char] || 0) + 1;
    }

    // Step through all of our constraints looking for reasons to deny this match
    for (const [char, info] of Object.entries(knowledge)) {
        // Are there between min_count and max_count of this letter?
        if (letterCounts[char] < info.min_count || letterCounts[char] > info.max_count) {
            return false;
        }

        // Anything in a misplaced position is a failure
        for (const pos of info.present) {
            if (word[pos] === char ) {
                return false;
            }
        }
        // ...but present letters must also be in the word
        if (info.present.length !== 0 && !word.includes(char)) {
            return false;
        }

        // Any positions in present must be this character
        for (const pos of info.correct) {
            if (word[pos] !== char) {
                return false;
            }
        }
    }

    return true;
}

export function printKnowledge(knowledge) {
    for (const [char, info] of Object.entries(knowledge)) {
        console.log(`${char}: ${info.min_count}-${info.max_count} good=${info.correct.join(',')} present=${info.present.join(',')}`);
    }
}
