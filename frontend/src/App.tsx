import "./App.css";
import AppRouter from "./routes/AppRouter";
import {BrowserRouter as Router} from 'react-router-dom'

export default function App() {


  return (
        <Router>
          <AppRouter></AppRouter>
        </Router>
  );
}
