'use server'
import { updateTaskStatus, deleteTask, createTask } from "@/app/actions";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Task } from "@prisma/client";

const NEXT_STATUS_MAP: Record<string, string | null> = {
    'TODO': 'IN_PROGRESS',
    'IN_PROGRESS': 'DONE',
    'DONE': null
};

const BUTTON_TEXT_MAP: Record<string, string> = {
    'TODO': 'Начать ->',
    'IN_PROGRESS': 'Завершить',
    'DONE': ''
};

const BUTTON_COLOR_MAP: Record<string, string> = {
    'TODO': 'bg-blue-500 hover:bg-blue-600',
    'IN_PROGRESS': 'bg-green-500 hover:bg-green-600',
    'DONE': ''
};


export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const board = await db.board.findUnique({
        where: { id },
        include: { tasks: true }
    });

    if (!board) notFound();

    const todoTasks = board.tasks.filter(t => t.status === 'TODO');
    const inProgressTasks = board.tasks.filter(t => t.status === 'IN_PROGRESS');
    const doneTasks = board.tasks.filter(t => t.status === 'DONE');

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                    Доска: <span className="text-blue-600">{board.title}</span>
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Column title="К исполнению" tasks={todoTasks} boardId={id} isNewTaskInput={true}/>
                    <Column title="В процессе" tasks={inProgressTasks} boardId={id} />
                    <Column title="Готово" tasks={doneTasks} boardId={id} />
                </div>
            </div>
        </div>
    );
}

function Column({ title, tasks, boardId, isNewTaskInput }: { title: string, tasks: Task[], boardId: string, isNewTaskInput?: boolean }) {
    return (
        <div className="bg-gray-200 p-4 rounded-xl flex flex-col gap-3 min-h-500px">
            <h3 className="font-bold text-gray-800 flex justify-between items-center mb-2 text-lg">
                {title}
                <span className="bg-white px-2 py-1 rounded-full text-xs text-black font-bold shadow-sm">
                    {tasks.length}
                </span>
            </h3>

            {isNewTaskInput && (
                <form action={createTask} className="mb-4">
                    <input type="hidden" name="boardId" value={boardId} />
                    <input 
                        name="taskText"
                        placeholder="Новая задача..." 
                        className="w-full p-3 rounded border border-gray-300 mb-2 text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                        autoComplete="off"
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm font-bold transition">
                        Добавить +
                    </button>
                </form>
            )}

            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} boardId={boardId}/>
            ))}
            
            {tasks.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    Нет задач
                </div>
            )}
        </div>
    );
}

function TaskCard({ task, boardId }: { task: Task, boardId: string }) {
    const nextStatus = NEXT_STATUS_MAP[task.status];
    const buttonText = BUTTON_TEXT_MAP[task.status];
    const buttonColor = BUTTON_COLOR_MAP[task.status];

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-gray-900">
            <div className="font-bold text-lg mb-2 leading-tight">{task.content}</div>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 font-medium">
                    {new Date(task.createdAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                    {nextStatus && (
                        <form action={updateTaskStatus}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <input type="hidden" name="boardId" value={boardId} />
                            <input type="hidden" name="newStatus" value={nextStatus} />
                            
                            <button 
                                type="submit" 
                                className={`text-white text-xs px-3 py-1.5 rounded font-bold transition-colors shadow-sm ${buttonColor}`}
                            >
                                {buttonText}
                            </button>
                        </form>
                    )}

                    <form action={deleteTask}>
                        <input type="hidden" name="taskId" value={task.id}></input>
                        <input type="hidden" name="boardId" value={boardId}></input>
                        <button type="submit" className="text-gray-400 hover:text-red-600 font-bold px-2 text-lg transition-colors">
                            ×
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}