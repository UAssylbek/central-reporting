import React from "react";
import { Link } from "react-router-dom";

const Administration: React.FC = () => {
  return (
    <div>
      <h1>Администрирование</h1>
      <p>Раздел администрирования системы. Доступен только администраторам.</p>
      <div style={{ marginTop: "1rem" }}>
        <Link
          to="/users"
          style={{ color: "#4f46e5", textDecoration: "underline" }}
        >
          Управление пользователями
        </Link>
      </div>
    </div>
  );
};

export default Administration;
