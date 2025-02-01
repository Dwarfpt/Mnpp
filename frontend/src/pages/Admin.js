import { useState } from 'react';
import axios from 'axios';

function Admin() {
  const [product, setProduct] = useState({ name: '', description: '', price: '', imageUrl: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/products', product, {
      headers: { Authorization: token },
    })
      .then((res) => {
        alert('Product added successfully');
      })
      .catch((err) => {
        alert('Failed to add product');
      });
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1>Админ-панель</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Название товара" onChange={handleChange} />
        <input type="text" name="description" placeholder="Описание" onChange={handleChange} />
        <input type="number" name="price" placeholder="Цена" onChange={handleChange} />
        <input type="text" name="imageUrl" placeholder="URL изображения" onChange={handleChange} />
        <button type="submit">Добавить товар</button>
      </form>
    </div>
  );
}

export default Admin;
