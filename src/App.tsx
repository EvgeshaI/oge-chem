import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import QuestPage from './pages/Quest'
import TopicPage from './pages/Topic'

function ScrollTop() {
  const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="topic/:id" element={<TopicPage />} />
          <Route path="quest" element={<QuestPage />} />
          <Route path="*" element={<div className="rounded-2xl bg-white p-8 text-center">Страница не найдена</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
