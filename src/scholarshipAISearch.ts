import { GoogleGenAI, Type } from "@google/genai";

export interface Scholarship {
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  applyUrl: string;
}

export interface SearchCriteria {
  course: string;
  category: string;
  income: string;
  cgpa: string;
  source: string;
}

export async function searchScholarships(criteria: SearchCriteria): Promise<Scholarship[]> {
  const { course, category, income, cgpa, source } = criteria;
  
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  let sourceInstruction = "";
  if (source === "State Government") {
    sourceInstruction = "Return ONLY real Karnataka State Scholarship Portal (SSP) scholarships (site: ssp.karnataka.gov.in).";
  } else if (source === "Central Government") {
    sourceInstruction = "Return ONLY real scholarships from the National Scholarship Portal (NSP) (site: scholarships.gov.in).";
  } else if (source === "Private Trust") {
    sourceInstruction = "Return ONLY real private scholarships available in India (e.g., from Buddy4Study, TATA Trust, HDFC, etc.).";
  } else {
    sourceInstruction = "Return a mix of real State (SSP), Central (NSP), and Private scholarships available in India.";
  }

  const prompt = `Generate a list of real and active scholarships for a student with the following profile:
- Course: ${course}
- Category: ${category}
- Annual Income: ${income}
- CGPA/Percentage: ${cgpa}
- Source Preference: ${source}

${sourceInstruction}

Requirements:
1. Provide real scholarship names.
2. Provide accurate and valid application links.
3. Provide a short, clear description of the scholarship and its eligibility.
4. Return the data in the following JSON format:
[
  {
    "name": "Scholarship Name",
    "link": "https://example.com/apply",
    "description": "Short description of the scholarship and eligibility."
  }
]`;

  try {
    console.log("Generating scholarships with Gemini for criteria:", criteria);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              link: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "link", "description"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    console.log("GEMINI RESULTS:", results);

    // Mapping to Scholarship interface
    const finalResults: Scholarship[] = results.map((item: any) => ({
      title: item.name,
      provider: source === "All" ? (item.link?.split('/')[2] || "Scholarship Portal") : source,
      amount: "Check Website",
      deadline: "Check Website",
      eligibility: item.description || "No description available",
      applyUrl: item.link,
    }));

    console.log("FINAL MAPPED RESULTS:", finalResults);
    return finalResults;
  } catch (error) {
    console.error("Error generating scholarships with Gemini:", error);
    return [];
  }
}
