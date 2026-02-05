import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";

export default function DashboardPage() {
    return (
        <div className="flex h-screen flex-col bg-[#0f0f0f]">

            {/* Top Navigation */}
            <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">
                <div className="text-sm font-semibold tracking-tight">
                    Weavy Clone
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1f1f1f]" />
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">

                <aside className="w-64 border-r border-[#1f1f1f] bg-[#121212]">
                    <Sidebar />
                </aside>
                <main className="flex-1 flex flex-col bg-[#0f0f0f]">

                    {/* Canvas Header */}
                    <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-6">
                        <div className="text-sm font-medium text-gray-400">
                            Untitled Workflow
                        </div>

                        <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-sm font-medium px-4 py-2 rounded-md transition-colors">
                            Run
                        </button>
                    </div>

                    {/* Canvas Body */}
                    <div className="flex-1 relative">
                        <WorkflowCanvas />
                    </div>

                </main>

                <aside className="w-[300px] border-l border-[#1f1f1f] bg-[#121212]" />

            </div>
        </div>
    );
}
