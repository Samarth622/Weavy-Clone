# 🚀 Weavy Clone – AI Workflow Builder

A full-stack AI Workflow Builder inspired by Weavy.  
Create, connect, and execute visual AI pipelines with support for:

- 🧠 LLM processing
- 🖼 Image cropping
- 🎬 Video frame extraction
- 📊 Workflow run history
- 🔐 Authentication
- ⚡ Real-time node execution status

Built using modern production-grade technologies.

---

## ✨ Features

### 🧩 Visual Workflow Builder
- Drag-and-drop nodes
- Connect nodes visually
- Directed Acyclic Graph (DAG) validation
- Real-time execution state (idle → running → success/error)

### 🤖 AI & Media Processing
- LLM Node (text + image support)
- Image Crop Node
- Video Frame Extraction Node (FFmpeg powered via Trigger.dev)

### 🔄 Workflow Engine
- Server-side execution
- Node-by-node execution tracking
- Topological sorting
- Background run processing
- Live polling updates

### 📜 Execution History
- Per-workflow run history
- Node-level output replay
- Status tracking

### 🔐 Authentication
- Clerk-based authentication
- User-specific workflows
- Protected API routes

### 💾 Database
- Supabase PostgreSQL
- Prisma ORM (v7)
- WorkflowRun & NodeRun tracking

### 🧠 State Management
- Zustand (global workflow state)
- Zod (input validation)

### 🌍 Deployment Ready
- Fully compatible with Vercel
- Prisma Accelerate supported
- Serverless-safe architecture

---

## 🏗 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 14 (App Router) |
| UI | React + TailwindCSS |
| Graph Engine | React Flow |
| Backend | Next.js API Routes |
| Auth | Clerk |
| Database | Supabase PostgreSQL |
| ORM | Prisma v7 |
| Background Tasks | Trigger.dev |
| Media Processing | FFmpeg |
| Media Saving | Transloadit |
| State Management | Zustand |
| Validation | Zod |
| Deployment | Vercel |

---

## 🧠 How It Works

1. User builds workflow visually
2. Workflow auto-saves
3. On Run:
   - WorkflowRun created
   - Nodes execute in DAG order
   - NodeRun created for each node
   - Status updated in real-time
4. UI polls run-status API
5. Node borders update live
6. Outputs stored in database
7. History available for replay

---

## 📦 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/weavy-clone.git
cd weavy-clone
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create .env:

```makefile
GOOGLE_API_KEY=

TRIGGER_SECRET_KEY=

NODE_ENV=development

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/sign-in

NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID=
NEXT_PUBLIC_TRANSLOADIT_KEY=
TRANSLOADIT_SECRET=
DATABASE_URL=
```

### 4️⃣ Generate Prisma Client

```bash
npx prisma generate
```

### 5️⃣ Run Development Server

```bash
npm run dev
```
### (Optional) Trigger.dev run
It is optional because if you use development api then

```bash
npx trigger.dev dev
```

## 📂 Project Structure

```arduino
app/
 ├── dashboard/
 ├── api/
 ├── run-workflow/
 ├── run-status/
components/
trigger/
prisma/
lib/
store/ (Zustand)
```

## 🎯 Assignment Requirements Covered

✔ Visual Workflow Builder
✔ Node-based execution
✔ DAG validation
✔ AI integration
✔ Image + Video processing
✔ Auth system
✔ Database storage
✔ Run history
✔ Real-time UI updates
✔ Production deployment

## 🛠 Future Improvements

• Auto Save on change
• Workflow templates
• Drag-and-drop sidebar
• Execution logs panel
• Multi-user collaboration
• Performance optimization
• Better mobile UI

## 👨‍💻 Author

Built with ❤️ by Samarth Gupta
