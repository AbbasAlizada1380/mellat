// dbconnection.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("mellat", "root", "newapp", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected using Sequelize");

    // 🔁 Auto update tables (ALTER)
    await sequelize.sync({ alter: true });
    console.log("🔄 Database synchronized (alter: true)");

  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export default sequelize;
