'use server'
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Task } from "@prisma/client";
import BoardClient from "@/app/components/BoardClient";


export default async function BoardPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const board = await db.board.findUnique({
        where: { id },
        include: { 
            tasks: {
                orderBy: {
                    createdAt: 'desc'
                }
            } 
        }
    });

    if (!board) {
        notFound();
    }

return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                    Доска: <span className="text-blue-600">{board.title}</span>
                </h1>
                <BoardClient boardID={id} initialTasks={board.tasks} />
            </div>
        </div>
    )
}