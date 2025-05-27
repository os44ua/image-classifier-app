//import { ErrorBoundary } from './components/ErrorBoundary';
import { ImageClassifier } from './components/ImageClassifier';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary fallback={<p>Algo sale mal</p>}>
      <div className="App">
        <ImageClassifier />
      </div>
    </ErrorBoundary>
  );
}

export default App;