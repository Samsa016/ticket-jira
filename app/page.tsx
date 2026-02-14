'use server'
import { db } from "@/lib/db"
import { createBoard } from "@/app/actions"
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
            className="flex-1 border border-gray-300 bg-gray-50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            required
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
            <Link 
              key={board.id} 
              href={'/boards/' + board.id}
              className="group block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                {board.title}
              </h3>
              <div className="text-sm text-gray-500">
                Создано: {board.createdAt.toLocaleDateString('ru-RU')}
              </div>
            </Link>
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