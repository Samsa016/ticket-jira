'use server'
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function moveTask(taskId: string, newStatus: string, boardId: string) {
    await db.task.update({
        where: {id: taskId},
        data: {status: newStatus}
    })
    revalidatePath('/boards/' + boardId)
}

export async function createBoard(formData: FormData) {

    const title = formData.get('title') as string
    if (!title) return;

    const tasks = ["Сходить в вуз", "Сделать несколько откликов на hh.ru", "Сходить в зал"]

    await db.board.create({
        data: {
            title: title,
            tasks: {
                create: tasks.map((taskText) => ({
                    content: taskText
                }))
            }
        }
    })
    revalidatePath('/')
    redirect('/')
}

export async function updateTaskStatus(formData: FormData) {
    const taskId = formData.get("taskId") as string
    const newStatus = formData.get("newStatus") as string
    const boardId = formData.get("boardId") as string

    if (!taskId || !newStatus || !boardId) {
        console.error("Missing fields")
        return
    }

    await db.task.update({
        data: {
            status: newStatus
        },
        where: {
            id: taskId
        }
        
    })
    revalidatePath('/boards/' + boardId)
}

export async function deleteTask(formData: FormData) {
    const taskId = formData.get("taskId") as string
    const boardId = formData.get("boardId") as string

    await db.task.delete({
        where: {
            id: taskId
        }
    })

    revalidatePath('/boards/' + boardId)
}

export async function createTask(formData: FormData) {
    const boardId = formData.get("boardId") as string
    const taskText = formData.get("content") as string

    if (taskText == '' || !taskText) return

    await db.task.create({
        data: {
            content: taskText,
            boardId: boardId,
            status: 'TODO'
        }
    })

    revalidatePath('/boards/' + boardId)
}

export async function deleteBoard(formData: FormData) {
    const boardId = formData.get("boardId") as string

    await db.board.delete({
        where: {
            id: boardId
        }
    })
}