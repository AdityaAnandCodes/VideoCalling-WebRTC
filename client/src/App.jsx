import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { SocketProvider } from './providers/Socket'
import RoomPage from './pages/Room'

const App = () => {
  return (
    <Router>
      <main className='w-full min-h-screen'>
        <SocketProvider>
      <Routes>
        
        <Route path='/' element={<Home />} />
        <Route path='room/:roomId' element={<RoomPage />} />
        
      </Routes>
      </SocketProvider>
      </main>
    </Router >
  )
}

export default App