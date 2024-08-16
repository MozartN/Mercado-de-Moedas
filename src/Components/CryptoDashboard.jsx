import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const CryptoDashboard = () => {
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [priceData, setPriceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
          },
        });
        setCryptos(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  useEffect(() => {
    const fetchPriceData = async (crypto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: '30', // Fetch data for the past 30 days
          },
        });

        const { prices } = response.data;
        const labels = prices.map(([timestamp]) => new Date(timestamp).toLocaleDateString());
        const data = prices.map(([, price]) => price);

        setPriceData({
          labels: labels,
          datasets: [
            {
              label: `Price of ${crypto}`,
              data: data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchPriceData(selectedCrypto);
  }, [selectedCrypto]);

  const handleChange = (event) => {
    setSelectedCrypto(event.target.value);
  };

  return (
    <div>
      <h1>Crypto Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {!loading && !error && (
        <div>
          <select value={selectedCrypto} onChange={handleChange}>
            {cryptos.map(crypto => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </option>
            ))}
          </select>
          <div>
            {priceData.labels && (
              <Line data={priceData} options={{ responsive: true, plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: (tooltipItem) => `$${tooltipItem.raw}` } } } }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoDashboard;
