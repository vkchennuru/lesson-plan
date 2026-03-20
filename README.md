# 🎓 Academic Plan Automator

An open-source, client-side web application designed for educators to transform raw syllabus PDFs into structured **Semester Curricular Plans** and **Teaching Plans**. 

This tool is specifically formatted to align with the requirements of the **Commissionerate of Collegiate Education, A.P.**

## 🚀 Features

- **Local PDF Processing:** Uses `pdf.js` to extract text directly in your browser. No files are uploaded to a server, ensuring privacy.
- **AI-Powered Structuring:** Leverages the **Google Gemini API** to intelligently categorize syllabus topics into weeks, objectives, and synopses.
- **Editable Exports:** Generates standard `.docx` files using `docx.js` that can be further edited in Microsoft Word or Google Docs.
- **Zero Cost:** Hosted for free on GitHub Pages with no backend database required.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Tailwind CSS
- **PDF Engine:** [PDF.js](https://mozilla.github.io/pdf.js/)
- **Intelligence:** [Google Gemini Pro API](https://ai.google.dev/)
- **Doc Generation:** [docx.js](https://docx.js.org/)
- **Deployment:** GitHub Pages

## 📂 Project Structure

```text
├── index.html    # Main UI and library imports
├── app.js        # Logic for PDF parsing, AI calling, and DOCX generation
└── README.md     # Documentation
