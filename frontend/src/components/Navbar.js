// frontend/src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
const Navbar = () => {
const { auth, logout } = useContext(AuthContext);
const navigate = useNavigate();
const handleLogout = () => {
logout();
navigate('/');
};
return (
<nav>
<ul style={ulStyle}>
<li><Link to="/">Главная</Link></li>
<li><Link to="/products">Товары</Link></li>
<li><Link to="/blog">Блог</Link></li>
<li><Link to="/catalog">Каталог</Link></li>
<li><Link to="/news">Новости</Link></li>
<li><Link to="/cart">Корзина</Link></li>
<li><Link to="/contact-us">Контакты</Link></li>
{!auth.token ? (
<>
<li><Link to="/register">Регистрация</Link></li>
<li><Link to="/login">Вход</Link></li>
</>
) : (
<>
<li><Link to="/dashboard">Личный кабинет</Link></li>
{auth.user && auth.user.role === 'admin' && (
<>
<li><Link to="/admin">Админ-панель</Link></li>
<li><Link to="/register-admin">Создать Администратора</Link></li>
</>
)}
<li><button onClick={handleLogout} style={buttonStyle}>Выйти</button></li>
</>
)}
</ul>
</nav>
);
};
const ulStyle = {
listStyle: 'none',
display: 'flex',
gap: '15px',
padding: '10px',
background: '#f0f0f0',
justifyContent: 'center',
alignItems: 'center'
};
const buttonStyle = {
background: 'transparent',
border: 'none',
cursor: 'pointer',
fontSize: '16px',
color: 'blue',
textDecoration: 'underline'
};
export default Navbar;