import { HashMap, LinkedList } from "./datastructures";

export const calculateSynonymSimilarity = async (text1, text2, synonymFile) => {
    // Ensure the synonym map (graph structure) is loaded
    if (SynonymFinder.synonymGraph.size === 0) {
        await SynonymFinder.loadSynonyms(synonymFile);
    }

    const words1 = new Set(Tokenize(text1));
    const words2 = new Set(Tokenize(text2));

    let synonymMatches = 0;
    words1.forEach(word1 => {
        if (words2.has(word1) || hasSynonymInSet(word1, words2)) {
            synonymMatches++;
        }
    });

    const totalWords = words1.size;
    return totalWords > 0 ? synonymMatches / totalWords : 0;
};

const hasSynonymInSet = (word, wordSet) => {
    const synonyms = SynonymFinder.getSynonyms(word);
    return [...synonyms].some(synonym => wordSet.has(synonym));
};

const Tokenize = text => text.toLowerCase().split(/\W+/).filter(Boolean);

class SynonymFinder {
    // Graph structure for synonyms (word -> set of related words)
    static synonymGraph = new Map();

    static async loadSynonyms(fileName) {
        try {
            const response = await fetch(fileName);
            const text = await response.text();
            const lines = text.split("\n");

            lines.forEach(line => {
                const parts = line.split("|||");
                if (parts.length >= 6) {
                    const source = parts[1].trim();
                    const target = parts[2].trim();
                    const entailment = parts[5].trim();

                    // Only include synonyms with "Equivalence" entailment
                    if (entailment === "Equivalence" && this.isAlpha(source) && this.isAlpha(target)) {
                        if (!this.synonymGraph.has(source)) this.synonymGraph.set(source, new Set());
                        if (!this.synonymGraph.has(target)) this.synonymGraph.set(target, new Set());

                        this.synonymGraph.get(source).add(target);
                        this.synonymGraph.get(target).add(source);
                    }
                }
            });

            console.log("Synonym graph loaded successfully.");
        } catch (error) {
            console.error("Error loading synonym file:", error);
        }
    }

    static getSynonyms(word) {
        if (!word) return new Set();
        const synonyms = this.synonymGraph.get(word.toLowerCase()) || new Set();
        return new Set([...synonyms].filter(this.isAlpha));
    }

    static isAlpha(str) {
        return str && /^[a-zA-Z]+$/.test(str);
    }
}

const stopWords = new Set([
    'the', 'a', 'an', 'in', 'of', 'on', 'at', 'to', 'and', 'but', 'or', 'is', 
    'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had', 'that', 'this', 
    'it', 'for', 'with', 'as', 'by', 'from', 'about', 'into', 'over', 'under', 
    'than', 'then', 'also', 'if', 'no', 'not', 'only', 'so', 'too', 'very', 'such'
]);

// Add lowercase letters
for (let i = 97; i <= 122; i++) {
    stopWords.add(String.fromCharCode(i));
}

// Add uppercase letters
for (let i = 65; i <= 90; i++) {
    stopWords.add(String.fromCharCode(i));
}

// Add digits
for (let i = 0; i <= 9; i++) {
    stopWords.add(i.toString());
}

// Updated function to find top matched words
export const findTopMatchedWords = (text1, text2, synonymFile) => {
    return new Promise(async (resolve) => {
        if (SynonymFinder.synonymGraph.size === 0) {
            await SynonymFinder.loadSynonyms(synonymFile);
        }

        const words1 = Tokenize(text1).filter(word => !stopWords.has(word));
        const words2 = Tokenize(text2).filter(word => !stopWords.has(word));
        const wordMatches = new Map();

        words1.forEach(word1 => {
            if (words2.includes(word1)) {
                wordMatches.set(word1, (wordMatches.get(word1) || 0) + 1);
            } else {
                const synonyms = SynonymFinder.getSynonyms(word1);
                synonyms.forEach(synonym => {
                    if (words2.includes(synonym)) {
                        wordMatches.set(word1, (wordMatches.get(word1) || 0) + 1);
                    }
                });
            }
        });

        // Use LinkedList to manage sorted matches
        const sortedMatches = [...wordMatches.entries()]
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10)
            .map(([word, count]) => ({
                word,
                percentage: ((count / words1.length) * 100).toFixed(2)
            }));

        const resultList = new LinkedList();
        sortedMatches.forEach(match => resultList.append(match));

        resolve(resultList.toArray());
    });
};



export const calculateTFIDF = (texts) => {
    const termFrequency = new HashMap();
    const documentFrequency = new HashMap();
    const tfidf = new HashMap();
    const totalDocuments = texts.length;

    // Tokenize and calculate term frequency
    texts.forEach((text, idx) => {
        const words = text.toLowerCase().split(/\W+/).filter(Boolean);
        const docTermFreq = new HashMap();

        words.forEach(word => {
            docTermFreq.set(word, (docTermFreq.get(word) || 0) + 1);
        });
        termFrequency.set(idx, docTermFreq);

        // Track document frequency
        const uniqueWords = new Set(words);
        uniqueWords.forEach(word => {
            documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
        });
    });

    // Calculate TF-IDF
    termFrequency.entries().forEach(([docIdx, docTermFreq]) => {
        const tfidfValues = new HashMap();
        docTermFreq.entries().forEach(([word, freq]) => {
            const tf = freq / Array.from(docTermFreq.values()).reduce((a, b) => a + b, 0);
            const idf = Math.log(totalDocuments / (documentFrequency.get(word) || 1));
            tfidfValues.set(word, tf * idf);
        });
        tfidf.set(docIdx, tfidfValues);
    });

    return tfidf;
};


export const sortTFIDF = (tfidf) => {
    const sortedResults = new LinkedList();

    tfidf.entries().forEach(([docIdx, docTFIDF]) => {
        const sorted = Array.from(docTFIDF.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); // Get top 10 terms
        sorted.forEach(([term, value]) => {
            sortedResults.append({ document: docIdx, term, value });
        });
    });

    return sortedResults.toArray();
};



