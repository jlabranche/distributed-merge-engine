import './main.css';

function Result({ data }) {
  return (
    <div className="result-container">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Result;
