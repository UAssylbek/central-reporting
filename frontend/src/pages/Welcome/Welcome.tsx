import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

const Welcome: React.FC = () => {
  const nav = useNavigate();

  return (
    <div className="Welcome">
      <h1>Добро пожаловать в Централизацию отчётности</h1>
      <p>
        Единая система для сбора, хранения и анализа отчётности. Чтобы
        продолжить, авторизуйтесь в системе.
      </p>
      <button onClick={() => nav("/login")}>Войти</button>
    </div>
  );
};

export default Welcome;
