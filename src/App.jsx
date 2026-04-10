import React from 'react'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './components/Layout/DashboardLayout'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/dashboard' element={<DashboardLayout />} />
          <Route path='/' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
      </Router>
      
    </>
  )
}

export default App
