'use client'
import { DragDropContext, DropResult, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { moveTask, createTask, deleteTask } from "@/app/actions";

export interface BoardTask {
    id: string;
    content: string;
    description: string | null;
    createdAt: Date;
    status: string;
}

export default function BoardClient({ boardID, initialTasks }: { boardID: string, initialTasks: BoardTask[] }) {
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);
    
    const [taskTodo, setTaskTodo] = useState<BoardTask[]>(initialTasks.filter(task => task.status === 'TODO'));
    const [taskInProgress, setTaskInProgress] = useState<BoardTask[]>(initialTasks.filter(task => task.status === 'IN_PROGRESS'));
    const [taskDone, setTaskDone] = useState<BoardTask[]>(initialTasks.filter(task => task.status === 'DONE'));

    useEffect(() => {
        setTaskTodo(initialTasks.filter(task => task.status === 'TODO'));
        setTaskInProgress(initialTasks.filter(task => task.status === 'IN_PROGRESS'));
        setTaskDone(initialTasks.filter(task => task.status === 'DONE'));
    }, [initialTasks]);

    const dictionaryOfStates = {
        'TODO': { list: taskTodo, setList: setTaskTodo },
        'IN_PROGRESS': { list: taskInProgress, setList: setTaskInProgress },
        'DONE': { list: taskDone, setList: setTaskDone }
    };

    const columns = [
        { id: 'TODO', title: 'К исполнению', tasks: taskTodo },
        { id: 'IN_PROGRESS', title: 'В процессе', tasks: taskInProgress },
        { id: 'DONE', title: 'Готово', tasks: taskDone }
    ];

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId && 
            destination.index === source.index
        ) return;

        const sourceId = source.droppableId as keyof typeof dictionaryOfStates;
        const destId = destination.droppableId as keyof typeof dictionaryOfStates;

        if (sourceId === destId) {
            const list = dictionaryOfStates[sourceId].list;
            const setList = dictionaryOfStates[sourceId].setList;
            
            const newTasks = Array.from(list);
            const [movedTask] = newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, movedTask);
            
            setList(newTasks);
            moveTask(result.draggableId, destId, boardID);
        } else {
            const sourceList = Array.from(dictionaryOfStates[sourceId].list);
            const destinationList = Array.from(dictionaryOfStates[destId].list);
            
            const setSourceList = dictionaryOfStates[sourceId].setList;
            const setDestinationList = dictionaryOfStates[destId].setList;

            const [movedTask] = sourceList.splice(source.index, 1);

            const movedTaskUpdate = {
                ...movedTask,
                status: destId
            };

            destinationList.splice(destination.index, 0, movedTaskUpdate);

            setSourceList(sourceList);
            setDestinationList(destinationList);
            moveTask(result.draggableId, destId, boardID);
        }
    };

    if (!enabled) {
        return null;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                {columns.map(column => (
                    <div key={column.id} className="bg-gray-100 p-4 rounded-xl min-h-500px flex flex-col">
                        <h2 className="font-bold mb-4 text-gray-700 flex justify-between">
                            {column.title}
                            <span className="bg-white px-2 rounded-full text-xs text-black py-1 shadow-sm">
                                {column.tasks.length}
                            </span>
                        </h2>

                        {column.id === 'TODO' && (
                            <form action={createTask} className="mb-4">
                                <input type="hidden" name="boardId" value={boardID} />
                                <input 
                                    name="content"
                                    placeholder="Новая задача..." 
                                    className="w-full p-2 rounded border border-gray-300 mb-2 text-black text-sm"
                                    required
                                    autoComplete="off"
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm font-bold">
                                    Добавить
                                </button>
                            </form>
                        )}

                        <Droppable droppableId={column.id}>
                            {(provided) => (
                                <div 
                                    ref={provided.innerRef} 
                                    {...provided.droppableProps}
                                    className="flex-1 flex flex-col gap-2"
                                >
                                    {column.tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white p-3 rounded shadow-sm border border-gray-200 group relative"
                                                >
                                                    <div className="font-medium text-gray-800 pr-6">
                                                        {task.content}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-2">
                                                        {new Date(task.createdAt).toLocaleDateString()}
                                                    </div>

                                                    <form action={deleteTask} className="absolute top-2 right-2">
                                                        <input type="hidden" name="taskId" value={task.id} />
                                                        <input type="hidden" name="boardId" value={boardID} />
                                                        <button 
                                                            type="submit" 
                                                            className="text-gray-300 hover:text-red-500 font-bold px-1 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}