import axios from 'axios';

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const LANGUAGE_MAP = {
  javascript: 63,  // JavaScript Node.js
  python: 71,      // Python 3
  java: 62,        // Java
  cpp: 54,         // C++
};

export const getJudge0LanguageId = (language) => {
  return LANGUAGE_MAP[language.toLowerCase()];
};

export const submitBatch = async (submissions) => {
  try {
    const response = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
      submissions,
    }, {
      headers: {
        'Content-Type': 'application/json',
        
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting batch:', error);
    throw error;
  }
};

export const pollBatchResults = async (tokens, maxAttempts = 10) => {
  const results = [];
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(
        `${process.env.JUDGE0_API_URL}/submissions/batch`, {
             params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            },
        }
        
      );

      const submissions = response.data.submissions;
      const allFinished = submissions.every(
        (sub) => sub.status.id >= 3
      );

      if (allFinished) {
        return submissions;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    } catch (error) {
      console.error('Error polling results:', error);
      throw error;
    }
  }

  throw new Error('Timeout waiting for judge results');
};

export function getLanguageName(languageId){
    const LANGUAGE_NAMES = {
        74: "TypeScript",
        63: "JavaScript",
        71: "Python",
        62: "Java",
    }

    return LANGUAGE_NAMES[languageId] || "Unknown"
}