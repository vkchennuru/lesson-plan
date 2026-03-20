// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function processSyllabus() {
    const file = document.getElementById('pdfUpload').files[0];
    const key = document.getElementById('apiKey').value;
    const status = document.getElementById('status');

    if (!file || !key) return alert("Please provide both an API Key and a PDF file.");

    status.innerText = "Reading PDF...";
    const text = await extractTextFromPDF(file);

    status.innerText = "Consulting Gemini AI...";
    const structuredData = await callGemini(text, key);

    status.innerText = "Generating Word Documents...";
    await createCurricularDoc(structuredData);
    await createTeachingDoc(structuredData);

    status.innerText = "Done! Check your downloads.";
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ");
    }
    return fullText;
}

async function callGemini(syllabusText, key) {
    // 1. Use a more modern model for 2026 (Flash is faster and handles more text)
    const model = "gemini-1.5-flash"; 
    
    const prompt = `Extract the syllabus topics from the following text and return ONLY a JSON array. 
    Format: [{"week": 1, "topic": "Topic Name", "objective": "Goal", "synopsis": "Summary", "activity": "Lab/Quiz"}]
    Syllabus Text: ${syllabusText.substring(0, 30000)}`; // Truncate if extremely long

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                // 2. Add Safety Settings to prevent the "Stuck" state
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ],
                generationConfig: {
                    temperature: 0.1, // Keep it factual/deterministic
                    responseMimeType: "application/json" // Force JSON output
                }
            })
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`API Error: ${errorDetails.error.message}`);
        }

        const result = await response.json();
        const content = result.candidates[0].content.parts[0].text;
        
        return JSON.parse(content);
    } catch (error) {
        console.error("Gemini Error:", error);
        alert("Error: " + error.message);
        document.getElementById('status').innerText = "Failed at AI step.";
        throw error;
    }
}

async function createCurricularDoc(data) {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = docx;

    const rows = data.map(item => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(item.week.toString())] }),
            new TableCell({ children: [new Paragraph(item.topic)] }),
            new TableCell({ children: [new Paragraph(item.activity)] }),
        ],
    }));

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph("Semester Curricular Plan"),
                new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows })
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Curricular_Plan.docx");
}

async function createTeachingDoc(data) {
    // Similar to above, but formatted vertically like your 2nd image
    console.log("Teaching Notes generated logic here...");
}
