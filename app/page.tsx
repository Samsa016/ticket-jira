'use server'
import { db } from "@/lib/db"
import { createBoard, deleteBoard } from "@/app/actions"
import Link from "next/link"

export default async function Home() {
  const boards = await db.board.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
          Мои Проекты
        </h1>

        <form action={createBoard} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10 flex gap-4 items-center">
          <input
            name="title"
            placeholder="Название новой доски..."
            className="flex-1 border border-gray-300 bg-gray-50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-black"
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            Создать
          </button>
        </form>

        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          Ваши доски
          <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {boards.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div 
              key={board.id} 
              className="relative group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <Link href={'/boards/' + board.id} className="block h-full">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 pr-6">
                  {board.title}
                </h3>
                <div className="text-sm text-gray-500">
                  Создано: {new Date(board.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </Link>

              <form action={deleteBoard} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="hidden" name="boardId" value={board.id} />
                <button 
                    type="submit"
                    className="text-gray-400 hover:text-red-600 font-bold p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Удалить доску"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
              </form>
            </div>
          ))}

          {boards.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
              Пока нет проектов. Создайте первый выше!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}