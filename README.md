# 📅 Task Planner

A **React + TypeScript** productivity planner inspired by Google Calendar — built for scheduling, rescheduling, and categorizing tasks in a **month view** with full drag-and-drop and resize support.

## 🚀 Overview

It is a simplified calendar that allows you to:

- Create tasks by dragging across days
- Move tasks to other dates via drag-and-drop
- Adjust task duration by stretching from left/right edges
- Categorize tasks via a modal
- Filter tasks by category and duration

---

## ✨ Features

### 1. **Task Creation (Multi-day Selection)**

- Click and drag across consecutive day tiles to select a date range.
- On release, a modal appears with:
  - Task name input
  - Category dropdown: **To Do, In Progress, Review, Completed**
- Task is shown as a colored bar spanning the selected days.

### 2. **Task Editing**

- **Move**: Drag a task to another day (duration preserved).
- **Resize**:
  - Drag **left edge** → change start date.
  - Drag **right edge** → change end date.
  - Live visual feedback during resizing.

### 3. **Categories**

- Each task belongs to one of four categories:
  - 📝 To Do
  - 🚧 In Progress
  - 🔍 Review
  - ✅ Completed
- Category affects task bar color in the calendar.

### 4. **Filtering Panel**

- **Category filters** (multi-select checkboxes)
- **Time filters** (single-select: 1 week, 2 weeks, 3 weeks)
- Filters are **cumulative** and update the calendar live.

### 5. **UI & Functional Notes**

- Clean, minimal month-view calendar.
- Days labeled correctly (1–31, aligned by weekday).
- Highlight today’s date.
- In-memory state management (with optional local Storage persistence).
- Responsive and mobile-friendly.

---

## 🛠 Tech Stack

- **React + TypeScript**
- **Drag & Drop** → [`@dnd-kit/core`](https://github.com/clauderic/dnd-kit) (or `react-dnd`)
- **Date Utilities** → [`date-fns`](https://date-fns.org/) (or `moment`)
- **Modal** → Custom or library of choice
- **State Management** → React Context / useReducer / Redux (in-memory)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ab007shetty/planner.git && cd planner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📦 Installation from Scratch

If you want to recreate this project from scratch, follow these steps:

### 1. Create Vite Project

```bash
# Create a new Vite project with React template
npm create vite@latest planner -- --template react
cd planner
npm install
```

### 2. Install Tailwind CSS

```bash
# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

# Generate Tailwind config files
npx tailwindcss init -p
```

---

## 🔧 Project Configuration

- Make sure the `"homepage"` field in `package.json` is set as follows (adjust for your repo):

```json
"homepage": "https://<your-github-username>.github.io/planner/"
```

- The `dist/` folder is included in `.gitignore` since it is generated automatically.

---

## 📦 Manual Deployment (Optional)

If you want to deploy manually instead of relying on GitHub Actions, run:

```bash
npm run deploy
```

This builds the app and pushes the `dist/` folder to the `gh-pages` branch on GitHub.

---

## 📂 GitHub Actions Automatic Deployment

- The workflow file `.github/workflows/deploy.yml` is already included in this repo.
- On every push to the `main` branch, GitHub Actions:
  - Installs dependencies
  - Runs the build script
  - Deploys the site to GitHub Pages by pushing the `dist/` folder to the `gh-pages` branch
- This means **no manual deploy commands needed** after setup—just push your code!

---

## 🛠 GitHub Pages Settings

Make sure GitHub Pages is configured correctly in your repo:

1. Go to **Settings > Pages**.
2. Set **Source** to:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Save changes.

Your site will then be live at:
`https://<your-github-username>.github.io/<repo-name>/`

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
