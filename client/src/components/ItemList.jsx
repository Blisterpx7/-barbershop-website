import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API URL from configuration
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}`);
      const data = await response.json();
      console.log('Items from MongoDB:', data);
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const addTestItem = async () => {
    try {
      const response = await fetch(`${apiUrl}/test-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Test item added:', data);
      fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Error adding test item:', err);
    }
  };

  if (loading) {
    return <div>Loading items...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="item-list">
      <h2>Items from MongoDB</h2>
      
      <button onClick={addTestItem} style={{ marginBottom: '20px' }}>
        Add Test Item
      </button>

      {items.length === 0 ? (
        <p>No items found. Click "Add Test Item" to create one!</p>
      ) : (
        <ul>
          {items.map((item, index) => (
            <li key={item._id || index}>
              {item.name || 'Unnamed item'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ItemList; 