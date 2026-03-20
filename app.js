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
    const prompt = `Convert this syllabus into a JSON array for a lesson plan. 
    Format: [{week: 1, topic: "", objective: "", synopsis: "", activity: ""}] 
    Syllabus: ${syllabusText}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const cleanJson = result.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
    return JSON.parse(cleanJson);
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