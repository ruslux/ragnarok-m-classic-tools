import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { KafraCalculatorPage } from './pages/KafraCalculatorPage'
import { MsCalculatorPage } from './pages/MsCalculatorPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="calculators/kafra" element={<KafraCalculatorPage />} />
        <Route path="calculators/ms" element={<MsCalculatorPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
