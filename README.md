# IPA – Integrated Portable Assistant

**IPA** is an AI system designed for integration into the upcoming **Portable Scientific Device (PSD)** — a fully customizable toolkit for students, engineers, and researchers. While IPA currently runs online, future versions of the PSD will feature it as a **locally installed AI assistant**, operating on a Raspberry Pi with a Linux-based system.

---

## 🔧 Run and Deploy Your AI Studio App

This section contains everything needed to run the app locally during development.

### Prerequisites
- [Node.js](https://nodejs.org)

### Steps to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## ✨ Key Features

- **Math and Engineering Tools**  
  Solve mathematical equations, generate graphs, and design circuit diagrams.

- **Advanced Database Management**  
  - Save articles in Markdown format (.md) with automatic filename generation
  - AI automatically creates and saves articles when generating content
  - Full database browser with search, upload, and download capabilities
  - Article editing, deletion, and full-text search across all content
  - Manual file management through intuitive UI

- **AI-Powered Article Management**  
  - **Create**: "Write an article about [topic]" - AI displays content and auto-saves
  - **Read**: "Read the article about [topic]" or "Show me [filename.md]"
  - **Update**: "Update the article about [topic] with [new info]"
  - **Delete**: "Delete the article [filename.md]"
  - **Search**: "Search for articles about [topic]"
  - **List**: "Show me all articles" or "List database"

- **Automated Web Search**  
  Analyzes images, identifies relevant information, and opens matching web pages using DuckDuckGo.

- **Multilingual Text-to-Speech**  
  Converts text into speech in multiple languages to improve accessibility and support multitasking.

- **Research Assistance**  
  Assists users throughout their research process to increase productivity and streamline workflows.

### Database Access
Click the **"📚 База данных"** button in the header to:
- Browse all saved articles with preview
- Search articles by content
- Upload .md files from your computer  
- Download articles to your device
- Manage and organize your knowledge base

> IPA is powered by the **Gemini API**. In future PSD deployments, it will run completely offline to ensure privacy, reliability, and accessibility in any environment.

---

## 🧰 PSD v1 – Coming Soon

The **Portable Scientific Device (PSD)** is currently in development. It will be a modular, Linux-based toolkit built on Raspberry Pi. Designed for flexibility and customization, PSD will support a wide range of educational and research applications. IPA will be a central component of this system.

---

## 👥 Team – Kimchi-devs

- **Akimjonov Azimjon** – Team Lead / Programmer  
- **Danaev Alisher** – Hardware Engineer  
- **Usmonov Saidazimxon** – Product Designer
