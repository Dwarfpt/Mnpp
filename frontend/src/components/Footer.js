// frontend/src/components/Footer.js
import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-3 mt-5">
            <Container className="text-center">
                <p className="mb-0">© 2024 Ваш сайт. Все права защищены.</p>
            </Container>
        </footer>
    );
};

export default Footer;
